const RECIPIENT_OPTIONS = [
  { value: 'all',      label: 'All Users' },
  { value: 'approved', label: 'Approved Users Only' },
  { value: 'pending',  label: 'Pending Users Only' },
  { value: 'category', label: 'By Category' },
  { value: 'selected', label: 'Selected Users' },
]

export default function ComposePanel({
  recipientMode,
  onRecipientModeChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  recipientCount = 0,
  onSend,
  sending,
}) {
  const recipientLabel = recipientCount > 0
    ? `${recipientCount.toLocaleString()} user${recipientCount !== 1 ? 's' : ''}`
    : '—'

  const canSend =
    !sending &&
    subject.trim() &&
    message.trim() &&
    recipientCount > 0 &&
    !(recipientMode === 'category' && !categoryFilter)

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      {/* Panel header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Compose Message</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Fill in the details below</p>
        </div>
      </div>

      <hr className="border-gray-100 dark:border-gray-800" />

      {/* Send To */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Send To</label>
        <select
          value={recipientMode}
          onChange={(e) => onRecipientModeChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
        >
          {RECIPIENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Category sub-select */}
        {recipientMode === 'category' && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Selected users hint */}
        {recipientMode === 'selected' && recipientCount === 0 && (
          <p className="text-xs text-orange-400">Check users in the table on the right to add recipients.</p>
        )}
      </div>

      {/* Recipient preview chip */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-500/5 px-4 py-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 7a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
        <span className="text-xs text-gray-500 dark:text-gray-400">Recipients:</span>
        <span className="text-xs font-semibold text-orange-500">{recipientLabel}</span>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Subject</label>
        <input
          type="text"
          placeholder="Enter email subject…"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Message</label>
        <textarea
          rows={7}
          placeholder="Write your message here…"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
        />
        <p className="text-right text-xs text-gray-400 dark:text-gray-500">{message.length} characters</p>
      </div>

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={!canSend}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Email
          </>
        )}
      </button>
    </div>
  )
}
