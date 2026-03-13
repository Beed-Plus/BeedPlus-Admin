export default function TopPostCard({ post }) {
  const username   = post.userData?.username ?? post.username ?? '—'
  const caption    = post.caption ?? ''
  const category   = Array.isArray(post.category) ? post.category[0] : (post.category ?? '')
  const thumbnail  = post.thumbnailUrl || post.media_url
  const permalink  = post.permalink ?? post.media?.permalink

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-100 dark:border-orange-500/20 bg-white dark:bg-gray-900 shadow-sm">
      {/* Subtle orange glow strip at top */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Thumbnail — left panel */}
        <div className="relative sm:w-52 shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Top post"
              className="h-52 w-full sm:h-full object-cover"
            />
          ) : (
            <div className="h-52 sm:h-full w-full bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Rank badge overlay */}
          <div className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-md text-xs font-black text-white">
            1
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
          <div className="flex flex-col gap-3">
            {/* Label + category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Top Post of the Week
              </span>
              {category && (
                <span className="rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  {category}
                </span>
              )}
            </div>

            {/* Caption */}
            <p className="text-lg font-black text-gray-900 dark:text-white leading-snug line-clamp-3">
              {caption || 'No caption'}
            </p>

            {/* Creator */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/15 text-[11px] font-bold text-orange-500">
                {(username[0] ?? 'U').toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">@{username}</span>
            </div>
          </div>

          {/* Bottom row: score + link */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            {post.weeklyBeedPlusScore != null && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Weekly Beed+ Score</p>
                <p className="text-3xl font-black text-orange-500 leading-none">
                  {post.weeklyBeedPlusScore.toLocaleString()}
                </p>
              </div>
            )}
            {permalink && (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-orange-300 hover:text-orange-500 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition"
              >
                View on Instagram
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
