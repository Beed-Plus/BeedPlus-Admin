import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { usersApi } from "../../../utils/usersApi";
import { categoriesApi } from "../../../utils/categoriesApi";
import { countriesApi } from "../../../utils/countriesApi";
import Badge from "../../ui/Badge";
import StatusBadge from "../../ui/StatusBadge";
import UserAvatar from "./UserAvatar";
import UserActions from "./UserActions";
import { CloseIcon, DeleteIcon, InstagramIcon, SuspendIcon } from "../../icons";
import { fmt } from "../../../utils/helper";

const COL = "px-6 py-3 text-[11px] font-bold tracking-widest text-[#3A3A3AB2]";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function displayName(user) {
  return user.instagram?.instagramUsername
    ? `@${user.instagram.instagramUsername}`
    : user.instagramUsername
      ? `@${user.instagramUsername}`
      : (user.email ?? "—");
}

function avatarSrc(user) {
  return user.instagram?.profilePictureUrl ?? user.profilePicture ?? null;
}

function fmtFollowers(n) {
  if (!n && n !== 0) return <span className="text-gray-300">—</span>;
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center min-w-[200px] gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4  ">
        <div className="h-3 w-16 min-w-[172px] rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  ">
        <div className="h-3 w-16 min-w-[172px] rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  ">
        <div className="h-3 w-12 min-w-[172px] rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  ">
        <div className="h-3 w-24 min-w-[172px] rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  ">
        <div className="h-5 w-14 min-w-[172px] rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  ">
        <div className="h-5 w-20 min-w-[172px] rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-6 py-4  " />
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserTable({
  users: initialUsers,
  loading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [localUsers, setLocalUsers] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [saving, setSaving] = useState(false);
  const displayUsers = localUsers ?? initialUsers;

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((res) =>
        setCategories(Array.isArray(res) ? res : (res.categories ?? [])),
      )
      .catch(() => {});
    countriesApi
      .getCountries()
      .then((res) =>
        setCountries(Array.isArray(res) ? res : (res.countries ?? [])),
      )
      .catch(() => {});
  }, []);

  async function handleAction(action, user) {
    if (action === "View Profile") {
      navigate(`/dashboard/users/${user._id}`);
    } else if (action === "Approve User") {
      setApprovingId(user._id);
      try {
        const res = await usersApi.approveUser(user._id, token);
        console.log("APPROVED RES", res);
        setApprovingId(null);
        setLocalUsers((prev) =>
          (prev ?? initialUsers).map((u) =>
            u._id === user._id
              ? {
                  ...u,
                  instagramApproval: {
                    ...(u.instagramApproval ?? {}),
                    status: "approved",
                  },
                }
              : u,
          ),
        );
      } catch (err) {
        console.log("ERROR FROM APPROVAL", err);
        setApprovingId(null);
        alert(`Approve failed: ${err.message}`);
      } finally {
        setApprovingId(null);
      }
    } else if (action === "Defer User") {
      setApprovingId(user._id);
      try {
        const res = await usersApi.deferUser(user._id, token);
        console.log("DEFERRED RES", res);
        setApprovingId(null);
        setLocalUsers((prev) =>
          (prev ?? initialUsers).map((u) =>
            u._id === user._id
              ? {
                  ...u,
                  instagramApproval: {
                    ...(u.instagramApproval ?? {}),
                    status: "deferred",
                  },
                }
              : u,
          ),
        );
      } catch (err) {
        console.log("ERROR FROM APPROVAL", err);
        setApprovingId(null);
        alert(`Approve failed: ${err.message}`);
      } finally {
        setApprovingId(null);
      }
    } else if (action === "Edit User") {
      setEditUser(user);
      setEditCategory(
        Array.isArray(user.category)
          ? (user.category[0] ?? "")
          : (user.category ?? ""),
      );
      setEditCountry(user.country ?? "");
    } else if (action === "Suspend User") {
      setSuspendUser(user);
    } else if (action === "Delete User") {
      setConfirmDelete(user);
    }
  }

  async function saveEditUser() {
    if (!editUser || (!editCategory && !editCountry)) return;
    setSaving(true);
    try {
      await usersApi.updateUserCategory(
        editUser._id,
        {
          category: editCategory || undefined,
          country: editCountry || undefined,
        },
        token,
      );
      setLocalUsers((prev) =>
        (prev ?? initialUsers).map((u) =>
          u._id === editUser._id
            ? {
                ...u,
                ...(editCategory && { category: editCategory }),
                ...(editCountry && { country: editCountry }),
              }
            : u,
        ),
      );
      setEditUser(null);
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteUser() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await usersApi.deleteUser(confirmDelete._id, token);
      setLocalUsers((prev) =>
        (prev ?? initialUsers).filter((u) => u._id !== confirmDelete._id),
      );
      setConfirmDelete(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-t-2xl border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#DDDDDD] dark:bg-gray-800/50">
              <th className={`${COL} min-w-[200px] text-left`}>User</th>
              <th className={`${COL} min-w-[172px] text-center`}>Category</th>
              <th className={`${COL} min-w-[172px] text-center`}>Country</th>
              <th className={`${COL} min-w-[172px] text-center`}>Post</th>
              <th className={`${COL} min-w-[172px] text-center`}>Viewers</th>
              <th className={`${COL} min-w-[172px] text-center`}>Status</th>
              <th className={`${COL} min-w-[172px] text-center`}>
                Instagram Status
              </th>
              <th className={`${COL} min-w-[172px] text-center`}>Joined</th>
              <th className={`${COL} text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && displayUsers.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}

            {!loading &&
              displayUsers.map((user) => {
                const name = displayName(user);
                const src = avatarSrc(user);
                const status = user.instagramApproval?.status ?? "pending";
                const category = user.category;
                const instagram = user.instagram;
                console.log("status", status);

                const statusColor = {
                  approved: {
                    label: "Approved",
                    style: "bg-green-50 text-green-600",
                  },
                  pending: {
                    label: "Pending",
                    style: "bg-amber-50 text-amber-600",
                  },
                  rejected: {
                    label: "Rejected",
                    style: "bg-red-50 text-red-500",
                  },
                  connected: {
                    label: "Connected",
                    style: "bg-green-50 text-green-600",
                  },
                };
                return (
                  <tr
                    key={user._id}
                    className="border-b border-[#DDDDDD] dark:border-gray-800/50  hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/users/${user._id}`)}
                  >
                    {/* User */}
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={name.replace("@", "") || "U"}
                          src={src}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#3A3A3A] dark:text-gray-100">
                            {name}
                          </p>
                          <p className="text-xs text-[#3A3A3A] dark:text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* man is man but the authentic realization of man is education. hdfjh */}
                    {/* Category */}
                    <td className="px-6 py-4 font-medium min-w-[172px] text-center">
                      {category ? (
                        <span
                          className={`inline-flex items-center text-[#3A3A3A] dark:text-gray-400 rounded-full px-3 py-1 text-sm font-medium `}
                        >
                          {category}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-sm">
                          —
                        </span>
                      )}
                    </td>

                    {/* Country */}
                    <td className="px-6 py-4 text-sm text-[#3A3A3A] dark:text-gray-400 font-medium min-w-[172px] text-center">
                      {user.country || (
                        <span className="text-[#3A3A3A] dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* POST */}
                    <td className="px-6 py-4 text-sm text-[#3A3A3A] dark:text-gray-400 capitalize font-medium min-w-[172px] text-center">
                      {instagram.mediaCount || (
                        <span className="text-[#3A3A3A] dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Instagram link */}
                    <td
                      className="px-6 py-4 text-[#3A3A3A] font-medium text-sm min-w-[172px] text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.monthlyReach ? (
                        fmt(user.monthlyReach)
                      ) : (
                        <span className="text-[#3A3A3A] dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Approval status */}
                    <td className="px-6 py-4 font-medium min-w-[172px] text-center">
                      {approvingId === user._id ? (
                        <div
                          class="inline-block h-5 w-5 animate-spin rounded-full border-5 border-gray-200 border-t-[#3A3A3A]"
                          role="status"
                          aria-label="Loading"
                        ></div>
                      ) : (
                        <Badge
                          label={statusColor[status]?.label ?? status}
                          custom={`${statusColor[status]?.style ?? ""}`}
                        />
                      )}
                    </td>
                    {/* Instagram status */}
                    <td className="px-6 py-4 font-medium min-w-[172px] text-center">
                      <Badge
                        label={
                          statusColor[
                            user.instagram.connected ? "connected" : "pending"
                          ]?.label ?? status
                        }
                        custom={`${statusColor[user.instagram.connected ? "connected" : "pending"]?.style ?? ""}`}
                      />
                    </td>

                    {/* Connected */}
                    <td className="px-6 py-4 min-w-[172px] text-center">
                      {user.createdAt ? (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-6 py-4 text-right flex items-center justify-center gap-3 min-w-[172px] text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={user?.instagramApproval?.instagramAccountLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <InstagramIcon />
                      </Link>
                      <UserActions
                        approvalStatus={status}
                        onAction={(action) => handleAction(action, user)}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Edit User modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !saving && setEditUser(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-5">
            <button
              type="button"
              onClick={() => setEditUser(null)}
              className="absolute top-8 right-6"
            >
              <CloseIcon />
            </button>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Edit User
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {displayName(editUser)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c._id ?? c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Country
              </label>
              <select
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              >
                <option value="">Select a country…</option>
                {countries.map((c) => (
                  <option key={c._id ?? c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center mx-auto w-3/4 gap-3 mt-4">
              <button
                onClick={() => setEditUser(null)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEditUser}
                disabled={saving || (!editCategory && !editCountry)}
                className="flex-1 rounded-xl bg-[#2F3134] py-2.5 text-sm font-semibold text-white hover:bg-[#2F3134] transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-4">
            {/* Icon */}
            <div className="flex h-17.5 w-17.5 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
              <DeleteIcon />
            </div>
            <div className="text">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Delete User?
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {displayName(confirmDelete)}
                </span>{" "}
                will be permanently removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-3/4 mx-auto">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setSuspendUser(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-4">
            {/* Icon */}
            <div className="flex h-17.5 w-17.5 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
              <SuspendIcon />
            </div>
            <div className="text">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Suspend User?
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {displayName(suspendUser)}
                </span>{" "}
                will be suspended.
              </p>
            </div>
            <div className="flex gap-3 w-3/4 mx-auto">
              <button
                onClick={() => setSuspendUser(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60">
                {deleting ? "Suspending…" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
