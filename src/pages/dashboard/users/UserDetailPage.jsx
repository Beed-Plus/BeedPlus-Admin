import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../../../hooks/useAuth";
import { usersApi } from "../../../utils/usersApi";
import { instagramApi } from "../../../utils/instagramApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { subCategoriesApi } from "../../../utils/subCategoriesApi";
import UserAvatar from "../../../components/dashboard/users/UserAvatar";
import StatusBadge from "../../../components/ui/StatusBadge";
import Badge from "../../../components/ui/Badge";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import SelectSearch from "../../../components/SelectSearch";
import CustomButton from "../../../components/CustomButton";
import { CloseIcon, InstagramIcon, RetryIcon } from "../../../components/icons";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";

const CRUMBS = [
  { label: "Users", to: "/dashboard/users" },
  { label: "User Profile" },
];

const SELECT =
  "w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-black dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer scrollbar-thin";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

function fmtBeedScore(n) {
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

function truncate(str, max = 25) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

const MEDIA_TYPE_CONFIG = {
  VIDEO: { label: "Video", color: "bg-blue-50 text-blue-500" },
  IMAGE: { label: "Image", color: "bg-green-50 text-green-600" },
  CAROUSEL_ALBUM: { label: "Carousel", color: "bg-purple-50 text-purple-500" },
};

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>;
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? {
    label: type,
    color: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Media Modal ──────────────────────────────────────────────────────────────
function MediaModal({ post, onClose }) {
  const overlayRef = useRef(null);

  // close on backdrop click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const categories = Array.isArray(post.category)
    ? post.category
    : [post.category].filter(Boolean);

  const caption = post.media?.caption;
  const thumbnailUrl = post.media?.thumbnailUrl;
  const mediaType = post.media?.mediaType;
  const permalink = post.media?.permalink;
  const isVideo = mediaType?.toUpperCase() === "VIDEO";

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition"
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

        {/* Media preview */}
        <div className="relative bg-gray-900 aspect-square">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Post thumbnail"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-600"
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
          {/* Video play overlay */}
          {isVideo && thumbnailUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 translate-x-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Caption */}
          {caption && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
              {caption}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            <MediaTypeBadge type={mediaType} />
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300"
              >
                {c}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-center">
              <p className="text-lg font-black text-orange-500">
                {post.currentRank ? `#${post.currentRank}` : "—"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                Rank
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
              <p className="text-lg font-black text-gray-700 dark:text-gray-200">
                {fmt(post.insights?.views)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Views
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
              <p className="text-lg font-black text-gray-700 dark:text-gray-200">
                {fmt(post.insights?.totalInteractions)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Interactions
              </p>
            </div>
          </div>

          {/* Extended insights */}
          {post.insights && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Reach", value: fmt(post.insights.reach) },
                { label: "Shares", value: fmt(post.insights.shares) },
                { label: "Saved", value: fmt(post.insights.saved) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-100 dark:border-gray-700 p-2.5 text-center"
                >
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {value}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* View on Instagram */}
          {permalink && (
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View on Instagram
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function displayName(user) {
  return user.instagram?.instagramUsername
    ? `${user.instagram.instagramUsername}`
    : user.instagramUsername
      ? `${user.instagramUsername}`
      : (user.email ?? "—");
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, globalValue, localValue }) {
  return (
    <div className="flex flex-col gap-4 rounded-[27px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg shadow-[#00000014]">
      <div className="flex items-center justify-center">
        <p className="text-[13px] font-medium text-center text-[#686969] dark:text-gray-500">
          {label}
        </p>
      </div>
      <div className="flex justify-center text-center">
        <div className="text-center w-1/2 border-r-[0.5px] border-[#B9B9B9]">
          <p className="text-[31px] font-bold text-[#2F3134] leading-6 dark:text-white">
            {globalValue}
          </p>
          <h4 className="text-[15px] font-normal text-[#818080]">Global</h4>
        </div>
        <div className="text-center w-1/2 border-l-[0.5px] border-[#B9B9B9]">
          <p className="text-[31px] font-bold text-[#2F3134] leading-6 dark:text-white">
            {localValue}
          </p>
          <h4 className="text-[15px] font-normal text-[#818080]">Nigeria</h4>
        </div>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="flex items-center gap-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg animate-pulse">
      <div className="h-16 w-16 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-56 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-8 w-24 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ScoreIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-orange-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);
const TrophyIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-amber-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);
const RankIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-violet-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const FollowersIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-blue-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;
  const {
    createSubCategory,
    fetchCategories,
    fetchSubCategories,
    categories,
    subCategories,
  } = useCategoriesProvider();

  console.log("CATEGORIES", categories);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

  // Instagram media (live feed) for admin browse + direct submit
  const [igMedia, setIgMedia] = useState([]);
  const [igMediaLoading, setIgMediaLoading] = useState(true);
  const [igMediaCursor, setIgMediaCursor] = useState(null);
  const [igMediaHasMore, setIgMediaHasMore] = useState(false);
  const [igMediaError, setIgMediaError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 100;

  // Admin direct-submit modal state
  const [submitModal, setSubmitModal] = useState(null);
  const [submitCat1, setSubmitCat1] = useState("");
  const [submitSubCat, setSubmitSubCat] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subCatOpen, setSubCatOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [sortby, setSortBy] = useState("");
  const [sortbyStatus, setSortByStatus] = useState("");
  const [userStats, setUserStats] = useState("");

  async function handleApprove() {
    setApproving(true);
    setApproveError(null);
    try {
      await usersApi.approveUser(id, token);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              instagramApproval: {
                ...prev.instagramApproval,
                status: "approved",
              },
            }
          : prev,
      );
    } catch (err) {
      setApproveError(err.message ?? "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);
      try {
        const [res, resStats] = await Promise.all([
          usersApi.getUserById(id, token),
          usersApi.getUserStats(id, token),
        ]);
        if (!cancelled) {
          setUser(res?.user ?? null);
          console.log("RES STATS", resStats);
          setUserStats(resStats);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load user");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadPosts() {
      setPostsLoading(true);
      try {
        const res = await instagramApi.getSubmittedMedia(id, token);
        if (!cancelled) {
          const arr = Array.isArray(res) ? res : (res?.media ?? []);
          setPosts(arr);
        }
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    }

    async function loadIgMedia() {
      setIgMediaLoading(true);
      setIgMediaError(null);
      try {
        const res = await instagramApi.adminGetUserInstagramMedia(id, token);
        if (!cancelled) {
          setIgMedia(Array.isArray(res.media) ? res.media : []);
          setIgMediaCursor(res.pagination?.nextCursor ?? null);
          setIgMediaHasMore(res.pagination?.hasMore ?? false);
        }
      } catch (err) {
        if (!cancelled)
          setIgMediaError(err.message ?? "Failed to load Instagram media");
      } finally {
        if (!cancelled) setIgMediaLoading(false);
      }
    }

    loadUser();
    loadPosts();
    loadIgMedia();
    fetchCategories();
    fetchSubCategories();
    return () => {
      cancelled = true;
    };
  }, [id, token, retryKey]);

  async function loadMoreIgMedia() {
    if (!igMediaCursor) return;
    setLoadingMore(true);
    try {
      const res = await instagramApi.adminGetUserInstagramMedia(id, token, {
        after: igMediaCursor,
      });
      setIgMedia((prev) => [...prev, ...(res.media ?? [])]);
      setIgMediaCursor(res.pagination?.nextCursor ?? null);
      setIgMediaHasMore(res.pagination?.hasMore ?? false);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }

  // Calculate pagination data
  const totalItems = igMedia.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return igMedia.filter((m) => {
      const submittedPosts = posts.filter((p) => p.instagramMediaId === m.id);

      // Submission filter
      if (sortby === "submitted" && submittedPosts.length === 0) return false;
      if (sortby === "unsubmitted" && submittedPosts.length > 0) return false;

      // Status filter — BUG FIX: was missing `return false`
      if (sortbyStatus && sortbyStatus !== "all") {
        const hasStatus = submittedPosts.some((p) => p.status === sortbyStatus);
        if (!hasStatus) return false;
      }

      // Category filter
      if (filterCategory && filterCategory !== "All") {
        const hasCategory = submittedPosts.some(
          (p) => p.category === filterCategory,
        );
        if (!hasCategory) return false;
      }

      // Sub-category filter
      if (filterSubCategory && filterSubCategory !== "all") {
        const hasSub = submittedPosts.some(
          (p) => (p.subCategory?.name ?? p.subCategory) === filterSubCategory,
        );
        if (!hasSub) return false;
      }

      // Caption search
      if (q) {
        const caption = m.caption?.toLowerCase() ?? "";
        if (!caption.includes(q)) return false;
      }

      return true;
    });
  }, [
    igMedia,
    posts,
    search,
    filterCategory,
    filterSubCategory,
    sortby,
    sortbyStatus,
  ]);

  // Calculate pagination based on filtered data
  const filteredTotalItems = filtered.length;
  const filteredTotalPages = Math.ceil(filteredTotalItems / ITEMS_PER_PAGE);
  const filteredStartIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const filteredEndIdx = filteredStartIdx + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(filteredStartIdx, filteredEndIdx);
  const [previewVideo, setPreviewVideo] = useState("");
  const previewVideoRef = useRef(null);
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterSubCategory]);

  // Auto-fetch more when reaching last page with remaining cursor items
  useEffect(() => {
    if (
      currentPage === filteredTotalPages &&
      filteredTotalPages > 0 &&
      igMediaHasMore &&
      !igMediaLoading
    ) {
      loadMoreIgMedia();
    }
  }, [currentPage, filteredTotalPages, igMediaHasMore, igMediaLoading]);

  async function handleAdminSubmit() {
    if (category.length === 0) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await instagramApi.adminDirectSubmit(
        {
          userId: id,
          mediaId: submitModal.id,
          category,
          subCategory,
        },
        token,
      );
      setPosts((prev) => [...prev, res?.media]);

      setSubmitMsg({ ok: true, text: "Media submitted successfully." });
      setSubmitModal(null);
      setSubmitMsg(null);
      setCategory("");
      setSubCategory("");
    } catch (err) {
      setSubmitMsg({ ok: false, text: err.message ?? "Submit failed." });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (previewVideo) {
      previewVideoRef.current?.play();
    } else {
      previewVideoRef.current?.pause();
    }
  }, [previewVideo]);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb crumbs={CRUMBS} />
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center shadow-lg">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => navigate("/dashboard/users")}
            className="mt-4 text-sm text-orange-500 hover:underline"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const name = user ? displayName(user) : "—";
  const status = user?.instagramApproval?.status ?? "pending";
  console.log("User data:", user);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb crumbs={CRUMBS} />

      {/* Profile hero */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <div className="rounded-2xp-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <UserAvatar
              name={name.replace("@", "") || "U"}
              src={user?.instagram?.profilePictureUrl ?? null}
              size="h-29 w-29 border-4 border-[#7E7E7E]"
              style="custom"
            />
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex flex-col items-start gap-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                  {name}
                </h2>
                <p className="text-base text-[#000000B2]">{user?.email}</p>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#000000B2]">
                {user?.category && (
                  <span className="rounded-lg bg-[#2F3134] dark:bg-gray-800 px-2.5 py-1 text-sm font-medium capitalize text-white dark:text-gray-400">
                    {user.category}
                  </span>
                )}
                {user?.country && (
                  <span className="flex items-center gap-1 border border-[#000000B2] rounded-lg px-2.5 py-0.5">
                    {user.country}
                  </span>
                )}
                <span className="flex items-center gap-1 border border-[#000000B2] rounded-lg px-2.5 py-0.5">
                  Joined {fmtDate(user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {status !== "approved" && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {approving ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {approving ? "Approving…" : "Approve User"}
                </button>
              )}

              {approveError && (
                <p className="text-xs text-red-500">{approveError}</p>
              )}

              <div className="flex flex-col items-end">
                <Link
                  to={user?.instagramApproval?.instagramAccountLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon />
                </Link>
                <p className="text-base font-medium text-[#00000080] dark:text-gray-500">
                  {fmt(user.monthlyReach)} monthly viewers
                </p>
                <p className="text-base font-medium text-[#00000080] dark:text-gray-500">
                  ID: {user?._id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Beed+ Top Creators"
              globalValue={
                userStats?.globalRank ? `${userStats.globalRank}` : "—"
              }
              localValue={
                userStats?.countryRank ? `${userStats.countryRank}` : "—"
              }
            />
            <StatCard
              label={`${user.category} Top Creators`}
              globalValue={
                userStats?.categoryRank ? `${userStats.categoryRank}` : "—"
              }
              localValue={
                userStats?.categoryCountryRank
                  ? userStats?.categoryCountryRank
                  : "—"
              }
            />
          </>
        )}
      </div>

      {/* Submitted Posts */}
      <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-[#0000001A] overflow-hidden">
        <div className="flex justify-between items-center px-4 mb-1">
          <h3 className="text-xl font-bold"></h3>

          <div className="flex gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {" "}
              <div className="min-w-30 ">
                <CustomDropDownInput
                  value={sortbyStatus}
                  onChange={(e) => setSortByStatus(e.target.value)}
                  items={[
                    {
                      label: "All",
                      value: "all",
                    },
                    {
                      label: "Approved",
                      value: "approved",
                    },
                    {
                      label: "Pending",
                      value: "pending",
                    },
                  ]}
                  // showShadow={true}
                  // style={{
                  //   height: "28px",
                  //   fontSize: "12px",
                  //   paddingHorizontal: "8px",
                  //   borderRadius: "8px",
                  //   backgroundColor: "#FFF",
                  // }}
                  // showOuterBoxMargin={false}
                  placeholder="Select a status"
                />
              </div>
              <div className="min-w-30 ">
                <CustomDropDownInput
                  value={sortby}
                  onChange={(e) => setSortBy(e.target.value)}
                  items={[
                    {
                      label: "All",
                      value: "all",
                    },
                    {
                      label: "Submitted",
                      value: "submitted",
                    },
                    {
                      label: "Unsubmitted",
                      value: "unsubmitted",
                    },
                  ]}
                  // showShadow={true}
                  // style={{
                  //   height: "28px",
                  //   fontSize: "12px",
                  //   paddingHorizontal: "8px",
                  //   borderRadius: "8px",
                  //   backgroundColor: "#FFF",
                  // }}
                  // showOuterBoxMargin={false}
                  placeholder="Submitted"
                />
              </div>
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search username…"
                className="w-62 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              />
              {/* Category */}
              <div className="min-w-40">
                <CustomDropDownInput
                  placeholder="Category"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterSubCategory("");
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
              <div className="w-40">
                <SelectSearch
                  placeholder="Subcategory"
                  onChange={(val) => setFilterSubCategory(val)}
                  value={filterSubCategory}
                  items={["All", ...subCategories.map((s) => s.name)]}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                disabled={loading}
                title="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg shadow-[#00000040] disabled:opacity-40"
              >
                <RetryIcon />
              </button>
              {!loading && !error && (
                <p className="px-3 py-1 text-base font-semibold">
                  Posts: {filtered?.length}
                </p>
              )}
            </div>
          </div>
        </div>
        {igMediaLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 animate-pulse"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-7 w-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No posts found.
          </div>
        ) : (
          <div className="pt-2">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-160 rounded-xl">
                <thead>
                  <tr className="border-b border-[#3A3A3A1A] dark:border-gray-800 bg-[#433E3E1A] dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Global Ranking
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Category Ranking
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Beedplus Score
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-[12px] font-bold tracking-widest text-[#3A3A3AB2] dark:text-gray-500 min-w-25">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData?.map((post, i) => {
                    const submittedMedia = posts.find(
                      (p) => p.instagramMediaId == post.id,
                    );

                    return (
                      <tr
                        key={post.id ?? submittedMedia?.instagramMediaId}
                        className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Thumbnail + caption (max 25 chars) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.thumbnail_url ? (
                              <div
                                className="w-10 h-10 lg:min-w-22 lg:min-h-22 relative"
                                onClick={() => {
                                  setPreviewVideo(post.media_url);
                                  console.log("Preview video set to:", post);
                                }}
                              >
                                <img
                                  src={post.thumbnail_url}
                                  alt=""
                                  className="w-full object-cover h-full rounded-2xl"
                                />

                                <div className="absolute inset-0 flex items-center justify-center ">
                                  <div className="flex h-8 w-8  items-center justify-center rounded-full ">
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
                              </div>
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-300 dark:text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <p
                              className="text-sm font-bold text-[#3A3A3A] dark:text-gray-300"
                              title={post.caption}
                            >
                              {truncate(post.caption)}
                            </p>
                          </div>
                        </td>
                        {/* Media type */}
                        <td className="px-6 py-4">
                          {submittedMedia?.globalRank ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#3A3A3A] dark:text-gray-300">
                              <span className="text-xs font-bold text-[#3A3A3A] dark:text-gray-500">
                                #
                              </span>
                              {submittedMedia?.globalRank}
                            </span>
                          ) : (
                            <span className="text-[#3A3A3A] text-sm">—</span>
                          )}
                        </td>
                        {/* Categories — grey pills */}
                        <td className="px-6 py-4">
                          {submittedMedia?.categoryRank ? (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#3A3A3A] dark:text-gray-300">
                              {submittedMedia?.categoryRank}
                            </span>
                          ) : (
                            <span className="text-[#3A3A3A] text-sm">—</span>
                          )}
                        </td>
                        {/* Ranking */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {submittedMedia?.category ? (
                              <span className="rounded-xl dark:bg-gray-800 px-3.5 py-1.5 text-sm font-medium text-[#4A4A4A] dark:text-gray-300">
                                {submittedMedia?.category}
                              </span>
                            ) : (
                              <span className="text-[#3A3A3A] text-sm">—</span>
                            )}
                          </div>
                        </td>
                        {/* Beed+ Score */}
                        <td className="px-6 py-4">
                          {submittedMedia?.beedplusScore != null ? (
                            <span className="inline-flex px-2.5 py-0.5 text-xs font-bold text-[#3A3A3A]">
                              {fmtBeedScore(submittedMedia?.beedplusScore)}
                            </span>
                          ) : (
                            <span className="text-[#3A3A3A] text-sm">—</span>
                          )}
                        </td>
                        {/* Submitted date */}
                        <td className="px-6 py-4 text-sm text-[#3A3A3A] font-medium whitespace-nowrap">
                          {fmtDate(submittedMedia?.createdAt)}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          {(() => {
                            const s = submittedMedia?.status;
                            const cfg = {
                              approved: "bg-green-50 text-green-600",
                              pending: "bg-amber-50 text-amber-600",
                              rejected: "bg-red-50 text-red-500",
                            };
                            return s ? (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-sm font-semibold capitalize ${cfg[s] ?? "bg-gray-100 text-gray-500"}`}
                              >
                                {s}
                              </span>
                            ) : (
                              <span className="text-[#3A3A3A] text-sm">—</span>
                            );
                          })()}
                        </td>
                        {/* View button → modal */}
                        <td className="px-6 py-4 text-right">
                          {submittedMedia?.status == "approved" ||
                          submittedMedia?.status == "pending" ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/posts/${submittedMedia.instagramMediaId}`,
                                  {
                                    state: { post: submittedMedia },
                                  },
                                )
                              }
                              className="rounded-lg bg-[#FFEFD0] px-3 py-1.5 text-xs font-semibold text-[#9B5A0A] hover:bg-orange-600 transition"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSubmitModal(post);
                                setSubmitCat1("");
                                setSubmitSubCat("");
                                setSubCatOpen(false);
                                setSubmitMsg(null);
                              }}
                              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
                            >
                              Submit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
        )}
      </div>

      {/* Unsubmitted Videos */}
      {/* <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Unsubmitted Videos
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Videos not yet submitted to rankings
            </p>
          </div>
          {!igMediaLoading && (
            <span className="text-xs text-gray-400">
              {igMedia.length} post{igMedia.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {igMediaError ? (
          <p className="px-6 py-10 text-center text-sm text-red-400">
            {igMediaError}
          </p>
        ) : igMediaLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 animate-pulse"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : igMedia.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
            No qualifying Instagram posts found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Reach
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Submit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {igMedia.map((post, i) => {
                    // let submittedMedia = posts?.find((med: any)=> (med?.instagramMediaId == post?.id));
                    console.log("posts[i]", post);
                    return (
                      <tr
                        key={post.id}
                        className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.thumbnail_url ? (
                              <img
                                src={post.thumbnail_url}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-300 dark:text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                                  />
                                </svg>
                              </div>
                            )}
                            <p
                              className="max-w-[180px] truncate text-sm font-medium text-gray-700 dark:text-gray-300"
                              title={post.caption}
                            >
                              {truncate(post.caption, 30)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <MediaTypeBadge type={post.media_type} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {fmt(post.insights?.views)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {fmt(post.insights?.reach)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {fmt(post.insights?.likes)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          {fmtDate(post.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSubmitModal(post);
                              setSubmitCat1("");
                              setSubmitSubCat("");
                              setSubCatOpen(false);
                              setSubmitMsg(null);
                            }}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
                          >
                            Submit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {igMediaHasMore && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-3 text-center">
                <button
                  onClick={loadMoreIgMedia}
                  className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div> */}

      {/* Daily Reach */}
      {/* <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Daily Reach
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Per-day reach history
          </p>
        </div>
        {!user?.instagram?.dailyInsights?.length ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No daily reach data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Reach
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...user.instagram.dailyInsights].reverse().map((entry, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(entry.date)}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {fmt(entry.reach)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div> */}

      {/* Media preview modal */}
      {selectedPost && (
        <MediaModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* Admin direct-submit modal */}
      {/* {previewVideo &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 ">
            <div className="p-6 lg:w-[600px] rounded-[8px] ">
              <button
                type="button"
                onClick={() => setPreviewVideo("")}
                className="absolute top-10 right-10"
              >
                <CloseIcon color={"#fff"} />
              </button>
              <video
                ref={previewVideoRef}
                src={previewVideo}
                controls
                className="object-cover w-full h-[90vh] lg:w-full rounded-[8px] relative m-auto"
              />
            </div>
          </div>,
          document.body,
        )} */}

      <Modal
        isVisible={previewVideo !== ""}
        onCloseModal={() => {
          setPreviewVideo("");
        }}
      >
        <div className="w-[90vw] lg:w-150 flex justify-center items-center relative">
          <button
            type="button"
            onClick={() => setPreviewVideo("")}
            className="absolute top-5 right-5 z-50"
          >
            <CloseIcon color={"#fff"} strokeWidth={2.5} />
          </button>
          {previewVideo && (
            <video
              ref={previewVideoRef}
              src={previewVideo}
              controls
              className="object-cover w-full h-[90vh] lg:w-full rounded-[8px] relative m-auto"
            />
          )}
        </div>
      </Modal>
      {submitModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 lg:w-[467px] rounded-[8px] relative">
              <button
                type="button"
                onClick={() => setSubmitModal(null)}
                className="absolute top-8 right-6"
              >
                <CloseIcon />
              </button>
              <p className="text-[24px] font-bold">Select Category</p>
              <CustomDropDownInput
                value={category}
                placeholder="Select your main category"
                items={categories.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                label="Category"
              />
              <SelectSearch
                label="Sub-Category"
                value={subCategory}
                placeholder="Select or add subcategory"
                items={
                  subCategories?.length > 0
                    ? subCategories.map((sc) => sc.name)
                    : []
                }
                onChange={(val) => {
                  setSubCategory(val);
                }}
                showEmptyButton
                onNoResult={(val) => createSubCategory({ name: val.trim() })}
              />
              <div className="w-full mt-5">
                <div className="w-[50%] m-auto">
                  <button
                    disabled={submitting || !category || !subCategory}
                    onClick={handleAdminSubmit}
                    className="flex-1 rounded-xl bg-[#2F3134] w-full py-2.5 text-sm font-semibold text-white hover:bg-[#2F3134] transition disabled:opacity-60"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
