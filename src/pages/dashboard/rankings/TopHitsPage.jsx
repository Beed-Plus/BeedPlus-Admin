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
  }, [])

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
        {dateRange && (
          <span className="shrink-0 mt-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {dateRange}
          </span>
        )}
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
