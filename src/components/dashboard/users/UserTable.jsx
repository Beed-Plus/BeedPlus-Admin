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

  // local copy so we can optimistically update approval status
  const [localUsers, setLocalUsers] = useState(null)
  const displayUsers = localUsers ?? initialUsers

  // sync when parent refreshes
  if (localUsers && initialUsers !== displayUsers) {
    // parent pushed new data — reset local override
  }

  async function handleAction(action, user) {
    if (action === 'View Profile') {
      navigate(`/dashboard/users/${user._id}`)
    } else if (action === 'Approve User') {
      try {
        await usersApi.approveUser(user._id, token)
        // optimistic: mark as approved in local list
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
              <th className={COL}>Approval</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && displayUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {!loading && displayUsers.map((user) => {
              const name     = displayName(user)
              const src      = avatarSrc(user)
              const status   = user.instagramApproval?.status ?? 'pending'
              const category = user.category

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
    </div>
  )
}
