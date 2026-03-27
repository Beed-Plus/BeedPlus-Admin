import { useState, useEffect } from 'react'
import { instagramApi } from '../../../utils/instagramApi'
import TopPostCard from '../../../components/dashboard/rankings/TopPostCard'
import TopHitsTable from '../../../components/dashboard/rankings/TopHitsTable'

export default function TopHitsPage() {
  const [topHits, setTopHits] = useState([])
  const [weekStartDate, setWeekStartDate] = useState(null)
  const [weekEndDate, setWeekEndDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    instagramApi.getTopHits()
      .then((res) => {
        if (cancelled) return
        setTopHits(res.topHits ?? [])
        setWeekStartDate(res.weekStartDate ?? null)
        setWeekEndDate(res.weekEndDate ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Failed to load top hits')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [refreshKey])

  const topPost = topHits[0] ?? null

  function formatDateRange(start, end) {
    if (!start || !end) return null
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }

  const dateRange = formatDateRange(weekStartDate, weekEndDate)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Top Hit Ranking</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Weekly performance overview for all media posts across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          {dateRange && (
            <span className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              {dateRange}
            </span>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            title="Refresh"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Featured post skeleton */}
      {loading && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Featured post */}
      {/* {!loading && topPost && <TopPostCard post={topPost} />} */}

      {/* Rankings table */}
      <TopHitsTable hits={topHits} loading={loading} />
    </div>
  )
}
