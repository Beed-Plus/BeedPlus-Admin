import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { instagramApi } from '../../../utils/instagramApi'
import { DayPicker } from 'react-day-picker'

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

// Get insight for a specific date (YYYY-MM-DD) or latest if null
function getInsightForDate(p, dateStr) {
  const arr = p.insights?.dailyInsights
  if (!Array.isArray(arr) || !arr.length) return null
  if (!dateStr) return arr[arr.length - 1]
  return arr.find((d) => d.date && new Date(d.date).toISOString().slice(0, 10) === dateStr)
    ?? arr[arr.length - 1]
}

const DAILY_METRICS = [
  { key: 'beedPlusScore',     label: 'Beed+ Score',        path: (p) => p.beedPlusScore,                     format: (v) => fmtBeedScore(v) },
  { key: 'currentRank',       label: 'Current Rank',       path: (p) => p.currentRank,                       format: (v) => v ? `#${v}` : '—', lowerBetter: true },
  { key: 'clicks',            label: 'Clicks',             path: (p) => p.clicks },
  { key: 'views',             label: 'Views',              path: (p) => p._activeInsight?.views },
  { key: 'reach',             label: 'Reach',              path: (p) => p._activeInsight?.reach },
  { key: 'totalInteractions', label: 'Total Interactions', path: (p) => p._activeInsight?.totalInteractions },
  { key: 'likes',             label: 'Likes',              path: (p) => p._activeInsight?.likes },
  { key: 'commentsCount',     label: 'Comments',           path: (p) => p._activeInsight?.commentsCount },
  { key: 'shares',            label: 'Shares',             path: (p) => p._activeInsight?.shares },
  { key: 'saved',             label: 'Saved',              path: (p) => p._activeInsight?.saved },
]

const LIFETIME_METRICS = [
  { key: 'lt_views',             label: 'Views',              path: (p) => p.insights?.views },
  { key: 'lt_reach',             label: 'Reach',              path: (p) => p.insights?.reach },
  { key: 'lt_totalInteractions', label: 'Total Interactions', path: (p) => p.insights?.totalInteractions },
  { key: 'lt_likes',             label: 'Likes',              path: (p) => p.insights?.likes },
  { key: 'lt_commentsCount',     label: 'Comments',           path: (p) => p.insights?.commentsCount },
  { key: 'lt_shares',            label: 'Shares',             path: (p) => p.insights?.shares },
  { key: 'lt_saved',             label: 'Saved',              path: (p) => p.insights?.saved },
]

const METRICS = [...DAILY_METRICS, ...LIFETIME_METRICS]

// ─── Calendar Picker ───────────────────────────────────────────────────────────
function CalendarPicker({ value, availableDates, onChange }) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates])
  const selected = value ? new Date(value + 'T00:00:00') : undefined

  function handleSelect(date) {
    if (!date) return
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    onChange(iso)
  }

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      defaultMonth={selected}
      disabled={(date) => {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return !availableSet.has(iso)
      }}
      classNames={{
        root:            'rdp-root',
        month_grid:      'w-full border-collapse',
        months:          'relative',
        month:           'w-full',
        month_caption:   'flex items-center justify-center h-9 mb-1',
        caption_label:   'text-sm font-bold text-gray-800 dark:text-white',
        nav:             'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: 'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition',
        button_next:     'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition',
        weekdays:        'grid grid-cols-7',
        weekday:         'text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400 py-1.5',
        week:            'grid grid-cols-7',
        day:             'flex items-center justify-center p-0',
        day_button:      'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500',
        selected:        '[&>button]:bg-orange-500 [&>button]:text-white [&>button]:shadow-sm [&>button]:hover:bg-orange-500 [&>button]:hover:text-white',
        disabled:        '[&>button]:text-gray-300 dark:[&>button]:text-gray-600 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-gray-300',
        today:           '[&>button]:font-black',
        outside:         'opacity-0 pointer-events-none',
      }}
    />
  )
}

