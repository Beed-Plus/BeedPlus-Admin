import { useState } from 'react'
import { Link } from 'react-router-dom'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'
const PREVIEW_COUNT = 5

function formatNum(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

export default function TopHitsTable({ hits, loading }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? hits : hits.slice(0, PREVIEW_COUNT)

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <div className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
              {['Rank', 'Post Content', 'Creator', 'Category', 'Weekly Views', 'Weekly Score', ''].map((h) => (
                <th key={h} className={COL}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                <td className="px-6 py-4"><div className="h-5 w-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-48 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-8 w-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Rankings</h2>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
            <th className={COL}>Rank</th>
            <th className={COL}>Post Content</th>
            <th className={COL}>Creator</th>
            <th className={COL}>Category</th>
            <th className={COL}>Weekly Views</th>
            <th className={COL}>Weekly Score</th>
            <th className={COL} />
          </tr>
        </thead>
        <tbody>
          {visible.map((hit) => {
            const rank = hit.rank
            const isFirst = rank === 1
            const username = hit.userData?.username ?? hit.username ?? '—'
            const country = hit.userData?.country ?? ''
            const profilePic = hit.userData?.profilePicture
            const category = Array.isArray(hit.category) ? hit.category[0] : (hit.category ?? '—')
            const caption = hit.caption ?? ''

            return (
              <tr key={hit.instagramMediaId ?? rank} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition-colors">

                {/* Rank */}
                <td className="px-6 py-4">
                  <span className={`text-base font-black tabular-nums ${isFirst ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}>
                    {String(rank).padStart(2, '0')}
                  </span>
                </td>

                {/* Post Content */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {(hit.thumbnailUrl || hit.media_url) ? (
                      <img
                        src={hit.thumbnailUrl || hit.media_url}
                        alt="thumbnail"
                        className="h-11 w-11 shrink-0 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 max-w-xs">
                        {caption || 'No caption'}
                      </p>
                      {hit.permalink && (
                        <a
                          href={hit.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-400 hover:text-orange-600 transition"
                        >
                          View on Instagram ↗
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                {/* Creator */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {profilePic ? (
                      <img src={profilePic} alt={username} className="h-7 w-7 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-xs font-bold text-orange-600">
                        {username[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">@{username}</p>
                      {country && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {category}
                  </span>
                </td>

                {/* Weekly Views */}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatNum(hit.weeklyViews)}
                </td>

                {/* Weekly Score */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-orange-500">
                    {formatNum(hit.weeklyBeedPlusScore)}
                  </span>
                </td>

                {/* View */}
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/dashboard/posts/${hit.instagramMediaId}`}
                    state={{
                      post: {
                        _id: hit.instagramMediaId,
                        media: {
                          caption: hit.caption,
                          thumbnailUrl: hit.thumbnailUrl || hit.media_url,
                          permalink: hit.permalink,
                        },
                        userData: hit.userData,
                        instagramUsername: hit.userData?.username,
                        beedPlusScore: hit.weeklyBeedPlusScore,
                        currentRank: hit.rank,
                        category: hit.category,
                        userId: hit.userData?.userId,
                        insights: {
                          views: hit.weeklyViews,
                          reach: hit.weeklyReach,
                          totalInteractions: hit.weeklyInteractions,
                        },
                      },
                    }}
                    className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-orange-300 hover:text-orange-500 transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}

          {hits.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                No top hits data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Show all / collapse */}
      {hits.length > PREVIEW_COUNT && (
        <button
          onClick={() => setShowAll((p) => !p)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 dark:border-gray-800 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-orange-500 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All ${hits.length} Posts`}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}
