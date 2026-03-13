const SELECT = 'w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer scrollbar-thin'

export default function UserFilters({
  category, country, approvalStatus, search = '', followerSort = '',
  categories, countries = [],
  onCategoryChange, onCountryChange, onApprovalStatusChange, onSearchChange, onFollowerSortChange,
  hideStatusFilter = false,
}) {
  const hasFilter = category || country || approvalStatus || search || followerSort

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search username…"
        className="w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
      />

      {/* Country */}
      <select value={country} onChange={(e) => onCountryChange(e.target.value)} className={SELECT}>
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Category */}
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className={SELECT}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Followers sort */}
      <select value={followerSort} onChange={(e) => onFollowerSortChange(e.target.value)} className={SELECT}>
        <option value="">Followers</option>
        <option value="desc">Highest to Lowest</option>
        <option value="asc">Lowest to Highest</option>
      </select>

      {/* Approval status — hidden on status-specific pages */}
      {/* {!hideStatusFilter && (
        <select value={approvalStatus} onChange={(e) => onApprovalStatusChange(e.target.value)} className={SELECT}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      )} */}

      {/* Clear filters */}
      {hasFilter && (
        <button
          onClick={() => { onSearchChange(''); onCategoryChange(''); onCountryChange(''); onApprovalStatusChange(''); onFollowerSortChange('') }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
        >
          Clear
        </button>
      )}
    </div>
  )
}
