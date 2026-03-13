function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full rounded-full bg-orange-100 dark:bg-orange-500/20">
      <div
        className="h-2 rounded-full bg-orange-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function AnalyticsCard() {
  return (
    <div className="relative">
      {/* Main card */}
      <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl p-6 w-80">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Real-time Analytics</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Monitoring system performance</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <ProgressBar value={82} />
          <ProgressBar value={48} />
          <ProgressBar value={71} />
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Active Users</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">12.4k</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">System Load</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">24%</p>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute -bottom-5 -right-5 flex items-center gap-3 rounded-2xl bg-orange-500 px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-orange-100">Enterprise Grade</p>
          <p className="text-xs font-bold text-white">Secure Access Only</p>
        </div>
      </div>
    </div>
  )
}
