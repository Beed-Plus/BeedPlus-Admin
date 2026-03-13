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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    instagramApi.getCreatorRankings()
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
  }, [])

  const paged = useMemo(
    () => rankings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rankings, page]
  )

  const topCreator = rankings[0]?.username ?? '—'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Top Creators Ranking</h1>
        <p className="mt-1 text-sm text-gray-400">
          Performance overview of the most active content creators across the Beed+ platform.
        </p>
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

      {/* Table */}
      <TopCreatorsTable
        creators={paged}
        currentPage={page}
        totalItems={rankings.length}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  )
}
