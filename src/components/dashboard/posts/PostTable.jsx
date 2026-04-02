import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import { categoriesApi } from '../../../utils/categoriesApi'
import { subCategoriesApi } from '../../../utils/subCategoriesApi'
import PostThumbnail from './PostThumbnail'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

const MEDIA_TYPE_CONFIG = {
  VIDEO:          { label: 'Video',    color: 'bg-blue-50 text-blue-500' },
  IMAGE:          { label: 'Image',    color: 'bg-green-50 text-green-600' },
  CAROUSEL_ALBUM: { label: 'Carousel', color: 'bg-purple-50 text-purple-500' },
  REELS:          { label: 'Reels',    color: 'bg-pink-50 text-pink-500' },
}

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}


function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(str, max = 40) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4" />
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostTable({ posts, loading }) {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const [localPosts, setLocalPosts] = useState(null)
  const [editPost, setEditPost] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editSubCategory, setEditSubCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const displayPosts = localPosts ?? posts

  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories(Array.isArray(res) ? res : (res.categories ?? [])))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!editCategory) { setSubCategories([]); return }
    const cat = categories.find((c) => c.name === editCategory)
    if (!cat?._id) return
    subCategoriesApi.getSubCategories(cat._id)
      .then((res) => setSubCategories(Array.isArray(res) ? res : (res.subCategories ?? [])))
      .catch(() => {})
  }, [editCategory, categories])

  function openEdit(post) {
    const cat = Array.isArray(post.category) ? post.category[0] ?? '' : post.category ?? ''
    setEditPost(post)
    setEditCategory(cat)
    setEditSubCategory(post.subCategory?.name ?? '')
  }

  async function saveEdit() {
    if (!editPost || !editCategory) return
    setSaving(true)
    try {
      let subCategoryId = null
      if (editSubCategory.trim()) {
        const cat = categories.find((c) => c.name === editCategory)
        const found = await subCategoriesApi.findOrCreate({ name: editSubCategory.trim(), categoryId: cat?._id }, token)
        subCategoryId = found?._id ?? found?.subCategory?._id ?? null
      }
      const res = await instagramApi.updateMediaCategory(
        editPost._id,
        { category: editCategory, subCategory: subCategoryId },
        token
      )
      setLocalPosts((prev) =>
        (prev ?? posts).map((p) =>
          p._id === editPost._id
            ? { ...p, category: [editCategory], subCategory: res.media?.subCategory ?? null }
            : p
        )
      )
      setEditPost(null)
    } catch (err) {
      alert(`Failed to update: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[75vh]">
        <table className="w-full min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className={COL}>Post</th>
              <th className={COL}>Creator</th>
              <th className={COL}>Category</th>
              <th className={COL}>Sub-Category</th>
              <th className={COL}>User ID</th>
              <th className={COL}>Media ID</th>
              <th className={COL}>Reach</th>
              <th className={COL}>Submitted</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && displayPosts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  No posts found
                </td>
              </tr>
            )}

            {!loading && displayPosts.map((post) => {
              const caption   = post.media?.caption
              const type      = post.media?.mediaType
              const thumb     = post.media?.thumbnailUrl ?? post.media?.mediaUrl
              const username  = post.instagramUsername || post.userData?.username
              const country   = post.userData?.country
              const cats      = Array.isArray(post.category) ? post.category : [post.category].filter(Boolean)
              const subCat    = post.subCategory?.name ?? post.subCategory ?? null

              return (
                <tr
                  key={post._id}
                  className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/posts/${post._id}`, { state: { post } })}
                >
                  {/* Post */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0"><PostThumbnail src={thumb} color="#e5e7eb" alt={caption} /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                          {truncate(caption)}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <MediaTypeBadge type={type} />
                          {country && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              {country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-4">
                    {username ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">@{username}</p>
                        {country && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cats.length > 0
                        ? cats.map((c) => (
                            <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                              {c}
                            </span>
                          ))
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </div>
                  </td>

                  {/* Sub-Category */}
                  <td className="px-6 py-4">
                    {subCat
                      ? <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">{subCat}</span>
                      : <span className="text-gray-300 dark:text-gray-600">—</span>
                    }
                  </td>

                  {/* User ID */}
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {post.userId ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>

                  {/* Media ID */}
                  <td className="px-6 py-4 text-xs text-gray-800 dark:text-gray-100 font-mono">
                    {post.instagramMediaId ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>

                  {/* Reach */}
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {post.insights?.reach != null
                      ? post.insights.reach >= 1_000_000
                        ? `${(post.insights.reach / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
                        : post.insights.reach >= 1_000
                          ? `${(post.insights.reach / 1_000).toFixed(1).replace(/\.0$/, '')}k`
                          : post.insights.reach.toLocaleString()
                      : <span className="text-gray-300 dark:text-gray-600">—</span>
                    }
                  </td>

                  {/* Submitted */}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{fmtDate(post.createdAt)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(post)}
                        className="rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/posts/${post._id}`, { state: { post } })}
                        className="rounded-lg bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Post modal */}
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setEditPost(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Edit Post</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{truncate(editPost.media?.caption, 40)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Category</label>
              <select
                value={editCategory}
                onChange={(e) => { setEditCategory(e.target.value); setEditSubCategory('') }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sub-Category</label>
              <input
                type="text"
                list="edit-subcategory-list"
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                disabled={!editCategory}
                placeholder={editCategory ? 'Type or select…' : 'Select a category first'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50"
              />
              <datalist id="edit-subcategory-list">
                {subCategories.map((s) => (
                  <option key={s._id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditPost(null)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || !editCategory}
                className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
