import { Link } from 'react-router-dom'

export default function StatCard({ label, value, icon: Icon, loading = false, href }) {
  const inner = (
    <div className={`flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm sm:p-6 transition ${href ? 'hover:border-orange-200 hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
          <Icon className="h-5 w-5 text-orange-500" />
        </div>
      </div>
      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ) : (
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  )

  if (href) return <Link to={href}>{inner}</Link>
  return inner
}
