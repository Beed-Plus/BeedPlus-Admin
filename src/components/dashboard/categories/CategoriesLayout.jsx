import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { categoriesApi } from '../../../utils/categoriesApi'

const INPUT = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition'
const COLOR_INPUT = 'h-10 w-10 cursor-pointer rounded-lg border border-gray-200 p-0.5'

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-100" />
          <div className="h-3 w-28 rounded bg-gray-100" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-5 w-10 rounded-full bg-gray-100" /></td>
      <td className="px-6 py-4"><div className="h-5 w-10 rounded-full bg-gray-100" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 rounded-lg bg-gray-100" />
          <div className="h-6 w-16 rounded-lg bg-gray-100" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-3 w-20 rounded bg-gray-100" /></td>
      <td className="px-6 py-4" />
    </tr>
  )
}

// ─── Category Modal (Add / Edit) ──────────────────────────────────────────────
function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = !!category
  const [name, setName]               = useState(category?.name ?? '')
  const [primaryColor, setPrimary]    = useState(category?.primaryColor ?? '#f97316')
  const [secondaryColor, setSecondary] = useState(category?.secondaryColor ?? '#fdba74')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { name: name.trim(), primaryColor, secondaryColor }
      const res = isEdit
        ? await categoriesApi.updateCategory(category._id, payload)
        : await categoriesApi.createCategory(payload)
      onSaved(res.category ?? res, isEdit)
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{isEdit ? 'Edit Category' : 'Add Category'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{isEdit ? 'Update category details' : 'Create a new platform category'}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div
          className="mb-4 flex h-14 items-center justify-center rounded-xl px-4 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
        >
          {name || 'Category Preview'}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category Name</label>
            <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fashion" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className={COLOR_INPUT} value={primaryColor} onChange={(e) => setPrimary(e.target.value)} />
                <input className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-mono" value={primaryColor} onChange={(e) => setPrimary(e.target.value)} maxLength={7} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className={COLOR_INPUT} value={secondaryColor} onChange={(e) => setSecondary(e.target.value)} />
                <input className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-mono" value={secondaryColor} onChange={(e) => setSecondary(e.target.value)} maxLength={7} />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ category, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await categoriesApi.deleteCategory(category._id)
      onConfirmed(category._id)
    } catch (err) {
      setError(err.message ?? 'Delete failed')
      setDeleting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Delete "{category.name}"?</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">This will permanently remove this category. Posts and users in this category may be affected.</p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function CategoriesLayout({ title, subtitle }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadCategories() {
    setLoading(true)
    setError(null)
    try {
      const res = await categoriesApi.getCategories()
      setCategories(res.categories ?? [])
    } catch (err) {
      setError(err.message ?? 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, search])

  function handleSaved(result, isEdit) {
    if (isEdit) {
      setCategories((prev) => prev.map((c) => c._id === result._id ? { ...c, ...result } : c))
      setEditTarget(null)
    } else {
      setCategories((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAdd(false)
    }
  }

  function handleDeleted(id) {
    setCategories((prev) => prev.filter((c) => c._id !== id))
    setDeleteTarget(null)
  }

  const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Categories</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : categories.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Posts</p>
          <p className="mt-1 text-2xl font-black text-orange-500">{loading ? '...' : categories.reduce((s, c) => s + (c.postCount ?? 0), 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : categories.reduce((s, c) => s + (c.userCount ?? 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error} — <button onClick={loadCategories} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Category List</p>
            {!loading && <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} of {categories.length} categories</p>}
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                <th className={COL}>Category</th>
                <th className={COL}>Posts</th>
                <th className={COL}>Users</th>
                <th className={COL}>Colors</th>
                <th className={COL}>Created</th>
                <th className={`${COL} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}

              {!loading && filtered.map((cat) => (
                <tr key={cat._id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors">
                  {/* Category name + color swatch */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 shrink-0 rounded-xl shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${cat.primaryColor}, ${cat.secondaryColor})` }}
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{cat.name}</span>
                    </div>
                  </td>

                  {/* Post count */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                      {(cat.postCount ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* User count */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-500">
                      {(cat.userCount ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Color pills */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.primaryColor }} />
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{cat.primaryColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.secondaryColor }} />
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{cat.secondaryColor}</span>
                      </div>
                    </div>
                  </td>

                  {/* Created date */}
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(cat.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditTarget(cat)}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd      && <CategoryModal                      onClose={() => setShowAdd(false)}      onSaved={handleSaved} />}
      {editTarget   && <CategoryModal category={editTarget} onClose={() => setEditTarget(null)}   onSaved={handleSaved} />}
      {deleteTarget && <DeleteModal   category={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirmed={handleDeleted} />}
    </div>
  )
}
