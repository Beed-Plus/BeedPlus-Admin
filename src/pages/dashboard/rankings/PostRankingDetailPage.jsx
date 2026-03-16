import { useLocation, useNavigate } from 'react-router-dom'

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

function RankBadge({ rank }) {
  if (rank === 1) return <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-white shadow">1</span>
  if (rank === 2) return <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-black text-white shadow">2</span>
  if (rank === 3) return <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-300 text-sm font-black text-white shadow">3</span>
  return <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-black text-gray-600 dark:text-gray-300">#{rank}</span>
}

function InsightCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="mt-1.5 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  )
}

export default function PostRankingDetailPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const item = state?.post

  console.log("post item", item)

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-gray-400">No ranking data found.</p>
        <button
          onClick={() => navigate('/dashboard/rankings/posts')}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          Back to Media Charts
        </button>
      </div>
    )
  }

  const {
    rank, beedPlusScore, category, insights = {},
    media = {}, userData = {},
  } = item

  const { archivedLifetimes = [], ...dailyInsights } = insights

  const cats = Array.isArray(category) ? category : [category].filter(Boolean)

  // Collect all insight keys (excluding archivedLifetimes)
  const insightEntries = Object.entries(dailyInsights).filter(([, v]) => v !== undefined && v !== null)

  // Known labels for common insight keys
  const INSIGHT_LABELS = {
    daily_views:             { label: 'Daily Views' },
    daily_totalInteractions: { label: 'Daily Interactions' },
    daily_likes:             { label: 'Daily Likes' },
    daily_comments:          { label: 'Daily Comments' },
    daily_shares:            { label: 'Daily Shares' },
    daily_saves:             { label: 'Daily Saves' },
    daily_reach:             { label: 'Daily Reach' },
    daily_impressions:       { label: 'Daily Impressions' },
    views:                   { label: 'Total Views' },
    totalInteractions:       { label: 'Total Interactions' },
    likes:                   { label: 'Likes' },
    comments:                { label: 'Comments' },
    shares:                  { label: 'Shares' },
    saves:                   { label: 'Saves' },
    reach:                   { label: 'Reach' },
    impressions:             { label: 'Impressions' },
  }

  function labelFor(key) {
    return INSIGHT_LABELS[key]?.label ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/rankings/posts')}
        className="flex items-center gap-1.5 self-start text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Media Charts
      </button>

      {/* Post card */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Thumbnail */}
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
            {media.thumbnailUrl
              ? <img src={media.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                {/* Creator */}
                <div className="flex items-center gap-2 mb-2">
                  {userData.profilePicture
                    ? <img src={userData.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                    : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-500">
                        {(userData.username?.[0] ?? 'U').toUpperCase()}
                      </div>
                  }
                  <div>
                    {userData.username && <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">@{userData.username}</p>}
                    {userData.country  && <p className="text-xs text-gray-400 dark:text-gray-500">{userData.country}</p>}
                  </div>
                </div>

                {/* Caption */}
                {media.caption && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{media.caption}</p>
                )}

                {/* Categories */}
                {cats.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cats.map((c) => (
                      <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">{c}</span>
                    ))}
                  </div>
                )}

                {/* Instagram link */}
                {media.permalink && (
                  <a
                    href={media.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-400 hover:text-orange-600 transition"
                  >
                    View on Instagram
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Rank badge */}
              {rank && <RankBadge rank={rank} />}
            </div>
          </div>
        </div>
      </div>

      {/* Score + rank strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InsightCard label="Beed+ Score" value={
          <span className="text-orange-500">{fmtBeedScore(beedPlusScore)}</span>
        } />
        <InsightCard label="Rank" value={rank ? `#${rank}` : '—'} />
        <InsightCard label="Ranking Date" value={fmtDate(item.date ?? item.rankingDate ?? item.updatedAt)} />
      </div>

      {/* Daily insights */}
      {insightEntries.length > 0 && (
        <>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Daily Insights</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {insightEntries.map(([key, value]) => (
              <InsightCard key={key} label={labelFor(key)} value={fmt(value)} />
            ))}
          </div>
        </>
      )}

      {insightEntries.length === 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-10 text-center text-sm text-gray-400 shadow-sm">
          No daily insights available for this post.
        </div>
      )}

      {/* Chart */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white">Chart</h2>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {archivedLifetimes.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No archived lifetime data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  {['Date', 'Views', 'Reach', 'Interactions', 'Shares', 'Saved'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archivedLifetimes.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{fmtDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{fmt(row.views)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{fmt(row.reach)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{fmt(row.totalInteractions)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{fmt(row.shares)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{fmt(row.saved)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
