import { CATEGORY_BADGE_STYLES } from '../../../data/mockPostRankings'

const COL = 'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

function ChangeArrow({ change }) {
  if (change === 'up') return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
  )
  if (change === 'down') return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
  return <span className="text-sm text-gray-300">—</span>
}

export default function PostRankingsTable({ posts }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
            <th className={COL}>Rank</th>
            <th className={COL}>Post</th>
            <th className={COL}>Username</th>
            <th className={COL}>Category</th>
            <th className={COL}>Clicks</th>
            <th className={COL}>Score</th>
            <th className={COL}>Change</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => {
            const rank = i + 1
            const badgeStyle = CATEGORY_BADGE_STYLES[post.category] ?? 'border-gray-200 bg-gray-50 text-gray-500'

            return (
              <tr key={post.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition-colors">

                {/* Rank */}
                <td className="px-5 py-4">
                  <span className="text-sm font-black text-gray-800 dark:text-gray-100">#{rank}</span>
                </td>

                {/* Post */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 shrink-0 rounded-xl"
                      style={{ backgroundColor: post.thumbnailColor }}
                    />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[180px] truncate">
                      {post.title}
                    </span>
                  </div>
                </td>

                {/* Username */}
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{post.username}</td>

                {/* Category */}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                    {post.category}
                  </span>
                </td>

                {/* Clicks */}
                <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {post.clicks.toLocaleString()}
                </td>

                {/* Score */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-500">
                    {post.score}
                  </span>
                </td>

                {/* Change */}
                <td className="px-5 py-4">
                  <ChangeArrow change={post.change} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

    </div>
  )
}
