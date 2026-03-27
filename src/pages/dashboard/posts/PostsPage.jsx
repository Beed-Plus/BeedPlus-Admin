import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import PostTable from '../../../components/dashboard/posts/PostTable'


const SELECT ='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'

export default function PostsPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  console.log("all posts", allPosts)

  // Filters
  const [search, setSearch]             = useState('')
  const [filterCategory, setCategory]   = useState('')
  const [filterSubCategory, setSubCategory] = useState('')
  const [filterCountry, setFilterCountry] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      let lastErr = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await instagramApi.getAllSubmittedMediaForAdmin(token)
          if (cancelled) return
          setAllPosts(Array.isArray(res) ? res : [])
          setLoading(false)
          return
        } catch (err) {
          if (cancelled) return
          lastErr = err
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, attempt * 1000))
            if (cancelled) return
          }
        }
      }

      setError(lastErr?.message ?? 'Failed to load posts')
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [token, retryKey])

  // Unique categories from all posts
  const categories = useMemo(() => {
    const set = new Set()
    allPosts.forEach((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean)
      cats.forEach((c) => set.add(c))
    })
    return [...set].sort()
  }, [allPosts])

  // Unique countries from all posts
  const countries = useMemo(() => {
    const set = new Set()
    allPosts.forEach((p) => { if (p.userData?.country) set.add(p.userData.country) })
    return [...set].sort()
  }, [allPosts])

  // Unique sub-categories (filtered by active category if set)
  const subCategories = useMemo(() => {
    const set = new Set()
    allPosts.forEach((p) => {
      if (filterCategory) {
        const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean)
        if (!cats.includes(filterCategory)) return
      }
      const sub = p.subCategory?.name ?? p.subCategory
      if (sub) set.add(sub)
    })
    return [...set].sort()
  }, [allPosts, filterCategory])

  // Filtered list (latest first)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allPosts
      .filter((p) => {
        if (filterCategory) {
          const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean)
          if (!cats.includes(filterCategory)) return false
        }
        if (filterSubCategory) {
          const sub = p.subCategory?.name ?? p.subCategory
          if (sub !== filterSubCategory) return false
        }
        if (filterCountry && p.userData?.country !== filterCountry) return false
        if (q) {
          const username = (p.instagramUsername ?? p.userData?.username ?? '').toLowerCase()
          if (!username.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
  }, [allPosts, search, filterCategory, filterSubCategory, filterCountry])


  function handleFilter(setter) {
    return (val) => { setter(val) }
  }

  const anyFilter = search || filterCategory || filterSubCategory || filterCountry

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Posts Management</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Monitor and manage all submitted posts.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {!loading && (
            <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
              {filtered.length.toLocaleString()} post{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            disabled={loading}
            title="Refresh"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={filterCategory}
          onChange={(e) => { handleFilter(setCategory)(e.target.value); setSubCategory('') }}
          className={SELECT}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Sub-Category */}
        <input
          type="text"
          list="subcategory-list"
          autoComplete="off"
          value={filterSubCategory}
          onChange={(e) => handleFilter(setSubCategory)(e.target.value)}
          placeholder="Sub-Category…"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-44"
        />
        <datalist id="subcategory-list">
          {subCategories.map((s) => <option key={s} value={s} />)}
        </datalist>

        {/* Search */}
        <input
          type="text"
          autoComplete="off"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
          placeholder="Search Username…"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-48"
        />

        {/* Country */}
        <select
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value) }}
          className={`${SELECT} ml-auto`}
        >
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Clear */}
        {anyFilter && (
          <button
            onClick={() => { setSearch(''); setCategory(''); setSubCategory(''); setFilterCountry('') }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <PostTable
        posts={filtered}
        loading={loading}
      />
    </div>
  )
}
