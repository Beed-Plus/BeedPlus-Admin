import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { usersApi } from '../../../utils/usersApi'
import { emailApi } from '../../../utils/emailApi'
import ComposePanel from '../../../components/dashboard/email/ComposePanel'
import RecipientsTable from '../../../components/dashboard/email/RecipientsTable'

export default function EmailPage() {
  const { auth } = useAuth()
  const token = auth?.token

  // ── Users state ──────────────────────────────────────────────────────────
  const [users, setUsers]     = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingUsers(true)
    usersApi.getUsers({ page: 1, limit: 1000 }, token)
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res) ? res : (res.users ?? res.data ?? [])
        setUsers(list)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingUsers(false) })
    return () => { cancelled = true }
  }, [token])

  // Derive unique categories from users
  const categories = useMemo(() => {
    const set = new Set()
    users.forEach((u) => {
      const cats = Array.isArray(u.category) ? u.category : [u.category].filter(Boolean)
      cats.forEach((c) => set.add(c))
    })
    return [...set].sort()
  }, [users])

  // ── Compose state ─────────────────────────────────────────────────────────
  const [recipientMode, setRecipientMode] = useState('selected')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subject, setSubject]   = useState('')
  const [message, setMessage]   = useState('')
  const [selected, setSelected] = useState(new Set())

  // Compute actual recipient count based on current mode
  const recipientCount = useMemo(() => {
    if (recipientMode === 'selected') return selected.size
    if (recipientMode === 'all') return users.length
    if (recipientMode === 'approved') return users.filter((u) => u.instagramApproval?.status === 'approved').length
    if (recipientMode === 'pending') return users.filter((u) => u.instagramApproval?.status === 'pending').length
    if (recipientMode === 'category' && categoryFilter) {
      return users.filter((u) => {
        const cats = Array.isArray(u.category) ? u.category : [u.category].filter(Boolean)
        return cats.includes(categoryFilter)
      }).length
    }
    return 0
  }, [recipientMode, users, selected, categoryFilter])

  // ── Send state ────────────────────────────────────────────────────────────
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [sendError, setSendError] = useState(null)

  function handleToggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleToggleAll(list) {
    if (list.length === 0) {
      setSelected(new Set())
      return
    }
    const allSelected = list.every((u) => selected.has(u._id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) list.forEach((u) => next.delete(u._id))
      else list.forEach((u) => next.add(u._id))
      return next
    })
  }

  async function handleSend() {
    setSending(true)
    setSendError(null)
    try {
      await emailApi.sendBulkEmail(
        {
          recipientMode,
          category: categoryFilter || undefined,
          userIds: recipientMode === 'selected' ? [...selected] : undefined,
          subject,
          message,
        },
        token,
      )
      setSent(true)
      setSubject('')
      setMessage('')
      setSelected(new Set())
      setTimeout(() => setSent(false), 5000)
    } catch (err) {
      setSendError(err.message ?? 'Failed to send email')
      setTimeout(() => setSendError(null), 6000)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Fixed toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {sent && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-green-200 bg-white dark:bg-gray-900 dark:border-green-900 px-5 py-4 shadow-lg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Email sent!</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Your message was delivered successfully.</p>
            </div>
          </div>
        )}
        {sendError && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-red-200 bg-white dark:bg-gray-900 dark:border-red-900 px-5 py-4 shadow-lg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Failed to send</p>
              <p className="text-xs text-red-500 truncate max-w-xs">{sendError}</p>
            </div>
            <button
              onClick={() => setSendError(null)}
              className="ml-2 text-gray-300 hover:text-gray-500 transition shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Email Users</h1>
        <p className="mt-1 text-sm text-gray-400">
          Compose and send messages to users across the platform.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start flex-col lg:flex-row">
        {/* Left — compose */}
        <div className="w-full lg:w-1/2 shrink-0">
          <ComposePanel
            recipientMode={recipientMode}
            onRecipientModeChange={(val) => { setRecipientMode(val); setSelected(new Set()) }}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
            subject={subject}
            onSubjectChange={setSubject}
            message={message}
            onMessageChange={setMessage}
            recipientCount={recipientCount}
            onSend={handleSend}
            sending={sending}
          />
        </div>

        {/* Right — recipients */}
        <div className="w-full lg:w-1/2 overflow-x-auto">
          <RecipientsTable
            users={users}
            loading={loadingUsers}
            selected={selected}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
          />
        </div>
      </div>
    </div>
  )
}
