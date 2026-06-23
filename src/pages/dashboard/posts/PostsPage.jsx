import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { instagramApi } from "../../../utils/instagramApi";
import { useScenes } from "../../../hooks/useScenes";
import PostTable from "../../../components/dashboard/posts/PostTable";
import { RefreshIcon } from "../../../components/icons";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import SelectSearch from "../../../components/SelectSearch";
import Loader from "../../../components/Loader";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";

const SELECT =
  "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer";

export default function PostsPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const { updateScene } = useScenes(token);

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [isSavingScene, setIsSavingScene] = useState(false);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setCategory] = useState("");
  const [filterSubCategory, setSubCategory] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterBeedplusScore, setFilterBeedplusScore] = useState("");
  const [smallLoading, setSmallLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { categories, subCategories } = useCategoriesProvider();

  async function refreshData() {
    setSmallLoading(true);
    setError(null);

    try {
      const res = await instagramApi.getAllSubmittedMediaForAdmin(token);
      setAllPosts(Array.isArray(res) ? res : []);
      setSmallLoading(false);
      return;
    } catch (err) {
      setError(err?.message ?? "Failed to load posts");
    } finally {
      setSmallLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let lastErr = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await instagramApi.getAllSubmittedMediaForAdmin(token);
          if (cancelled) return;
          setAllPosts(Array.isArray(res) ? res : []);
          setLoading(false);
          return;
        } catch (err) {
          if (cancelled) return;
          lastErr = err;
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, attempt * 1000));
            if (cancelled) return;
          }
        }
      }

      setError(lastErr?.message ?? "Failed to load posts");
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, retryKey]);

  // Unique countries from all posts
  const countries = useMemo(() => {
    const set = new Set();
    allPosts.forEach((p) => {
      if (p.userData?.country) set.add(p.userData.country);
    });
    return [...set].sort();
  }, [allPosts]);

  // Filtered list (latest first)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPosts
      .filter((p) => {
        if (filterCategory && filterCategory !== "All") {
          const cats = Array.isArray(p.category)
            ? p.category
            : [p.category].filter(Boolean);
          if (!cats.includes(filterCategory)) return false;
        }
        if (filterSubCategory && filterSubCategory !== "All") {
          const sub = p.subCategory?.name ?? p.subCategory;
          if (sub !== filterSubCategory) return false;
        }
        if (
          filterCountry &&
          p.userData?.country !== filterCountry &&
          filterCountry !== "All"
        )
          return false;
        if (q) {
          const username = (
            p.instagramUsername ??
            p.userData?.username ??
            ""
          ).toLowerCase();
          if (!username.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filterBeedplusScore === "Highest to Lowest") {
          return (b.beedplusScore ?? 0) - (a.beedplusScore ?? 0);
        } else if (filterBeedplusScore === "Lowest to Highest") {
          return (a.beedplusScore ?? 0) - (b.beedplusScore ?? 0);
        }
      });
  }, [
    allPosts,
    search,
    filterCategory,
    filterSubCategory,
    filterCountry,
    filterBeedplusScore,
  ]);

  function handleFilter(setter) {
    return (val) => {
      setter(val);
    };
  }

  const anyFilter =
    search || filterCategory || filterSubCategory || filterCountry;

  const bookmarkScene = async (post) => {
    setSelectedPost(post._id);
    try {
      setIsSavingScene(true);
      await updateScene(post._id, post.inScenes);
      setIsSavingScene(false);
      await refreshData();
    } catch (err) {
      console.log(`Failed to update scene: ${err.message}`);
    } finally {
      setIsSavingScene(false);
      setSelectedPost(null);
    }
  };

  async function handleReject(item) {
    setSmallLoading(true);
    try {
      await instagramApi.rejectPendingMedia(item._id, {}, token);
      await refreshData();
    } catch (err) {
      alert(err.message ?? "Failed to delete");
    } finally {
      setSmallLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      {smallLoading && <Loader />}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-[#0000001A] overflow-hidden py-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-999 px-4">
          <h2 className="text-xl font-bold text-[#2F3134] dark:text-white">
            Post
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 z-40">
              <div className="w-[294px]">
                <CustomTextInput
                  value={search}
                  placeholder="Search by username…"
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </div>
              <div className="min-w-22">
                <CustomDropDownInput
                  placeholder="Category"
                  value={filterCategory}
                  onChange={(e) => {
                    handleFilter(setCategory)(e.target.value);
                    setSubCategory("");
                  }}
                  items={[
                    {
                      label: "All",
                      value: "All",
                    },
                    ...categories.map((c) => ({
                      label: c.name,
                      value: c.name,
                    })),
                  ]}
                />
              </div>
              <div className="w-30">
                <SelectSearch
                  placeholder="Subcategory"
                  onChange={(val) => handleFilter(setSubCategory)(val)}
                  value={filterSubCategory}
                  items={["All", ...subCategories.map((s) => s.name)]}
                />
              </div>
              <div className="min-w-22">
                <CustomDropDownInput
                  placeholder="Sort by BPS"
                  value={filterBeedplusScore}
                  onChange={(e) => {
                    handleFilter(setFilterBeedplusScore)(e.target.value);
                  }}
                  items={[
                    {
                      label: "Default",
                      value: "Default",
                    },
                    {
                      label: "Highest to Lowest",
                      value: "Highest to Lowest",
                    },
                    {
                      label: "Lowest to Highest",
                      value: "Lowest to Highest",
                    },
                  ]}
                />
              </div>
              <div className="min-w-22">
                <CustomDropDownInput
                  placeholder="Country"
                  value={filterCountry}
                  onChange={(e) => {
                    handleFilter(setFilterCountry)(e.target.value);
                    setSubCategory("");
                  }}
                  items={[
                    {
                      label: "All",
                      value: "All",
                    },
                    ...countries.map((c) => ({
                      label: c,
                      value: c,
                    })),
                  ]}
                />
              </div>

              <div className="flex items-center gap-2 ">
                <button
                  onClick={() => refreshData()}
                  disabled={loading}
                  title="Refresh"
                  className="flex px-2 py-2 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
                >
                  <RefreshIcon />
                </button>
                {
                  <span className="p-2 rounded-md text-xl font-semibold text-black">
                    Post{filtered.length !== 1 ? "s" : ""}:{" "}
                    {filtered
                      .filter((post) => post.status == "approved")
                      .length.toLocaleString()}
                  </span>
                }
              </div>
            </div>
          </div>

          {/* Category */}

          {/* Sub-Category
        <input
          type="text"
          list="subcategory-list"
          autoComplete="off"
          value={filterSubCategory}
          onChange={(e) => handleFilter(setSubCategory)(e.target.value)}
          placeholder="Sub-Category…"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-44"
        />
        <datalist id="subcategory-list">
          {subCategories.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist> */}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => refreshData()}
              className="shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <PostTable
          posts={filtered.filter((post) => post.status == "approved")}
          loading={loading}
          bookmarkScene={bookmarkScene}
          smallLoading={isSavingScene}
          selectedPost={selectedPost}
          handleReject={handleReject}
        />
      </div>
    </div>
  );
}
