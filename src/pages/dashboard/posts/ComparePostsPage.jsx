import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLocation } from "react-router-dom";
import { instagramApi } from "../../../utils/instagramApi";
import { DayPicker } from "react-day-picker";
import UserAvatar from "../../../components/dashboard/users/UserAvatar";
import {
  BackArrowIcon,
  BookmarkIcon,
  EyeIcon,
  CommentIcon,
  ShareIcon,
  ReachIcon,
  LikeIcon,
} from "../../../components/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function truncate(str, max = 50) {
  if (!str) return "No caption";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function getInsightForDate(p, dateStr) {
  const arr = p.insights?.dailyInsights;
  if (!Array.isArray(arr) || !arr.length) return null;
  if (!dateStr) return arr[arr.length - 1];
  return (
    arr.find(
      (d) => d.date && new Date(d.date).toISOString().slice(0, 10) === dateStr,
    ) ?? arr[arr.length - 1]
  );
}

const DAILY_METRICS = [
  {
    key: "beedPlusScore",
    label: "Beed+ Score",
    path: (p) => p.beedPlusScore,
    format: (v) => fmtBeedScore(v),
  },
  {
    key: "currentRank",
    label: "Current Rank",
    path: (p) => p.currentRank,
    format: (v) => (v ? `#${v}` : "—"),
    lowerBetter: true,
  },
  { key: "clicks", label: "Clicks", path: (p) => p.clicks },
  { key: "views", label: "Views", path: (p) => p._activeInsight?.views },
  { key: "reach", label: "Reach", path: (p) => p._activeInsight?.reach },
  {
    key: "totalInteractions",
    label: "Total Interactions",
    path: (p) => p._activeInsight?.totalInteractions,
  },
  { key: "likes", label: "Likes", path: (p) => p._activeInsight?.likes },
  {
    key: "commentsCount",
    label: "Comments",
    path: (p) => p._activeInsight?.commentsCount,
  },
  { key: "shares", label: "Shares", path: (p) => p._activeInsight?.shares },
  { key: "saved", label: "Saved", path: (p) => p._activeInsight?.saved },
];

const LIFETIME_METRICS = [
  { key: "lt_views", label: "Views", path: (p) => p.insights?.views },
  { key: "lt_reach", label: "Reach", path: (p) => p.insights?.reach },
  {
    key: "lt_totalInteractions",
    label: "Total Interactions",
    path: (p) => p.insights?.totalInteractions,
  },
  { key: "lt_likes", label: "Likes", path: (p) => p.insights?.likes },
  {
    key: "lt_commentsCount",
    label: "Comments",
    path: (p) => p.insights?.commentsCount,
  },
  { key: "lt_shares", label: "Shares", path: (p) => p.insights?.shares },
  { key: "lt_saved", label: "Saved", path: (p) => p.insights?.saved },
];

const METRICS = [...DAILY_METRICS, ...LIFETIME_METRICS];

const MEDIA_TYPE_CONFIG = {
  VIDEO: { label: "Video", color: "bg-[#FFFFFF] text-[#3A3A3A]" },
  IMAGE: { label: "Image", color: "bg-[#FFFFFF] text-[#3A3A3A]" },
  CAROUSEL_ALBUM: { label: "Carousel", color: "bg-[#FFFFFF] text-[#3A3A3A]" },
  REELS: { label: "Reels", color: "bg-[#FFFFFF] text-[#3A3A3A]" },
};

function MediaTypeBadge({ type }) {
  if (!type) return null;
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? {
    label: type,
    color: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconBg, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-white dark:bg-gray-900 p-4.5 shadow-sm shadow-[#0000001A] h-20">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#0000004D] dark:text-gray-500">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold text-[#000] dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#0000004D] dark:text-gray-500">{sub}</p>
      )}
    </div>
  );
}

