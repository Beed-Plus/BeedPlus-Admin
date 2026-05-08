import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import { categoriesApi } from '../../../utils/categoriesApi'
import { subCategoriesApi } from '../../../utils/subCategoriesApi'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RowSkeleton() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" style={{ width: i === 0 ? 160 : i === 1 ? 120 : 80 }} />
        </td>
      ))}
    </tr>
  )
}

function PreviewModal({ item, categories, subCatOptions, onClose, onApprove, onReject, busy }) {
  const overlayRef = useRef(null)

  const [cat, setCat]               = useState((item.category ?? [])[0] ?? '')
  const [subCat, setSubCat]         = useState('')
  const [subCatOpen, setSubCatOpen] = useState(false)

  // Resolve stored subCategory ObjectId → name on mount
  useEffect(() => {
    if (!item.subCategory) return
    const match = subCatOptions.find(
      (s) => s._id === item.subCategory || s._id?.toString() === item.subCategory?.toString()
    )
    if (match) setSubCat(match.name)
  }, [item.subCategory, subCatOptions])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlay(e) {
    if (e.target === overlayRef.current) onClose()
  }

  const filteredSubCats = subCatOptions.filter((s) =>
    !subCat || s.name.toLowerCase().includes(subCat.toLowerCase())
  )

  const isVideo = item.media?.mediaType?.toUpperCase() === 'VIDEO'
  const cats    = Array.isArray(item.category) ? item.category : []

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-[69.6rem] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-row max-h-[88vh]">

        {/* Left — video / image */}
        <div className="w-[32rem] flex-shrink-0 bg-gray-950 flex items-center justify-center">
          {isVideo && item.media?.mediaUrl ? (
            <video
              controls
              playsInline
              autoPlay
              poster={item.media.thumbnailUrl || undefined}
              src={item.media.mediaUrl}
              className="w-full h-full object-contain"
              style={{ maxHeight: '88vh' }}
            />
          ) : item.media?.thumbnailUrl ? (
            <img src={item.media.thumbnailUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="flex h-full w-full min-h-48 items-center justify-center text-gray-600 p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right — details + actions */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">

          {/* Creator */}
          <div className="flex items-center gap-3">
            {item.userData?.profilePicture ? (
              <img src={item.userData.profilePicture} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">@{item.userData?.username || '—'}</p>
              {item.userData?.country && <p className="text-xs text-gray-400">{item.userData.country}</p>}
            </div>
          </div>

          {/* Caption */}
          {item.media?.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{item.media.caption}</p>
          )}

          {/* Submitted category pills */}
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <span key={c} className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-500">{c}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{fmtDate(item.createdAt)}</span>
            {item.media?.permalink && (
              <a href={item.media.permalink} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-500 transition">
                View on IG ↗
              </a>
            )}
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Category override */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="">— Select category —</option>
              {categories.map((c) => {
                const name = c.name ?? c
                return <option key={name} value={name}>{name}</option>
              })}
            </select>
          </div>

          {/* Sub-category autocomplete */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Sub-category <span className="text-gray-300 dark:text-gray-600">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={subCat}
                onChange={(e) => { setSubCat(e.target.value); setSubCatOpen(true) }}
                onFocus={() => setSubCatOpen(true)}
                onBlur={() => setTimeout(() => setSubCatOpen(false), 150)}
                placeholder="Type to search or create new…"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              {subCatOpen && filteredSubCats.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {filteredSubCats.map((s) => (
                    <li
                      key={s._id}
                      onMouseDown={() => { setSubCat(s.name); setSubCatOpen(false) }}
                      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(item, { category: cat ? [cat] : undefined, subCategory: subCat || undefined })}
              disabled={busy || !cat}
              className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Approving…' : 'Approve'}
            </button>
            <button
              onClick={() => onReject(item)}
              disabled={busy}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Rejecting…' : 'Reject'}
            </button>
          </div>

          <button onClick={onClose} className="text-center text-xs text-gray-400 hover:text-gray-500 transition">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function MediaReviewPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [items, setItems]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [actionId, setActionId]         = useState(null)
  const [viewModal, setViewModal]       = useState(null)
  const [categories, setCategories]     = useState([])
  const [subCatOptions, setSubCatOptions] = useState([])

  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories(Array.isArray(res) ? res : (res?.categories ?? [])))
      .catch(() => {})
    subCategoriesApi.getSubCategories()
      .then((res) => setSubCatOptions(Array.isArray(res) ? res : (res?.subCategories ?? [])))
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await instagramApi.getPendingMediaForAdmin(token, 'pending')
      setItems(res.pending ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  async function handleApprove(item, { category, subCategory } = {}) {
    setActionId(item._id)
    try {
      await instagramApi.approvePendingMedia(item._id, { category, subCategory }, token)
      setItems((prev) => prev.filter((i) => i._id !== item._id))
      setViewModal(null)
    } catch (err) {
      alert(err.message ?? 'Failed to approve')
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(item) {
    setActionId(item._id)
    try {
      await instagramApi.rejectPendingMedia(item._id, {}, token)
      setItems((prev) => prev.filter((i) => i._id !== item._id))
      setViewModal(null)
    } catch (err) {
      alert(err.message ?? 'Failed to reject')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Media Review</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Approve or reject creator-submitted media before it enters the ranking system</p>
        </div>
        {!loading && (
          <span className="text-sm font-semibold text-gray-400">{items.length} pending</span>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {!loading && items.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-gray-400 dark:text-gray-500">No pending media to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Post</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Creator</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Submitted</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                  : items.map((item) => {
                      const cats = Array.isArray(item.category) ? item.category : []
                      const busy = actionId === item._id
                      return (
                        <tr
                          key={item._id}
                          onClick={() => setViewModal(item)}
                          className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.media?.thumbnailUrl ? (
                                <img src={item.media.thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                              )}
                              <p className="max-w-[180px] truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={item.media?.caption}>
                                {item.media?.caption || '—'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {item.userData?.profilePicture ? (
                                <img src={item.userData.profilePicture} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                              ) : (
                                <div className="h-7 w-7 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">@{item.userData?.username || '—'}</p>
                                {item.userData?.country && <p className="text-[11px] text-gray-400">{item.userData.country}</p>}
                              </div>
                            </div>
                          </td>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500">
                            {fmtDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setViewModal(item)}
                              disabled={busy}
                              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
                            >
                              Review
                            </button>
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

      {viewModal && (
        <PreviewModal
          item={viewModal}
          categories={categories}
          subCatOptions={subCatOptions}
          onClose={() => setViewModal(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          busy={actionId === viewModal._id}
        />
      )}
    </div>
  )
}
