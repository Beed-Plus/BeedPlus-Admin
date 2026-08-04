import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { usersApi } from "../../../utils/usersApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { countriesApi } from "../../../utils/countriesApi";
import UserFilters from "../../../components/dashboard/users/UserFilters";
import UserTable from "../../../components/dashboard/users/UserTable";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import { RetryIcon } from "../../../components/icons";
import Loader from "../../../components/Loader";
import toast from "react-hot-toast";

const STATUS_META = {
  approved: {
    label: "Approved Users",
    color: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
    description: "Users who have been approved and have full platform access.",
  },
  pending: {
    label: "Pending Users",
    color: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
    description: "Users awaiting review and approval.",
  },
  rejected: {
    label: "Rejected Users",
    color: "bg-red-50 text-red-500",
    dot: "bg-red-400",
    description: "Users whose access has been denied or revoked.",
  },
  deferred: {
    label: "Deferred Users",
    color: "bg-blue-50 text-blue-500",
    dot: "bg-blue-400",
    description: "Users whose access has been deferred.",
  },
};

const ITEMS_PER_PAGE = 100;

function cleanFilterValue(value) {
  return value && value !== "All" ? value : "";
}

function applyFilters(users, { search, followerSort }) {
  let result = users;
  if (search) {
    const lower = search.toLowerCase();
    result = result.filter((u) => {
      const username = (
        u.instagram?.instagramUsername ??
        u.instagramUsername ??
        ""
      ).toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return username.includes(lower) || email.includes(lower);
    });
  }
  if (followerSort) {
    result = [...result].sort((a, b) => {
      const af = a.instagram?.followersCount ?? 0;
      const bf = b.instagram?.followersCount ?? 0;
      return followerSort === "desc" ? bf - af : af - bf;
    });
  }
  return result;
}

