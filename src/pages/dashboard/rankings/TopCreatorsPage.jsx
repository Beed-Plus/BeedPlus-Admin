import { useState, useEffect, useMemo } from "react";
import { instagramApi } from "../../../utils/instagramApi";
import CreatorHighlightCards from "../../../components/dashboard/rankings/CreatorHighlightCards";
import TopCreatorsTable from "../../../components/dashboard/rankings/TopCreatorsTable";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";

const SELECT =
  "w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer scrollbar-thin";

export default function TopCreatorsPage() {
  const [rankings, setRankings] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1+ = category index
  const [filterCountry, setFilterCountry] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // const { categories, subCategories, fetchCategories, fetchSubCategories } =
  //   useCategoriesProvider();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    instagramApi
      .getCreatorMonthlyTop100()
      .then((res) => {
        if (cancelled) return;
        setRankings(res.rankings ?? []);
        setCount(res.count ?? res.rankings?.length ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load creator rankings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Unique categories derived from rankings
  const categories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    rankings.forEach((r) => {
      if (r.category && !seen.has(r.category)) {
        seen.add(r.category);
        cats.push(r.category);
      }
    });
    return cats.sort();
  }, [rankings]);

  // Unique countries derived from rankings
  const availableCountries = useMemo(() => {
    const set = new Set();
    rankings.forEach((r) => {
      if (r.country) set.add(r.country);
    });
    return [...set].sort();
  }, [rankings]);

  // Filter by active tab + country
  // const filtered = useMemo(() => {
  //   let list =
  //     activeTab === 0
  //       ? rankings
  //       : rankings.filter((r) => r.category === categories[activeTab - 1]);
  //   if (filterCountry) list = list.filter((r) => r.country === filterCountry);
  //   return list;
  // }, [rankings, activeTab, categories, filterCountry]);

  const filtered = useMemo(() => {
    
    return rankings
      .filter((r) => {
        if (category) {
          if (r.category == category) return false;
        }
        if (subCategory) {
          if (r.subCategory !== subCategory) return false;
        }
        if (filterCountry && r.country !== filterCountry) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
  }, [rankings, category, subCategory, filterCountry]);

  const topCreator = rankings[0]?.username ?? "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Category tabs + Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 pt-4 mb-6">
          <h3 className="text-xl font-bold">Top Creator Ranking</h3>

          <div className="flex gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={SELECT}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Country */}
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className={SELECT}
              >
                <option value="">All Countries</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <TopCreatorsTable creators={filtered} loading={loading} nested />
      </div>
    </div>
  );
}
