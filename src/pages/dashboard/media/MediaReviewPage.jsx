import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all']

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusPill({ status }) {
  const map = {
    approved: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-500',
    pending:  'bg-amber-50 text-amber-600',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function RowSkeleton() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" style={{ width: i === 0 ? 160 : i === 1 ? 120 : 80 }} />
        </td>
      ))}
    </tr>
  )
}

export default function MediaReviewPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [activeTab, setActiveTab] = useState('pending')
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [actionId, setActionId]   = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load(status) {
    setLoading(true)
    try {
      const res = await instagramApi.getPendingMediaForAdmin(token, status)
      setItems(res.pending ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(activeTab) }, [activeTab, token])

  async function handleApprove(item) {
    setActionId(item._id)
    try {
      await instagramApi.approvePendingMedia(item._id, token)
      setItems((prev) => prev.filter((i) => i._id !== item._id))
    } catch (err) {
      alert(err.message ?? 'Failed to approve')
    } finally {
      setActionId(null)
    }
  }

  async function handleReject() {
    if (!rejectModal) return
    setActionId(rejectModal._id)
    try {
      await instagramApi.rejectPendingMedia(rejectModal._id, { reason: rejectReason }, token)
      setItems((prev) => prev.filter((i) => i._id !== rejectModal._id))
      setRejectModal(null)
      setRejectReason('')
    } catch (err) {
      alert(err.message ?? 'Failed to reject')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Media Review</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Approve or reject creator-submitted media before it enters the ranking system</p>
        </div>
        {!loading && (
          <span className="text-sm font-semibold text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {!loading && items.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-gray-400 dark:text-gray-500">
            No {activeTab === 'all' ? '' : activeTab} media found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Post</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Creator</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Submitted</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                  : items.map((item) => {
                      const cats = Array.isArray(item.category) ? item.category : []
                      const isPending = item.status === 'pending'
                      const busy = actionId === item._id
                      return (
                        <tr
                          key={item._id}
                          className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          {/* Post */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.media?.thumbnailUrl ? (
                                <img src={item.media.thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                              )}
                              <div className="min-w-0">
                                <p className="max-w-[180px] truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={item.media?.caption}>
                                  {item.media?.caption || '—'}
                                </p>
                                {item.media?.permalink && (
                                  <a
                                    href={item.media.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-pink-400 hover:text-pink-500 transition"
                                  >
                                    View on IG
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Creator */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {item.userData?.profilePicture ? (
                                <img src={item.userData.profilePicture} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                              ) : (
                                <div className="h-7 w-7 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  @{item.userData?.username || '—'}
                                </p>
                                {item.userData?.country && (
                                  <p className="text-[11px] text-gray-400">{item.userData.country}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {cats.length > 0
                                ? cats.map((c) => (
                                    <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{c}</span>
                                  ))
                                : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                              }
                            </div>
                          </td>

                          {/* Submitted */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500">
                            {fmtDate(item.createdAt)}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusPill status={item.status} />
                            {item.status === 'rejected' && item.rejectionReason && (
                              <p className="mt-1 max-w-[140px] truncate text-[11px] text-gray-400" title={item.rejectionReason}>
                                {item.rejectionReason}
                              </p>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(item)}
                                  disabled={busy}
                                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {busy ? '…' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => { setRejectModal(item); setRejectReason('') }}
                                  disabled={busy}
                                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Reject Media</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
              @{rejectModal.userData?.username} — optionally provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)…"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleReject}
                disabled={!!actionId}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
              >
                {actionId ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
