'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Globe, Zap, Shield, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  _id: string
  name: string
  type: string
  countryCode: string
  countryName: string
  speedMbps: number
  uptimePercent: number
  protocols: string[]
  isFeatured: boolean
  plans: Array<{ duration: string; priceUsdt: number; isPopular: boolean; ipCount: number }>
}

const TYPE_LABELS: Record<string, string> = {
  residential: 'Residential',
  datacenter: 'Datacenter',
  mobile: 'Mobile',
  isp: 'ISP',
}

const TYPE_ACCENT: Record<string, string> = {
  residential: '#FFFFFF',
  datacenter:  '#888888',
  mobile:      '#10B981',
  isp:         '#F59E0B',
}

const REGION_MAP: Record<string, string> = {
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  BS: 'North America', BB: 'North America', BZ: 'North America',
  CR: 'North America', CU: 'North America', DO: 'North America',
  GT: 'North America', HN: 'North America', HT: 'North America',
  JM: 'North America', KN: 'North America', LC: 'North America',
  NI: 'North America', PA: 'North America', PR: 'North America',
  SV: 'North America', TT: 'North America', CW: 'North America',
  DM: 'North America', AG: 'North America', GD: 'North America',
  // South America
  BR: 'South America', AR: 'South America', CL: 'South America',
  CO: 'South America', PE: 'South America', BO: 'South America',
  EC: 'South America', GY: 'South America', PY: 'South America',
  SR: 'South America', UY: 'South America', VE: 'South America',
  // Europe
  GB: 'Europe', DE: 'Europe', FR: 'Europe', NL: 'Europe', SE: 'Europe',
  IT: 'Europe', ES: 'Europe', CH: 'Europe', PL: 'Europe', UA: 'Europe',
  RO: 'Europe', TR: 'Europe', CZ: 'Europe', AT: 'Europe', BE: 'Europe',
  DK: 'Europe', FI: 'Europe', NO: 'Europe', PT: 'Europe', GR: 'Europe',
  HU: 'Europe', SK: 'Europe', RS: 'Europe', BG: 'Europe', HR: 'Europe',
  RU: 'Europe', IE: 'Europe', IS: 'Europe', LT: 'Europe', LV: 'Europe',
  EE: 'Europe', LU: 'Europe', MT: 'Europe', CY: 'Europe', AL: 'Europe',
  BA: 'Europe', BY: 'Europe', MD: 'Europe', ME: 'Europe', MK: 'Europe',
  SI: 'Europe', GE: 'Europe', AM: 'Europe', AZ: 'Europe', AD: 'Europe',
  LI: 'Europe', SM: 'Europe', XK: 'Europe',
  // Asia
  JP: 'Asia', SG: 'Asia', KR: 'Asia', IN: 'Asia', HK: 'Asia',
  TH: 'Asia', ID: 'Asia', CN: 'Asia', VN: 'Asia', PH: 'Asia',
  MY: 'Asia', TW: 'Asia', PK: 'Asia', KZ: 'Asia', UZ: 'Asia',
  BD: 'Asia', AF: 'Asia', BN: 'Asia', BT: 'Asia', KH: 'Asia',
  KG: 'Asia', LA: 'Asia', LK: 'Asia', MN: 'Asia', MM: 'Asia',
  MO: 'Asia', MV: 'Asia', NP: 'Asia', TJ: 'Asia', TL: 'Asia', TM: 'Asia',
  // Middle East
  AE: 'Middle East', IL: 'Middle East', SA: 'Middle East',
  IQ: 'Middle East', IR: 'Middle East', JO: 'Middle East',
  KW: 'Middle East', LB: 'Middle East', OM: 'Middle East',
  QA: 'Middle East', YE: 'Middle East', BH: 'Middle East',
  PS: 'Middle East', SY: 'Middle East',
  // Africa
  ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa',
  MA: 'Africa', GH: 'Africa', TZ: 'Africa', DZ: 'Africa',
  AO: 'Africa', BI: 'Africa', BJ: 'Africa', BW: 'Africa',
  BF: 'Africa', CM: 'Africa', CF: 'Africa', CG: 'Africa',
  CD: 'Africa', CI: 'Africa', CV: 'Africa', DJ: 'Africa',
  ER: 'Africa', ET: 'Africa', GA: 'Africa', GM: 'Africa',
  GN: 'Africa', GQ: 'Africa', GW: 'Africa', KM: 'Africa',
  LS: 'Africa', LR: 'Africa', LY: 'Africa', MG: 'Africa',
  ML: 'Africa', MR: 'Africa', MU: 'Africa', MW: 'Africa',
  MZ: 'Africa', NA: 'Africa', NE: 'Africa', RW: 'Africa',
  SD: 'Africa', SL: 'Africa', SN: 'Africa', SO: 'Africa',
  SS: 'Africa', ST: 'Africa', SZ: 'Africa', TD: 'Africa',
  TG: 'Africa', TN: 'Africa', UG: 'Africa', ZM: 'Africa', ZW: 'Africa',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', FM: 'Oceania',
  KI: 'Oceania', MH: 'Oceania', NR: 'Oceania', PG: 'Oceania',
  PW: 'Oceania', SB: 'Oceania', TO: 'Oceania', TV: 'Oceania',
  VU: 'Oceania', WS: 'Oceania',
}

const REGIONS = ['Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania']

