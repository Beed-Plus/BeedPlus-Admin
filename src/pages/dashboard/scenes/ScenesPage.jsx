import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useScenes } from "../../../hooks/useScenes";
import ScenesTable from "../../../components/dashboard/scenes/ScenesTable";
import { RefreshIcon } from "../../../components/icons";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import SelectSearch from "../../../components/SelectSearch";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";

const SELECT =
  "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer";
const COL =
  "px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400";

const MEDIA_TYPE_CONFIG = {
  VIDEO: { label: "Video", color: "bg-blue-50 text-blue-500" },
  IMAGE: { label: "Image", color: "bg-green-50 text-green-600" },
  CAROUSEL_ALBUM: { label: "Carousel", color: "bg-purple-50 text-purple-500" },
  REELS: { label: "Reels", color: "bg-pink-50 text-pink-500" },
};

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>;
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? {
    label: type,
    color: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex scenes-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtReach(n) {
  if (n == null) return "—";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

function truncate(str, max = 45) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumb({ src, alt }) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full scenes-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex scenes-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </td>
      ))}
      <td className="px-6 py-4" />
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ScenesPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const { scenes, loading, updateScene, getScenes, refreshData } =
    useScenes(token);

  const [search, setSearch] = useState("");
  const [filterCategory, setCategory] = useState("");
  const [filterSubCategory, setSubCategory] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [removing, setRemoving] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [smallLoading, setSmallLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  // Unique categories & countries derived from watchlist scenes
    const {
      categories,
      subCategories,
      createSubCategory,
      fetchCategories,
      fetchSubCategories,
    } = useCategoriesProvider();


  const countries = useMemo(() => {
    const set = new Set();
    scenes.forEach((item) => {
      if (item.userData?.country) set.add(item.userData.country);
    });
    return [...set].sort();
  }, [scenes]);


  const filtered = useMemo(() => {
    return scenes.filter((item) => {
      if (filterCategory) {
        const cats = Array.isArray(item.category)
          ? item.category
          : [item.category].filter(Boolean);
        if (!cats.includes(filterCategory)) return false;
      }
      if (filterCountry && item.userData?.country !== filterCountry)
        return false;
      return true;
    });
  }, [scenes, filterCategory, filterCountry]);

  async function handleRemove(e, mediaId) {
    e.stopPropagation();
    setRemoving(mediaId);
    try {
      // await remove(mediaId)
    } finally {
      setRemoving(null);
    }
  }

  function handleFilter(setter) {
    return (val) => {
      setter(val);
    };
  }

  const anyFilter = filterCategory || filterCountry;

  const bookmarkScene = async (post) => {
    setSelectedPost(post._id);
    try {
      setSmallLoading(true);
      await updateScene(post._id, post.inScenes);
      await refreshData();
    } catch (err) {
      console.log(`Failed to update scene: ${err.message}`);
    } finally {
      setSmallLoading(false);
      setSelectedPost(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Scenes
          </h1>
          <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
            Monitor and manage all submitted posts.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {!loading && (
            <span className=" min-w-42.5 text-center bg-[#F87A15] p-2 rounded-md text-xl font-semibold text-white">
              Total Post{filtered.length !== 1 ? "s" : ""}:{" "}
              {filtered.length.toLocaleString()}
            </span>
          )}
          <button
            onClick={async () => await getScenes()}
            disabled={loading}
            title="Refresh"
            className="flex px-2 py-2 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden py-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-999 px-4">
        <h2 className="text-xl font-bold text-[#2F3134] dark:text-white">
          Scenes
        </h2>

        <div className="flex items-center gap-10">
          <div className="w-[294px]">
            <CustomTextInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="min-w-22">
              <CustomDropDownInput
                placeholder="Category"
                value={filterCategory}
                onChange={(e) => {
                  handleFilter(setCategory)(e.target.value);
                  setSubCategory("");
                }}
                items={categories.map((c) => ({ label: c.name, value: c.name }))}
              />
            </div>
            <div className="min-w-22 z-998">
              <SelectSearch
                placeholder="Subcategory"
                onChange={(val) => handleFilter(setSubCategory)(val)}
                value={filterSubCategory}
                items={subCategories.map((s) => s.name)}
              />
            </div>
            <div className="min-w-22">
              <CustomDropDownInput placeholder="Today" />
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


      <ScenesTable
        posts={filtered}
        loading={loading}
        bookmarkScene={bookmarkScene}
        smallLoading={smallLoading}
        selectedPost={selectedPost}
      />
      </div>
    </div>
  );
}
