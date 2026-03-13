import { useState, useMemo } from 'react'
import UserAvatar from '../users/UserAvatar'

const COL = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

function ApprovalBadge({ status }) {
  const cfg = {
    approved: 'bg-green-50 text-green-600 border-green-200',
    pending:  'bg-yellow-50 text-yellow-600 border-yellow-200',
    rejected: 'bg-red-50 text-red-500 border-red-200',
  }[status?.toLowerCase()] ?? 'bg-gray-50 text-gray-500 border-gray-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cfg}`}>
      {status ?? 'unknown'}
    </span>
  )
}

export default function RecipientsTable({ users, loading, selected, onToggle, onToggleAll }) {
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy]               = useState('username')

  const categoryOptions = useMemo(() => {
    const set = new Set()
    users.forEach((u) => {
      const cats = Array.isArray(u.category) ? u.category : [u.category].filter(Boolean)
      cats.forEach((c) => set.add(c))
    })
    return [...set].sort()
  }, [users])

  const filtered = useMemo(() => {
    let list = users.filter((u) => {
      const username = u.instagramUsername ?? ''
      const email    = u.email ?? ''
      const status   = u.instagramApproval?.status ?? ''
      const cats     = Array.isArray(u.category) ? u.category : [u.category].filter(Boolean)

      const matchSearch   = !search || username.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
      const matchStatus   = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase()
      const matchCategory = !categoryFilter || cats.includes(categoryFilter)

      return matchSearch && matchStatus && matchCategory
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'status')  return (a.instagramApproval?.status ?? '').localeCompare(b.instagramApproval?.status ?? '')
      if (sortBy === 'country') return (a.country ?? '').localeCompare(b.country ?? '')
      return (a.instagramUsername ?? '').localeCompare(b.instagramUsername ?? '')
    })
  }, [users, search, statusFilter, categoryFilter, sortBy])

  const allFilteredSelected = filtered.length > 0 && filtered.every((u) => selected.has(u._id))

  if (loading) {
    return (
      <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="h-9 w-52 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: '480px' }}>
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                <th className="px-4 py-3 w-10" />
                <th className={COL}>User</th>
                <th className={COL}>Category</th>
                <th className={COL}>Status</th>
                <th className={COL}>Country</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="px-4 py-3.5"><div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">User List</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {selected.size > 0
                ? `${selected.size} of ${users.length} selected`
                : `${filtered.length} of ${users.length} users`}
            </p>
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search username or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-52"
            />
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
          >
            <option value="username">Sort: Username</option>
            <option value="status">Sort: Status</option>
            <option value="country">Sort: Country</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '480px' }}>
        <table className="w-full min-w-[520px]">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={() => onToggleAll(filtered)}
                  className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                />
              </th>
              <th className={COL}>User</th>
              <th className={COL}>Category</th>
              <th className={COL}>Status</th>
              <th className={COL}>Country</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isSelected = selected.has(user._id)
              const username   = user.instagramUsername ?? '—'
              const status     = user.instagramApproval?.status
              const cats       = Array.isArray(user.category) ? user.category : [user.category].filter(Boolean)

              return (
                <tr
                  key={user._id}
                  onClick={() => onToggle(user._id)}
                  className={`border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors cursor-pointer ${
                    isSelected ? 'bg-orange-50/60 dark:bg-orange-500/10' : 'hover:bg-gray-50/40 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(user._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={username} src={user.profilePicture ?? null} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">@{username}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {cats.length > 0 ? cats.map((c) => (
                        <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">{c}</span>
                      )) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <ApprovalBadge status={status} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                    {user.country || '—'}
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Selected bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between border-t border-orange-100 bg-orange-50 px-5 py-3">
          <p className="text-sm font-semibold text-orange-600">
            {selected.size} recipient{selected.size !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={() => onToggleAll([])}
            className="text-xs font-medium text-orange-400 hover:text-orange-600 transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