function ProductCard({ product }: { product: Product }) {
  const cheapest = product.plans?.sort((a, b) => a.priceUsdt - b.priceUsdt)[0]
  const accent = TYPE_ACCENT[product.type] ?? '#888888'

  return (
    <Link href={`/catalog/${product._id}`}>
      <div className="group flex flex-col rounded-2xl p-5 h-full cursor-pointer transition-all duration-200"
        style={{
          background: '#0D0D0D',
          border: product.isFeatured ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.18)',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = product.isFeatured ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)')}>

        {/* Top */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/flags/${product.countryCode.toLowerCase()}.png`}
                alt={product.countryName} className="w-7 h-5 object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight" style={{ color: '#FFFFFF' }}>
                {product.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#BBBBBB' }}>{product.countryName}</p>
            </div>
          </div>
          {product.isFeatured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}>
              Featured
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
            style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}22` }}>
            {TYPE_LABELS[product.type]}
          </span>
          {product.protocols.slice(0, 2).map(p => (
            <span key={p} className="text-xs px-2.5 py-1 rounded-lg font-mono"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#CCCCCC', border: '1px solid rgba(255,255,255,0.06)' }}>
              {p.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="w-3 h-3" style={{ color: '#CCCCCC' }} />
            <span style={{ color: '#CCCCCC' }}>
              {product.speedMbps >= 1000 ? `${product.speedMbps / 1000}Gbps` : `${product.speedMbps}Mbps`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3 h-3" style={{ color: '#CCCCCC' }} />
            <span style={{ color: '#CCCCCC' }}>{product.uptimePercent}% uptime</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#EEEEEE' }}>від</p>
            <p className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
              ${cheapest?.priceUsdt?.toFixed(2) ?? '—'}
              <span className="text-xs font-normal ml-1" style={{ color: '#BBBBBB' }}>USDT</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
            style={{ color: '#CCCCCC' }}>
            Деталі
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function getPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton h-3.5 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20 rounded-lg" />
        <div className="skeleton h-6 w-14 rounded-lg" />
      </div>
      <div className="skeleton h-px w-full" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-16 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [regionOpen, setRegionOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'default'>('default')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 24

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType) params.set('type', selectedType)
      const res = await fetch(`/api/v1/products?${params}&limit=300`)
      const data = await res.json()
      setProducts(data.data?.items ?? [])
      setTotal(data.data?.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [search, selectedType, selectedRegion, sortBy])

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.countryName.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedRegion && REGION_MAP[p.countryCode] !== selectedRegion) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'default') return 0
    const aPrice = a.plans?.slice().sort((x, y) => x.priceUsdt - y.priceUsdt)[0]?.priceUsdt ?? 999
    const bPrice = b.plans?.slice().sort((x, y) => x.priceUsdt - y.priceUsdt)[0]?.priceUsdt ?? 999
    return sortBy === 'price-asc' ? aPrice - bPrice : bPrice - aPrice
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: '#060606' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <span className="tag mb-4 inline-block">
            <Globe className="w-3 h-3 inline mr-1.5" />{loading ? total : filtered.length} проксі
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
            style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
            Каталог проксі
          </h1>
          <p className="text-base" style={{ color: '#CCCCCC' }}>
            Residential, Datacenter, Mobile і ISP — всі регіони світу
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#EEEEEE' }} />
            <input
              placeholder="Пошук по країні або назві..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-colors"
              style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {['', 'residential', 'datacenter', 'mobile', 'isp'].map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: selectedType === type ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: `1px solid ${selectedType === type ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                  color: selectedType === type ? '#FFFFFF' : '#555',
                }}>
                {type ? TYPE_LABELS[type] : 'Всі'}
              </button>
            ))}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'default')}
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.12)', color: '#CCCCCC', outline: 'none', cursor: 'pointer' }}>
              <option value="default">Сортування</option>
              <option value="price-asc">Ціна ↑</option>
              <option value="price-desc">Ціна ↓</option>
            </select>

            {/* Region dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegionOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: selectedRegion ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: `1px solid ${selectedRegion ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                  color: selectedRegion ? '#FFFFFF' : '#555',
                }}>
                <Globe className="w-3.5 h-3.5" />
                {selectedRegion || 'Регіон'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {regionOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-20 min-w-[160px] rounded-xl overflow-hidden"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => { setSelectedRegion(''); setRegionOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ color: !selectedRegion ? '#FFFFFF' : '#888', background: !selectedRegion ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = !selectedRegion ? 'rgba(255,255,255,0.06)' : 'transparent')}>
                    Всі регіони
                  </button>
                  {REGIONS.map(r => (
                    <button key={r}
                      onClick={() => { setSelectedRegion(r); setRegionOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                      style={{ color: selectedRegion === r ? '#FFFFFF' : '#888', background: selectedRegion === r ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = selectedRegion === r ? 'rgba(255,255,255,0.06)' : 'transparent')}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: '#CCCCCC' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>Нічого не знайдено</p>
            <p className="text-sm" style={{ color: '#BBBBBB' }}>Спробуйте змінити фільтри або пошуковий запит</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6"
                style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                <p className="text-sm order-2 sm:order-1" style={{ color: '#BBBBBB' }}>
                  Показано {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} з {filtered.length}
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CCCCCC' }}
                    onMouseEnter={e => { if (page > 1) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)')}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {getPages(page, totalPages).map((p, i) =>
                    p === '...'
                      ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-sm" style={{ color: '#EEEEEE' }}>…</span>
                      : <button key={p}
                          onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: page === p ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: `1px solid ${page === p ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
                            color: page === p ? '#FFFFFF' : '#555',
                          }}
                          onMouseEnter={e => { if (page !== p) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)' }}
                          onMouseLeave={e => { if (page !== p) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)' }}>
                          {p}
                        </button>
                  )}

                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CCCCCC' }}
                    onMouseEnter={e => { if (page < totalPages) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)')}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
