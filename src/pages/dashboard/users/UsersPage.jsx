import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { usersApi } from '../../../utils/usersApi'
import { categoriesApi } from '../../../utils/categoriesApi'
import { countriesApi } from '../../../utils/countriesApi'
import UserFilters from '../../../components/dashboard/users/UserFilters'
import UserTable from '../../../components/dashboard/users/UserTable'

const PAGE_SIZE = 15

function applyFilters(users, { search, followerSort }) {
  let result = users
  if (search) {
    const lower = search.toLowerCase()
    result = result.filter((u) => {
      const username = (u.instagram?.instagramUsername ?? u.instagramUsername ?? '').toLowerCase()
      const email    = (u.email ?? '').toLowerCase()
      return username.includes(lower) || email.includes(lower)
    })
  }
  if (followerSort) {
    result = [...result].sort((a, b) => {
      const af = a.instagram?.followersCount ?? 0
      const bf = b.instagram?.followersCount ?? 0
      return followerSort === 'desc' ? bf - af : af - bf
    })
  }
  return result
}

export default function UsersPage() {
  const { auth } = useAuth()
  const token = auth?.token

  const [users, setUsers]           = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [retryKey, setRetryKey]     = useState(0)

  const [page, setPage]                     = useState(1)
  const [search, setSearch]                 = useState('')
  const [followerSort, setFollowerSort]     = useState('')
  const [category, setCategory]             = useState('')
  const [country, setCountry]               = useState('')
  const [approvalStatus, setApprovalStatus] = useState('')

  const [categories, setCategories] = useState([])
  const [countries, setCountries]   = useState([])

  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories((res?.categories ?? []).map((c) => c.name ?? c).filter(Boolean)))
      .catch(() => {})
    countriesApi.getCountries()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.countries ?? [])
        setCountries(list.map((c) => c.name ?? c).filter(Boolean).sort())
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      let lastErr = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await usersApi.getUsers(
            {
              page,
              limit: PAGE_SIZE,
              ...(category       ? { category }       : {}),
              ...(country        ? { country }        : {}),
              ...(approvalStatus ? { approvalStatus } : {}),
            },
            token,
          )
          if (cancelled) return
          setUsers(res?.users ?? [])
          setPagination(res?.pagination ?? { total: 0, page: 1, pages: 1 })
          setLoading(false)
          return // success
        } catch (err) {
          if (cancelled) return
          lastErr = err
          if (attempt < 3) {
            // wait before next attempt: 1s, then 2s
            await new Promise((r) => setTimeout(r, attempt * 1000))
            if (cancelled) return
          }
        }
      }

      // all attempts exhausted
      setError(lastErr?.message ?? 'Failed to load users')
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [page, category, country, approvalStatus, token, retryKey])

  function handleFilter(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  const visibleUsers = useMemo(
    () => applyFilters(users, { search, followerSort }),
    [users, search, followerSort],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage, audit, and monitor all registered users in the Beed+ ecosystem.
          </p>
        </div>
        {!loading && !error && (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            {pagination.total.toLocaleString()} users
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <button className="relative pb-3 text-sm font-semibold text-orange-500 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-orange-500">
          All Users
        </button>
      </div>

      {/* Filters */}
      <UserFilters
        search={search}
        category={category}
        country={country}
        approvalStatus={approvalStatus}
        categories={categories}
        countries={countries}
        followerSort={followerSort}
        onSearchChange={setSearch}
        onFollowerSortChange={setFollowerSort}
        onCategoryChange={handleFilter(setCategory)}
        onCountryChange={handleFilter(setCountry)}
        onApprovalStatusChange={handleFilter(setApprovalStatus)}
      />

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
      <UserTable
        users={visibleUsers}
        loading={loading}
        currentPage={pagination.page ?? page}
        totalPages={pagination.pages ?? 1}
        totalItems={pagination.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}
