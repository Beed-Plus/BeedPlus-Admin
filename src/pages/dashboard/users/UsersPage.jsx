import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { usersApi } from "../../../utils/usersApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { countriesApi } from "../../../utils/countriesApi";
import UserFilters from "../../../components/dashboard/users/UserFilters";
import UserTable from "../../../components/dashboard/users/UserTable";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import { RetryIcon } from "../../../components/icons";

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

export default function UsersPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const [search, setSearch] = useState("");
  const [followerSort, setFollowerSort] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [country, setCountry] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [gender, setGender] = useState("");

  // const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

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
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let lastErr = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await usersApi.getUsers(
            {
              ...(category ? { category } : {}),
              ...(gender ? { gender } : {}),
              ...(country ? { country } : {}),
              ...(approvalStatus ? { approvalStatus } : {}),
            },
            token,
          );
          console.log("Fetched users:", JSON.stringify(res, null, 2));
          if (cancelled) return;
          setUsers(res?.users ?? []);
          setPagination(res?.pagination ?? { total: 0, page: 1, pages: 1 });
          setLoading(false);
          return; // success
        } catch (err) {
          if (cancelled) return;
          lastErr = err;
          if (attempt < 3) {
            // wait before next attempt: 1s, then 2s
            await new Promise((r) => setTimeout(r, attempt * 1000));
            if (cancelled) return;
          }
        }
      }

      // all attempts exhausted
      setError(lastErr?.message ?? "Failed to load users");
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, country, gender, approvalStatus, token, retryKey]);

  function handleFilter(setter) {
    return (val) => {
      setter(val);
    };
  }

  const visibleUsers = useMemo(
    () => applyFilters(users, { search, followerSort }),
    [users, search, followerSort],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: loading ? "..." : users.length,
            color: "text-[#FDD6B6] dark:text-gray-500",
            boxColor: "bg-[#2F3134] shadow-sm",
            headerColor: "text-[#DADADA]",
          },
          {
            label: "Active Creator",
            value: loading ? "..." : 0,
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-sm",
            headerColor: "text-[#686969]",
          },
          {
            label: "Suspended Account",
            value: loading ? "..." : 0,
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-sm",
            headerColor: "text-[#686969]",
          },
          {
            label: "New Users Today",
            value: loading ? "..." : 0,
            color: "text-[#2F3134] dark:text-white",
            boxColor: "bg-[#F9F9F9] shadow-sm",
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

      {/* Filters */}

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
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden py-6">
        <div className="flex justify-between items-center px-4 mb-6">
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
              onSearchChange={setSearch}
              onFollowerSortChange={setFollowerSort}
              onCategoryChange={handleFilter(setCategory)}
              onSubCategoryChange={handleFilter(setSubCategory)}
              onCountryChange={handleFilter(setCountry)}
              onApprovalStatusChange={handleFilter(setApprovalStatus)}
              pagination={pagination}
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                disabled={loading}
                title="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shadow-[#00000040] disabled:opacity-40"
              >
                <RetryIcon />
              </button>
              {!loading && !error && (
                <p className="px-3 py-1 text-base font-semibold">
                  Users: {pagination.total.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Table */}
        <UserTable users={visibleUsers} loading={loading} />
      </div>
    </div>
  );
}
