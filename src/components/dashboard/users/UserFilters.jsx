const SELECT = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'

export default function UserFilters({
  category, country, approvalStatus,
  categories,
  onCategoryChange, onCountryChange, onApprovalStatusChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter icon label */}
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filter by
      </div>

      {/* Category */}
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className={SELECT}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Country */}
      <input
        type="text"
        value={country}
        onChange={(e) => onCountryChange(e.target.value)}
        placeholder="Country…"
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-36"
      />

      {/* Approval status */}
      <select value={approvalStatus} onChange={(e) => onApprovalStatusChange(e.target.value)} className={SELECT}>
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Clear filters */}
      {(category || country || approvalStatus) && (
        <button
          onClick={() => { onCategoryChange(''); onCountryChange(''); onApprovalStatusChange('') }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
        >
          Clear
        </button>
      )}
    </div>
  )
}
