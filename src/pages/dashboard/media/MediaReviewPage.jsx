import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../hooks/useAuth";
import { instagramApi } from "../../../utils/instagramApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { subCategoriesApi } from "../../../utils/subCategoriesApi";
import MediaReviewTable from "../../../components/dashboard/mediaReview/MediaReviewTable";
import { RefreshIcon } from "../../../components/icons";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomDropDownInput from "../../../components/CustomDropDownInput";
import SelectSearch from "../../../components/SelectSearch";
import { fmt } from "../../../utils/helper";
import {
  BackArrowIcon,
  BookmarkIcon,
  EyeIcon,
  CommentIcon,
  ShareIcon,
  ReachIcon,
  LikeIcon,
} from "../../../components/icons";
import { useCategoriesProvider } from "../../../hooks/useCategoriesProvider";
import { Link } from "react-router-dom";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RowSkeleton() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 rounded bg-gray-100 dark:bg-gray-800"
            style={{ width: i === 0 ? 160 : i === 1 ? 120 : 80 }}
          />
        </td>
      ))}
    </tr>
  );
}

function InsightRow({ label, value, icon }) {
  return (
    <div className="flex gap-5 items-center p-2.5 ">
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

function truncate(str, max = 200) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function PreviewModal({
  item,
  categories,
  subCategories,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) {
  const overlayRef = useRef(null);
  const [cat, setCat] = useState(item.category ?? "");
  const [subCat, setSubCat] = useState(item.subCategory ?? "");
  const [subCatOpen, setSubCatOpen] = useState(false);
  const [expandCaption, setExpandCaption] = useState(false);
  const fullCaption = item.media?.caption;
  const truncatedCaption = truncate(fullCaption);
  const isCaptionTruncated = fullCaption && fullCaption.length > 25;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleOverlay(e) {
    if (e.target === overlayRef.current) onClose();
  }

  const filterSubCategory = subCategories.filter(
    (s) => !subCat || s.name.toLowerCase().includes(subCat.toLowerCase()),
  );

  const isVideo = item.media?.mediaType?.toUpperCase() === "VIDEO";

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-[870px] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-row h-[85dvh]">
        {/* Left — video / image */}
        <div className="w-[50%] flex-shrink-0 bg-gray-950 flex items-center justify-center h-full">
          {isVideo && item.media?.mediaUrl ? (
            <video
              controls
              playsInline
              autoPlay
              poster={item.media.thumbnailUrl || undefined}
              src={item.media.mediaUrl}
              className="w-full h-full object-contain"
            />
          ) : item.media?.thumbnailUrl ? (
            <img
              src={item.media.thumbnailUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full min-h-48 items-center justify-center text-gray-600 p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right — details + actions */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Creator */}
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              {item.userData?.profilePicture ? (
                <img
                  src={item.userData.profilePicture}
                  alt=""
                  className="h-14.5 w-14.5 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="h-14.5 w-14.5 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
              )}
              <div>
                <p className="text-xl font-bold text-black dark:text-white">
                  {item.userData?.instagramUsername || "—"}
                </p>
                {item.userData?.country && (
                  <p className="text-xs text-[#000000B2]">
                    {item.userData.country}
                  </p>
                )}
              </div>
            </div>
            <div className="">
              <Link
                to={item.media?.permalink || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.62169 0H23.5566C28.8651 0 33.1783 4.31317 33.1783 9.62169V23.5566C33.1783 26.1084 32.1645 28.5557 30.3601 30.3601C28.5557 32.1645 26.1084 33.1783 23.5566 33.1783H9.62169C4.31317 33.1783 0 28.8651 0 23.5566V9.62169C0 7.06986 1.01371 4.62255 2.81813 2.81813C4.62255 1.01371 7.06986 0 9.62169 0ZM9.28991 3.31783C7.70602 3.31783 6.18699 3.94703 5.06701 5.06701C3.94703 6.18699 3.31783 7.70602 3.31783 9.28991V23.8883C3.31783 27.1896 5.98868 29.8604 9.28991 29.8604H23.8883C25.4722 29.8604 26.9913 29.2312 28.1112 28.1112C29.2312 26.9913 29.8604 25.4722 29.8604 23.8883V9.28991C29.8604 5.98868 27.1896 3.31783 23.8883 3.31783H9.28991ZM25.2984 5.80619C25.8484 5.80619 26.3758 6.02467 26.7647 6.41355C27.1536 6.80243 27.3721 7.32987 27.3721 7.87984C27.3721 8.4298 27.1536 8.95724 26.7647 9.34612C26.3758 9.735 25.8484 9.95348 25.2984 9.95348C24.7485 9.95348 24.221 9.735 23.8321 9.34612C23.4432 8.95724 23.2248 8.4298 23.2248 7.87984C23.2248 7.32987 23.4432 6.80243 23.8321 6.41355C24.221 6.02467 24.7485 5.80619 25.2984 5.80619ZM16.5891 8.29456C18.789 8.29456 20.8987 9.16845 22.4543 10.724C24.0098 12.2795 24.8837 14.3893 24.8837 16.5891C24.8837 18.789 24.0098 20.8987 22.4543 22.4543C20.8987 24.0098 18.789 24.8837 16.5891 24.8837C14.3893 24.8837 12.2795 24.0098 10.724 22.4543C9.16845 20.8987 8.29456 18.789 8.29456 16.5891C8.29456 14.3893 9.16845 12.2795 10.724 10.724C12.2795 9.16845 14.3893 8.29456 16.5891 8.29456ZM16.5891 11.6124C15.2692 11.6124 14.0034 12.1367 13.07 13.07C12.1367 14.0034 11.6124 15.2692 11.6124 16.5891C11.6124 17.909 12.1367 19.1749 13.07 20.1082C14.0034 21.0415 15.2692 21.5659 16.5891 21.5659C17.909 21.5659 19.1749 21.0415 20.1082 20.1082C21.0415 19.1749 21.5659 17.909 21.5659 16.5891C21.5659 15.2692 21.0415 14.0034 20.1082 13.07C19.1749 12.1367 17.909 11.6124 16.5891 11.6124Z"
                    fill="#2F3134"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Caption */}
          <p className="text-base font-medium leading-relaxed text-black dark:text-gray-100 ">
            {!fullCaption ? (
              <span className="text-gray-300 dark:text-gray-600 italic"></span>
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

          {/* Submitted category pills */}
          <div className=" gap-1.5">
            <CustomDropDownInput
              placeholder="Category"
              value={cat}
              onChange={(e) => {
                setCat(e.target.value);
              }}
              items={categories.map((c) => ({ label: c.name, value: c.name }))}
            />
            {/* <span
              key={item.userData?.category}
              className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-500"
            >
              {item.userData?.category}
            </span> */}
          </div>

          {/* Meta */}
          <div className="">
            <SelectSearch
              placeholder="Subcategory"
              onChange={(val) => setSubCat(val)}
              value={subCat}
              items={subCategories?.map((s) => s.name)}
            />
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <h3 className="mb-4 text-base font-medium dark:text-gray-500">
              Instagram Insights
            </h3>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8">
              <InsightRow
                label="Views"
                value={item.insights?.views}
                icon={<EyeIcon />}
              />
              <InsightRow
                label="Reach"
                value={item.insights?.reach}
                icon={<ReachIcon />}
              />
              <InsightRow
                label="Saved"
                value={item.insights?.saved}
                icon={<BookmarkIcon />}
              />
              <InsightRow
                label="Likes"
                value={item.insights?.likes}
                icon={<LikeIcon />}
              />
              <InsightRow
                label="Comments"
                value={item.insights?.commentsCount}
                icon={<CommentIcon />}
              />
              <InsightRow
                label="Shares"
                value={item.insights?.shares}
                icon={<ShareIcon />}
              />
            </div>
          </div>

          {/* Category override */}
          {/* <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="">— Select category —</option>
              {categories.map((c) => {
                const name = c.name ?? c;
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div> */}

          {/* Sub-category autocomplete */}
          {/* <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Sub-category{" "}
              <span className="text-gray-300 dark:text-gray-600">
                (optional)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={subCat}
                onChange={(e) => {
                  setSubCat(e.target.value);
                  setSubCatOpen(true);
                }}
                onFocus={() => setSubCatOpen(true)}
                onBlur={() => setTimeout(() => setSubCatOpen(false), 150)}
                placeholder="Type to search or create new…"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              {subCatOpen && filteredSubCats.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {filteredSubCats.map((s) => (
                    <li
                      key={s._id}
                      onMouseDown={() => {
                        setSubCat(s.name);
                        setSubCatOpen(false);
                      }}
                      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> */}

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                onApprove(item, {
                  category: cat ? cat : undefined,
                  subCategory: subCat || undefined,
                })
              }
              disabled={isApproving || isRejecting || !cat}
              className="flex-1 rounded-lg bg-[#1A9704] h-12 py-2.5 text-xl font-bold text-white hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isApproving ? "Approving…" : "Approve"}
            </button>
            <button
              onClick={() => onReject(item)}
              disabled={isApproving || isRejecting}
              className="flex-1 rounded-lg bg-[#FF0000] h-12 py-2.5 text-xl font-bold text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRejecting ? "Rejecting…" : "Reject"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-center rounded-lg w-62 mx-auto h-12 border border-white dark:border-gray-600 py-2.5 shadow-lg shadow-[#0000001A] my-4 text-xl text-[#3A3A3A] font-bold hover:text-gray-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function MediaReviewPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  // const [categories, setCategories] = useState([]);
  const [subCatOptions, setSubCatOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setCategory] = useState("");
  const [filterSubCategory, setSubCategory] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  const { categories, subCategories } = useCategoriesProvider();
  const [expandCaption, setExpandCaption] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Get full and truncated captions

  // useEffect(() => {
  //   categoriesApi
  //     .getCategories()
  //     .then((res) =>
  //       setCategories(Array.isArray(res) ? res : (res?.categories ?? [])),
  //     )
  //     .catch(() => {});
  //   subCategoriesApi
  //     .getSubCategories()
  //     .then((res) =>
  //       setSubCatOptions(Array.isArray(res) ? res : (res?.subCategories ?? [])),
  //     )
  //     .catch(() => {});
  // }, []);

  const countries = useMemo(() => {
    const set = new Set();
    items.forEach((p) => {
      if (p.userData?.country) set.add(p.userData.country);
    });
    return [...set].sort();
  }, [items]);

  async function load() {
    setLoading(true);
    try {
      const res = await instagramApi.getPendingMediaForAdmin(token, "pending");
      setItems(res.pending ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((p) => {
        if (filterCategory) {
          const cats = Array.isArray(p.category)
            ? p.category
            : [p.category].filter(Boolean);
          if (filterCategory && filterCategory !== "All") return false;
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
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
  }, [items, filterCategory, filterSubCategory, search, filterCountry]);

  async function handleApprove(item, { category, subCategory } = {}) {
    setActionId(item._id);
    setIsApproving(true);
    try {
      await instagramApi.approvePendingMedia(
        item._id,
        { category, subCategory },
        token,
      );
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      setViewModal(null);
    } catch (err) {
      alert(err.message ?? "Failed to approve");
    } finally {
      setActionId(null);
      setIsApproving(false);
    }
  }

  async function handleReject(item) {
    setActionId(item._id);
    setIsRejecting(true);
    try {
      await instagramApi.rejectPendingMedia(item._id, {}, token);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      setViewModal(null);
    } catch (err) {
      alert(err.message ?? "Failed to reject");
    } finally {
      setIsRejecting(false);
      setActionId(null);
    }
  }

  function handleFilter(setter) {
    return (val) => {
      setter(val);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-[#0000001A] overflow-hidden py-2">
        {/* Filters */}
        <div className="flex justify-between items-center px-4 mb-2">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
            Media Review
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="min-w-30">
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
              <div className="w-30 z-40">
                <SelectSearch
                  placeholder="Subcategory"
                  onChange={(val) => handleFilter(setSubCategory)(val)}
                  value={filterSubCategory}
                  items={["All", ...subCategories.map((s) => s.name)]}
                />
              </div>
              <div className="min-w-30">
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
              <div className="min-w-22">
                <CustomDropDownInput placeholder="Today" />
              </div>
            </div>

            <div className="flex items-center gap-4 ">
              <button
                onClick={async () => await load()}
                disabled={loading}
                title="Refresh"
                className="flex px-2 py-2 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition disabled:opacity-40"
              >
                <RefreshIcon />
              </button>
              {
                <span className="text-center rounded-md text-xl font-semibold text-black">
                  Post{filtered.length !== 1 ? "s" : ""}:{" "}
                  {filtered.length.toLocaleString()}
                </span>
              }
            </div>
          </div>
        </div>

        <MediaReviewTable
          posts={filtered}
          loading={loading}
          review={(item) => setViewModal(item)}
          actionId={actionId}
        />

        {viewModal && (
          <PreviewModal
            item={viewModal}
            categories={categories}
            subCategories={subCategories}
            onClose={() => setViewModal(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />
        )}
      </div>
    </div>
  );
}
