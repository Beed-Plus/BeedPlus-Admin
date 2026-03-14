import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { instagramApi } from '../../../utils/instagramApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

function fmtBeedScore(n) {
  if (n == null) return '—'
  return Number(n).toFixed(10)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(str, max = 50) {
  if (!str) return 'No caption'
  return str.length > max ? str.slice(0, max) + '…' : str
}

const METRICS = [
  { key: 'beedPlusScore',               label: 'Beed+ Score',        path: (p) => p.beedPlusScore,                  highlight: true, format: (v) => fmtBeedScore(v) },
  { key: 'currentRank',                 label: 'Current Rank',       path: (p) => p.currentRank,                    format: (v) => v ? `#${v}` : '—', lowerBetter: true },
  { key: 'clicks',                      label: 'Clicks',             path: (p) => p.clicks },
  { key: 'views',                       label: 'Views',              path: (p) => p.insights?.views },
  { key: 'reach',                       label: 'Reach',              path: (p) => p.insights?.reach },
  { key: 'totalInteractions',           label: 'Total Interactions', path: (p) => p.insights?.totalInteractions },
  { key: 'likes',                       label: 'Likes',              path: (p) => p.insights?.likes },
  { key: 'commentsCount',               label: 'Comments',           path: (p) => p.insights?.commentsCount },
  { key: 'shares',                      label: 'Shares',             path: (p) => p.insights?.shares },
  { key: 'saved',                       label: 'Saved',              path: (p) => p.insights?.saved },
]

// ─── Post Selector Panel ───────────────────────────────────────────────────────
function PostSelectorPanel({ label, posts, loading, selected, onSelect }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return posts.slice(0, 20)
    const q = query.toLowerCase()
    return posts.filter((p) => {
      const caption  = (p.media?.caption ?? '').toLowerCase()
      const username = (p.instagramUsername ?? p.userData?.username ?? '').toLowerCase()
      return caption.includes(q) || username.includes(q)
    }).slice(0, 20)
  }, [query, posts])

  if (selected) {
    const thumb    = selected.media?.thumbnailUrl ?? selected.media?.mediaUrl
    const username = selected.instagramUsername || selected.userData?.username
    const cats     = Array.isArray(selected.category) ? selected.category : [selected.category].filter(Boolean)

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
          <button
            onClick={() => onSelect(null)}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
          >
            Change
          </button>
        </div>
        <div className="rounded-2xl border border-orange-200 dark:border-orange-500/30 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              {thumb
                ? <img src={thumb} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
              }
            </div>
            <div className="min-w-0 flex-1">
              {username && <p className="text-xs font-bold text-orange-500">@{username}</p>}
              <p className="mt-0.5 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
                {truncate(selected.media?.caption, 80)}
              </p>
              {cats.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {cats.map((c) => (
                    <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by caption or username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">No posts found</p>
          )}
          {!loading && filtered.map((post) => {
            const thumb    = post.media?.thumbnailUrl ?? post.media?.mediaUrl
            const username = post.instagramUsername || post.userData?.username
            return (
              <button
                key={post._id}
                onClick={() => onSelect(post)}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-500/5 transition"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {thumb
                    ? <img src={thumb} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  {username && <p className="text-xs font-semibold text-orange-500">@{username}</p>}
                  <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{truncate(post.media?.caption, 45)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Metric Row ────────────────────────────────────────────────────────────────
function MetricRow({ metric, postA, postB }) {
  const rawA = metric.path(postA)
  const rawB = metric.path(postB)
  const numA = typeof rawA === 'number' ? rawA : 0
  const numB = typeof rawB === 'number' ? rawB : 0
  const total = numA + numB

  const barA = total > 0 ? (numA / total) * 100 : 50
  const barB = total > 0 ? (numB / total) * 100 : 50

  const aWins = metric.lowerBetter ? numA < numB : numA > numB
  const bWins = metric.lowerBetter ? numB < numA : numB > numA
  const tied  = numA === numB

  const displayA = metric.format ? metric.format(rawA) : fmt(rawA)
  const displayB = metric.format ? metric.format(rawB) : fmt(rawB)

  return (
    <div className="py-4 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
      <div className="flex items-center gap-4">
        {/* Value A */}
        <div className="w-24 text-right shrink-0">
          <span className={`text-sm font-bold ${aWins && !tied ? 'text-orange-500' : 'text-gray-700 dark:text-gray-200'}`}>
            {displayA}
          </span>
        </div>

        {/* Bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {metric.label}
          </p>
          <div className="flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-full rounded-l-full transition-all duration-500 ${aWins && !tied ? 'bg-orange-400' : 'bg-gray-300 dark:bg-gray-600'}`}
              style={{ width: `${barA}%` }}
            />
            <div
              className={`h-full rounded-r-full transition-all duration-500 ${bWins && !tied ? 'bg-violet-400' : 'bg-gray-200 dark:bg-gray-700'}`}
              style={{ width: `${barB}%` }}
            />
          </div>
        </div>

        {/* Value B */}
        <div className="w-24 shrink-0">
          <span className={`text-sm font-bold ${bWins && !tied ? 'text-violet-500' : 'text-gray-700 dark:text-gray-200'}`}>
            {displayB}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Post Header ──────────────────────────────────────────────────────────────
function PostHeader({ post, color }) {
  const thumb    = post.media?.thumbnailUrl ?? post.media?.mediaUrl
  const username = post.instagramUsername || post.userData?.username
  const profilePic = post.userData?.profilePicture

  return (
    <div className="flex flex-col items-center gap-3 text-center p-5">
      <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ${color === 'orange' ? 'ring-orange-400' : 'ring-violet-400'} shadow-md`}>
        {thumb
          ? <img src={thumb} alt="" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
        }
      </div>
      <div>
        {username && (
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {profilePic
              ? <img src={profilePic} alt="" className="h-5 w-5 rounded-full object-cover" />
              : <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${color === 'orange' ? 'bg-orange-400' : 'bg-violet-400'}`}>
                  {(username[0] ?? 'U').toUpperCase()}
                </div>
            }
            <p className={`text-sm font-bold ${color === 'orange' ? 'text-orange-500' : 'text-violet-500'}`}>@{username}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 max-w-[160px]">
          {truncate(post.media?.caption, 60)}
        </p>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{fmtDate(post.createdAt)}</p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ComparePostsPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const { state } = useLocation()

  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [postA, setPostA]       = useState(state?.postA ?? null)
  const [postB, setPostB]       = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    instagramApi.getAllSubmittedMediaForAdmin(token)
      .then((res) => { if (!cancelled) setAllPosts(Array.isArray(res) ? res : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  // Prevent selecting the same post for both sides
  const postsForA = useMemo(() => allPosts.filter((p) => p._id !== postB?._id), [allPosts, postB])
  const postsForB = useMemo(() => allPosts.filter((p) => p._id !== postA?._id), [allPosts, postA])

  const ready = postA && postB

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Compare Posts</h1>
        <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">Select two posts to compare their performance side by side.</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PostSelectorPanel label="Post A" posts={postsForA} loading={loading} selected={postA} onSelect={setPostA} />
        <PostSelectorPanel label="Post B" posts={postsForB} loading={loading} selected={postB} onSelect={setPostB} />
      </div>

      {/* Empty state */}
      {!ready && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">
            {!postA && !postB ? 'Select both posts to start comparing' : 'Select the second post to compare'}
          </p>
        </div>
      )}

      {/* Comparison */}
      {ready && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Post headers */}
          <div className="grid grid-cols-[1fr_auto_1fr] border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
            <PostHeader post={postA} color="orange" />
            <div className="flex items-center justify-center px-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-black text-gray-400 dark:text-gray-500">VS</span>
            </div>
            <PostHeader post={postB} color="violet" />
          </div>

          {/* Metrics */}
          <div className="px-6 py-2">
            {METRICS.map((metric) => (
              <MetricRow key={metric.key} metric={metric} postA={postA} postB={postB} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 border-t border-gray-50 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Post A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Post B</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-5 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Tied / No data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
