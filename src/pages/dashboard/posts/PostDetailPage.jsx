import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { instagramApi } from '../../../utils/instagramApi'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import UserAvatar from '../../../components/dashboard/users/UserAvatar'

const CRUMBS = [
  { label: 'Posts', to: '/dashboard/posts' },
  { label: 'Post Details' },
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

const MEDIA_TYPE_CONFIG = {
  VIDEO:          { label: 'Video',    color: 'bg-blue-50 text-blue-500' },
  IMAGE:          { label: 'Image',    color: 'bg-green-50 text-green-600' },
  CAROUSEL_ALBUM: { label: 'Carousel', color: 'bg-purple-50 text-purple-500' },
  REELS:          { label: 'Reels',    color: 'bg-pink-50 text-pink-500' },
}

function MediaTypeBadge({ type }) {
  if (!type) return null
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconBg, icon: Icon }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  )
}

// ─── Insight Row ──────────────────────────────────────────────────────────────
function InsightRow({ label, value, color = 'text-gray-700' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{fmt(value)}</span>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ScoreIcon(p)   { return <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> }
function RankIcon(p)    { return <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
function ClickIcon(p)   { return <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg> }
function ViewsIcon(p)   { return <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-6 w-48 rounded bg-gray-100" />
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex gap-6">
          <div className="h-72 w-72 shrink-0 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-6 w-3/4 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuth()
  const token = auth?.token

  const [post, setPost]       = useState(location.state?.post ?? null)
  const [loading, setLoading] = useState(!location.state?.post)
  const [error, setError]     = useState(null)

  // Only fetch if we didn't receive post via navigation state
  useEffect(() => {
    if (post) return
    let cancelled = false
    setLoading(true)
    instagramApi.getAllSubmittedMediaForAdmin(token)
      .then((res) => {
        if (cancelled) return
        const all = Array.isArray(res) ? res : []
        const found = all.find((p) => p._id === id)
        if (found) setPost(found)
        else setError('Post not found')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load post')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, token, post])

  if (loading) return <PageSkeleton />

  if (error || !post) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb crumbs={CRUMBS} />
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center shadow-sm">
          <p className="text-sm text-red-500">{error ?? 'Post not found'}</p>
          <button onClick={() => navigate('/dashboard/posts')} className="mt-4 text-sm text-orange-500 hover:underline">
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  const caption     = post.media?.caption
  const mediaType   = post.media?.mediaType
  const thumbnailUrl = post.media?.thumbnailUrl ?? post.media?.mediaUrl
  const permalink   = post.media?.permalink
  const isVideo     = mediaType?.toUpperCase() === 'VIDEO' || mediaType?.toUpperCase() === 'REELS'
  const username    = post.instagramUsername || post.userData?.username
  const country     = post.userData?.country
  const profilePic  = post.userData?.profilePicture
  const cats        = Array.isArray(post.category) ? post.category : [post.category].filter(Boolean)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb crumbs={CRUMBS} />

      {/* Main card: thumbnail + details */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Thumbnail */}
          <div className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-gray-900 lg:w-72 aspect-square lg:aspect-auto lg:h-72">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Post thumbnail" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-4 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <MediaTypeBadge type={mediaType} />
              {cats.map((c) => (
                <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  {c}
                </span>
              ))}
            </div>

            {/* Caption */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Caption</p>
              <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100">
                {caption ?? <span className="text-gray-300 dark:text-gray-600 italic">No caption</span>}
              </p>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              <span>Submitted {fmtDate(post.createdAt)}</span>
              {post.media?.timestamp && <span>Posted {fmtDate(post.media.timestamp)}</span>}
              {post.media?.likeCount != null && <span>{fmt(post.media.likeCount)} likes</span>}
              {post.media?.commentsCount != null && <span>{fmt(post.media.commentsCount)} comments</span>}
            </div>

            {/* Permalink */}
            {permalink && (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Beed+ Score"  value={fmt(post.beedPlusScore)}           sub="Overall score"    iconBg="bg-orange-50"  icon={(p) => <ScoreIcon {...p} className="h-5 w-5 text-orange-500" />} />
        <StatCard label="Current Rank" value={post.currentRank ? `#${post.currentRank}` : '—'} sub="Overall ranking" iconBg="bg-violet-50"  icon={(p) => <RankIcon {...p} className="h-5 w-5 text-violet-500" />} />
        <StatCard label="Clicks"       value={fmt(post.clicks)}                  sub="Total clicks"     iconBg="bg-blue-50"    icon={(p) => <ClickIcon {...p} className="h-5 w-5 text-blue-500" />} />
        <StatCard label="Views"        value={fmt(post.insights?.views)}         sub="From insights"    iconBg="bg-teal-50"    icon={(p) => <ViewsIcon {...p} className="h-5 w-5 text-teal-500" />} />
      </div>

      {/* Insights + Creator row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Insights */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Insights</p>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8">
            <InsightRow label="Views"               value={post.insights?.views} />
            <InsightRow label="Reach"               value={post.insights?.reach} />
            <InsightRow label="Total Interactions"  value={post.insights?.totalInteractions} color="text-orange-500" />
            <InsightRow label="Shares"              value={post.insights?.shares} />
            <InsightRow label="Saved"               value={post.insights?.saved} />
            <InsightRow label="Category Rank"       value={post.categoryRank ? `#${post.categoryRank}` : null} />
          </div>
        </div>

        {/* Creator */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Creator</p>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={username || 'U'}
              src={profilePic ?? null}
              size="lg"
            />
            <div className="min-w-0">
              {username && (
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">@{username}</p>
              )}
              {country && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
              {post.userId && (
                <Link
                  to={`/dashboard/users/${post.userId}`}
                  className="mt-1 inline-block text-xs font-semibold text-orange-500 hover:text-orange-600 transition"
                >
                  View Profile →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/dashboard/posts')}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </button>
      </div>
    </div>
  )
}
