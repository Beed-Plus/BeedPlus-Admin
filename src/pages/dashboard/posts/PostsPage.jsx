import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import PostTable from '../../../components/dashboard/posts/PostTable'

const PAGE_SIZE = 15

const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'REELS']

const SELECT = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'

export default function PostsPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [page, setPage]         = useState(1)

  // Filters
  const [search, setSearch]         = useState('')
  const [filterCategory, setCategory] = useState('')
  const [filterType, setType]       = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    instagramApi.getAllSubmittedMediaForAdmin(token)
      .then((res) => {
        if (!cancelled) setAllPosts(Array.isArray(res) ? res : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load posts')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  // Unique categories from all posts
  const categories = useMemo(() => {
    const set = new Set()
    allPosts.forEach((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean)
      cats.forEach((c) => set.add(c))
    })
    return [...set].sort()
  }, [allPosts])

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allPosts.filter((p) => {
      if (filterType && p.media?.mediaType?.toUpperCase() !== filterType) return false
      if (filterCategory) {
        const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean)
        if (!cats.includes(filterCategory)) return false
      }
      if (q) {
        const caption  = (p.media?.caption ?? '').toLowerCase()
        const username = (p.instagramUsername ?? p.userData?.username ?? '').toLowerCase()
        if (!caption.includes(q) && !username.includes(q)) return false
      }
      return true
    })
  }, [allPosts, search, filterCategory, filterType])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  const anyFilter = search || filterCategory || filterType

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Posts Management</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Monitor and manage all submitted posts.</p>
        </div>
        {!loading && (
          <span className="inline-flex self-start items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
            {filtered.length.toLocaleString()} post{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter icon */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filter by
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Caption or username…"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-48"
        />

        {/* Category */}
        <select value={filterCategory} onChange={(e) => handleFilter(setCategory)(e.target.value)} className={SELECT}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Media type */}
        <select value={filterType} onChange={(e) => handleFilter(setType)(e.target.value)} className={SELECT}>
          <option value="">All Types</option>
          {MEDIA_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
        </select>

        {/* Clear */}
        {anyFilter && (
          <button
            onClick={() => { setSearch(''); setCategory(''); setType(''); setPage(1) }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Table */}
      <PostTable
        posts={paged}
        loading={loading}
        currentPage={page}
        totalItems={filtered.length}
        onPageChange={setPage}
      />
    </div>
  )
}
