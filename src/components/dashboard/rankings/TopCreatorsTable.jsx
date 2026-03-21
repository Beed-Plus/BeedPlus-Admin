import { Link } from 'react-router-dom'
import Pagination from '../../ui/Pagination'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

const PAGE_SIZE = 10

function RankBadge({ rank }) {
  if (rank === 1) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow-sm">1</span>
  if (rank === 2) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-white shadow-sm">2</span>
  if (rank === 3) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-xs font-black text-white shadow-sm">3</span>
  return <span className="text-sm font-semibold text-gray-500">#{rank}</span>
}

function CreatorAvatar({ profilePicture, username }) {
  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={username}
        className="h-9 w-9 rounded-full object-cover border border-gray-100"
      />
    )
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
      {username?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function formatScore(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

export default function TopCreatorsTable({ creators, currentPage, totalItems, onPageChange, loading, nested = false }) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const Wrapper = ({ children }) => nested
    ? <div className="overflow-x-auto">{children}</div>
    : <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-x-auto">{children}</div>

  if (loading) {
    return (
      <Wrapper>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
              <th className={COL}>Rank</th>
              <th className={COL}>Creator</th>
              <th className={COL}>Country</th>
              <th className={COL}>Category</th>
              <th className={COL}>Monthly Reach</th>
              <th className={`${COL} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                <td className="px-6 py-4"><div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
            <th className={COL}>Rank</th>
            <th className={COL}>Creator</th>
            <th className={COL}>Country</th>
            <th className={COL}>Category</th>
            <th className={COL}>Monthly Reach</th>
            <th className={`${COL} text-right`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {creators.map((creator) => (
            <tr
              key={creator.userId}
              className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
            >
              {/* Rank */}
              <td className="px-6 py-4">
                <RankBadge rank={creator.monthlyCreatorRank} />
              </td>

              {/* Creator */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <CreatorAvatar profilePicture={creator.profilePicture} username={creator.username} />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">@{creator.username}</span>
                </div>
              </td>

              {/* Country */}
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {creator.country || '—'}
              </td>

              {/* Category */}
              <td className="px-6 py-4">
                {creator.category ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {creator.category}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>

              {/* Monthly Reach */}
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {formatScore(creator.monthlyReach)}
                </span>
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/dashboard/users/${creator.userId}`}
                  className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
                >
                  View Profile
                </Link>
              </td>
            </tr>
          ))}

          {creators.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                No creators found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemLabel="creators"
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </Wrapper>
  )
}
