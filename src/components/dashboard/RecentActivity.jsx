import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { activitiesApi } from '../../utils/activitiesApi'

// ─── Activity type config ────────────────────────────────────────────────────
const TYPE_CONFIG = {
  media_submitted: {
    label: 'Submitted a post',
    color: 'bg-orange-50 text-orange-600',
    dot: 'bg-orange-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  ranking_updated: {
    label: 'Ranking updated',
    color: 'bg-amber-50 text-amber-600',
    dot: 'bg-amber-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  user_signup: {
    label: 'Joined Beed+',
    color: 'bg-green-50 text-green-600',
    dot: 'bg-green-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  user_approved: {
    label: 'Account approved',
    color: 'bg-blue-50 text-blue-600',
    dot: 'bg-blue-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  instagram_connected: {
    label: 'Connected Instagram',
    color: 'bg-purple-50 text-purple-600',
    dot: 'bg-purple-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  instagram_disconnected: {
    label: 'Disconnected Instagram',
    color: 'bg-red-50 text-red-500',
    dot: 'bg-red-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
}

const FALLBACK = {
  label: 'Activity',
  color: 'bg-gray-100 text-gray-500',
  dot: 'bg-gray-300',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function displayName(activity) {
  return activity.username || 'System Auto Job'
}

function metaLine(activity) {
  const { meta, type } = activity
  if (!meta || Object.keys(meta).length === 0) return null
  if (type === 'media_submitted' && meta.category) return `Category: ${meta.category}`
  if (type === 'ranking_updated' && meta.rank)     return `Rank #${meta.rank}`
  return null
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 w-48 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecentActivity() {
  const { auth } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await activitiesApi.getActivities(auth?.token, 20)
        if (!cancelled) setActivities(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load activity')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [auth?.token])

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          {!loading && !error && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{activities.length} recent events</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-500">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-8 text-center text-sm text-red-500">{error}</div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && activities.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-gray-400">No activity yet</div>
      )}

      {/* Desktop list */}
      {!loading && !error && activities.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Activity</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Details</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((row) => {
                  const cfg  = TYPE_CONFIG[row.type] ?? FALLBACK
                  const meta = metaLine(row)
                  return (
                    <tr key={row._id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      {/* User */}
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                          {displayName(row)}
                        </span>
                      </td>
                      {/* Activity badge */}
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      {/* Meta */}
                      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-gray-500">
                        {meta ?? <span className="text-gray-200 dark:text-gray-700">—</span>}
                      </td>
                      {/* Time */}
                      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-gray-500 text-right whitespace-nowrap">
                        {fmtDateTime(row.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800">
            {activities.map((row) => {
              const cfg  = TYPE_CONFIG[row.type] ?? FALLBACK
              const meta = metaLine(row)
              return (
                <li key={row._id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{displayName(row)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    {meta && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{meta}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap pt-0.5">{fmtDateTime(row.createdAt)}</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
