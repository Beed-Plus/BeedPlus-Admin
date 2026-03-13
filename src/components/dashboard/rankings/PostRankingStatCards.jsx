function StatCard({ label, children }) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-5 shadow-sm">
      <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>
      {children}
    </div>
  )
}

export default function PostRankingStatCards({ totalPostsRanked, avgBeedPlusScore, topPerformingCategory }) {
  return (
    <div className="flex gap-4">
      <StatCard label="Total Posts Ranked">
        <p className="text-3xl font-black text-gray-900 dark:text-white">{totalPostsRanked.toLocaleString()}</p>
      </StatCard>

      <StatCard label="Average BeedPlusScore">
        <p className="text-3xl font-black text-gray-900 dark:text-white">{avgBeedPlusScore}</p>
      </StatCard>

      <StatCard label="Top Performing Category">
        <p className="text-3xl font-black text-gray-900 dark:text-white">{topPerformingCategory}</p>
      </StatCard>
    </div>
  )
}
