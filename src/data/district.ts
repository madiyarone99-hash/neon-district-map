export type Phase =
  | 'planned'
  | 'excavation'
  | 'structure'
  | 'finishing'
  | 'handover'
  | 'sold'

export type Amenity = 'lrt' | 'mosque' | 'green' | 'market' | 'school'

export interface PricePoint {
  year: number
  pricePerSqm: number
}

export interface Building {
  id: string
  name: string
  tagline: string
  polygon: string
  label: [number, number]
  areaSqm: number
  floors: number
  amenities: Amenity[]
  conditions: string[]
  appearYear: number
  phaseByYear: Record<number, Phase>
  prices: PricePoint[]
  futurePlan: string
}

export interface Zone {
  id: string
  name: string
  type: 'green' | 'lrt' | 'mosque' | 'water'
  path: string
  appearYear: number
  expandYear?: number
  expandPath?: string
}

export const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032] as const
export type Year = (typeof YEARS)[number]

export const DISTRICT = {
  name: 'NEXUS-7',
  subtitle: 'Neon Arc Quarter',
  tagline: 'Купи участок в будущем, которое уже строится',
}

export const PHASE_LABEL: Record<Phase, string> = {
  planned: 'План',
  excavation: 'Котлован',
  structure: 'Каркас',
  finishing: 'Отделка',
  handover: 'Сдача',
  sold: 'Продано',
}

export const AMENITY_LABEL: Record<Amenity, string> = {
  lrt: 'LRT рядом',
  mosque: 'Мега-мечеть',
  green: 'Зелёная зона',
  market: 'Базар / ритейл',
  school: 'Школа',
}

export const zones: Zone[] = [
  {
    id: 'river',
    name: 'Arc Canal',
    type: 'water',
    path: 'M40 520 C180 480, 320 560, 480 500 S780 420, 960 480 L960 600 L40 600 Z',
    appearYear: 2024,
  },
  {
    id: 'green-core',
    name: 'Emerald Spine',
    type: 'green',
    path: 'M420 180 L520 160 L560 280 L480 320 L400 260 Z',
    appearYear: 2025,
    expandYear: 2028,
    expandPath: 'M380 140 L560 120 L620 300 L500 360 L340 280 Z',
  },
  {
    id: 'green-east',
    name: 'Pulse Park',
    type: 'green',
    path: 'M720 220 L860 200 L880 340 L740 360 Z',
    appearYear: 2027,
  },
  {
    id: 'mosque',
    name: 'Aurora Mega Mosque',
    type: 'mosque',
    path: 'M200 120 L280 90 L340 140 L300 220 L180 200 Z',
    appearYear: 2024,
  },
  {
    id: 'lrt-line',
    name: 'LRT Neon Line',
    type: 'lrt',
    path: 'M60 380 C220 340, 400 300, 560 320 S820 380, 940 300',
    appearYear: 2026,
  },
]

