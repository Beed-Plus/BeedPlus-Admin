import { useState } from 'react'

const ADMIN = {
  name: 'Alex Rivera',
  email: 'alex.rivera@beedplus.com',
  phone: '+1 (555) 012-3456',
  role: 'Super Admin',
  bio: 'Responsible for overseeing platform operations, managing users, and ensuring content quality across Beed+.',
  joinDate: 'January 12, 2024',
  lastLogin: 'March 12, 2026 · 09:14 AM',
  initials: 'AR',
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition'

export default function AdminPage() {
  // Profile form
  const [name, setName]   = useState(ADMIN.name)
  const [email, setEmail] = useState(ADMIN.email)
  const [phone, setPhone] = useState(ADMIN.phone)
  const [bio, setBio]     = useState(ADMIN.bio)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError]     = useState('')
  const [pwSaved, setPwSaved]     = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState({
    newUser:      true,
    postSubmitted: true,
    flaggedContent: true,
    weeklyReport: false,
    systemAlerts: true,
  })

  function handleProfileSave(e) {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  function handlePasswordSave(e) {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwSaved(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  function toggleNotif(key) {
    setNotifs((p) => ({ ...p, [key]: !p[key] }))
  }

  const NOTIF_ITEMS = [
    { key: 'newUser',        label: 'New user registration',   sub: 'Alert when a new user joins the platform' },
    { key: 'postSubmitted',  label: 'Post submitted',          sub: 'Alert when a creator submits a new post' },
    { key: 'flaggedContent', label: 'Flagged content',         sub: 'Alert when content is flagged for review' },
    { key: 'weeklyReport',   label: 'Weekly summary report',   sub: 'Receive a weekly digest of platform activity' },
    { key: 'systemAlerts',   label: 'System alerts',           sub: 'Critical notifications about system health' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Manage your account, security, and preferences.</p>
      </div>

      {/* Profile hero card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-400 text-2xl font-black text-white">
          {ADMIN.initials}
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{ADMIN.name}</h2>
            <span className="inline-flex self-center items-center rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-500">
              {ADMIN.role}
            </span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{ADMIN.email}</p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Joined {ADMIN.joinDate}
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last login: {ADMIN.lastLogin}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — Edit Profile */}
        <SectionCard title="Edit Profile" subtitle="Update your personal information">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <Field label="Full Name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Email Address">
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            </Field>
            <Field label="Phone Number">
              <input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            </Field>
            <Field label="Bio">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio…"
              />
            </Field>
            <div className="flex items-center justify-between pt-1">
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changes saved
                </span>
              )}
              <button
                type="submit"
                className="ml-auto rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Right — Security + Notifications */}
        <div className="flex flex-col gap-6">
          {/* Security */}
          <SectionCard title="Security" subtitle="Change your admin password">
            <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
              <Field label="Current Password">
                <input className={inputCls} type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="New Password">
                <input className={inputCls} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
              </Field>
              <Field label="Confirm New Password">
                <input className={inputCls} type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
              </Field>
              {pwError && <p className="text-xs font-medium text-red-500">{pwError}</p>}
              <div className="flex items-center justify-between pt-1">
                {pwSaved && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Password updated
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!currentPw || !newPw || !confirmPw}
                  className="ml-auto rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" subtitle="Choose which alerts you receive">
            <ul className="flex flex-col divide-y divide-gray-50">
              {NOTIF_ITEMS.map(({ key, label, sub }) => (
                <li key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                  </div>
                  <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
