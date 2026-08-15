import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { instagramApi } from "../../../utils/instagramApi";
import { useScenes } from "../../../hooks/useScenes";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import UserAvatar from "../../../components/dashboard/users/UserAvatar";
import {
  BackArrowIcon,
  BookmarkIcon,
  EyeIcon,
  CommentIcon,
  ShareIcon,
  ReachIcon,
  LikeIcon,
  CloseIcon,
} from "../../../components/icons";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";

const CRUMBS = [
  { label: "Posts", to: "/dashboard/posts" },
  { label: "Post Details" },
];

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
    <div className="flex flex-col gap-1 rounded-lg bg-white dark:bg-gray-900 p-4.5 shadow-md shadow-[#0000000D]">
      <div className="flex items-start justify-between">
        <p className="text-[17px] font-medium text-[#0000004D] dark:text-gray-500">
          {label}
        </p>
      </div>
      <p className="text-[28px] font-semibold text-[#000] dark:text-white">
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
    <div className="flex gap-2.5 items-center p-2.5 px-4 bg-[#F4F4F44D] rounded-2xl">
      <div className="h-10 w-10 bg-[#FFF] rounded-lg items-center flex justify-center">
        {icon && icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[25px] text-[#3A3A3A] font-semibold dark:text-gray-400">
          {fmt(value)}
        </span>
        <span className={`text-xs font-medium text-[#BEB09B]`}>{label}</span>
      </div>
    </div>
  );
}
function Top100({ label, globalValue, localValue }) {
  return (
    <div className="flex flex-col gap-5 bg-white p-2.5 rounded-2xl">
      <h4 className="text-lg font-medium text-black text-center p-2.5 rounded-lg bg-[#F4F4F4] shadow-md shadow-[#0000000D]">
        {label}
      </h4>
      <div className="flex gap-4 ">
        <div className="flex flex-col items-center gap-2.5 w-1/2 shadow-md shadow-[#0000000D] rounded-lg py-2">
          <span
            className={`text-sm text-[#0000004D] font-medium dark:text-gray-400`}
          >
            Global
          </span>
          <span className="text-3xl text-[#000000] font-bold dark:text-gray-400">
            {fmt(globalValue)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2.5 w-1/2 shadow-md shadow-[#0000000D] rounded-lg py-2">
          <span
            className={`text-sm text-[#0000004D] font-medium dark:text-gray-400`}
          >
            Nigeria
          </span>
          <span className="text-3xl text-[#000000] font-bold dark:text-gray-400">
            {fmt(localValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

function truncate(str, max = 200) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-6 w-48 rounded bg-gray-100" />
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="flex gap-6">
          <div className="h-72 w-72 shrink-0 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-6 w-3/4 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PostDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instagramMediaId = searchParams.get("instagramMediaId");

  const navigate = useNavigate();
  const location = useLocation();

  const [expandCaption, setExpandCaption] = useState(false);

  const { auth } = useAuth();
  const token = auth?.token;

  const { updateScene } = useScenes(token);

  const initialPost = location.state?.post ?? null;
  const [post, setPost] = useState(initialPost);

  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [smallLoading, setSmallLoading] = useState(false);
  const [mediaStats, setMediaStats] = useState(null);
  const [previewVideo, setPreviewVideo] = useState("");
  const previewVideoRef = useRef(null);


  async function getMediaStats() {
    setLoading(true);
    try {
      let result = await instagramApi.getMediaStats(id, token);
      setLoading(false);
      setMediaStats(result);
    } catch (e) {
      toast.error( e.message ?? "error fetching media stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      Promise.all([load(), getMediaStats()]);
    }
  }, [id]);

  useEffect(() => {
    if (previewVideo) {
      previewVideoRef.current
        ?.play()
        .then()
        .catch((err) => {
          console.log("Failed to play preview video:", err);
        });
    } else {
      previewVideoRef.current?.pause();
    }
  }, [previewVideo]);

  if (loading) return <PageSkeleton />;

  if (!post) {
    return (
      <div className="flex gap-6">
        <BackArrowIcon />
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center shadow-lg">
          <p className="text-sm text-red-500">{error ?? "Post not found"}</p>
          <button
            onClick={() => navigate("/dashboard/posts")}
            className="mt-4 text-sm text-orange-500 hover:underline"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  // Get full and truncated captions
  const fullCaption = post.media?.caption;
  const truncatedCaption = truncate(fullCaption);
  const isCaptionTruncated = fullCaption && fullCaption.length > 25;

  const caption = truncate(post.media?.caption);
  const mediaType = post.media?.mediaType;
  const thumbnailUrl = post.media?.thumbnailUrl ?? post.media?.mediaUrl;
  const permalink = post.media?.permalink;
  const isVideo =
    mediaType?.toUpperCase() === "VIDEO" ||
    mediaType?.toUpperCase() === "REELS";
  const username = post.instagramUsername || post.userData?.username;
  const country = post.userData?.country;
  const profilePic = post.userData?.profilePicture;
  const cats = Array.isArray(post.category)
    ? post.category
    : [post.category].filter(Boolean);

  async function refreshData() {
    setSmallLoading(true);

    try {
      const res = await instagramApi.getMediaByIdForAdmin(id, token);

      if (res?.media?._id) setPost(res.media);
      setSmallLoading(false);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load posts");
    } finally {
      setSmallLoading(false);
    }
  }
  async function load() {
    setLoading(true);

    try {
      const res = await instagramApi.getMediaByIdForAdmin(id, token);

      if (res?.media?._id) setPost(res.media);
      setLoading(false);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  const bookmarkScene = async (post) => {
    try {
      setSmallLoading(true);
      await updateScene(post._id, post.inScenes);
      await refreshData();
    } catch (err) {
      console.log(`Failed to update scene: ${err.message}`);
    } finally {
      setSmallLoading(false);
    }
  };

  function BookmarkButton({ active, onClick, disabled }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={active ? "Remove from scenes" : "Add to scenes"}
      >
        <BookmarkIcon fillColor={active} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-xl dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300  transition"
          >
            <BackArrowIcon />
            Back
          </button>
        </div>

        <div className="flex items-center gap-4">
          {smallLoading ? (
            <div
              class="inline-block h-5 w-5 animate-spin rounded-full border-5 border-gray-200 border-t-[#3A3A3A]"
              role="status"
              aria-label="Loading"
            ></div>
          ) : (
            <BookmarkButton
              active={post.inScenes}
              onClick={() => {
                bookmarkScene(post);
              }}
              disabled={smallLoading}
            />
          )}

          <button
            onClick={() =>
              navigate("/dashboard/posts/compare", { state: { postA: post } })
            }
            type="button "
            class=" rounded-lg p-2.5 min-w-[157px] bg-white border border-white shadow-sm shadow-[#0000001A] font-medium"
          >
            Compare Post
          </button>

          <div className="min-w-29">
            <CustomDropDownInput placeholder="Today" />
          </div>
        </div>
      </div>

      {/* Main card: thumbnail + details */}
      <div className="flex justify-between rounded-[20px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000000D]">
        {/* Card top row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Thumbnail */}
          <div
            onClick={() => {
              setPreviewVideo(post.media.mediaUrl);
              console.log("Preview video set to:", post);
            }}
            className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-gray-900 lg:w-72 aspect-square lg:aspect-auto lg:h-72"
          >
            {thumbnailUrl ? (
              <div className="w-full h-full">
                <img
                  src={thumbnailUrl}
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

          {/* Details */}
          <div className="flex flex-1 flex-col gap-3 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {cats.map((c) => (
                <span
                  key={c}
                  className="inline-flex justify-center items-center min-w-[87px] rounded-[20px] bg-[#FFF5DE] dark:bg-gray-800 px-3 py-1 text-base font-medium text-[#A45308] dark:text-gray-300"
                >
                  {c}
                </span>
              ))}
              {post.subCategory ? (
                <span className="inline-flex justify-center items-center min-w-[87px] rounded-[20px] bg-[#D5D5D580] dark:bg-gray-800 px-3 py-1 text-base font-medium text-[#555555] dark:text-gray-300">
                  {post.subCategory}
                </span>
              ) : null}
            </div>

            {/* Caption */}
            <div className="max-w-[362px]">
              <p className="text-base font-medium tracking-widest text-[#0000004D] mb-1">
                Caption
              </p>
              <p className="text-base font-medium leading-relaxed text-black dark:text-gray-100 ">
                {!fullCaption ? (
                  <span className="text-gray-300 dark:text-gray-600 italic">
                    No caption
                  </span>
                ) : (
                  <>
                    {expandCaption ? fullCaption : truncatedCaption}
                    {isCaptionTruncated && (
                      <button
                        onClick={() => setExpandCaption(!expandCaption)}
                        className="ml-2 text-[#0000004D]  font-semibold transition"
                      >
                        {expandCaption ? "Less" : "More"}
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-900 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/users/${post.userId}`)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <UserAvatar
                    name={
                      post?.userData.instagramUsername?.replace("@", "") || "U"
                    }
                    src={post?.userData?.profilePicture ?? null}
                    size="h-11 w-11 "
                    style="custom"
                  />
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex flex-col items-start gap-2">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        {post?.userData?.instagramUsername}
                      </h2>
                      {/* <p className="text-base text-[#000000B2]">{user?.email}</p> */}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Meta row */}
            <div className="">
              {post.media?.timestamp && (
                <span className="text-base text-[#00000080] ">
                  Posted {fmtDate(post.media.timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold">
              {fmtDate(post.createdAt)}
            </span>
            <h4 className="text-base font-medium text-[#0000004D]">
              Submitted
            </h4>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{post._id}</span>
            <h4 className="text-base font-medium text-[#0000004D]">Media Id</h4>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{post.instagramMediaId}</span>
            <h4 className="text-base font-medium text-[#0000004D]">Instagram Id</h4>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Beed+ Score"
          value={post?.beedplusScore?.toLocaleString() ?? "--"}
        />
        <StatCard label="Beed+ Clicks" value={fmt(post.clicks)} />
        <StatCard label="Beed+ Views" value={fmt(post.beedplusViews)} />
      </div>

      {/* Insights + Creator row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Insights */}

        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000000D]">
          <h3 className="mb-4 text-[24px] font-medium dark:text-gray-500">
            Instagram Daily Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-x-8">
            <InsightRow
              label="Views"
              value={mediaStats?.dailyInsights?.views?.toLocaleString()}
              icon={<EyeIcon />}
            />
            <InsightRow
              label="Reach"
              value={mediaStats?.dailyInsights?.reach?.toLocaleString()}
              icon={<ReachIcon />}
            />
            <InsightRow
              label="Saved"
              value={mediaStats?.dailyInsights?.saved?.toLocaleString()}
              icon={<BookmarkIcon />}
            />
            <InsightRow
              label="Likes"
              value={mediaStats?.dailyInsights?.likes?.toLocaleString()}
              icon={<LikeIcon />}
            />
            <InsightRow
              label="Comments"
              value={mediaStats?.dailyInsights?.comments?.toLocaleString()}
              icon={<CommentIcon />}
            />
            <InsightRow
              label="Shares"
              value={mediaStats?.dailyInsights?.shares?.toLocaleString()}
              icon={<ShareIcon />}
            />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg shadow-[#0000000D]">
          <h3 className="mb-4 text-[24px] font-medium dark:text-gray-500">
            Instagram Lifetime Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-x-8">
            <InsightRow
              label="Views"
              value={post.insights?.views}
              icon={<EyeIcon />}
            />
            <InsightRow
              label="Reach"
              value={post.insights?.reach}
              icon={<ReachIcon />}
            />
            <InsightRow
              label="Saved"
              value={post.insights?.saved}
              icon={<BookmarkIcon />}
            />
            <InsightRow
              label="Likes"
              value={post.insights?.likes}
              icon={<LikeIcon />}
            />
            <InsightRow
              label="Comments"
              value={post.insights?.comments}
              icon={<CommentIcon />}
            />
            <InsightRow
              label="Shares"
              value={post.insights?.shares}
              icon={<ShareIcon />}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 row-1 col-4 shadow-lg">
          <div className="">
            <Top100
              label="Beed+ Top Top100"
              globalValue={mediaStats?.globalRank ?? "--"}
              localValue={mediaStats?.countryRank ?? "--"}
            />
          </div>
          <div className="">
            <Top100
              label={`${post?.category} Top 100 Nigeria`}
              globalValue={mediaStats?.categoryRank ?? "--"}
              localValue={mediaStats?.countryCategoryRank ?? "--"}
            />
          </div>
        </div>
      </div>

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
    </div>
  );
}
