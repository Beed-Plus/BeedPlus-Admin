import { useState, useEffect } from 'react'
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
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [page, category, country, approvalStatus, token])

  function handleFilter(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  const visibleUsers = applyFilters(users, { search, followerSort })

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
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
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
