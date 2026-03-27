import { useState, useEffect, useMemo } from 'react'
import { instagramApi } from '../../../utils/instagramApi'
import CreatorHighlightCards from '../../../components/dashboard/rankings/CreatorHighlightCards'
import TopCreatorsTable from '../../../components/dashboard/rankings/TopCreatorsTable'

const PAGE_SIZE = 10

export default function TopCreatorsPage() {
  const [rankings, setRankings] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState(0) // 0 = All, 1+ = category index
  const [filterCountry, setFilterCountry] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    instagramApi.getCreatorMonthlyTop100()
      .then((res) => {
        if (cancelled) return
        setRankings(res.rankings ?? [])
        setCount(res.count ?? res.rankings?.length ?? 0)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Failed to load creator rankings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [refreshKey])

  // Unique categories derived from rankings
  const categories = useMemo(() => {
    const seen = new Set()
    const cats = []
    rankings.forEach((r) => {
      if (r.category && !seen.has(r.category)) {
        seen.add(r.category)
        cats.push(r.category)
      }
    })
    return cats.sort()
  }, [rankings])

  // Unique countries derived from rankings
  const availableCountries = useMemo(() => {
    const set = new Set()
    rankings.forEach((r) => { if (r.country) set.add(r.country) })
    return [...set].sort()
  }, [rankings])

  // Filter by active tab + country
  const filtered = useMemo(() => {
    let list = activeTab === 0 ? rankings : rankings.filter((r) => r.category === categories[activeTab - 1])
    if (filterCountry) list = list.filter((r) => r.country === filterCountry)
    return list
  }, [rankings, activeTab, categories, filterCountry])

  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  function switchTab(idx) {
    setActiveTab(idx)
    setPage(1)
  }

  const topCreator = rankings[0]?.username ?? '—'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Top Creators Ranking</h1>
          <p className="mt-1 text-sm text-gray-400">
            Performance overview of the most active content creators across the Beed+ platform.
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          title="Refresh"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Highlight cards */}
      {!loading && !error && (
        <CreatorHighlightCards
          topCreator={topCreator}
          totalActiveCreators={count}
          availableCountries={availableCountries}
          filterCountry={filterCountry}
          onFilterCountry={(c) => { setFilterCountry(c); setPage(1) }}
          filteredCount={filtered.length}
        />
      )}

      {loading && (
        <div className="flex flex-col gap-4 sm:flex-row">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6 shadow-sm">
              <div className="flex-1 space-y-3">
                <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-8 w-48 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category tabs + Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {!loading && categories.length > 0 && (
          <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 scrollbar-none">
            <button
              onClick={() => switchTab(0)}
              className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition border-b-2 ${
                activeTab === 0
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === 0 ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {filterCountry ? rankings.filter((r) => r.country === filterCountry).length : rankings.length}
              </span>
            </button>

            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => switchTab(idx + 1)}
                className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition border-b-2 ${
                  activeTab === idx + 1
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {cat}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  activeTab === idx + 1 ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {rankings.filter((r) => r.category === cat && (!filterCountry || r.country === filterCountry)).length}
                </span>
              </button>
            ))}
          </div>
        )}

        <TopCreatorsTable
          creators={paged}
          currentPage={page}
          totalItems={filtered.length}
          onPageChange={setPage}
          loading={loading}
          nested
        />
      </div>
    </div>
  )
}
