import { useState, useEffect } from "react";
import StatCard from "../../components/dashboard/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import {
  UsersIcon,
  PostsIcon,
  CategoriesIcon,
  SubCategoriesIcon,
} from "../../components/ui/icons";
import { useAuth } from "../../hooks/useAuth";
import { usersApi } from "../../utils/usersApi";
import { categoriesApi } from "../../utils/categoriesApi";
import { subCategoriesApi } from "../../utils/subCategoriesApi";
import { instagramApi } from "../../utils/instagramApi";
import { useCategoriesProvider } from "../../hooks/useCategoriesProvider";
import { useScenes } from "../../hooks/useScenes";

function fmt(val) {
  if (val === null || val === undefined) return "—";
  if (val >= 1_000_000)
    return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return val.toLocaleString();
}

export default function DashboardPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [stats, setStats] = useState({
    users: null,
    posts: null,
    categories: null,
    subCategories: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankings, setRankings] = useState([]);

  const {
    categories,
    subCategories,
    createSubCategory,
    fetchCategories,
    fetchSubCategories,
  } = useCategoriesProvider();
   const { scenes, getScenes } =
      useScenes(token);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [usersRes, postsRes, pendingRes] = await Promise.allSettled([
        usersApi.getUsers({ limit: 1 }, token),
        instagramApi.getAllSubmittedMediaForAdmin(token),
        instagramApi.getPendingMediaForAdmin(token, "pending"),
        fetchCategories(),
        fetchSubCategories(),
      ]);
      getScenes()
      instagramApi
        .getCreatorMonthlyTop100()
        .then((res) => {
          if (cancelled) return;
          setRankings(res.rankings ?? []);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message ?? "Failed to load creator rankings");
        });

      if (cancelled) return;
console.log("pendingRes results:", { pendingRes });
      setStats({
        users:
          usersRes.status === "fulfilled"
            ? (usersRes.value?.pagination?.total ?? null)
            : null,
        posts:
          postsRes.status === "fulfilled"
            ? Array.isArray(postsRes.value)
              ? postsRes.value.length
              : null
            : null,
        pending:
          pendingRes.status === "fulfilled"
            ? Array.isArray(pendingRes.value.pending)
              ? pendingRes.value.pending.length
              : null
            : null,
      });

      // Surface a top-level error only if ALL requests failed
      const allFailed = [usersRes, postsRes, pendingRes].every(
        (r) => r.status === "rejected",
      );
      if (allFailed) setError("Failed to load dashboard data. Please refresh.");

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const STAT_CARDS = [
    {
      label: "Total Users",
      value: fmt(stats.users),
      icon: UsersIcon,
      href: "/dashboard/users",
    },
    {
      label: "Total Media",
      value: fmt(stats.posts),
      icon: PostsIcon,
      href: "/dashboard/posts",
    },
    {
      label: "Total Scenes",
      value: fmt(scenes.length),
      icon: CategoriesIcon,
      href: "/dashboard/categories/posts",
    },
    {
      label: "Total Pending",
      value: fmt(stats.pending),
      icon: SubCategoriesIcon,
      href: "/dashboard/sub-categories",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl text-[#0F172A] font-semibold sm:text-2xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-[10px] font-medium text-[#1A1A1A]">
          Welcome back, here's what's happening with Beed+ today.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} loading={loading} index={i} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-start h-75">
        <div className="shadow-sm shadow-[#0000000D] p-4 rounded-2xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-xs text-[#9096A2] font-medium text-left py-3 px-4 w-16">
                  Ranking
                </th>
                <th className="text-xs text-[#9096A2] font-medium text-left py-3 px-4">
                  Name
                </th>
                <th className="text-xs text-[#9096A2] font-medium text-left py-3 px-4 w-36">
                  Category
                </th>
                <th className="text-xs text-[#9096A2] font-medium text-left py-3 px-4 w-24">
                  Views
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((creator, index) => (
                <tr
                  key={creator.instagramUsername}
                  className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 w-16">
                    <span className="text-xs font-medium text-gray-400">
                      {index + 1}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {creator.instagramUsername}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    {creator.category ? (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {creator.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Views */}
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {creator.postCount || "—"}
                    </span>
                  </td>
                </tr>
              ))}

              {rankings.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    No creators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
