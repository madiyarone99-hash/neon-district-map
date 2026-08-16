import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Regenerates public/amenities.json with two additional honest categories
// (kindergarten, mall) pulled from the same cached OSM Overpass response
// already used to build the original file. No coordinates or names are
// invented — everything here traces back to /tmp/osm_amenities.json tags.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const currentPath = join(root, 'public/amenities.json')
const rawPath = '/tmp/osm_amenities.json'

const current = JSON.parse(readFileSync(currentPath, 'utf8'))
const raw = JSON.parse(readFileSync(rawPath, 'utf8'))

function wayCentroid(geometry) {
  let lon = 0
  let lat = 0
  for (const point of geometry) {
    lon += point.lon
    lat += point.lat
  }
  return [lon / geometry.length, lat / geometry.length]
}

function collect(predicate) {
  const out = []
  for (const element of raw.elements) {
    const tags = element.tags ?? {}
    if (!predicate(tags)) continue
    let coordinates
    if (element.type === 'node') {
      coordinates = [element.lon, element.lat]
    } else if (element.geometry) {
      coordinates = wayCentroid(element.geometry)
    } else if (element.center) {
      coordinates = [element.center.lon, element.center.lat]
    } else {
      continue
    }
    const name = tags['name:ru'] ?? tags.name ?? null
    out.push({
      type: 'Feature',
      properties: {
        id: `${element.type}/${element.id}`,
        kind: predicate.kind,
        name,
      },
      geometry: { type: 'Point', coordinates },
    })
  }
  return out
}

const mallIds = new Set()
const kindergartens = collect(
  Object.assign((tags) => tags.amenity === 'kindergarten', { kind: 'kindergarten' }),
)
const malls = collect(Object.assign((tags) => tags.shop === 'mall', { kind: 'mall' }))
for (const feature of malls) mallIds.add(feature.properties.id)

// Idempotent baseline: keep only the two categories this script does not
// derive (school, shopping-minus-malls). `transit` is dropped on purpose —
// the dedicated LRT station layer reads infra.json's `stations` collection,
// which carries the real station `ref` numbers this file does not have.
// Re-running this script must not accumulate duplicate kindergarten/mall
// entries, so kindergarten/mall are always rebuilt fresh below.
const keptShopping = current.features.filter(
  (feature) =>
    (feature.properties.kind === 'school' ||
      feature.properties.kind === 'shopping') &&
    !mallIds.has(feature.properties.id),
)

const merged = {
  type: 'FeatureCollection',
  features: [...keptShopping, ...kindergartens, ...malls],
}

writeFileSync(currentPath, `${JSON.stringify(merged)}\n`)
writeFileSync(join(root, 'dist/amenities.json'), `${JSON.stringify(merged)}\n`, { flag: 'w' })

const counts = merged.features.reduce((acc, f) => {
  acc[f.properties.kind] = (acc[f.properties.kind] ?? 0) + 1
  return acc
}, {})
console.log('amenities kinds:', counts, 'total', merged.features.length)
