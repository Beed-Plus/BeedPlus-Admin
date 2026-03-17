import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { usersApi } from '../../../utils/usersApi'
import Badge from '../../ui/Badge'
import StatusBadge from '../../ui/StatusBadge'
import Pagination from '../../ui/Pagination'
import UserAvatar from './UserAvatar'
import UserActions from './UserActions'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function displayName(user) {
  return user.instagram?.instagramUsername
    ? `@${user.instagram.instagramUsername}`
    : user.instagramUsername
    ? `@${user.instagramUsername}`
    : user.email ?? '—'
}

function avatarSrc(user) {
  return user.instagram?.profilePictureUrl ?? user.profilePicture ?? null
}

function fmtRank(rank) {
  if (!rank) return <span className="text-gray-300">—</span>
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
      <span className="text-xs font-normal text-gray-400">#</span>
      {rank}
    </span>
  )
}

function fmtFollowers(n) {
  if (!n && n !== 0) return <span className="text-gray-300">—</span>
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}

function fmtScore(n) {
  if (!n && n !== 0) return <span className="text-gray-300">—</span>
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
      {n >= 1_000 ? `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k` : n.toLocaleString()}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4" />
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserTable({ users: initialUsers, loading, currentPage, totalPages, totalItems, onPageChange }) {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const [localUsers, setLocalUsers] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // user object pending deletion
  const [deleting, setDeleting] = useState(false)
  const displayUsers = localUsers ?? initialUsers

  async function handleAction(action, user) {
    if (action === 'View Profile') {
      navigate(`/dashboard/users/${user._id}`)
    } else if (action === 'Approve User') {
      try {
        await usersApi.approveUser(user._id, token)
        setLocalUsers((prev) =>
          (prev ?? initialUsers).map((u) =>
            u._id === user._id
              ? { ...u, instagramApproval: { ...(u.instagramApproval ?? {}), status: 'approved' } }
              : u,
          ),
        )
      } catch (err) {
        alert(`Approve failed: ${err.message}`)
      }
    } else if (action === 'Suspend User') {
      alert('Suspend endpoint not yet available.')
    } else if (action === 'Delete User') {
      setConfirmDelete(user)
    }
  }

  async function confirmDeleteUser() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await usersApi.deleteUser(confirmDelete._id, token)
      setLocalUsers((prev) => (prev ?? initialUsers).filter((u) => u._id !== confirmDelete._id))
      setConfirmDelete(null)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
              <th className={COL}>User</th>
              <th className={COL}>Monthly Rank</th>
              <th className={COL}>Followers</th>
              <th className={COL}>Category</th>
              <th className={COL}>Beed+ Score</th>
              <th className={COL}>Connected</th>
              <th className={COL}>Approval</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && displayUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {!loading && displayUsers.map((user) => {
              const name     = displayName(user)
              const src      = avatarSrc(user)
              const status    = user.instagramApproval?.status ?? 'pending'
              const category  = user.category
              const connected = user.instagram?.connected === true

              return (
                <tr
                  key={user._id}
                  className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/users/${user._id}`)}
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={name.replace('@', '') || 'U'} src={src} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Monthly rank */}
                  <td className="px-6 py-4">{fmtRank(user.monthlyCreatorRank)}</td>

                  {/* Followers */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {fmtFollowers(user.instagram?.followersCount)}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    {category
                      ? <Badge label={category} variant="orange" />
                      : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                    }
                  </td>

                  {/* Beed+ Score */}
                  <td className="px-6 py-4">
                    {fmtScore(user.beedPlusCreatorScore)}
                  </td>

                  {/* Connected */}
                  <td className="px-6 py-4">
                    {connected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                        Not connected
                      </span>
                    )}
                  </td>

                  {/* Approval status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <UserActions
                      approvalStatus={status}
                      onAction={(action) => handleAction(action, user)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemLabel="users"
          onPageChange={onPageChange}
        />
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 mx-auto">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-3h6a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Delete User?</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{displayName(confirmDelete)}</span> will be permanently removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
