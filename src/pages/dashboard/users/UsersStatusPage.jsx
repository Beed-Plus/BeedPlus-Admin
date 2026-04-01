import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { usersApi } from '../../../utils/usersApi'
import { categoriesApi } from '../../../utils/categoriesApi'
import { countriesApi } from '../../../utils/countriesApi'
import UserFilters from '../../../components/dashboard/users/UserFilters'
import UserTable from '../../../components/dashboard/users/UserTable'

const STATUS_META = {
  approved: { label: 'Approved Users', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400', description: 'Users who have been approved and have full platform access.' },
  pending:  { label: 'Pending Users',  color: 'bg-amber-50 text-amber-600',   dot: 'bg-amber-400',   description: 'Users awaiting review and approval.' },
  rejected: { label: 'Rejected Users', color: 'bg-red-50 text-red-500',       dot: 'bg-red-400',     description: 'Users whose access has been denied or revoked.' },
}

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

export default function UsersStatusPage({ status }) {
  const { auth } = useAuth()
  const token = auth?.token
  const meta = STATUS_META[status] ?? STATUS_META.approved

  const [users, setUsers]           = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const [search, setSearch]             = useState('')
  const [followerSort, setFollowerSort] = useState('')
  const [category, setCategory]     = useState('')
  const [country, setCountry]       = useState('')

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
            approvalStatus: status,
            ...(category ? { category } : {}),
            ...(country  ? { country }  : {}),
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
  }, [category, country, status, token])

  function handleFilter(setter) {
    return (val) => { setter(val) }
  }

  const visibleUsers = applyFilters(users, { search, followerSort })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{meta.label}</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{meta.description}</p>
        </div>
        {!loading && !error && (
          <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${meta.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {pagination.total.toLocaleString()} users
          </span>
        )}
      </div>

      {/* Filters — no status filter (it's fixed by the route) */}
      <UserFilters
        search={search}
        category={category}
        country={country}
        approvalStatus=""
        categories={categories}
        countries={countries}
        followerSort={followerSort}
        onSearchChange={setSearch}
        onFollowerSortChange={setFollowerSort}
        onCategoryChange={handleFilter(setCategory)}
        onCountryChange={handleFilter(setCountry)}
        onApprovalStatusChange={() => {}}
        hideStatusFilter
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
      />
    </div>
  )
}
