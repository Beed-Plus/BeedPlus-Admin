import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { countriesApi } from "../../../utils/countriesApi";
import UserWorldMap from "../../../components/dashboard/countries/UserWorldMap";
import { DeleteIcon } from "../../../components/icons";
import CustomDropDownInput from "../../../components/CustomDropDownInput";

const COL = "px-6 py-3 text-left text-base font-medium text-[#3A3A3AB2]";

function CountryFlag({ code, size = 20 }) {
  if (!code || code.length !== 2) return null;
  return (
    <img
      src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png 2x`}
      width={size}
      alt={code}
      className="rounded-full object-cover shrink-0"
      style={{ height: size }}
    />
  );
}
const INPUT =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition";

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-base font-medium text-green-600">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-base font-medium text-gray-500">
      Inactive
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4">
        <div className="h-3 w-32 rounded bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-10 rounded-full bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-10 rounded-lg bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="ml-auto h-6 w-20 rounded-lg bg-gray-100" />
      </td>
    </tr>
  );
}

function CountryModal({ country, onClose, onSaved }) {
  const isEdit = !!country;
  const [name, setName] = useState(country?.name ?? "");
  const [code, setCode] = useState(country?.code ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), code: code.trim().toUpperCase() };
      const result = isEdit
        ? await countriesApi.updateCountry(country._id, payload)
        : await countriesApi.createCountry(payload);
      onSaved(result, isEdit);
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CountryFlag code={isEdit ? country.code : code} size={40} />
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {isEdit ? "Edit Country" : "Add Country"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {isEdit
                  ? "Update country details"
                  : "Add a new supported country"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Country Name
            </label>
            <input
              className={INPUT}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nigeria"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Country Code
            </label>
            <input
              className={INPUT}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="e.g. NG"
              required
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Country"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function DeleteModal({ country, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await countriesApi.deleteCountry(country._id);
      onConfirmed(country._id);
    } catch (err) {
      setError(err.message ?? "Delete failed");
      setDeleting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
          Delete {country.name}?
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          This will permanently remove this country. This action cannot be
          undone.
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  async function loadCountries() {
    setLoading(true);
    setError(null);
    try {
      const res = await countriesApi.getCountries();
      setCountries(
        Array.isArray(res) ? res : (res?.countries ?? res?.data ?? []),
      );
    } catch (err) {
      setError(err.message ?? "Failed to load countries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCountries();
  }, []);

  const activeCount = countries.filter((c) => c.isActive).length;
  const inactiveCount = countries.filter((c) => !c.isActive).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return countries.filter((c) => {
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.code.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      return true;
    });
  }, [countries, search, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIdx, endIdx);

  async function handleToggle(country) {
    setTogglingId(country._id);
    try {
      const updated = country.isActive
        ? await countriesApi.suspendCountry(country._id)
        : await countriesApi.activateCountry(country._id);
      setCountries((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c)),
      );
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  }

  function handleSaved(result, isEdit) {
    if (isEdit) {
      setCountries((prev) =>
        prev.map((c) => (c._id === result._id ? result : c)),
      );
      setEditTarget(null);
    } else {
      setCountries((prev) =>
        [...prev, result].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setShowAdd(false);
    }
  }

  function handleDeleted(id) {
    setCountries((prev) => prev.filter((c) => c._id !== id));
    setDeleteTarget(null);
  }

  console.log("countries", countries);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-white sm:text-2xl">
            Countries
          </h1>
          <p className="mt-1 text-sm text-[#1A1A1A] dark:text-gray-500">
            Monitor platform activity and creator performance across regions.
          </p> */}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-[#2F3134] px-4 py-2.5 text-sm font-semibold text-white transition sm:self-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Country
        </button>
      </div>

      {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Countries",
            value: loading ? "..." : countries.length,
            color: "text-[#FDD6B6] dark:text-gray-500",
            boxColor: "bg-[#2F3134] shadow-lg",
            headerColor: "text-[#DADADA]",
          },
          {
            label: "Top Country",
            value: loading
              ? "..."
              : countries
                  .reduce((s, c) => s + (c.userCount ?? 0), 0)
                  .toLocaleString(),
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-lg",
            headerColor: "text-[#686969]",
          },
          {
            label: "Total views",
            value: loading ? "..." : activeCount,
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-lg",
            headerColor: "text-[#686969]",
          },
          {
            label: "Active Creator",
            value: loading ? "..." : activeCount,
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-lg",
            headerColor: "text-[#686969]",
          },
        ].map(({ label, value, color, boxColor, headerColor }) => (
          <div
            key={label}
            className={`rounded-[20px] flex flex-col gap-6  ${boxColor} p-5`}
          >
            <p
              className={`text-base font-medium tracking-widest ${headerColor}`}
            >
              {label}
            </p>
            <p className={`mt-1 text-4xl font-bold ${color} `}>{value}</p>
          </div>
        ))}
      </div> */}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error} —{" "}
          <button onClick={loadCountries} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row ">
        {/* Table — 60% */}
        <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden flex flex-col">
          <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Country List
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-50"
                />
              </div>
              <div className="w-40">
                <CustomDropDownInput
                  placeholder="All Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  items={[
                    { label: "All Status", value: "" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div
            className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin rounded-t-xl"
            style={{ maxHeight: 580 }}
          >
            <table className="w-full min-w-[480px] ">
              <thead>
                <tr className="border-b bg-[#DDDDDD] border-gray-100 dark:border-gray-800 rounded-t-xl dark:bg-gray-800/50 sticky top-0 z-10">
                  <th className={COL}>Country</th>
                  <th className={COL}>Users</th>
                  <th className={COL}>Code</th>
                  <th className={COL}>Status</th>
                  <th className={`${COL} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      No countries match your search.
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedData.map((country) => (
                    <tr
                      key={country._id}
                      className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <CountryFlag code={country.code} size={40} />
                          <span className="text-lg font-bold text-[#3A3A3A] dark:text-gray-100">
                            {country.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full dark:bg-blue-500/10 px-2.5 py-0.5 text-base font-medium text-black">
                          {(country.userCount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-xl dark:bg-gray-800 p-2.5 text-base font-medium tracking-widest text-black dark:text-gray-400">
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
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.862 4.48725L18.549 2.79925C18.9007 2.44757 19.3777 2.25 19.875 2.25C20.3723 2.25 20.8493 2.44757 21.201 2.79925C21.5527 3.15092 21.7502 3.6279 21.7502 4.12525C21.7502 4.62259 21.5527 5.09957 21.201 5.45125L10.582 16.0702C10.0533 16.5986 9.40137 16.987 8.685 17.2002L6 18.0002L6.8 15.3152C7.01328 14.5989 7.40163 13.9469 7.93 13.4182L16.862 4.48725ZM16.862 4.48725L19.5 7.12525M18 14.0002V18.7502C18 19.347 17.7629 19.9193 17.341 20.3412C16.919 20.7632 16.3467 21.0002 15.75 21.0002H5.25C4.65326 21.0002 4.08097 20.7632 3.65901 20.3412C3.23705 19.9193 3 19.347 3 18.7502V8.25025C3 7.65351 3.23705 7.08121 3.65901 6.65926C4.08097 6.2373 4.65326 6.00025 5.25 6.00025H10"
                                stroke="black"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggle(country)}
                            disabled={togglingId === country._id}
                            title={country.isActive ? "Suspend" : "Activate"}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 ${country.isActive ? "text-amber-400 hover:bg-amber-50 hover:text-amber-600" : "text-green-400 hover:bg-green-50 hover:text-green-600"}`}
                          >
                            {togglingId === country._id ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : country.isActive ? (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.25 9V15M9.75 15V9M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
                                  stroke="#CBC401"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(country)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <div className="flex items-center gap-1.5">
                {(() => {
                  const pageButtons = [];
                  const maxButtons = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

                  if (endPage - startPage + 1 < maxButtons) {
                    startPage = Math.max(1, endPage - maxButtons + 1);
                  }

                  if (startPage > 1) {
                    pageButtons.push(
                      <button
                        key="first"
                        onClick={() => setCurrentPage(1)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pageButtons.push(
                        <span key="ellipsis-start" className="text-gray-400 dark:text-gray-600">
                          …
                        </span>
                      );
                    }
                  }

                  for (let page = startPage; page <= endPage; page++) {
                    pageButtons.push(
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          page === currentPage
                            ? "bg-[#3A3A3A] text-white shadow-lg"
                            : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pageButtons.push(
                        <span key="ellipsis-end" className="text-gray-400 dark:text-gray-600">
                          …
                        </span>
                      );
                    }
                    pageButtons.push(
                      <button
                        key="last"
                        onClick={() => setCurrentPage(totalPages)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pageButtons;
                })()}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
        {/* end table card */}
      </div>
      {/* end row */}

      {showAdd && (
        <CountryModal onClose={() => setShowAdd(false)} onSaved={handleSaved} />
      )}
      {editTarget && (
        <CountryModal
          country={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          country={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDeleted}
        />
      )}
    </div>
  );
}
