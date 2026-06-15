import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { categoriesApi } from "../../../utils/categoriesApi";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import { CloseIcon } from "../../icons";

const INPUT =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition";
const COLOR_INPUT =
  "h-10 w-10 cursor-pointer rounded-lg border border-gray-200 p-0.5";

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 rounded-lg bg-gray-100" />
          <div className="h-3 rounded bg-gray-100" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 rounded-full bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 rounded-full bg-gray-100" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 rounded-lg bg-gray-100" />
          <div className="h-6 rounded-lg bg-gray-100" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 rounded bg-gray-100" />
      </td>
      <td className="px-6 py-4" />
    </tr>
  );
}

// ─── Category Modal (Add / Edit) ──────────────────────────────────────────────
function CategoryModal({ category, onClose, action }) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [primaryColor, setPrimary] = useState(
    category?.primaryColor ?? "#f97316",
  );
  const [secondaryColor, setSecondary] = useState(
    category?.secondaryColor ?? "#fdba74",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), primaryColor, secondaryColor };
      const res = isEdit
        ? await action(category._id, payload)
        : await action(payload);
      onClose();
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#000000E5] dark:text-gray-100">
              {isEdit ? "Edit Category" : "Add Category"}
            </p>
            <p className="text-base text-[#00000080] dark:text-gray-500">
              {isEdit
                ? "Update category details"
                : "Create a new platform category"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
           <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              className={INPUT}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fashion"
              required
            />
          </div>
          {/* 
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className={COLOR_INPUT}
                  value={primaryColor}
                  onChange={(e) => setPrimary(e.target.value)}
                />
                <input
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-mono"
                  value={primaryColor}
                  onChange={(e) => setPrimary(e.target.value)}
                  maxLength={7}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className={COLOR_INPUT}
                  value={secondaryColor}
                  onChange={(e) => setSecondary(e.target.value)}
                />
                <input
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-mono"
                  value={secondaryColor}
                  onChange={(e) => setSecondary(e.target.value)}
                  maxLength={7}
                />
              </div>
            </div>
          </div> */}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#2F3134] px-5 py-2.5 text-xl font-medium text-white hover:bg-[#2F3134] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ category, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await onConfirmed(category._id);
      onClose();
    } catch (err) {
      setError(err.message ?? "Delete failed");
      setDeleting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex h-17 w-17 items-center justify-center rounded-full bg-red-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <p className="text-xl font-bold text-[#000000E5] dark:text-gray-100">
          Delete "{category.name}"?
        </p>
        <p className="mt-1 text-base text-[#00000080] dark:text-gray-500">
          This will permanently remove this category. Posts and users in this
          category may be affected.
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function CategoriesLayout({ title, subtitle }) {
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const {
    categories,
    setCategories,
    createCategory,
    fetchCategories,
    deleteCategory,
    updateCategory,
    reorderCategory,
    isLoading,
  } = useCategoriesProvider();

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  // function handleSaved(result, isEdit) {
  //   if (isEdit) {
  //     setCategories((prev) =>
  //       prev.map((c) => (c._id === result._id ? { ...c, ...result } : c)),
  //     );
  //     setEditTarget(null);
  //   } else {
  //     setCategories((prev) =>
  //       [...prev, result].sort((a, b) => a.name.localeCompare(b.name)),
  //     );
  //     setShowAdd(false);
  //   }
  // }

  async function handleDrop(e, targetId) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const updated = [...categories];
    const fromIdx = updated.findIndex((c) => c._id === draggingId);
    const toIdx = updated.findIndex((c) => c._id === targetId);
    const [item] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, item);
    console.log("updated reorder", updated);
    setCategories(updated);
    setDraggingId(null);
    setDragOverId(null);
    try {
      await reorderCategory(updated.map((c) => c._id));
    } catch {
      fetchCategories();
    }
  }

  const canDrag = !search.trim();
  const COL = "px-6 py-3 text-left text-base font-medium text-[#3A3A3AB2]";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>

        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-lg bg-[#2F3134] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#2F3134] transition sm:self-auto"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stat card */}
      {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] flex flex-col gap-6  bg-[#2F3134] p-5">
          <p className="text-base font-medium tracking-widest text-[#DADADA] dark:text-gray-500">
            Total Categories
          </p>
          <p className="mt-1 text-4xl font-black text-[#FDD6B6] dark:text-white">
            {isLoading ? "..." : categories.length}
          </p>
        </div>
        <div className="rounded-[20px] flex flex-col gap-6  bg-[#F9F9F9] p-5 dark:bg-gray-900 shadow-lg">
          <p className="text-base font-medium tracking-widest text-[#686969] dark:text-gray-500 dark:text-gray-500">
            Total Posts
          </p>
          <p className="mt-1 text-4xl font-bold text-[#2F3134] dark:text-white">
            {isLoading
              ? "..."
              : categories
                  .reduce((s, c) => s + (c.postCount ?? 0), 0)
                  .toLocaleString()}
          </p>
        </div>
        <div className="rounded-[20px] flex flex-col gap-6  bg-[#F9F9F9] p-5 dark:bg-gray-900 shadow-lg">
          <p className="text-base font-medium tracking-widest text-[#686969] dark:text-gray-500 dark:text-gray-5000">
            Total Users
          </p>
          <p className="mt-1 text-4xl font-bold text-[#2F3134] dark:text-white">
            {isLoading
              ? "..."
              : categories
                  .reduce((s, c) => s + (c.userCount ?? 0), 0)
                  .toLocaleString()}
          </p>
        </div>
      </div> */}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error} —{" "}
          <button onClick={fetchCategories} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900  shadow-lg shadow-[#0000001A] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-bold text-[#2F3134] dark:text-gray-100">
              Category List
            </p>
          </div>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-[#E5E5E5] bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-50 h-12"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-t-2xl">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#DDDDDD] dark:bg-gray-800/50">
                <th className="w-8 px-3 py-3" />
                <th className={COL}>Category</th>
                <th className={COL}>Posts</th>
                <th className={COL}>Views</th>
                <th className={COL}>Users</th>
                <th className={COL}>Created</th>
                <th className={`${COL}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((cat) => (
                  <tr
                    key={cat._id}
                    draggable={canDrag}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(cat._id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (cat._id !== draggingId) setDragOverId(cat._id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => handleDrop(e, cat._id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                    className={[
                      "border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors",
                      draggingId === cat._id ? "opacity-40" : "",
                      dragOverId === cat._id
                        ? "bg-orange-50/60 dark:bg-orange-500/10 border-t-2 border-t-orange-400"
                        : "hover:bg-gray-50/40 dark:hover:bg-gray-800/40",
                    ].join(" ")}
                  >
                    {/* Drag handle */}
                    <td className="pl-3 pr-1 py-4">
                      <div
                        title={
                          canDrag
                            ? "Drag to reorder"
                            : "Clear search to reorder"
                        }
                        className={
                          canDrag
                            ? "cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-400"
                            : "cursor-not-allowed text-gray-200 dark:text-gray-700"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 16 16"
                          fill="#000000"
                        >
                          <circle cx="5" cy="3.5" r="1.2" />
                          <circle cx="11" cy="3.5" r="1.2" />
                          <circle cx="5" cy="8" r="1.2" />
                          <circle cx="11" cy="8" r="1.2" />
                          <circle cx="5" cy="12.5" r="1.2" />
                          <circle cx="11" cy="12.5" r="1.2" />
                        </svg>
                      </div>
                    </td>
                    {/* Category name + color swatch */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-[#000000CC] dark:text-gray-100">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    {/* Post count */}
                    <td className="px-6 py-4">
                      <span className="text-base font-bold text-[#00000080] dark:text-gray-1000">
                        {(cat.postCount ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Views count */}
                    <td className="px-6 py-4">
                      <span className="text-base font-bold text-[#00000080] dark:text-gray-1000">
                        {(cat.views ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* User count */}
                    <td className="px-6 py-4">
                      <span className="text-base font-bold text-[#00000080] dark:text-gray-1000">
                        {(cat.userCount ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 text-base font-bold text-[#00000080] dark:text-gray-1000">
                      {new Date(cat.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setEditTarget(cat)}
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                        >
                          <svg
                            width="36"
                            height="32"
                            viewBox="0 0 36 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="36"
                              height="32"
                              rx="6"
                              fill="#FFEFD0"
                            />
                            <path
                              d="M22.487 8.86225L24.174 7.17425C24.5257 6.82257 25.0027 6.625 25.5 6.625C25.9973 6.625 26.4743 6.82257 26.826 7.17425C27.1777 7.52592 27.3752 8.0029 27.3752 8.50025C27.3752 8.99759 27.1777 9.47457 26.826 9.82625L16.207 20.4452C15.6783 20.9736 15.0264 21.362 14.31 21.5752L11.625 22.3752L12.425 19.6902C12.6383 18.9739 13.0266 18.3219 13.555 17.7932L22.487 8.86225ZM22.487 8.86225L25.125 11.5002M23.625 18.3752V23.1252C23.625 23.722 23.3879 24.2943 22.966 24.7162C22.544 25.1382 21.9717 25.3752 21.375 25.3752H10.875C10.2783 25.3752 9.70597 25.1382 9.28401 24.7162C8.86205 24.2943 8.625 23.722 8.625 23.1252V12.6252C8.625 12.0285 8.86205 11.4562 9.28401 11.0343C9.70597 10.6123 10.2783 10.3752 10.875 10.3752H15.625"
                              stroke="#C27A06"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          title="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <svg
                            width="38"
                            height="34"
                            viewBox="0 0 38 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="38"
                              height="34"
                              rx="6"
                              fill="#FFD0D0"
                            />
                            <path
                              d="M21.74 14.0005L21.394 23.0005M16.606 23.0005L16.26 14.0005M22.75 10.3935C23.9138 10.4836 25.0739 10.616 26.228 10.7905C26.57 10.8425 26.91 10.8975 27.25 10.9565M26.228 10.7905L25.16 24.6735C25.1164 25.2387 24.8611 25.7667 24.445 26.1518C24.029 26.5368 23.4829 26.7507 22.916 26.7505H15.084C14.5171 26.7507 13.971 26.5368 13.555 26.1518C13.1389 25.7667 12.8836 25.2387 12.84 24.6735L11.772 10.7905M11.772 10.7905C11.43 10.8415 11.09 10.8965 10.75 10.9555M11.772 10.7905C12.9261 10.616 14.0862 10.4836 15.25 10.3935M22.75 10.3935V9.47752C22.75 8.29752 21.84 7.31352 20.66 7.27652C19.5536 7.24116 18.4464 7.24116 17.34 7.27652C16.16 7.31352 15.25 8.29852 15.25 9.47752V10.3935M22.75 10.3935C20.2537 10.2006 17.7463 10.2006 15.25 10.3935"
                              stroke="#C20606"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <CategoryModal
          onClose={() => setShowAdd(false)}
          action={createCategory}
        />
      )}
      {editTarget && (
        <CategoryModal
          category={editTarget}
          onClose={() => setEditTarget(null)}
          action={updateCategory}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={deleteCategory}
        />
      )}
    </div>
  );
}
