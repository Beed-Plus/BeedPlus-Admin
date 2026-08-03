import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { instagramApi } from "../../../utils/instagramApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { subCategoriesApi } from "../../../utils/subCategoriesApi";
import PostThumbnail from "../PostThumbnail";
import { fmt } from "../../../utils/helper";
import { BookmarkIcon, CloseIcon, DeleteIcon } from "../../icons";
import SelectSearch from "../../SelectSearch";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import Modal from "../../Modal";

const COL =
  "px-6 py-3 text-[11px] text-left font-bold tracking-widest text-[#3A3A3AB2]";

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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}
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

function truncate(str, max = 40) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4" />
    </tr>
  );
}

// ─── Bookmark Button ──────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostTable({
  posts,
  loading,
  bookmarkScene,
  smallLoading,
  selectedPost,
  handleReject,
}) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [localPosts, setLocalPosts] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const displayPosts = localPosts ?? posts;
  const [previewVideo, setPreviewVideo] = useState("");
  const previewVideoRef = useRef(null);
  const {
    categories,
    subCategories,
    setCategories,
    setSubCategories,
    fetchSubCategories,
    fetchCategories,
    createSubCategory,
  } = useCategoriesProvider();
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  function openEdit(post) {
    setEditPost(post);
    setEditCategory(post.category);
    setEditSubCategory(post.subCategory);
  }

  function openDelete(post) {
    setDeletePost(post);
  }

  async function saveEdit() {
    if (!editPost || !editCategory) return;
    setSaving(true);
    try {
      const res = await instagramApi.updateMediaCategory(
        editPost._id,
        { category: editCategory, subCategory: editSubCategory },
        token,
      );
      setLocalPosts((prev) =>
        (prev ?? posts).map((p) =>
          p._id === editPost._id
            ? {
                ...p,
                category: [editCategory],
                subCategory: res.media?.subCategory ?? null,
              }
            : p,
        ),
      );
      setEditPost(null);
    } catch (err) {
      toast.error(err?.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border-t border-[#DDDDDD] overflow-hidden">
      <div className="overflow-auto max-h-[75vh] bg-white">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-[#DDDDDD] dark:bg-gray-800/50 sticky top-0 z-10">
            <tr className="">
              <th className={COL}>Post</th>
              <th className={COL}>Creator</th>
              <th className={COL}>Category</th>
              <th className={COL}>Subcategory</th>
              <th className={COL}>IG Views</th>
              <th className={COL}>Views</th>
              <th className={COL}>Beed+ Score</th>
              <th className={COL}>Submitted</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="h-[500px">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && displayPosts.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No posts found
                </td>
              </tr>
            )}

            {!loading &&
              displayPosts.map((post) => {
                const caption = post.media?.caption;
                const type = post.media?.mediaType;
                const thumb = post.media?.thumbnailUrl ?? post.media?.mediaUrl;
                const username =
                  post.userData.instagramUsername || post.userData?.username;
                const country = post.userData?.country;
                const cats = Array.isArray(post.category)
                  ? post.category
                  : [post.category].filter(Boolean);
                const subCat =
                  post.subCategory?.name ?? post.subCategory ?? null;

                console.log(post);
                return (
                  <tr
                    key={post._id}
                    className="border-b border-[#3A3A3A1A] dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  >
                    {/* Post */}
                    <td className="px-6 py-4 min-w-75">
                      <div className="flex items-center gap-3">
                        <div
                          className="shrink-0"
                          onClick={() => {
                            setPreviewVideo(post.media.mediaUrl);
                            console.log("Preview video set to:", post);
                          }}
                        >
                          <PostThumbnail
                            src={thumb}
                            color="#e5e7eb"
                            alt={caption}
                            showPlayIcon={true}
                          />
                        </div>
                        <div
                          className="min-w-0"
                          onClick={() =>
                            navigate(
                              `/dashboard/posts/${post.instagramMediaId}`,
                              {
                                state: { post },
                              },
                            )
                          }
                        >
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                            {truncate(caption)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td
                      className="px-6 py-4 min-w-25"
                      onClick={() =>
                        navigate(`/dashboard/users/${post.userId}`, {
                          state: { post },
                        })
                      }
                    >
                      {username ? (
                        <div>
                          <p className="text-sm font-bold text-[#3A3A3A] dark:text-gray-100">
                            {username}
                          </p>
                          {country && (
                            <p className="text-xs text-[#3A3A3A] dark:text-gray-500">
                              {country}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 min-w-25">
                      <div className="flex flex-wrap gap-1">
                        {cats.length > 0 ? (
                          cats.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center rounded-xl dark:bg-gray-800 px-2.5 py-0.5 text-base font-medium text-[#4A4A4A] dark:text-gray-300"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sub-Category */}
                    <td className="px-6 py-4 min-w-30">
                      {subCat ? (
                        <span className="inline-flex items-center rounded-xl dark:bg-blue-500/10 px-2.5 py-0.5 text-base font-medium text-[#4A4A4A] dark:text-gray-300">
                          {subCat}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 min-w-25 text-sm font-semibold text-[#2F3134] dark:text-gray-100 font-mono">
                      {fmt(post.insights.views) ?? (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 min-w-25 text-sm font-semibold text-[#2F3134] dark:text-gray-100 font-mono">
                      {fmt(post.beedplusViews) ?? (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 min-w-25 text-sm font-semibold text-[#2F3134] dark:text-gray-100 font-mono">
                      {fmt(post.beedplusScore) ?? (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="px-6 py-4 text-sm text-[#2F3134] dark:text-gray-400">
                      {fmtDate(post.createdAt)}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-3">
                        {selectedPost === post._id && smallLoading ? (
                          <div
                            class="inline-block h-5 w-5 animate-spin rounded-full border-5 border-gray-200 border-t-[#3A3A3A]"
                            role="status"
                            aria-label="Loading"
                          ></div>
                        ) : (
                          <BookmarkButton
                            active={post.inScenes.value}
                            onClick={() => {
                              bookmarkScene(post);
                            }}
                            disabled={smallLoading}
                          />
                        )}
                        <button
                          onClick={() => openEdit(post)}
                          className="rounded-xl bg-[#D0E6FF] dark:bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-[#0A5F9B] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/posts/${post.instagramMediaId}`,
                              {
                                state: { post },
                              },
                            )
                          }
                          className="rounded-xl bg-[#FFEFD0] dark:bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-[#9B5A0A] hover:bg-orange-100 dark:hover:bg-orange-500/20 transition"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openDelete(post)}
                          title={"Delete post"}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Edit Post modal */}
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !saving && setEditPost(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Edit Post
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {truncate(editPost.media?.caption, 40)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => {
                  setEditCategory(e.target.value);
                  setEditSubCategory("");
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="">
              <SelectSearch
                placeholder="Subcategory"
                onChange={(val) => setEditSubCategory(val)}
                value={editSubCategory}
                items={subCategories?.map((s) => s.name)}
                showEmptyButton
                onNoResult={(val) => createSubCategory({ name: val.trim() })}
              />
            </div>

            <div className="flex items-center justify-center mx-auto w-3/4 gap-3 mt-2">
              <button
                onClick={() => setEditPost(null)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || !editCategory}
                className="flex-1 rounded-xl bg-[#2F3134] py-2.5 text-sm font-semibold text-white hover:bg-[#2F3134] transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deletePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeletePost(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Delete Post
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {truncate(deletePost?.media?.caption, 40)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletePost(null)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleReject(deletePost);
                  setDeletePost(null);
                }}
                disabled={smallLoading || loading}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {smallLoading || loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
