import { useNavigate } from 'react-router-dom'
import PostThumbnail from './PostThumbnail'
import Pagination from '../../ui/Pagination'

const COL = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400'
const PAGE_SIZE = 15

const MEDIA_TYPE_CONFIG = {
  VIDEO:          { label: 'Video',    color: 'bg-blue-50 text-blue-500' },
  IMAGE:          { label: 'Image',    color: 'bg-green-50 text-green-600' },
  CAROUSEL_ALBUM: { label: 'Carousel', color: 'bg-purple-50 text-purple-500' },
  REELS:          { label: 'Reels',    color: 'bg-pink-50 text-pink-500' },
}

function MediaTypeBadge({ type }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>
  const cfg = MEDIA_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type, color: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function fmtScore(n) {
  if (!n && n !== 0) return <span className="text-gray-300">—</span>
  const val = n >= 1_000 ? `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k` : n.toLocaleString()
  return (
    <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
      {val}
    </span>
  )
}

function fmtRank(n) {
  if (!n) return <span className="text-gray-300">—</span>
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-gray-700">
      <span className="text-xs font-normal text-gray-400">#</span>{n}
    </span>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(str, max = 40) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
      <td className="px-6 py-4" />
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostTable({ posts, loading, currentPage, totalItems, onPageChange }) {
  const navigate = useNavigate()
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50">
              <th className={COL}>Post</th>
              <th className={COL}>Creator</th>
              <th className={COL}>Category</th>
              <th className={COL}>Beed+ Score</th>
              <th className={COL}>Rank</th>
              <th className={COL}>Submitted</th>
              <th className={`${COL} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  No posts found
                </td>
              </tr>
            )}

            {!loading && posts.map((post) => {
              const caption   = post.media?.caption
              const type      = post.media?.mediaType
              const thumb     = post.media?.thumbnailUrl ?? post.media?.mediaUrl
              const username  = post.instagramUsername || post.userData?.username
              const country   = post.userData?.country
              const cats      = Array.isArray(post.category) ? post.category : [post.category].filter(Boolean)

              return (
                <tr
                  key={post._id}
                  className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/posts/${post._id}`, { state: { post } })}
                >
                  {/* Post */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PostThumbnail src={thumb} color="#e5e7eb" alt={caption} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                          {truncate(caption)}
                        </p>
                        <div className="mt-0.5">
                          <MediaTypeBadge type={type} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-4">
                    {username ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">@{username}</p>
                        {country && <p className="text-xs text-gray-400 dark:text-gray-500">{country}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cats.length > 0
                        ? cats.map((c) => (
                            <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                              {c}
                            </span>
                          ))
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </div>
                  </td>

                  {/* Beed+ Score */}
                  <td className="px-6 py-4">{fmtScore(post.beedPlusScore)}</td>

                  {/* Rank */}
                  <td className="px-6 py-4">{fmtRank(post.currentRank)}</td>

                  {/* Submitted */}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{fmtDate(post.createdAt)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/dashboard/posts/${post._id}`, { state: { post } })}
                      className="rounded-lg bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition"
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

      <div className="border-t border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemLabel="posts"
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
