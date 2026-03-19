import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

function fmtBeedScore(n) {
  if (n == null) return '—'
  return Number(n).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Convert ISO/date string → YYYY-MM-DD for input[type=date]
function toInputDate(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
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

// ─── Calendar Picker ──────────────────────────────────────────────────────────
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
        root:          'rdp-root',
        month_grid:    'w-full border-collapse',
        months:        'relative',
        month:         'w-full',
        month_caption: 'flex items-center justify-center h-9 mb-1',
        caption_label: 'text-sm font-bold text-gray-800 dark:text-white',
        nav:           'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: 'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition',
        button_next:     'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition',
        weekdays:      'grid grid-cols-7',
        weekday:       'text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400 py-1.5',
        week:          'grid grid-cols-7',
        day:           'flex items-center justify-center p-0',
        day_button:    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500',
        selected:      '[&>button]:bg-orange-500 [&>button]:text-white [&>button]:shadow-sm [&>button]:hover:bg-orange-500 [&>button]:hover:text-white',
        disabled:      '[&>button]:text-gray-300 dark:[&>button]:text-gray-600 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-gray-300',
        today:         '[&>button]:font-black',
        outside:       'opacity-0 pointer-events-none',
      }}
    />
  )
}

// ─── Group a day's rankings by category ───────────────────────────────────────
function groupByCategory(rawRankings) {
  const grouped = {}
  rawRankings.forEach((item) => {
    const cats = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
    const cat = cats[0] ?? 'Uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })
  return Object.entries(grouped).map(([category, rankings]) => ({ category, rankings }))
}

export default function PostRankingsPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()

  const [allDays, setAllDays]       = useState([])       // all days from API
  const [data, setData]             = useState(null)     // { date, categories: [...] }
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState(0)        // 0 = All, 1+ = category idx
  const [page, setPage]             = useState(1)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [filterCountry, setFilterCountry] = useState('')

  console.log("data", data)
  
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    instagramApi.getDailyTop100()
      .then((res) => {
        if (!cancelled) {
          const days = Array.isArray(res?.days) ? res.days : (Array.isArray(res) ? res : null)
          const latestDay = days ? days[days.length - 1] : res
          const rawRankings = latestDay?.rankings ?? []
          const categories = groupByCategory(rawRankings)

          // If API returns a single day object (not an array), wrap it so the calendar has a date
          setAllDays(days ?? (latestDay ? [latestDay] : []))
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

  function selectDate(iso) {  // iso = YYYY-MM-DD
    if (!iso || allDays.length === 0) return
    const match = allDays.find((d) => toInputDate(d.date) === iso)
    if (!match) return
    const categories = groupByCategory(match.rankings ?? [])
    setData({ date: match.date, categories })
    setActiveTab(0)
    setPage(1)
  }

  // Tabs: "All" + one per category
  const categories = data?.categories ?? []
  const allRankings = categories
    .flatMap((c) => c.rankings)
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))

  // Unique countries from current day's rankings
  const availableCountries = useMemo(() => {
    const set = new Set()
    allRankings.forEach((r) => { if (r.userData?.country) set.add(r.userData.country) })
    return [...set].sort()
  }, [allRankings])

  // What the current tab shows, filtered by country
  const isAllTab = activeTab === 0
  const tabRankings = isAllTab ? allRankings : (categories[activeTab - 1]?.rankings ?? [])
  const rankings = filterCountry
    ? tabRankings.filter((r) => r.userData?.country === filterCountry)
    : tabRankings
  const totalPages = Math.ceil(rankings.length / PAGE_SIZE)
  const paged      = rankings

  const totalPosts = allRankings.length

  // Country-filtered counts per tab (for chips)
  const filteredAllCount = filterCountry
    ? allRankings.filter((r) => r.userData?.country === filterCountry).length
    : allRankings.length
  const filteredCatCounts = categories.map((cat) =>
    filterCountry
      ? (cat.rankings ?? []).filter((r) => r.userData?.country === filterCountry).length
      : (cat.rankings?.length ?? 0)
  )
  const countryTotal = filterCountry
    ? allRankings.filter((r) => r.userData?.country === filterCountry).length
    : allRankings.length

  const availableDates = allDays.map((d) => toInputDate(d.date)).filter(Boolean)

  // Close calendar on outside click (but not when clicking the trigger button itself)
  const calendarWrapRef = useRef(null)
  useEffect(() => {
    if (!calendarOpen) return
    function handler(e) {
      if (calendarWrapRef.current && !calendarWrapRef.current.contains(e.target)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [calendarOpen])

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
        {/* Date picker — MUI-style input */}
        <div ref={calendarWrapRef} className="relative self-start">
          <div
            onClick={() => setCalendarOpen((o) => !o)}
            className={`
              flex w-52 cursor-pointer items-center gap-2 rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 transition-all
              ${calendarOpen
                ? 'border-orange-500 ring-2 ring-orange-500/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
          >
            {/* Calendar icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 ${calendarOpen ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>

            {/* Date value */}
            <span className={`flex-1 text-sm ${data?.date ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
              {data?.date ? fmtDate(data.date) : 'Select date'}
            </span>

            {/* Dropdown chevron */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${calendarOpen ? 'rotate-180 text-orange-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Label above (like MUI floating label) */}
          <span className={`pointer-events-none absolute -top-2 left-2.5 px-1 text-[10px] font-medium transition-colors bg-white dark:bg-gray-800 ${calendarOpen ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
            Ranking date
          </span>

          {calendarOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-3 min-w-[280px]">
              {availableDates.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  {loading ? 'Loading dates…' : 'No ranking dates available.'}
                </p>
              ) : (
                <CalendarPicker
                  value={data?.date ? toInputDate(data.date) : ''}
                  availableDates={availableDates}
                  onChange={(iso) => { selectDate(iso); setCalendarOpen(false) }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Categories</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : categories.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Countries</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : availableCountries.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Post</p>
            {filterCountry && (
              <button
                onClick={() => { setFilterCountry(''); setPage(1) }}
                className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {loading ? '...' : filterCountry ? countryTotal : totalPosts}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {filterCountry ? 'posts' : 'total posts'}
              </p>
            </div>
            <select
              value={filterCountry}
              onChange={(e) => { setFilterCountry(e.target.value); setPage(1) }}
              disabled={loading || availableCountries.length === 0}
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer disabled:opacity-40"
            >
              <option value="">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
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
          {/* Category tabs — "All" + one per category */}
          {!loading && categories.length > 0 && (
            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 scrollbar-none">
              {/* All tab */}
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
                  {filteredAllCount}
                </span>
              </button>

              {/* Per-category tabs */}
              {categories.map((cat, idx) => (
                <button
                  key={cat.category}
                  onClick={() => switchTab(idx + 1)}
                  className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition border-b-2 ${
                    idx + 1 === activeTab
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {cat.category}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    idx + 1 === activeTab ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {filteredCatCounts[idx]}
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
                      No rankings available{isAllTab ? '' : ' for this category'}.
                    </td>
                  </tr>
                )}

                {!loading && paged.map((item, idx) => {
                  const rank       = (!isAllTab || filterCountry) ? idx + 1 : (item.rank ?? idx + 1)
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
                          {fmtBeedScore(item.beedPlusScore)}
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
                          onClick={() => navigate(`/dashboard/rankings/posts/${item.instagramMediaId}`, { state: { post: { ...item, rankingDate: data?.date } } })}
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

        </div>
      )}
    </div>
  )
}
