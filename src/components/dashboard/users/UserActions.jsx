import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function UserActions({ onAction, approvalStatus }) {
  const isApproved = approvalStatus === "approved";

  const DROPDOWN_ACTIONS = [
    "View Profile",
    "Edit User",
    ...(!isApproved ? ["Approve User"] : []),
    ...(isApproved ? ["Suspend User"] : []),
    "Delete User",
    ...(isApproved ? [] : ["Defer User"]),
  ];

  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function close(e) {
      const insideBtn = btnRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideBtn && !insideDropdown) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function toggle(e) {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((p) => !p);
  }

  return (
    <div className="inline-flex items-center justify-end">
      {/* More actions dropdown */}
      <div ref={btnRef} className="inline-block">
        <button
          type="button"
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6.75C11.8011 6.75 11.6103 6.67098 11.4697 6.53033C11.329 6.38968 11.25 6.19891 11.25 6C11.25 5.80109 11.329 5.61032 11.4697 5.46967C11.6103 5.32902 11.8011 5.25 12 5.25C12.1989 5.25 12.3897 5.32902 12.5303 5.46967C12.671 5.61032 12.75 5.80109 12.75 6C12.75 6.19891 12.671 6.38968 12.5303 6.53033C12.3897 6.67098 12.1989 6.75 12 6.75ZM12 12.75C11.8011 12.75 11.6103 12.671 11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12C11.25 11.8011 11.329 11.6103 11.4697 11.4697C11.6103 11.329 11.8011 11.25 12 11.25C12.1989 11.25 12.3897 11.329 12.5303 11.4697C12.671 11.6103 12.75 11.8011 12.75 12C12.75 12.1989 12.671 12.3897 12.5303 12.5303C12.3897 12.671 12.1989 12.75 12 12.75ZM12 18.75C11.8011 18.75 11.6103 18.671 11.4697 18.5303C11.329 18.3897 11.25 18.1989 11.25 18C11.25 17.8011 11.329 17.6103 11.4697 17.4697C11.6103 17.329 11.8011 17.25 12 17.25C12.1989 17.25 12.3897 17.329 12.5303 17.4697C12.671 17.6103 12.75 17.8011 12.75 18C12.75 18.1989 12.671 18.3897 12.5303 18.5303C12.3897 18.671 12.1989 18.75 12 18.75Z"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open &&
          createPortal(
            <div
              ref={dropdownRef}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: dropPos.top,
                right: dropPos.right,
                zIndex: 9999,
              }}
              className="w-40 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-1 shadow-lg"
            >
              {DROPDOWN_ACTIONS.map((action) => (
                <button
                  type="button"
                  key={action}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(action);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 medium`}
                >
                  {action}
                </button>
              ))}
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