export const buildings: Building[] = [
  {
    id: 'b1',
    name: 'Prism Tower',
    tagline: 'Стеклянный хай-райз у LRT',
    polygon: 'M120 300 L200 280 L220 380 L140 400 Z',
    label: [160, 340],
    areaSqm: 420,
    floors: 28,
    amenities: ['lrt', 'green'],
    conditions: [
      'Первый взнос от 20%',
      'Рассрочка до сдачи без %',
      'Вид на канал + LRT',
    ],
    appearYear: 2024,
    phaseByYear: {
      2024: 'excavation',
      2025: 'structure',
      2026: 'structure',
      2027: 'finishing',
      2028: 'handover',
      2029: 'sold',
      2030: 'sold',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2024, pricePerSqm: 480000 },
      { year: 2025, pricePerSqm: 520000 },
      { year: 2026, pricePerSqm: 610000 },
      { year: 2027, pricePerSqm: 690000 },
      { year: 2028, pricePerSqm: 780000 },
      { year: 2029, pricePerSqm: 820000 },
      { year: 2030, pricePerSqm: 860000 },
      { year: 2031, pricePerSqm: 900000 },
      { year: 2032, pricePerSqm: 940000 },
    ],
    futurePlan: 'К 2030 — ритейл-подиум и sky-bridge к станции LRT',
  },
  {
    id: 'b2',
    name: 'Mosque Gate Residences',
    tagline: 'Тихие лофты у Aurora Mosque',
    polygon: 'M300 200 L390 180 L410 270 L320 290 Z',
    label: [350, 235],
    areaSqm: 95,
    floors: 12,
    amenities: ['mosque', 'green', 'market'],
    conditions: [
      'Семейные планировки 2–4 комн.',
      'Закрытый двор',
      'Шариат-friendly escrow',
    ],
    appearYear: 2024,
    phaseByYear: {
      2024: 'planned',
      2025: 'excavation',
      2026: 'structure',
      2027: 'finishing',
      2028: 'handover',
      2029: 'handover',
      2030: 'sold',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2024, pricePerSqm: 390000 },
      { year: 2025, pricePerSqm: 410000 },
      { year: 2026, pricePerSqm: 470000 },
      { year: 2027, pricePerSqm: 540000 },
      { year: 2028, pricePerSqm: 600000 },
      { year: 2029, pricePerSqm: 640000 },
      { year: 2030, pricePerSqm: 680000 },
      { year: 2031, pricePerSqm: 710000 },
      { year: 2032, pricePerSqm: 740000 },
    ],
    futurePlan: 'После 2029 — надстройка wellness-этажа и зелёная терраса',
  },
  {
    id: 'b3',
    name: 'Canal Strip A',
    tagline: 'Ритейл + апартаменты у воды',
    polygon: 'M240 440 L360 420 L380 500 L260 520 Z',
    label: [310, 470],
    areaSqm: 160,
    floors: 8,
    amenities: ['green', 'market'],
    conditions: [
      'Коммерция на 1 этаже',
      'Аренда до сдачи разрешена',
      'Налог на имущество — льготный период 2 года',
    ],
    appearYear: 2025,
    phaseByYear: {
      2025: 'planned',
      2026: 'excavation',
      2027: 'structure',
      2028: 'finishing',
      2029: 'handover',
      2030: 'handover',
      2031: 'sold',
      2032: 'sold',
    },
    prices: [
      { year: 2025, pricePerSqm: 350000 },
      { year: 2026, pricePerSqm: 380000 },
      { year: 2027, pricePerSqm: 430000 },
      { year: 2028, pricePerSqm: 510000 },
      { year: 2029, pricePerSqm: 580000 },
      { year: 2030, pricePerSqm: 620000 },
      { year: 2031, pricePerSqm: 660000 },
      { year: 2032, pricePerSqm: 700000 },
    ],
    futurePlan: 'К 2031 — плавучий food-court на канале',
  },
  {
    id: 'b4',
    name: 'LRT Hub Lofts',
    tagline: 'Жить над станцией',
    polygon: 'M520 280 L640 260 L660 360 L540 380 Z',
    label: [590, 320],
    areaSqm: 72,
    floors: 18,
    amenities: ['lrt', 'green', 'school'],
    conditions: [
      '5 мин пешком до LRT',
      'Smart-home включён',
      'Кешбек 3% при покупке до 2027',
    ],
    appearYear: 2026,
    phaseByYear: {
      2026: 'planned',
      2027: 'excavation',
      2028: 'structure',
      2029: 'finishing',
      2030: 'handover',
      2031: 'handover',
      2032: 'sold',
    },
    prices: [
      { year: 2026, pricePerSqm: 520000 },
      { year: 2027, pricePerSqm: 560000 },
      { year: 2028, pricePerSqm: 640000 },
      { year: 2029, pricePerSqm: 720000 },
      { year: 2030, pricePerSqm: 800000 },
      { year: 2031, pricePerSqm: 850000 },
      { year: 2032, pricePerSqm: 910000 },
    ],
    futurePlan: 'После открытия LRT — premium-premium переоценка +20–25%',
  },
  {
    id: 'b5',
    name: 'Pulse Park Villas',
    tagline: 'Таунхаусы у парка',
    polygon: 'M740 380 L860 360 L880 460 L760 480 Z',
    label: [810, 420],
    areaSqm: 210,
    floors: 3,
    amenities: ['green', 'school'],
    conditions: [
      'Свой участок 80 м²',
      'Парковка на 2 авто',
      'Ограничение этажности района',
    ],
    appearYear: 2027,
    phaseByYear: {
      2027: 'planned',
      2028: 'excavation',
      2029: 'structure',
      2030: 'finishing',
      2031: 'handover',
      2032: 'handover',
    },
    prices: [
      { year: 2027, pricePerSqm: 450000 },
      { year: 2028, pricePerSqm: 480000 },
      { year: 2029, pricePerSqm: 540000 },
      { year: 2030, pricePerSqm: 610000 },
      { year: 2031, pricePerSqm: 680000 },
      { year: 2032, pricePerSqm: 720000 },
    ],
    futurePlan: 'К 2032 — расширение Pulse Park и велодорожка к мечети',
  },
  {
    id: 'b6',
    name: 'North Spire',
    tagline: 'Флагман квартала 2030+',
    polygon: 'M600 100 L700 80 L740 180 L640 200 Z',
    label: [670, 140],
    areaSqm: 110,
    floors: 42,
    amenities: ['lrt', 'mosque', 'green', 'market'],
    conditions: [
      'Pre-sale только до 2028',
      'Минимальный лот — 2 комнаты',
      'Консьерж + sky lounge',
    ],
    appearYear: 2028,
    phaseByYear: {
      2028: 'planned',
      2029: 'excavation',
      2030: 'structure',
      2031: 'structure',
      2032: 'finishing',
    },
    prices: [
      { year: 2028, pricePerSqm: 700000 },
      { year: 2029, pricePerSqm: 760000 },
      { year: 2030, pricePerSqm: 850000 },
      { year: 2031, pricePerSqm: 940000 },
      { year: 2032, pricePerSqm: 1050000 },
    ],
    futurePlan: '2033–2035: вторая башня-близнец и воздушный сад',
  },
]

export function getPriceAtYear(building: Building, year: number): number | null {
  const exact = building.prices.find((p) => p.year === year)
  if (exact) return exact.pricePerSqm
  const past = [...building.prices].filter((p) => p.year <= year).at(-1)
  return past?.pricePerSqm ?? null
}

export function getPhaseAtYear(building: Building, year: number): Phase | null {
  if (year < building.appearYear) return null
  return building.phaseByYear[year] ?? null
}

export function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} млн ₸/м²`
  }
  return `${Math.round(value / 1000)}k ₸/м²`
}

export function priceDelta(building: Building, year: number): number | null {
  const current = getPriceAtYear(building, year)
  const prev = getPriceAtYear(building, year - 1)
  if (current == null || prev == null || prev === 0) return null
  return ((current - prev) / prev) * 100
}

export const YEAR_EVENTS: Record<number, string> = {
  2024: 'Старт квартала · мечеть уже открыта',
  2025: 'Emerald Spine — первая зелёная зона',
  2026: 'Старт строительства LRT Neon Line',
  2027: 'Pulse Park · LRT на половине трассы',
  2028: 'Расширение парка · North Spire pre-sale',
  2029: 'Пик сдачи жилых корпусов',
  2030: 'LRT в полном режиме · переоценка',
  2031: 'Canal food-court · saturated market',
  2032: 'Планы второй фазы аркологии',
}
