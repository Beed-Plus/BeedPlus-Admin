import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { instagramApi } from "../../../utils/instagramApi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import SelectSearch from "../../../components/SelectSearch";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  return n.toLocaleString();
}

function fmtBeedScore(n) {
  if (n == null) return "—";
  return Number(n).toFixed(2);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Convert ISO/date string → YYYY-MM-DD for input[type=date]
function toInputDate(iso) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function truncate(str, max = 45) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-4 py-4">
        <div className="h-4 w-6 rounded bg-gray-100 mx-auto" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-24 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-14 rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-12 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-12 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-12 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-12 rounded-lg bg-gray-100" />
      </td>
    </tr>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow-lg">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-white shadow-lg">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-xs font-black text-white shadow-lg">
        3
      </span>
    );
  return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
}

const SELECT =
  "w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer scrollbar-thin";

// ─── Page ─────────────────────────────────────────────────────────────────────
const COL =
  "px-4 py-3 text-left text-[11px] font-semibold tracking-widest text-[#6F6F6F]";

// ─── Media Modal ──────────────────────────────────────────────────────────────
function MediaModal({ item, onClose }) {
  const overlayRef = useRef(null);
  const embedRef = useRef(null);
  const permalink = item.media?.permalink ?? "";
  const [html, setHtml] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // Fetch oEmbed HTML from our backend proxy
  useEffect(() => {
    instagramApi
      .getOembed(permalink)
      .then((res) => setHtml(res.html))
      .catch(() => setLoadError(true));
  }, [permalink]);

  // After HTML is injected, trigger Instagram's embed script to activate the widget
  useEffect(() => {
    if (!html || !embedRef.current) return;
    if (window.instgrm?.Embeds) {
      window.instgrm.Embeds.process();
    } else {
      const existing = document.getElementById("instagram-embed-script");
      if (!existing) {
        const s = document.createElement("script");
        s.id = "instagram-embed-script";
        s.src = "https://www.instagram.com/embed.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [html]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-black/20 transition"
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

        {/* oEmbed content */}
        {!html && !loadError && (
          <div className="flex items-center justify-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        )}

        {loadError && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preview unavailable.
            </p>
            {permalink && (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
              >
                Open on Instagram ↗
              </a>
            )}
          </div>
        )}

        {html && (
          <div
            ref={embedRef}
            dangerouslySetInnerHTML={{ __html: html }}
            className="[&>blockquote]:!mx-0 [&>blockquote]:!min-w-0 [&>blockquote]:!w-full"
          />
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({ value, availableDates, onChange }) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const selected = value ? new Date(value + "T00:00:00") : undefined;

  function handleSelect(date) {
    if (!date) return;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    onChange(iso);
  }

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      defaultMonth={selected}
      disabled={(date) => {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return !availableSet.has(iso);
      }}
      classNames={{
        root: "rdp-root",
        month_grid: "w-full border-collapse",
        months: "relative",
        month: "w-full",
        month_caption: "flex items-center justify-center h-9 mb-1",
        caption_label: "text-sm font-bold text-gray-800 dark:text-white",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition",
        button_next:
          "flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition",
        weekdays: "grid grid-cols-7",
        weekday:
          "text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400 py-1.5",
        week: "grid grid-cols-7",
        day: "flex items-center justify-center p-0",
        day_button:
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500",
        selected:
          "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:shadow-lg [&>button]:hover:bg-orange-500 [&>button]:hover:text-white",
        disabled:
          "[&>button]:text-gray-300 dark:[&>button]:text-gray-600 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-gray-300",
        today: "[&>button]:font-black",
        outside: "opacity-0 pointer-events-none",
      }}
    />
  );
}

// ─── Group a day's rankings by category ───────────────────────────────────────
function groupByCategory(rawRankings) {
  const grouped = {};
  rawRankings.forEach((item) => {
    const cats = item.category
      ? item.category
      : [item.category].filter(Boolean);
    const cat = cats[0] ?? "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });
  return Object.entries(grouped).map(([category, rankings]) => ({
    category,
    rankings,
  }));
}

export default function PostRankingsPage() {
  const navigate = useNavigate();

  const [allDays, setAllDays] = useState([]); // all days from API
  const [data, setData] = useState(null); // { date, categories: [...] }
  const [rankings, setRankings] = useState([]); // { date, categories: [...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1+ = category idx
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [dateLoading, setDateLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setCategory] = useState("");
  const [filterSubCategory, setSubCategory] = useState("");

  // const { categories, subCategories } = useCategoriesProvider();

  useEffect(() => {
    setLoading(true);

    async function load() {
      try {
        // Fetch latest chart (critical) + available dates (non-critical) in parallel
        const res = await instagramApi.getMediaChart();
        const rawRankings = res?.rankings ?? [];
        const categories = groupByCategory(rawRankings);
        setData({ date: res?.date ?? null, categories });
        setRankings(res?.rankings ?? []);
        setActiveTab(0);
      } catch (err) {
        toast.error(err?.message ?? "Failed to load chart");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function selectDate(iso) {
    // iso = YYYY-MM-DD
    if (!iso) return;
    setDateLoading(true);
    try {
      const res = await instagramApi.getMediaChartByDate(iso);
      const categories = groupByCategory(res?.rankings ?? []);
      setData({ date: res?.date ?? iso, categories });
      setActiveTab(0);
    } catch (err) {
      console.error("Failed to load chart for date:", err);
    } finally {
      setDateLoading(false);
    }
  }



  const categories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    rankings?.forEach((r) => {
      const name = r.category;
      if (!seen.has(name)) {
        seen.add(name);
        cats.push(name);
      }
    });
    return cats;
  }, [rankings]);

  const subCategories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    rankings?.forEach((r) => {
      const name = r.subCategory;
      if (!seen.has(name)) {
        seen.add(name);
        cats.push(name);
      }
    });
    return cats;
  }, [rankings]);

  // Close calendar on outside click
  const calendarWrapRef = useRef(null);
  useEffect(() => {
    if (!calendarOpen) return;
    function handler(e) {
      if (
        calendarWrapRef.current &&
        !calendarWrapRef.current.contains(e.target)
      ) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [calendarOpen]);

  function switchTab(idx) {
    setActiveTab(idx);
  }

  const filtered = useMemo(() => {
    return rankings.filter((p) => {
      if (filterCategory) {
        const cats = Array.isArray(p.category)
          ? p.category
          : [p.category].filter(Boolean);
        if (!cats.includes(filterCategory)) return false;
      }
      if (filterSubCategory) {
        const sub = p.subCategory?.name ?? p.subCategory;
        if (sub !== filterSubCategory) return false;
      }
      return true;
    });
  }, [rankings, filterCategory, filterSubCategory]);

  function handleFilter(setter) {
    return (val) => {
      setter(val);
    };
  }

  // return null;

  return (
    <div className="flex flex-col gap-6 rounded-2xl  shadow-lg shadow-[#0000001A] bg-white">
      {/* Header */}

      {/* Stat strip */}
      {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Total Posts
            </p>
            {filterCountry && (
              <button
                onClick={() => {
                  setFilterCountry("");
                }}
                className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {loading ? "..." : filterCountry ? countryTotal : totalPosts}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {filterCountry ? "posts matched" : "total posts"}
              </p>
            </div>
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
              }}
              disabled={loading || availableCountries.length === 0}
              className="w-28 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer disabled:opacity-40"
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
      </div> */}

      <div className="flex justify-between items-center px-4 pt-2 ">
        <h3 className="text-xl font-bold">Charts</h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category */}

          <div className="min-w-50">
            <CustomDropDownInput
              placeholder="Category"
              value={filterCategory}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory("");
              }}
              items={[
                {
                  label: "All",
                  value: "All",
                },
                ...categories.map((c) => ({
                  label: c,
                  value: c,
                })),
              ]}
            />
          </div>
          <div className="w-50">
            <SelectSearch
              placeholder="Subcategory"
              onChange={(val) => setSubCategory(val)}
              value={filterSubCategory}
              items={["All", ...subCategories.map((s) => s)]}
            />
          </div>

          {/* Country */}
          {/* <select
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
              </select> */}
        </div>
      </div>


      {/* Media modal */}
      {selectedItem && (
        <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Main card */}
      {
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
          {/* Table */}
          <div className="overflow-auto max-h-[75vh]">
            <table className="w-full min-w-[860px]">
              <thead className="border-b bg-[#dddddd] border-gray-100 dark:border-gray-800 dark:bg-gray-800/50 sticky top-0">
                <tr>
                  <th className={`${COL} w-12 text-center`}>Rank</th>
                  <th className={COL}>Post</th>
                  <th className={COL}>Creator</th>
                  <th className={COL}>Category</th>
                  <th className={COL}>Sub-Category</th>
                  <th className={COL}>Beed+ Score</th>
                  <th className={COL}>Daily Views</th>
                  <th className={COL}>Reach</th>
                  <th className={COL}>Interactions</th>
                  <th className={`${COL} w-16`}></th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {!loading &&
                  filtered.map((item, idx) => {
                    console.log("Rendering item:", item);
                    const rank = idx + 1;
                    const overallRank = null;
                    const caption = item.media?.caption;
                    const thumb = item.media?.thumbnailUrl;
                    const permalink = item.media?.permalink;
                    const username =
                      item.userData?.instagramUsername ||
                      item.media?.instagramUsername;
                    const country = item.userData?.country;
                    const profilePic = item.userData?.profilePicture;

                    return (
                      <tr
                        key={item.instagramMediaId ?? idx}
                        className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Rank */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {rank && (
                              <span className="inline-flex items-center rounded-full dark:bg-gray-800 px-1.5 py-0.5 text-xl font-semibold text-black dark:text-gray-500 leading-none">
                                {rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Post */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
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
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-black dark:text-gray-100 leading-snug">
                                {truncate(caption)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Creator */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {profilePic ? (
                              <img
                                src={profilePic}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-500">
                                {(username?.[0] ?? "U").toUpperCase()}
                              </div>
                            )}
                            <div>
                              {username && (
                                <p className="text-sm font-medium text-black dark:text-gray-100">
                                  {username}
                                </p>
                              )}
                              {country && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {country}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          {item.category ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-black dark:text-grey-100">
                              {item.category}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              —
                            </span>
                          )}
                        </td>

                        {/* Sub-Category */}
                        <td className="px-4 py-4">
                          {item.subCategory ? (
                            <span className="inline-flex items-center rounded-fullpx-2.5 py-0.5 text-xs font-medium text-black dark:text-gray-100">
                              {item.subCategory}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              —
                            </span>
                          )}
                        </td>

                        {/* Beed+ Score */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-ful px-2.5 py-0.5 text-xs font-bold text-black">
                            {fmtBeedScore(item.insights?.beedPlusScore)}
                          </span>
                        </td>

                        {/* Daily Views */}
                        <td className="px-4 py-4 text-sm text-black dark:text-gray-400">
                          {fmt(item.insights?.views)}
                        </td>

                        {/* Reach */}
                        <td className="px-4 py-4 text-sm text-black dark:text-gray-400">
                          {fmt(item.insights?.reach)}
                        </td>

                        {/* Interactions */}
                        <td className="px-4 py-4 text-sm text-black dark:text-gray-400">
                          {fmt(item.insights?.totalInteractions)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedItem(item)}
                              title="Watch media"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-orange-300 hover:text-orange-500 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 translate-x-px"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/posts/${item.instagramMediaId}`,
                                  {
                                    state: {
                                      post: item,
                                    },
                                  },
                                )
                              }
                              className="rounded-xl bg-[#FFEFD0] px-3 py-1.5 text-base font-semibold text-[#9B5A0A] transition"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      {error}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
}