// ─── Insight Row ──────────────────────────────────────────────────────────────
function InsightRow({ label, value, icon }) {
  return (
    <div className="flex gap-5 items-center p-2.5 px-4 bg-[#F4F4F44D] rounded-2xl">
      <div className="h-6 w-6 flex justify-center">{icon && icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl text-[#3A3A3A] font-semibold dark:text-gray-400">
          {fmt(value)}
        </span>
        <span className={`text-xs font-medium text-[#BEB09B]`}>{label}</span>
      </div>
    </div>
  );
}

function Top100({ label, globalValue, localValue }) {
  return (
    <div className="flex flex-col gap-3 bg-white p-2.5 px-4 rounded-2xl shadow-md shadow-[#0000001A]">
      <h4 className="text-lg font-medium text-black text-center p-2.5 rounded-lg bg-[#F4F4F4] shadow-md shadow-[#0000000D]">
        {label}
      </h4>
      <div className="flex gap-4 ">
        <div className="flex flex-col items-center gap-1 w-1/2 shadow-sm shadow-[#0000001A] rounded-lg py-2">
          <span
            className={`text-xs text-[#0000004D] font-medium dark:text-gray-400`}
          >
            Global
          </span>
          <span className="text-[21px] text-[#000000] font-bold dark:text-gray-400">
            {fmt(globalValue)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 w-1/2 shadow-sm shadow-[#0000001A] rounded-lg py-2">
          <span
            className={`text-xs text-[#0000004D] font-medium dark:text-gray-400`}
          >
            Nigeria
          </span>
          <span className="text-[21px] text-[#000000] font-bold dark:text-gray-400">
            {fmt(localValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Picker ───────────────────────────────────────────────────────────
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

// ─── Post Selector Panel ───────────────────────────────────────────────────────
function PostSelectorPanel({
  label,
  color,
  posts,
  loading,
  selected,
  onSelect,
  // whether the *other* post is also selected (enables win badges)
  canCompare,
  mediaStat,
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return posts.slice(0, 20);
    const q = query.toLowerCase();
    return posts
      .filter((p) => {
        const caption = (p.media?.caption ?? "").toLowerCase();
        const username = (
          p.instagramUsername ??
          p.userData?.username ??
          ""
        ).toLowerCase();
        return caption.includes(q) || username.includes(q);
      })
      .slice(0, 20);
  }, [query, posts]);

  const accentText = color === "orange" ? "text-orange-500" : "text-violet-500";
  const accentRing = color === "orange" ? "ring-orange-400" : "ring-violet-400";
  const accentBg = color === "orange" ? "bg-orange-400" : "bg-violet-400";
  const accentBorder =
    color === "orange"
      ? "border-orange-200 dark:border-orange-500/30"
      : "border-violet-200 dark:border-violet-500/30";

  if (selected) {
    const thumb = selected.media?.thumbnailUrl ?? selected.media?.mediaUrl;
    const username = selected.instagramUsername || selected.userData?.username;
    const profilePic = selected.userData?.profilePicture;
    const cats = Array.isArray(selected.category)
      ? selected.category
      : [selected.category].filter(Boolean);

    // If we don't have enriched __metrics yet (full data still loading), show a spinner
    const metricsReady = Array.isArray(selected.__metrics);

    const mediaType = selected.media?.mediaType;
    const isVideo =
      mediaType?.toUpperCase() === "VIDEO" ||
      mediaType?.toUpperCase() === "REELS";
console.log("selected", selected)
    return (
      <div
        className={`flex flex-col rounded-2xl p-5 bg-[#FFFEFC] dark:bg-gray-900 overflow-hidden shadow-lg shadow-[#0000000D]`}
      >
        {/* Card header */}
        <div className={`flex items-center justify-between px-4 py-3`}>
          <h3 className={`text-base font-semibold`}>{label}</h3>
          <button
            onClick={() => onSelect(null)}
            className="text-xs font-semibold text-[#0000004D] transition"
          >
            Change
          </button>
        </div>

        {/* CREATOR ROW */}
        <div className="flex justify-between rounded-[20px] dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000001A] min-h-60 mb-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-gray-900 lg:w-50 aspect-square lg:aspect-auto lg:h-48">
              {thumb ? (
                <img
                  src={thumb}
                  alt="Post thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-14 w-14 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <MediaTypeBadge type={mediaType} />
              </div>

              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full ">
                    <svg
                      width="44"
                      height="47"
                      viewBox="0 0 44 47"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.01028e-08 3.52098C4.01028e-08 0.845978 2.86562 -0.847772 5.20937 0.439728L41.2719 20.2741C41.8238 20.5773 42.2842 21.0233 42.6049 21.5653C42.9255 22.1074 43.0947 22.7256 43.0947 23.3554C43.0947 23.9851 42.9255 24.6034 42.6049 25.1454C42.2842 25.6874 41.8238 26.1334 41.2719 26.4366L5.20937 46.271C4.67402 46.5653 4.0712 46.7151 3.46034 46.7054C2.84949 46.6958 2.25168 46.5272 1.72584 46.2162C1.2 45.9052 0.764293 45.4625 0.461657 44.9318C0.159022 44.4011 -9.22244e-05 43.8007 4.01028e-08 43.1897V3.52098Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {cats.map((c) => (
                  <span
                    key={c}
                    className="inline-flex justify-center items-center min-w-[87px] rounded-[20px] bg-[#FFF5DE] dark:bg-gray-800 px-3 py-1 text-sm font-medium text-[#A45308] dark:text-gray-300"
                  >
                    {c}
                  </span>
                ))}
                {selected.subCategory ? (
                  <span className="inline-flex justify-center items-center min-w-[87px] rounded-[20px] bg-[#D5D5D580] dark:bg-gray-800 px-3 py-1 text-sm font-medium text-[#555555] dark:text-gray-300">
                    {selected.subCategory}
                  </span>
                ) : null}
              </div>

              <div className="max-w-[362px]">
                <p className="text-sm font-medium tracking-widest text-[#0000004D] mb-1">
                  Caption
                </p>
                <p className="text-sm font-medium leading-relaxed text-black dark:text-gray-100 line-clamp-3">
                  {selected.media.caption ?? (
                    <span className="text-gray-300 dark:text-gray-600 italic">
                      No caption
                    </span>
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-gray-900 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/users/${selected.userId}`)
                  }
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <UserAvatar
                      name={
                        selected?.userData.instagramUsername?.replace(
                          "@",
                          "",
                        ) || "U"
                      }
                      src={selected?.userData?.profilePicture ?? null}
                      size="h-11 w-11 "
                      style="custom"
                    />
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex flex-col items-start gap-2">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">
                          {selected?.userData?.instagramUsername}
                        </h2>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="">
                {selected.media?.timestamp && (
                  <span className="text-xs text-[#00000080] ">
                    Posted {fmtDate(selected.media.timestamp)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">
                    {fmtDate(selected.createdAt)}
                  </span>
                  <h4 className="text-sm font-medium text-[#0000004D]">
                    Submitted
                  </h4>
                </div>
                {/* <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{selected._id}</span>
                  <h4 className="text-base font-medium text-[#0000004D]">
                    Media Id
                  </h4>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between">
            <StatCard
              label="Beed+ Score"
              value={fmtBeedScore(selected.beedplusScore)}
            />
            <StatCard label="Beed+ Clicks" value={fmt(selected.clicks)} />
            <StatCard
              label="Beed+ Views"
              value={fmt(selected.beedplusViews)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Top100
              label="Beed+ Top Top100"
              globalValue={mediaStat?.globalRank}
              localValue={mediaStat?.categoryRank}
            />
            <Top100
              label={`${selected?.category} Top 100 Nigeria`}
              globalValue={mediaStat?.categoryRank}
              localValue={mediaStat?.countryCategoryRank}
            />
          </div>
        </div>

        {/* Insights + Creator row */}
        <div className="grid grid-cols-1 gap-4 mt-4 ">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000001A]">
            <h3 className="mb-4 text-base font-medium dark:text-gray-500">
              Instagram Daily Insights
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-8">
              <InsightRow
                label="Views"
                value={mediaStat?.dailyInsights?.views}
                icon={<EyeIcon />}
              />
              <InsightRow
                label="Reach"
                value={mediaStat?.dailyInsights?.reach}
                icon={<ReachIcon />}
              />
              <InsightRow
                label="Saved"
                value={mediaStat?.dailyInsights?.saved}
                icon={<BookmarkIcon />}
              />
              <InsightRow
                label="Likes"
                value={mediaStat?.dailyInsights?.likes}
                icon={<LikeIcon />}
              />
              <InsightRow
                label="Comments"
                value={mediaStat?.dailyInsights?.comments}
                icon={<CommentIcon />}
              />
              <InsightRow
                label="Shares"
                value={mediaStat?.dailyInsights?.shares}
                icon={<ShareIcon />}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000001A]">
            <h3 className="mb-4 text-base font-medium dark:text-gray-500">
              Instagram Lifetime Insights
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-8">
              <InsightRow
                label="Views"
                value={selected.insights?.views}
                icon={<EyeIcon />}
              />
              <InsightRow
                label="Reach"
                value={selected.insights?.reach}
                icon={<ReachIcon />}
              />
              <InsightRow
                label="Saved"
                value={selected.insights?.saved}
                icon={<BookmarkIcon />}
              />
              <InsightRow
                label="Likes"
                value={selected.insights?.likes}
                icon={<LikeIcon />}
              />
              <InsightRow
                label="Comments"
                value={selected.insights?.comments}
                icon={<CommentIcon />}
              />
              <InsightRow
                label="Shares"
                value={selected.insights?.shares}
                icon={<ShareIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Selector (no post chosen yet) ─────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-[#0000000D] overflow-hidden py-5">
        <h3
          className={`text-base font-semibold tracking-widest text-[#000000] px-6 py-2`}
        >
          {label}
        </h3>
        <div className="p-3 px-6">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
              placeholder="Search by caption or username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[20px] border border-gray-200 dark:border-gray-700 bg-[#F5F5F5] dark:bg-gray-800 pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800 px-6">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No posts found
            </p>
          )}
          {!loading &&
            filtered.map((post) => {
              const thumb = post.media?.thumbnailUrl ?? post.media?.mediaUrl;
              const username =
                post.instagramUsername || post.userData?.username;
              return (
                <button
                  key={post._id}
                  onClick={() => onSelect(post)}
                  className="w-full flex items-center border-b-[#0000000D] border-b- gap-5 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                >
                  <div className="h-12.5 w-12.5 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
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
                          className="h-4 w-4 text-gray-300"
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#3A3A3A] font-bold dark:text-gray-200 truncate">
                      {truncate(post.media?.caption, 45)}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ComparePostsPage() {
  const { auth } = useAuth();
  const token = auth?.token;
  const { state } = useLocation();

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postA, setPostA] = useState(state?.postA ?? null);
  const [postB, setPostB] = useState(null);
  const [fullA, setFullA] = useState(null);
  const [fullB, setFullB] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const [postAMediaStat, setPostAMediaStat] = useState(null);
  const [postBMediaStat, setPostBMediaStat] = useState(null);

  useEffect(() => {
    if (!calendarOpen) return;
    function handler(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target))
        setCalendarOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [calendarOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    instagramApi
      .getAllSubmittedMediaForAdmin(token)
      .then((res) => {
        if (!cancelled) setAllPosts(Array.isArray(res) ? res : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!postA) {
      setFullA(null);
      return;
    }
    let cancelled = false;

    const fetchMedia = async () => {
      try {
        const result = await instagramApi.getMediaByIdForAdmin(
          postA._id,
          token,
        );
        const data = result.media ?? result;
        if (!cancelled) setFullA(data);
        return data;
      } catch (error) {
        if (!cancelled) setFullA(postA);
        return postA;
      }
    };

    const fetchPostA = async () => {
      const [res, mediaStat] = await Promise.all([
        fetchMedia(),
        getMediaStats(postA.instagramMediaId),
      ]);
      console.log("POST A MEDIA STAT", mediaStat);
      setPostAMediaStat(mediaStat);
    };

    fetchPostA();
    return () => {
      cancelled = true;
    };
  }, [postA?._id, token]);

  useEffect(() => {
    if (!postB) {
      setFullB(null);
      return;
    }
    let cancelled = false;

    const fetchMedia = async () => {
      try {
        const result = await instagramApi.getMediaByIdForAdmin(
          postB._id,
          token,
        );
        const data = result.media ?? result;
        if (!cancelled) setFullB(data);
        return data;
      } catch (error) {
        if (!cancelled) setFullB(postB);
        return postB;
      }
    };
    const fetchPostB = async () => {
      const [res, mediaStat] = await Promise.all([
        fetchMedia(),
        getMediaStats(postB.instagramMediaId),
      ]);
      console.log("POST B MEDIA STAT", mediaStat);
      setPostBMediaStat(mediaStat);
    };

    fetchPostB();
    return () => {
      cancelled = true;
    };
  }, [postB?._id, token]);

  async function getMediaStats(id) {
    setLoading(true);
    try {
      let result = await instagramApi.getMediaStats(id, token);
      console.log("MEDIA STATS", result);
      setLoading(false);
      return result;
    } catch (e) {
      console.log("ERROR loading stats", e);
      return null;
    } finally {
      setLoading(false);
    }
  }

  const postsForA = useMemo(
    () => allPosts.filter((p) => p._id !== postB?._id),
    [allPosts, postB],
  );
  const postsForB = useMemo(
    () => allPosts.filter((p) => p._id !== postA?._id),
    [allPosts, postA],
  );

  // Both posts selected AND full data loaded for both
  const bothReady = postA && fullA && postB && fullB;

  // Either post selected with full data loaded — show preview immediately
  const eitherReady = (postA && fullA) || (postB && fullB);

  const availableDates = useMemo(() => {
    const set = new Set();
    [fullA, fullB].forEach((p) => {
      if (!p) return;
      (p.insights?.dailyInsights ?? []).forEach((d) => {
        if (d.date) set.add(new Date(d.date).toISOString().slice(0, 10));
      });
    });
    return [...set].sort().reverse();
  }, [fullA, fullB]);

  // Enrich a single post — wins are only computed when we have something to compare against
  const enriched = useMemo(() => {
    function enrich(post, other) {
      if (!post) return null;
      const withInsight = {
        ...post,
        _activeInsight: getInsightForDate(post, selectedDate),
      };
      const otherWithInsight = other
        ? { ...other, _activeInsight: getInsightForDate(other, selectedDate) }
        : null;

      const metrics = METRICS.map((metric) => {
        const rawSelf = metric.path(withInsight);
        const numSelf = typeof rawSelf === "number" ? rawSelf : 0;
        let wins = false;
        if (otherWithInsight) {
          const rawOther = metric.path(otherWithInsight);
          const numOther = typeof rawOther === "number" ? rawOther : 0;
          const tied = numSelf === numOther;
          wins =
            !tied &&
            (metric.lowerBetter ? numSelf < numOther : numSelf > numOther);
        }
        return {
          metric,
          value: rawSelf,
          display: metric.format ? metric.format(rawSelf) : fmt(rawSelf),
          wins,
        };
      });
      return { ...withInsight, __metrics: metrics };
    }

    return {
      // Pass null for "other" if that post's full data isn't loaded yet
      a: fullA ? enrich(fullA, fullB ?? null) : postA ? postA : null,
      b: fullB ? enrich(fullB, fullA ?? null) : postB ? postB : null,
    };
  }, [fullA, fullB, selectedDate]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-white">
            Compare Post
          </h1>
          <p className="mt-0.5 text-sm text-[#1A1A1A] dark:text-gray-500">
            Select two posts to compare their performance side by side.
          </p>
        </div>
        {eitherReady && availableDates.length > 0 && (
          <div ref={calendarRef} className="relative shrink-0">
            <div
              onClick={() => setCalendarOpen((o) => !o)}
              className={`flex w-48 cursor-pointer items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2 transition-all ${calendarOpen ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 shrink-0 ${calendarOpen ? "text-orange-500" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span
                className={`flex-1 text-sm ${selectedDate ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
              >
                {selectedDate
                  ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "Latest"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${calendarOpen ? "rotate-180 text-orange-500" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <span
              className={`pointer-events-none absolute -top-2 left-2.5 px-1 text-[10px] font-medium bg-white dark:bg-gray-800 transition-colors ${calendarOpen ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`}
            >
              Insight date
            </span>
            {calendarOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-3 min-w-[280px]">
                <CalendarPicker
                  value={selectedDate ?? availableDates[0]}
                  availableDates={availableDates}
                  onChange={(iso) => {
                    setSelectedDate(iso);
                    setCalendarOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PostSelectorPanel
          color="orange"
          label="Post A"
          posts={postsForA}
          loading={loading}
          selected={enriched.a}
          onSelect={setPostA}
          canCompare={bothReady}
          mediaStat={postAMediaStat}
        />

        <PostSelectorPanel
          color="violet"
          label="Post B"
          posts={postsForB}
          loading={loading}
          selected={enriched.b}
          onSelect={setPostB}
          canCompare={bothReady}
          mediaStat={postBMediaStat}
        />
      </div>

      {/* Archived Lifetime — show as soon as at least one post is ready */}
      {(fullA || fullB) && (
        <div className="flex flex-col gap-3">
          {/* <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Archived Lifetime
          </h2> */}
          <div className="grid grid-cols-2 gap-3">
            {/* Post A lifetime */}
            {/* {fullA && enriched.a?.__metrics && (
              <div className="rounded-2xl border border-orange-100 dark:border-orange-500/20 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-orange-50 dark:border-orange-500/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                    Archived Lifetime
                    {fullA?.instagramUsername || fullA?.userData?.username
                      ? ` @${fullA.instagramUsername || fullA.userData.username}`
                      : ""}
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {LIFETIME_METRICS.map((metric) => {
                    const m = enriched.a.__metrics.find(
                      (x) => x.metric.key === metric.key,
                    );
                    return (
                      <div
                        key={metric.key}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {metric.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${bothReady && m?.wins ? "text-orange-500" : "text-gray-700 dark:text-gray-200"}`}
                        >
                          {m?.display ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}

            {/* Post B lifetime */}
            {/* {fullB && enriched.b?.__metrics && (
              <div className="rounded-2xl border border-violet-100 dark:border-violet-500/20 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-violet-50 dark:border-violet-500/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                    Archived Lifetime
                    {fullB?.instagramUsername || fullB?.userData?.username
                      ? ` @${fullB.instagramUsername || fullB.userData.username}`
                      : ""}
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {LIFETIME_METRICS.map((metric) => {
                    const m = enriched.b.__metrics.find(
                      (x) => x.metric.key === metric.key,
                    );
                    return (
                      <div
                        key={metric.key}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {metric.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${bothReady && m?.wins ? "text-violet-500" : "text-gray-700 dark:text-gray-200"}`}
                        >
                          {m?.display ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
