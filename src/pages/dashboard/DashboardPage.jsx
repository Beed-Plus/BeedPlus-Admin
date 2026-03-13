import { useState, useEffect } from 'react'
import StatCard from '../../components/dashboard/StatCard'
import RecentActivity from '../../components/dashboard/RecentActivity'
import {
  UsersIcon,
  PostsIcon,
  CategoriesIcon,
  SubCategoriesIcon,
} from '../../components/ui/icons'
import { useAuth } from '../../hooks/useAuth'
import { usersApi } from '../../utils/usersApi'
import { categoriesApi } from '../../utils/categoriesApi'
import { subCategoriesApi } from '../../utils/subCategoriesApi'
import { instagramApi } from '../../utils/instagramApi'

function fmt(val) {
  if (val === null || val === undefined) return '—'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1_000)     return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return val.toLocaleString()
}

export default function DashboardPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [stats, setStats]     = useState({ users: null, posts: null, categories: null, subCategories: null })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [usersRes, postsRes, catsRes, subCatsRes] = await Promise.allSettled([
        usersApi.getUsers({ limit: 1 }, token),
        instagramApi.getAllSubmittedMediaForAdmin(token),
        categoriesApi.getCategories(),
        subCategoriesApi.getSubCategories(),
      ])

      if (cancelled) return

      setStats({
        users:        usersRes.status   === 'fulfilled' ? (usersRes.value?.pagination?.total    ?? null) : null,
        posts:        postsRes.status   === 'fulfilled' ? (Array.isArray(postsRes.value) ? postsRes.value.length : null) : null,
        categories:   catsRes.status    === 'fulfilled' ? (catsRes.value?.categories?.length    ?? null) : null,
        subCategories: subCatsRes.status === 'fulfilled' ? (subCatsRes.value?.subCategories?.length ?? null) : null,
      })

      // Surface a top-level error only if ALL requests failed
      const allFailed = [usersRes, postsRes, catsRes, subCatsRes].every((r) => r.status === 'rejected')
      if (allFailed) setError('Failed to load dashboard data. Please refresh.')

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [token])

  const STAT_CARDS = [
    { label: 'Total Users',    value: fmt(stats.users),         icon: UsersIcon },
    { label: 'Total Posts',    value: fmt(stats.posts),         icon: PostsIcon },
    { label: 'Categories',     value: fmt(stats.categories),    icon: CategoriesIcon },
    { label: 'Sub-Categories', value: fmt(stats.subCategories), icon: SubCategoriesIcon },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-400">
          Welcome back, here's what's happening with Beed+ today.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
