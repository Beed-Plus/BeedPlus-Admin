export default function CategoryStatCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <p className="text-4xl font-black text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        {trend && (
          <span className="mb-1 flex items-center gap-1 text-sm font-semibold text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
