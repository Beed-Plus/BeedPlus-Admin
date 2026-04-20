import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { useWatchlist } from '../../../hooks/useWatchlist'

const SELECT = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'
const COL    = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

const MEDIA_TYPE_CONFIG = {
  VIDEO:          { label: 'Video',    color: 'bg-blue-50 text-blue-500' },
  IMAGE:          { label: 'Image',    color: 'bg-green-50 text-green-600' },
  CAROUSEL_ALBUM: { label: 'Carousel', color: 'bg-purple-50 text-purple-500' },
  REELS:          { label: 'Reels',    color: 'bg-pink-50 text-pink-500' },
}

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtReach(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}

function truncate(str, max = 45) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumb({ src, alt }) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      {src
        ? <img src={src} alt={alt} className="h-full w-full object-cover" />
        : (
          <div className="flex h-full w-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      }
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </td>
      ))}
      <td className="px-6 py-4" />
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WatchlistPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const { items, loading, remove } = useWatchlist(token)

  const [filterCategory, setFilterCategory] = useState('')
  const [filterCountry,  setFilterCountry]  = useState('')
  const [removing, setRemoving] = useState(null)

  // Unique categories & countries derived from watchlist items
  const categories = useMemo(() => {
    const set = new Set()
    items.forEach((item) => {
      const cats = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
      cats.forEach((c) => set.add(c))
    })
    return [...set].sort()
  }, [items])

  const countries = useMemo(() => {
    const set = new Set()
    items.forEach((item) => { if (item.userData?.country) set.add(item.userData.country) })
    return [...set].sort()
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterCategory) {
        const cats = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
        if (!cats.includes(filterCategory)) return false
      }
      if (filterCountry && item.userData?.country !== filterCountry) return false
      return true
    })
  }, [items, filterCategory, filterCountry])

  async function handleRemove(e, mediaId) {
    e.stopPropagation()
    setRemoving(mediaId)
    try {
      await remove(mediaId)
    } finally {
      setRemoving(null)
    }
  }

  const anyFilter = filterCategory || filterCountry

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Watchlist</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Videos flagged for review or follow-up.</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center self-start rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-500">
            {filtered.length.toLocaleString()} item{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={SELECT}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className={`${SELECT} ml-auto`}
        >
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {anyFilter && (
          <button
            onClick={() => { setFilterCategory(''); setFilterCountry('') }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                <th className={COL}>Post</th>
                <th className={COL}>Creator</th>
                <th className={COL}>Category</th>
                <th className={COL}>Sub-Category</th>
                <th className={COL}>Reach</th>
                <th className={COL}>Beed+ Score</th>
                <th className={COL}>Added</th>
                <th className={`${COL} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-sm text-gray-400 dark:text-gray-500">
                    {items.length === 0 ? 'No videos in the watchlist yet.' : 'No items match the current filters.'}
                  </td>
                </tr>
              )}

              {!loading && filtered.map((item) => {
                const thumb    = item.media?.thumbnailUrl ?? item.media?.mediaUrl
                const caption  = item.media?.caption
                const type     = item.media?.mediaType
                const username = item.instagramUsername || item.userData?.username
                const country  = item.userData?.country
                const cats     = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
                const subCat   = item.subCategory?.name ?? null
                const isRemoving = removing === item.mediaId?.toString()

                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/posts/${item.mediaId}`)}
                  >
                    {/* Post */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Thumb src={thumb} alt={caption} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                            {truncate(caption)}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <MediaTypeBadge type={type} />
                            {country && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                {country}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="px-6 py-4">
                      {username
                        ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">@{username}</p>
                            {country && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
                          </div>
                        )
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {cats.length > 0
                          ? cats.map((c) => (
                              <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                {c}
                              </span>
                            ))
                          : <span className="text-gray-300 dark:text-gray-600">—</span>
                        }
                      </div>
                    </td>

                    {/* Sub-Category */}
                    <td className="px-6 py-4">
                      {subCat
                        ? <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">{subCat}</span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>

                    {/* Reach */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {fmtReach(item.insights?.reach)}
                    </td>

                    {/* Beed+ Score */}
                    <td className="px-6 py-4 text-sm font-bold text-orange-500">
                      {item.beedPlusScore ? Number(item.beedPlusScore).toFixed(2) : '—'}
                    </td>

                    {/* Added */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={isRemoving}
                        onClick={(e) => handleRemove(e, item.mediaId)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        {isRemoving
                          ? <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        }
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
