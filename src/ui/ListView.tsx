import { formatPrice, formatTotalPrice, formatWalkMinutes } from '../domain/format'
import { walkingMinutes } from '../domain/geo'
import { PROJECT_STATUS_LABEL } from '../domain/timeline'
import type { ListingContext } from '../domain/sort'

interface ListViewProps {
  items: ListingContext[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ListView({ items, selectedId, onSelect }: ListViewProps) {
  return (
    <div className="list-view" role="list" aria-label="Объекты в продаже">
      {items.map((item) => {
        const { listing, status, pricePerSqm, lrtMeters, parkMeters, completionYear } = item
        const meta: string[] = []
        if (listing.classLabel) meta.push(`Класс ${listing.classLabel}`)
        if (status) meta.push(PROJECT_STATUS_LABEL[status])
        if (completionYear != null) meta.push(`Q4 ${completionYear}`)
        const proximity: string[] = []
        if (lrtMeters != null) proximity.push(`LRT ${formatWalkMinutes(walkingMinutes(lrtMeters))}`)
        if (parkMeters != null) proximity.push(`Парк ${formatWalkMinutes(walkingMinutes(parkMeters))}`)
        return (
          <button
            key={listing.id}
            type="button"
            role="listitem"
            className={`project-card glass ${selectedId === listing.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(listing.id)}
          >
            <span className="project-card-name">{listing.name}</span>
            <span className="project-card-meta">{meta.join(' · ')}</span>
            <span className="project-card-price">
              {pricePerSqm != null ? `от ${formatPrice(pricePerSqm)}` : 'Цена по запросу'}
            </span>
            {pricePerSqm != null && (
              <span className="project-card-total">от {formatTotalPrice(pricePerSqm, listing.areaSqm)}</span>
            )}
            {proximity.length > 0 && <span className="project-card-proximity">{proximity.join(' · ')}</span>}
          </button>
        )
      })}
      {items.length === 0 && (
        <p className="list-empty">Под текущие фильтры ничего не подходит. Сбросьте фильтры.</p>
      )}
    </div>
  )
}