export default function UsersStatusPage({ status }) {
  const { auth } = useAuth();
  const token = auth?.token;
  const meta = STATUS_META[status] ?? STATUS_META.approved;

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReloading, setIsReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [followerSort, setFollowerSort] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [gender, setGender] = useState("");

  // const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [subCategory, setSubCategory] = useState("");

  const { categories, subCategories, fetchCategories, fetchSubCategories } =
    useCategoriesProvider();

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    countriesApi
      .getCountries()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.countries ?? []);
        setCountries(
          list
            .map((c) => c.name ?? c)
            .filter(Boolean)
            .sort(),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await usersApi.getUsers(
          {
            approvalStatus: status,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            ...(cleanFilterValue(category)
              ? { category: cleanFilterValue(category) }
              : {}),
            ...(cleanFilterValue(gender)
              ? { gender: cleanFilterValue(gender) }
              : {}),
            ...(cleanFilterValue(country)
              ? { country: cleanFilterValue(country) }
              : {}),
            ...(cleanFilterValue(approvalStatus)
              ? { approvalStatus: cleanFilterValue(approvalStatus) }
              : {}),
            ...(search ? { search } : {}),
          },
          token,
        );
        setUsers(res?.users ?? []);
        setPagination(res?.pagination ?? { total: 0, page: 1, pages: 1 });
      } catch (err) {
        toast.error(err?.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [
    category,
    country,
    status,
    token,
    currentPage,
    approvalStatus,
    gender,
    search,
  ]);

  function handleFilter(setter) {
    return (val) => {
      setCurrentPage(1);
      setter(val);
    };
  }

  async function refreshData() {
    setIsReloading(true);

    try {
      const res = await usersApi.getUsers(
        {
          approvalStatus: status,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(cleanFilterValue(category)
            ? { category: cleanFilterValue(category) }
            : {}),
          ...(cleanFilterValue(gender)
            ? { gender: cleanFilterValue(gender) }
            : {}),
          ...(cleanFilterValue(country)
            ? { country: cleanFilterValue(country) }
            : {}),
          ...(cleanFilterValue(approvalStatus)
            ? { approvalStatus: cleanFilterValue(approvalStatus) }
            : {}),
          ...(search ? { search } : {}),
        },
        token,
      );
      setUsers(res?.users ?? []);
      setPagination(res?.pagination ?? { total: 0, page: 1, pages: 1 });
      setIsReloading(false);
    } catch (err) {
      toast.error(err?.message ?? "Failed to refresh users");
    } finally {
      setIsReloading(false);
    }
  }
  const visibleUsers = applyFilters(users, { search, followerSort });

  const loadingMore = loading;
  const filteredTotalPages = Math.max(1, pagination?.pages ?? 1);
  const paginatedData = visibleUsers;

  useEffect(() => {
    if (currentPage > filteredTotalPages) {
      setCurrentPage(filteredTotalPages);
    }
  }, [currentPage, filteredTotalPages]);



  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {meta.label}
          </h1>
          <p className="mt-1 text-sm text-black-400 dark:text-gray-500">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900  shadow-lg shadow-[#0000001A] overflow-hidden py-2 mb-40">
        <div className="flex justify-between items-center px-4 mb-2">
          <h3 className="text-xl font-bold">User List</h3>

          <div className="flex gap-4">
            <UserFilters
              search={search}
              gender={gender}
              category={category}
              subCategory={subCategory}
              country={country}
              approvalStatus={approvalStatus}
              categories={categories}
              subCategories={subCategories}
              countries={countries}
              followerSort={followerSort}
              onSearchChange={(val) => {
                setCurrentPage(1);
                setSearch(val);
              }}
              onFollowerSortChange={setFollowerSort}
              onCategoryChange={handleFilter(setCategory)}
              onSubCategoryChange={handleFilter(setSubCategory)}
              onCountryChange={handleFilter(setCountry)}
              onApprovalStatusChange={handleFilter(setApprovalStatus)}
              pagination={pagination}
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => refreshData()}
                disabled={isReloading}
                title="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shadow-[#00000040] disabled:opacity-40"
              >
                <RetryIcon />
              </button>
              {
                <p className="px-3 py-1 text-base font-semibold">
                  Users: {pagination.total.toLocaleString() ?? 0}
                </p>
              }
            </div>
          </div>
        </div>
        {/* Table */}
        <UserTable users={paginatedData} loading={loading} refreshData={refreshData} />

        {filteredTotalPages > 1 && (
          <div className="relative flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            {/* Loading spinner overlay */}
            {loadingMore && <Loader />}

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loadingMore}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <div className="flex items-center gap-1.5">
              {(() => {
                const pageButtons = [];
                const maxButtons = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxButtons / 2),
                );
                let endPage = Math.min(
                  filteredTotalPages,
                  startPage + maxButtons - 1,
                );

                if (endPage - startPage + 1 < maxButtons) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }

                if (startPage > 1) {
                  pageButtons.push(
                    <button
                      key="first"
                      onClick={() => setCurrentPage(1)}
                      disabled={loadingMore}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      1
                    </button>,
                  );
                  if (startPage > 2) {
                    pageButtons.push(
                      <span
                        key="ellipsis-start"
                        className="text-gray-400 dark:text-gray-600"
                      >
                        …
                      </span>,
                    );
                  }
                }

                for (let page = startPage; page <= endPage; page++) {
                  pageButtons.push(
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loadingMore}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        page === currentPage
                          ? "bg-[#3A3A3A] text-white shadow-lg"
                          : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                      }`}
                    >
                      {page}
                    </button>,
                  );
                }

                if (endPage < filteredTotalPages) {
                  if (endPage < filteredTotalPages - 1) {
                    pageButtons.push(
                      <span
                        key="ellipsis-end"
                        className="text-gray-400 dark:text-gray-600"
                      >
                        …
                      </span>,
                    );
                  }
                  pageButtons.push(
                    <button
                      key="last"
                      onClick={() => setCurrentPage(filteredTotalPages)}
                      disabled={loadingMore}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {filteredTotalPages}
                    </button>,
                  );
                }

                return pageButtons;
              })()}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(filteredTotalPages, p + 1))
              }
              disabled={currentPage === filteredTotalPages || loadingMore}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