// ─── Post Selector Panel ───────────────────────────────────────────────────────
function PostSelectorPanel({ label, color, posts, loading, selected, onSelect }) {
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

  const accentText  = color === 'orange' ? 'text-orange-500'  : 'text-violet-500'
  const accentRing  = color === 'orange' ? 'ring-orange-400'  : 'ring-violet-400'
  const accentBg    = color === 'orange' ? 'bg-orange-400'    : 'bg-violet-400'
  const accentBorder = color === 'orange' ? 'border-orange-200 dark:border-orange-500/30' : 'border-violet-200 dark:border-violet-500/30'

  if (selected) {
    const thumb    = selected.media?.thumbnailUrl ?? selected.media?.mediaUrl
    const username = selected.instagramUsername || selected.userData?.username
    const profilePic = selected.userData?.profilePicture
    const cats     = Array.isArray(selected.category) ? selected.category : [selected.category].filter(Boolean)

    return (
      <div className={`flex flex-col rounded-2xl border ${accentBorder} bg-white dark:bg-gray-900 overflow-hidden shadow-sm`}>
        {/* Card header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${accentBorder}`}>
          <span className={`text-xs font-black uppercase tracking-widest ${accentText}`}>Daily Insight{username ? ` @${username}` : ''}</span>
          <button onClick={() => onSelect(null)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition">Change</button>
        </div>

        {/* Post identity */}
        <div className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-gray-800/60">
          <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ${accentRing} shadow`}>
            {thumb
              ? <img src={thumb} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
            }
          </div>
          <div className="min-w-0 flex-1">
            {username && (
              <div className="flex items-center gap-1.5 mb-1">
                {profilePic
                  ? <img src={profilePic} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                  : <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${accentBg}`}>
                      {(username[0] ?? 'U').toUpperCase()}
                    </div>
                }
                <p className={`text-sm font-bold ${accentText}`}>@{username}</p>
              </div>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug line-clamp-2">
              {truncate(selected.media?.caption, 80)}
            </p>
            {cats.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {cats.map((c) => (
                  <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">{c}</span>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{fmtDate(selected.createdAt)}</p>
          </div>
        </div>

        {/* Daily Insight Metrics */}
        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800/60">
          {selected.__metrics?.filter(({ metric }) => !metric.key.startsWith('lt_')).map(({ metric, value, wins, display }) => (
            <div key={metric.key} className={`flex items-center justify-between px-4 py-3 ${wins ? (color === 'orange' ? 'bg-orange-50/50 dark:bg-orange-500/5' : 'bg-violet-50/50 dark:bg-violet-500/5') : ''}`}>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{metric.label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${wins ? accentText : 'text-gray-700 dark:text-gray-200'}`}>
                  {display}
                </span>
                {wins && (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${accentText}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Selector (no post chosen yet) ─────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <span className={`text-xs font-black uppercase tracking-widest ${accentText}`}>{label}</span>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
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
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
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
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
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
                  {username && <p className={`text-xs font-semibold ${accentText}`}>@{username}</p>}
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

// ─── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ m, color }) {
  const accentText   = color === 'orange' ? 'text-orange-500'  : 'text-violet-500'
  const accentBg     = color === 'orange' ? 'bg-orange-50/60 dark:bg-orange-500/5'  : 'bg-violet-50/60 dark:bg-violet-500/5'
  const accentCheck  = color === 'orange' ? 'text-orange-400'  : 'text-violet-400'
  const accentBorder = color === 'orange' ? 'border-orange-100 dark:border-orange-500/20' : 'border-violet-100 dark:border-violet-500/20'
  const label        = color === 'orange' ? 'A' : 'B'

  return (
    <div className={`flex flex-col rounded-2xl border ${m.wins ? accentBorder : 'border-gray-100 dark:border-gray-800'} ${m.wins ? accentBg : 'bg-white dark:bg-gray-900'} shadow-sm px-4 py-4`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        {m.metric.label}
      </span>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-black ${m.wins ? accentText : 'text-gray-800 dark:text-gray-100'}`}>
          {m.display}
        </span>
        {m.wins && (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${accentCheck}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ComparePostsPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const { state } = useLocation()

  const [allPosts, setAllPosts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [postA, setPostA]         = useState(state?.postA ?? null)
  const [postB, setPostB]         = useState(null)
  // Full data (with dailyInsights) fetched per selected post
  const [fullA, setFullA]         = useState(null)
  const [fullB, setFullB]         = useState(null)
  const [selectedDate, setSelectedDate] = useState(null) // null = latest
  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef(null)

  useEffect(() => {
    if (!calendarOpen) return
    function handler(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setCalendarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [calendarOpen])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    instagramApi.getAllSubmittedMediaForAdmin(token)
      .then((res) => { if (!cancelled) setAllPosts(Array.isArray(res) ? res : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  // Fetch full data when Post A is selected
  useEffect(() => {
    if (!postA) { setFullA(null); return }
    let cancelled = false
    instagramApi.getMediaByIdForAdmin(postA._id, token)
      .then((res) => { if (!cancelled) setFullA(res.media ?? res) })
      .catch(() => { if (!cancelled) setFullA(postA) }) // fallback to list data
    return () => { cancelled = true }
  }, [postA?._id, token])

  // Fetch full data when Post B is selected
  useEffect(() => {
    if (!postB) { setFullB(null); return }
    let cancelled = false
    instagramApi.getMediaByIdForAdmin(postB._id, token)
      .then((res) => { if (!cancelled) setFullB(res.media ?? res) })
      .catch(() => { if (!cancelled) setFullB(postB) })
    return () => { cancelled = true }
  }, [postB?._id, token])

  const postsForA = useMemo(() => allPosts.filter((p) => p._id !== postB?._id), [allPosts, postB])
  const postsForB = useMemo(() => allPosts.filter((p) => p._id !== postA?._id), [allPosts, postA])

  const ready = postA && postB && fullA && fullB

  // Unique sorted dates from both posts' dailyInsights
  const availableDates = useMemo(() => {
    const set = new Set()
    ;[fullA, fullB].forEach((p) => {
      if (!p) return
      ;(p.insights?.dailyInsights ?? []).forEach((d) => {
        if (d.date) set.add(new Date(d.date).toISOString().slice(0, 10))
      })
    })
    return [...set].sort().reverse()
  }, [fullA, fullB])

  // Enrich posts with per-metric win state so the card can render them
  const enriched = useMemo(() => {
    if (!ready) return { a: postA, b: postB }

    function enrich(post, other) {
      const withInsight      = { ...post,  _activeInsight: getInsightForDate(post,  selectedDate) }
      const otherWithInsight = { ...other, _activeInsight: getInsightForDate(other, selectedDate) }
      const metrics = METRICS.map((metric) => {
        const rawSelf  = metric.path(withInsight)
        const rawOther = metric.path(otherWithInsight)
        const numSelf  = typeof rawSelf  === 'number' ? rawSelf  : 0
        const numOther = typeof rawOther === 'number' ? rawOther : 0
        const wins = metric.lowerBetter
          ? numSelf < numOther
          : numSelf > numOther
        const tied = numSelf === numOther
        return {
          metric,
          value: rawSelf,
          display: metric.format ? metric.format(rawSelf) : fmt(rawSelf),
          wins: wins && !tied,
        }
      })
      return { ...withInsight, __metrics: metrics }
    }

    return { a: enrich(fullA, fullB), b: enrich(fullB, fullA) }
  }, [fullA, fullB, selectedDate, ready])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Compare Posts</h1>
          <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">Select two posts to compare their performance side by side.</p>
        </div>
        {ready && availableDates.length > 0 && (
          <div ref={calendarRef} className="relative shrink-0">
            <div
              onClick={() => setCalendarOpen((o) => !o)}
              className={`flex w-48 cursor-pointer items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2 transition-all ${calendarOpen ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 ${calendarOpen ? 'text-orange-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`flex-1 text-sm ${selectedDate ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Latest'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${calendarOpen ? 'rotate-180 text-orange-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className={`pointer-events-none absolute -top-2 left-2.5 px-1 text-[10px] font-medium bg-white dark:bg-gray-800 transition-colors ${calendarOpen ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
              Insight date
            </span>
            {calendarOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-3 min-w-[280px]">
                <CalendarPicker
                  value={selectedDate ?? availableDates[0]}
                  availableDates={availableDates}
                  onChange={(iso) => { setSelectedDate(iso); setCalendarOpen(false) }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PostSelectorPanel color="orange" label="Post A" posts={postsForA} loading={loading} selected={enriched.a} onSelect={setPostA} />

        {/* VS divider — only visible on desktop between the two columns */}
        <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center justify-center pointer-events-none" style={{ top: 0, bottom: 0 }}>
        </div>

        <PostSelectorPanel color="violet" label="Post B" posts={postsForB} loading={loading} selected={enriched.b} onSelect={setPostB} />
      </div>

      {/* Archived Lifetime */}
      {ready && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Archived Lifetime</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Post A lifetime */}
              <div className="rounded-2xl border border-orange-100 dark:border-orange-500/20 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-orange-50 dark:border-orange-500/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Archived Lifetime{fullA?.instagramUsername || fullA?.userData?.username ? ` @${fullA.instagramUsername || fullA.userData.username}` : ''}</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {LIFETIME_METRICS.map((metric) => {
                    const m = enriched.a.__metrics.find((x) => x.metric.key === metric.key)
                    return (
                      <div key={metric.key} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{metric.label}</span>
                        <span className={`text-sm font-bold ${m?.wins ? 'text-orange-500' : 'text-gray-700 dark:text-gray-200'}`}>{m?.display ?? '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Post B lifetime */}
              <div className="rounded-2xl border border-violet-100 dark:border-violet-500/20 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-violet-50 dark:border-violet-500/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Archived Lifetime{fullB?.instagramUsername || fullB?.userData?.username ? ` @${fullB.instagramUsername || fullB.userData.username}` : ''}</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {LIFETIME_METRICS.map((metric) => {
                    const m = enriched.b.__metrics.find((x) => x.metric.key === metric.key)
                    return (
                      <div key={metric.key} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{metric.label}</span>
                        <span className={`text-sm font-bold ${m?.wins ? 'text-violet-500' : 'text-gray-700 dark:text-gray-200'}`}>{m?.display ?? '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Loading full data */}
      {postA && postB && !ready && (
        <div className="flex items-center justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}

      {/* Empty state — only when at least one post is missing */}
      {(!postA || !postB) && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-14 text-center shadow-sm">
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
    </div>
  )
}
