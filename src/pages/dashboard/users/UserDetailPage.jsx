import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../hooks/useAuth'
import { usersApi } from '../../../utils/usersApi'
import { instagramApi } from '../../../utils/instagramApi'
import UserAvatar from '../../../components/dashboard/users/UserAvatar'
import StatusBadge from '../../../components/ui/StatusBadge'
import Badge from '../../../components/ui/Badge'
import Breadcrumb from '../../../components/ui/Breadcrumb'

const CRUMBS = [
  { label: 'Users', to: '/dashboard/users' },
  { label: 'User Profile' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(str, max = 25) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

const MEDIA_TYPE_CONFIG = {
  VIDEO:           { label: 'Video',    color: 'bg-blue-50 text-blue-500' },
  IMAGE:           { label: 'Image',    color: 'bg-green-50 text-green-600' },
  CAROUSEL_ALBUM:  { label: 'Carousel', color: 'bg-purple-50 text-purple-500' },
}

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ─── Media Modal ──────────────────────────────────────────────────────────────
function MediaModal({ post, onClose }) {
  const overlayRef = useRef(null)

  // close on backdrop click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  // close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const categories = Array.isArray(post.category)
    ? post.category
    : [post.category].filter(Boolean)

  const caption     = post.media?.caption
  const thumbnailUrl = post.media?.thumbnailUrl
  const mediaType   = post.media?.mediaType
  const permalink   = post.media?.permalink
  const isVideo     = mediaType?.toUpperCase() === 'VIDEO'

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Media preview */}
        <div className="relative bg-gray-900 aspect-square">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Post thumbnail" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Video play overlay */}
          {isVideo && thumbnailUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Caption */}
          {caption && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{caption}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            <MediaTypeBadge type={mediaType} />
            {categories.map((c) => (
              <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{c}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-center">
              <p className="text-lg font-black text-orange-500">{post.currentRank ? `#${post.currentRank}` : '—'}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">Rank</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
              <p className="text-lg font-black text-gray-700 dark:text-gray-200">{fmt(post.insights?.views)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Views</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
              <p className="text-lg font-black text-gray-700 dark:text-gray-200">{fmt(post.insights?.totalInteractions)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Interactions</p>
            </div>
          </div>

          {/* Extended insights */}
          {post.insights && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Reach',  value: fmt(post.insights.reach) },
                { label: 'Shares', value: fmt(post.insights.shares) },
                { label: 'Saved',  value: fmt(post.insights.saved) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-gray-100 dark:border-gray-700 p-2.5 text-center">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* View on Instagram */}
          {permalink && (
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Instagram
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function displayName(user) {
  return user.instagram?.instagramUsername
    ? `@${user.instagram.instagramUsername}`
    : user.instagramUsername
    ? `@${user.instagramUsername}`
    : user.email ?? '—'
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent = 'bg-orange-50' }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="flex items-center gap-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm animate-pulse">
      <div className="h-16 w-16 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-56 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-8 w-24 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ScoreIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
const TrophyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)
const RankIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const FollowersIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const [user, setUser]             = useState(null)
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError]           = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [postsPage, setPostsPage]       = useState(1)
  const [approving, setApproving]       = useState(false)
  const [approveError, setApproveError] = useState(null)
  const POSTS_PER_PAGE = 5

  async function handleApprove() {
    setApproving(true)
    setApproveError(null)
    try {
      await usersApi.approveUser(id, token)
      setUser((prev) => prev ? {
        ...prev,
        instagramApproval: { ...prev.instagramApproval, status: 'approved' },
      } : prev)
    } catch (err) {
      setApproveError(err.message ?? 'Approval failed')
    } finally {
      setApproving(false)
    }
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function loadUser() {
      setLoading(true)
      setError(null)
      try {
        const res = await usersApi.getUserById(id, token)
        if (!cancelled) setUser(res?.user ?? null)
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load user')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function loadPosts() {
      setPostsLoading(true)
      try {
        const res = await instagramApi.getSubmittedMedia(id, token)
        if (!cancelled) {
          const arr = Array.isArray(res) ? res : (res?.media ?? [])
          setPosts(arr)
        }
      } catch {
        if (!cancelled) setPosts([])
      } finally {
        if (!cancelled) setPostsLoading(false)
      }
    }

    loadUser()
    loadPosts()
    return () => { cancelled = true }
  }, [id, token])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb crumbs={CRUMBS} />
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center shadow-sm">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={() => navigate('/dashboard/users')} className="mt-4 text-sm text-orange-500 hover:underline">
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  const name   = user ? displayName(user) : '—'
  const status = user?.instagramApproval?.status ?? 'pending'

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb crumbs={CRUMBS} />

      {/* Profile hero */}
      {loading ? <HeroSkeleton /> : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <UserAvatar
              name={name.replace('@', '') || 'U'}
              src={user?.instagram?.profilePictureUrl ?? null}
              size="xl"
            />

            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{name}</h2>
                <StatusBadge status={status} />
                {user?.category && <Badge label={user.category} variant="orange" />}
                {user?.role && (
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-500 dark:text-gray-400">
                    {user.role}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400">{user?.email}</p>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-400">
                {user?.country && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    {user.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {fmtDate(user?.createdAt)}
                </span>
                {user?.instagram?.connected && (
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Instagram connected
                  </span>
                )}
                {(user?.instagram?.instagramUsername || user?.instagramUsername) && (
                  <a
                    href={`https://www.instagram.com/${user.instagram?.instagramUsername ?? user.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-500 font-medium hover:text-pink-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    @{user.instagram?.instagramUsername ?? user.instagramUsername}
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {status !== 'approved' && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {approving ? (
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {approving ? 'Approving…' : 'Approve User'}
                </button>
              )}

              {approveError && (
                <p className="text-xs text-red-500">{approveError}</p>
              )}

              <button
                onClick={() => navigate('/dashboard/users')}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Beed+ Score"
              value={fmt(user?.beedPlusCreatorScore)}
              sub="Creator score"
              icon={ScoreIcon}
              accent="bg-orange-50"
            />
            <StatCard
              label="Monthly Score"
              value={fmt(user?.beedPlusMonthlyCreatorScore)}
              sub="30-day aggregate"
              icon={TrophyIcon}
              accent="bg-amber-50"
            />
            <StatCard
              label="Monthly Rank"
              value={user?.monthlyCreatorRank ? `#${user.monthlyCreatorRank}` : '—'}
              sub="Overall leaderboard"
              icon={RankIcon}
              accent="bg-violet-50"
            />
            <StatCard
              label="Followers"
              value={fmt(user?.instagram?.followersCount)}
              sub={user?.instagram?.followsCount != null ? `Following ${fmt(user.instagram.followsCount)}` : 'Instagram followers'}
              icon={FollowersIcon}
              accent="bg-blue-50"
            />
          </>
        )}
      </div>

      {/* Submitted Posts */}
      <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Submitted Posts</p>
            {!postsLoading && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {postsLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="h-7 w-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No submitted posts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Post</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Ranking</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Beed+ Score</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Submitted</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">View</th>
                </tr>
              </thead>
              <tbody>
                {posts.slice((postsPage - 1) * POSTS_PER_PAGE, postsPage * POSTS_PER_PAGE).map((post) => {
                  const categories = Array.isArray(post.category)
                    ? post.category
                    : [post.category].filter(Boolean)
                  return (
                    <tr
                      key={post._id ?? post.instagramMediaId}
                      className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Thumbnail + caption (max 25 chars) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.media?.thumbnailUrl ? (
                            <img src={post.media.thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300" title={post.media?.caption}>
                            {truncate(post.media?.caption)}
                          </p>
                        </div>
                      </td>
                      {/* Media type */}
                      <td className="px-6 py-4">
                        <MediaTypeBadge type={post.media?.mediaType} />
                      </td>
                      {/* Categories — grey pills */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {categories.length > 0
                            ? categories.map((c) => (
                                <span key={c} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{c}</span>
                              ))
                            : <span className="text-gray-300 text-sm">—</span>
                          }
                        </div>
                      </td>
                      {/* Ranking */}
                      <td className="px-6 py-4">
                        {post.currentRank != null ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">#</span>
                            {post.currentRank}
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      {/* Beed+ Score */}
                      <td className="px-6 py-4">
                        {post.beedPlusScore != null ? (
                          <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                            {fmt(post.beedPlusScore)}
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      {/* Submitted date */}
                      <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {fmtDate(post.createdAt)}
                      </td>
                      {/* View button → modal */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Posts pagination */}
        {!postsLoading && posts.length > POSTS_PER_PAGE && (() => {
          const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
          return (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-6 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {(postsPage - 1) * POSTS_PER_PAGE + 1}–{Math.min(postsPage * POSTS_PER_PAGE, posts.length)} of {posts.length} posts
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPostsPage((p) => Math.max(1, p - 1))}
                  disabled={postsPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPostsPage(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      p === postsPage
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPostsPage((p) => Math.min(totalPages, p + 1))}
                  disabled={postsPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Media preview modal */}
      {selectedPost && (
        <MediaModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  )
}
