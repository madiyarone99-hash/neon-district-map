import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Adds the real OSM `ref` (public station code) to each LRT station, and
// marks each LRT line segment with an honest `segment` classification
// derived straight from its own OSM tag (`status=proposed` vs the rest),
// so the map can render the not-yet-approved extension differently from
// the funded main line without guessing.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const infraPath = join(root, 'public/infra.json')
const rawPath = '/tmp/osm_infra.json'

const infra = JSON.parse(readFileSync(infraPath, 'utf8'))
const raw = JSON.parse(readFileSync(rawPath, 'utf8'))

const refById = new Map()
for (const element of raw.elements) {
  if (element.type === 'node' && element.tags?.ref) {
    refById.set(`node/${element.id}`, element.tags.ref)
  }
}

for (const feature of infra.stations.features) {
  const ref = refById.get(feature.properties.id)
  if (ref) feature.properties.ref = ref
}

for (const feature of infra.lrt.features) {
  feature.properties.segment = feature.properties.status === 'proposed' ? 'proposed' : 'core'
}

writeFileSync(infraPath, `${JSON.stringify(infra)}\n`)
writeFileSync(join(root, 'dist/infra.json'), `${JSON.stringify(infra)}\n`)
console.log(
  'stations with ref:',
  infra.stations.features.filter((f) => f.properties.ref).length,
  '/',
  infra.stations.features.length,
)
