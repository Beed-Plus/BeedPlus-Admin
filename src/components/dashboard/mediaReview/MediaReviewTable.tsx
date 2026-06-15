import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { instagramApi } from "../../../utils/instagramApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { subCategoriesApi } from "../../../utils/subCategoriesApi";
import PostThumbnail from "../PostThumbnail";
import { fmt } from "../../../utils/helper";
import { BookmarkIcon, DeleteIcon } from "../../icons";

const COL =
  "px-6 py-3 text-[11px] text-left font-bold uppercase tracking-widest text-[#3A3A3AB2]";

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function MediaReviewTable({ posts, loading, review, actionId }) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [localPosts, setLocalPosts] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const displayPosts = localPosts ?? posts;

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((res) =>
        setCategories(Array.isArray(res) ? res : (res.categories ?? [])),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editCategory) {
      setSubCategories([]);
      return;
    }
    const cat = categories.find((c) => c.name === editCategory);
    if (!cat?._id) return;
    subCategoriesApi
      .getSubCategories(cat._id)
      .then((res) =>
        setSubCategories(Array.isArray(res) ? res : (res.subCategories ?? [])),
      )
      .catch(() => {});
  }, [editCategory, categories]);

  function openEdit(post) {
    const cat = Array.isArray(post.category)
      ? (post.category[0] ?? "")
      : (post.category ?? "");
    setEditPost(post);
    setEditCategory(cat);
    setEditSubCategory(post.subCategory?.name ?? "");
  }

  async function saveEdit() {
    if (!editPost || !editCategory) return;
    setSaving(true);
    try {
      let subCategoryId = null;
      if (editSubCategory.trim()) {
        const cat = categories.find((c) => c.name === editCategory);
        const found = await subCategoriesApi.findOrCreate(
          { name: editSubCategory.trim(), categoryId: cat?._id },
          token,
        );
        subCategoryId = found?._id ?? found?.subCategory?._id ?? null;
      }
      const res = await instagramApi.updateMediaCategory(
        editPost._id,
        { category: editCategory, subCategory: subCategoryId },
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
      alert(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }
  

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-auto max-h-[75vh]">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-[#DDDDDD] dark:bg-gray-800/50 sticky top-0 z-10">
            <tr className="">
              <th className={COL}>Post</th>
              <th className={COL}>Creator</th>
              <th className={COL}>Category</th>
              <th className={COL}>Subcategory</th>
              <th className={COL}>Country</th>
              <th className={COL}>Views</th>
              <th className={COL}>Submitted</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
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
              const busy = actionId === post._id;
                return (
                  <tr
                    key={post._id}
                    className="border-b border-[#3A3A3A1A] dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/dashboard/posts/${post._id}`, {
                        state: { post },
                      })
                    }
                  >
                    {/* Post */}
                    <td className="px-6 py-4 min-w-75">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <PostThumbnail
                            src={thumb}
                            color="#e5e7eb"
                            alt={caption}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                            {truncate(caption)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="px-6 py-4 min-w-25">
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

                    {/* Country */}
                    <td className="px-6 py-4 min-w-30">
                      {post.userData.country ? (
                        <span className="inline-flex items-center rounded-xl dark:bg-blue-500/10 px-2.5 py-0.5 text-base font-medium text-[#4A4A4A] dark:text-gray-300">
                          {post.userData.country}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 min-w-25 text-sm font-semibold text-[#2F3134] dark:text-gray-100 font-mono">
                      {fmt(post.insights?.views) ?? (
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
                        <button
                          onClick={() => review(post)}
                          disabled={busy}
                          className="rounded-lg bg-[#FFEFD0] px-3 py-1.5 text-xs font-semibold text-[#9B5A0A] transition disabled:opacity-60"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
