import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function UserActions({ onAction, approvalStatus, isInvited }) {
  const isApproved = approvalStatus === 'approved'

  const DROPDOWN_ACTIONS = [
    'View Profile',
    'Edit User',
    ...(!isApproved ? ['Approve User'] : []),
    ...(isApproved  ? ['Suspend User'] : []),
    ...(!isInvited  ? ['Mark as Invited'] : []),
    'Delete User',
  ]

  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })
  const btnRef      = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function close(e) {
      const insideBtn      = btnRef.current?.contains(e.target)
      const insideDropdown = dropdownRef.current?.contains(e.target)
      if (!insideBtn && !insideDropdown) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function toggle() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({
        top:   rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((p) => !p)
  }

  return (
    <div className="inline-flex items-center justify-end">
      {/* More actions dropdown */}
      <div ref={btnRef} className="inline-block">
        <button
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {open && createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
            className="w-40 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-1 shadow-lg"
          >
            {DROPDOWN_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => { onAction?.(action); setOpen(false) }}
                className={`w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  action === 'Delete User'      ? 'text-red-500' :
                  action === 'Approve User'     ? 'text-green-600 dark:text-green-400 font-medium' :
                  action === 'Suspend User'     ? 'text-amber-500 dark:text-amber-400' :
                  action === 'Edit User'        ? 'text-blue-600 dark:text-blue-400' :
                  action === 'Mark as Invited'  ? 'text-purple-600 dark:text-purple-400 font-medium' :
                  'text-gray-700 dark:text-gray-200'
                }`}
              >
                {action}
              </button>
            ))}
          </div>,
          document.body,
        )}
      </div>
    </div>
  )
}
