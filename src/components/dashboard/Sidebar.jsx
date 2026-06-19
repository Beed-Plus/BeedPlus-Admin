import { NavLink, useLocation, useNavigate, useMatch } from "react-router-dom";
import { useState, useEffect } from "react";
import navConfig from "./navConfig";
import BeedLogo from "../auth/BeedLogo";
import { useAuth } from "../../hooks/useAuth";

const STATUS_COLORS = {
  all: "bg-gray-400",
  approved: "bg-emerald-400",
  pending: "bg-amber-400",
  rejected: "bg-red-400",
};

function NavItem({ label, path, icon: Icon, collapsed, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = children?.length > 0;
  const isChildActive =
    hasChildren && children.some((c) => location.pathname.startsWith(c.path));
  const isParentExact = location.pathname === path;
  const [open, setOpen] = useState(() => isChildActive || isParentExact);

  useEffect(() => {
    if (!isChildActive && !isParentExact) setOpen(false);
  }, [location.pathname]);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => {
            navigate(path);
            setOpen((o) => !o);
          }}
          title={collapsed ? label : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          } ${
            isChildActive || isParentExact || open
              ? "bg-[#2F3134] dark:bg-orange-500/10 text-[#F8FAFC]"
              : "text-[#3A3A3A] dark:text-gray-400 hover:bg-[#2F3134] dark:hover:bg-gray-800 hover:text-[#F8FAFC] dark:hover:text-gray-100"
          }`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span
            className={`flex-1 truncate text-left transition-all ${collapsed ? "lg:hidden" : ""}`}
          >
            {label}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${collapsed ? "lg:hidden" : ""}`}
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
        </button>

        {open && (
          <div className={`mt-0.5 pl-4 ${collapsed ? "lg:hidden" : ""}`}>
            <div className="relative">
              <div className="absolute left-0 top-1 bottom-1 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col gap-0.5 pl-3">
                {children.map((child) => {
                  const dot =
                    STATUS_COLORS[child.label.toLowerCase()] ?? "bg-gray-400";
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#2F3134] dark:bg-orange-500/10 text-[#F8FAFC]"
                            : "text-[#3A3A3A] dark:text-gray-400 hover:bg-[#2F3134] dark:hover:bg-gray-800 hover:text-[#F8FAFC] dark:hover:text-gray-100"
                        }`
                      }
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${dot}`}
                      />
                      {child.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      end
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          collapsed ? "lg:justify-center lg:px-0" : ""
        } ${
          isActive
            ? "bg-[#2F3134] dark:bg-orange-500/10 text-[#F8FAFC]"
            : "text-[#3A3A3A] dark:text-gray-400 hover:bg-[#2F3134] dark:hover:bg-gray-800 hover:text-[#F8FAFC] dark:hover:text-gray-100"
        }`
      }
    >
      <Icon className="h-6 w-6" />
      <span
        className={`truncate transition-all block pb-1 ${collapsed ? "lg:hidden" : ""}`}
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  dark,
  onThemeToggle,
}) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }
  const user = auth?.user;
  const displayName = user?.name ?? user?.username ?? user?.email ?? "Admin";
  const role = user?.role ?? "Admin";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-gray-100 dark:border-gray-800 bg-light-hover shadow-2xl shadow-[#0000001A] dark:bg-gray-900 py-6 transition-all duration-300
          lg:relative lg:z-auto lg:translate-x-0 rounded-br-4xl rounded-tr-4xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-[72px] lg:px-2 w-60 px-4" : "w-60 px-4"}
        `}
      >
        {/* Logo row */}
        <div className="mb-8 flex items-center justify-between px-1">
          {/* Full logo — always on mobile, hidden on desktop when collapsed */}
          <div className={collapsed ? "lg:hidden" : ""}>
            <BeedLogo />
          </div>

          {/* Mini logo — desktop collapsed only */}
          {collapsed && (
            <div className="hidden lg:flex mx-auto items-center justify-center">
              <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                B<span className="text-red-500">+</span>
              </span>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className={`hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition ${
              collapsed ? "mx-auto" : "ml-auto"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto hide-scrollbar">
          {navConfig.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {/* Section label — hidden when collapsed on desktop */}
              {group.section && (
                <p
                  className={`mb-1 px-3 text-base font-normal uppercase text-[#00000080] ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.section}
                </p>
              )}
              {/* Divider shown in place of label when collapsed on desktop */}
              {group.section && collapsed && (
                <div className="hidden lg:block mb-1 mx-2 h-px bg-[#3A3A3A] dark:bg-gray-800" />
              )}
              {group.items.map((item) => (
                <NavItem key={item.path} {...item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* Theme toggle */}


        {/* User profile + logout */}
        <div
          className={`mt-2 flex items-center rounded-xl px-3 py-2 transition-all ${collapsed ? "lg:justify-center lg:px-0" : "gap-3"}`}
          title={collapsed ? displayName : undefined}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-400 text-sm font-bold text-white">
            {initials}
          </div>
          <div
            className={`min-w-0 flex-1 transition-all ${collapsed ? "lg:hidden" : ""}`}
          >
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-400 capitalize">
              {role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition ${collapsed ? "lg:hidden" : ""}`}
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
