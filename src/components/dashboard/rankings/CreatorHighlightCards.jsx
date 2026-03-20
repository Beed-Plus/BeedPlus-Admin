export default function CreatorHighlightCards({ topCreator, totalActiveCreators, availableCountries = [], filterCountry = '', onFilterCountry, filteredCount }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Top Creator of the Month */}
      {/* <div className="flex flex-1 items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Top Creator of the Month
          </p>
          <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{topCreator}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
      </div> */}

      {/* Total Active Creators */}
      <div className="flex flex-1 items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Total Active Creators
          </p>
          <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
            {totalActiveCreators.toLocaleString()}
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 7a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
      </div>
      {/* Country filter */}
      <div className="flex flex-1 flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Filter by Country
          </p>
          {filterCountry && (
            <button
              onClick={() => onFilterCountry('')}
              className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {filterCountry ? filteredCount : totalActiveCreators}
          </p>
          <select
            value={filterCountry}
            onChange={(e) => onFilterCountry(e.target.value)}
            disabled={availableCountries.length === 0}
            className="w-32 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer disabled:opacity-40"
          >
            <option value="">All Countries</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
