import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { countriesApi } from '../../../utils/countriesApi'
import UserWorldMap from '../../../components/dashboard/countries/UserWorldMap'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'
const INPUT = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition'

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4"><div className="h-3 w-32 rounded bg-gray-100" /></td>
      <td className="px-6 py-4"><div className="h-5 w-10 rounded-full bg-gray-100" /></td>
      <td className="px-6 py-4"><div className="h-5 w-10 rounded-lg bg-gray-100" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
      <td className="px-6 py-4"><div className="ml-auto h-6 w-20 rounded-lg bg-gray-100" /></td>
    </tr>
  )
}

function CountryModal({ country, onClose, onSaved }) {
  const isEdit = !!country
  const [name, setName]     = useState(country?.name ?? '')
  const [code, setCode]     = useState(country?.code ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { name: name.trim(), code: code.trim().toUpperCase() }
      const result = isEdit
        ? await countriesApi.updateCountry(country._id, payload)
        : await countriesApi.createCountry(payload)
      onSaved(result, isEdit)
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
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{isEdit ? 'Edit Country' : 'Add Country'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{isEdit ? 'Update country details' : 'Add a new supported country'}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Country Name</label>
            <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nigeria" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Country Code</label>
            <input className={INPUT} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={2} placeholder="e.g. NG" required />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Country'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function DeleteModal({ country, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await countriesApi.deleteCountry(country._id)
      onConfirmed(country._id)
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
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Delete {country.name}?</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">This will permanently remove this country. This action cannot be undone.</p>
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

export default function CountriesPage() {
  const [countries, setCountries]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [togglingId, setTogglingId]     = useState(null)

  async function loadCountries() {
    setLoading(true)
    setError(null)
    try {
      const res = await countriesApi.getCountries()
      setCountries(Array.isArray(res) ? res : (res?.countries ?? res?.data ?? []))
    } catch (err) {
      setError(err.message ?? 'Failed to load countries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCountries() }, [])

  const activeCount   = countries.filter((c) => c.isActive).length
  const inactiveCount = countries.filter((c) => !c.isActive).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return countries.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false
      if (statusFilter === 'active'   && !c.isActive) return false
      if (statusFilter === 'inactive' &&  c.isActive) return false
      return true
    })
  }, [countries, search, statusFilter])

  async function handleToggle(country) {
    setTogglingId(country._id)
    try {
      const updated = country.isActive
        ? await countriesApi.suspendCountry(country._id)
        : await countriesApi.activateCountry(country._id)
      setCountries((prev) => prev.map((c) => c._id === updated._id ? updated : c))
    } catch {
      // ignore
    } finally {
      setTogglingId(null)
    }
  }

  function handleSaved(result, isEdit) {
    if (isEdit) {
      setCountries((prev) => prev.map((c) => c._id === result._id ? result : c))
      setEditTarget(null)
    } else {
      setCountries((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAdd(false)
    }
  }

  function handleDeleted(id) {
    setCountries((prev) => prev.filter((c) => c._id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl">Countries</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Manage platform-supported countries and their status.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Country
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Countries', value: loading ? '...' : countries.length,                                                   color: 'text-gray-900 dark:text-white' },
          { label: 'Total Users',    value: loading ? '...' : countries.reduce((s, c) => s + (c.userCount ?? 0), 0).toLocaleString(), color: 'text-blue-500'               },
          { label: 'Active',         value: loading ? '...' : activeCount,                                                            color: 'text-green-600'              },
          { label: 'Inactive',       value: loading ? '...' : inactiveCount,                                                          color: 'text-gray-400'               },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error} — <button onClick={loadCountries} className="font-semibold underline">Retry</button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Map — 40% */}
        {!loading && countries.length > 0 && (
          <div className="lg:flex-[2]">
            <UserWorldMap countries={countries} />
          </div>
        )}

        {/* Table — 60% */}
        <div className="lg:flex-[3] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Country List</p>
            {!loading && <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} of {countries.length} countries</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin" style={{ maxHeight: 380 }}>
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 sticky top-0 z-10">
                <th className={COL}>Country</th>
                <th className={COL}>Users</th>
                <th className={COL}>Code</th>
                <th className={COL}>Status</th>
                <th className={`${COL} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No countries match your search.
                  </td>
                </tr>
              )}

              {!loading && filtered.map((country) => (
                <tr key={country._id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{country.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-500">
                      {(country.userCount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400">
                      {country.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={country.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditTarget(country)}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggle(country)}
                        disabled={togglingId === country._id}
                        title={country.isActive ? 'Suspend' : 'Activate'}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 ${country.isActive ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600' : 'text-green-400 hover:bg-green-50 hover:text-green-600'}`}
                      >
                        {togglingId === country._id ? (
                          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : country.isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(country)}
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
        </div>{/* end table card */}
      </div>{/* end row */}

      {showAdd      && <CountryModal                       onClose={() => setShowAdd(false)}      onSaved={handleSaved} />}
      {editTarget   && <CountryModal country={editTarget}  onClose={() => setEditTarget(null)}    onSaved={handleSaved} />}
      {deleteTarget && <DeleteModal  country={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirmed={handleDeleted} />}
    </div>
  )
}
