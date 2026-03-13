import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(str, max = 45) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '...' : str
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-4 py-4"><div className="h-4 w-6 rounded bg-gray-100 mx-auto" /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-5 w-14 rounded-full bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-gray-100" /></td>
      <td className="px-4 py-4"><div className="h-6 w-12 rounded-lg bg-gray-100" /></td>
    </tr>
  )
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow-sm">1</span>
  if (rank === 2) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-white shadow-sm">2</span>
  if (rank === 3) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-xs font-black text-white shadow-sm">3</span>
  return <span className="text-sm font-semibold text-gray-500">#{rank}</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const COL = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'
const PAGE_SIZE = 10

export default function PostRankingsPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()

  const [data, setData]           = useState(null)   // { date, categories: [...] }
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage]           = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    instagramApi.getDailyTop100()
      .then((res) => {
        if (!cancelled) {
          // API returns a document with a `days` array; latest is the last element
          const days = Array.isArray(res?.days) ? res.days : (Array.isArray(res) ? res : null)
          const latestDay = days ? days[days.length - 1] : res

          // Group flat rankings array by category
          const rawRankings = latestDay?.rankings ?? []
          const grouped = {}
          rawRankings.forEach((item) => {
            const cats = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
            const cat = cats[0] ?? 'Uncategorized'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push(item)
          })
          const categories = Object.entries(grouped).map(([category, rankings]) => ({ category, rankings }))

          setData({ date: latestDay?.date ?? null, categories })
          setActiveTab(0)
          setPage(1)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load rankings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const categories = data?.categories ?? []
  const current    = categories[activeTab]
  const rankings   = current?.rankings ?? []
  const totalPages = Math.ceil(rankings.length / PAGE_SIZE)
  const paged      = rankings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Total ranked posts across all categories
  const totalPosts = categories.reduce((s, c) => s + (c.rankings?.length ?? 0), 0)

  function switchTab(idx) {
    setActiveTab(idx)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Post Rankings</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Daily top-ranked posts by category based on Beed+ score and engagement.
          </p>
        </div>
        {data?.date && (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fmtDate(data.date)}
          </span>
        )}
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Categories</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : categories.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Ranked Posts</p>
          <p className="mt-1 text-2xl font-black text-orange-500">{loading ? '...' : fmt(totalPosts)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm sm:col-span-1 col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Active Category</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white truncate">{loading ? '...' : (current?.category ?? '—')}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Main card */}
      {!error && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Category tabs */}
          {!loading && categories.length > 0 && (
            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 scrollbar-none">
              {categories.map((cat, idx) => (
                <button
                  key={cat.category}
                  onClick={() => switchTab(idx)}
                  className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition border-b-2 ${
                    idx === activeTab
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {cat.category}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    idx === activeTab ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {cat.rankings?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className={`${COL} w-12 text-center`}>Rank</th>
                  <th className={COL}>Post</th>
                  <th className={COL}>Creator</th>
                  <th className={COL}>Beed+ Score</th>
                  <th className={COL}>Daily Views</th>
                  <th className={COL}>Interactions</th>
                  <th className={`${COL} w-16`}></th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">
                      No rankings available for this category.
                    </td>
                  </tr>
                )}

                {!loading && paged.map((item, idx) => {
                  const rank       = item.rank ?? ((page - 1) * PAGE_SIZE + idx + 1)
                  const caption    = item.media?.caption
                  const thumb      = item.media?.thumbnailUrl
                  const permalink  = item.media?.permalink
                  const username   = item.userData?.username || item.media?.username
                  const country    = item.userData?.country
                  const profilePic = item.userData?.profilePicture

                  return (
                    <tr key={item.instagramMediaId ?? idx} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      {/* Rank */}
                      <td className="px-4 py-4 text-center">
                        <RankBadge rank={rank} />
                      </td>

                      {/* Post */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                            {thumb
                              ? <img src={thumb} alt="" className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                              {truncate(caption)}
                            </p>
                            {permalink && (
                              <a
                                href={permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5 inline-flex items-center gap-0.5 text-xs text-orange-400 hover:text-orange-600 transition"
                              >
                                View post
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {profilePic
                            ? <img src={profilePic} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                            : <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-500">
                                {(username?.[0] ?? 'U').toUpperCase()}
                              </div>
                          }
                          <div>
                            {username && <p className="text-sm font-medium text-gray-800 dark:text-gray-100">@{username}</p>}
                            {country  && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Beed+ Score */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                          {fmt(item.beedPlusScore)}
                        </span>
                      </td>

                      {/* Daily Views */}
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {fmt(item.insights?.daily_views)}
                      </td>

                      {/* Interactions */}
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {fmt(item.insights?.daily_totalInteractions)}
                      </td>

                      {/* View */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/dashboard/posts/${item.instagramMediaId}`, { state: { post: item } })}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-orange-300 hover:text-orange-500 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rankings.length)} of {rankings.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 transition hover:border-orange-300 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                      p === page ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 transition hover:border-orange-300 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
