import { useState, useEffect, useRef, useCallback } from 'react'
import { instagramApi } from '../../../utils/instagramApi'

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString()
}

// ─── Right-side icon button ───────────────────────────────────────────────────
function RightBtn({ onClick, label, children, large = false, active = false }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`flex items-center justify-center rounded-full transition
        ${large ? 'h-14 w-14' : 'h-11 w-11'}
        ${active ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}>
        {children}
      </div>
      {label && <span className="text-[10px] text-white/60 group-hover:text-white/90 transition">{label}</span>}
    </button>
  )
}

// ─── Single reel slide — only the video + bottom info ────────────────────────
function ReelSlide({ item, rank, playing, muted, onTogglePlay, onEnded, setVideoEl }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={setVideoEl}
        src={item.media?.mediaUrl}
        playsInline
        muted={muted}
        onClick={onTogglePlay}
        onEnded={onEnded}
        className="h-full w-full object-cover sm:object-contain cursor-pointer"
      />

      {/* centre play overlay when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-black/40 p-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* bottom info — only visible when paused */}
      <div
        className="absolute bottom-0 inset-x-0 px-4 pb-6 pt-20 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          opacity: playing ? 0 : 1,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          {item.userData?.profilePicture && (
            <img src={item.userData.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate">
                @{item.userData?.username || item.media?.username || '—'}
              </p>
              <span className="shrink-0 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                #{rank}
              </span>
            </div>
            {item.userData?.country && (
              <p className="text-xs text-white/60">{item.userData.country}</p>
            )}
          </div>
        </div>
        {item.media?.caption && (
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{item.media.caption}</p>
        )}
        {(item.category ?? []).length > 0 && (
          <p className="mt-1 text-xs text-orange-300">{(item.category ?? []).join(' · ')}</p>
        )}
        {item.media?.permalink && (
          <a
            href={item.media.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-gray-900 hover:bg-white/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Instagram
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Full-screen reel player ───────────────────────────────────────────────────
function ReelPlayer({ items, startIndex, onClose, onLoadMore, loadingMore }) {
  const [currentIdx, setCurrentIdx] = useState(startIndex)
  const [playing, setPlaying]       = useState(false)
  const [muted, setMuted]           = useState(true)
  const slideRefs = useRef([])
  const videoRefs = useRef([])

  // helpers
  const currentVideo = () => videoRefs.current[currentIdx]
  function goTo(idx) {
    slideRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function goPrev() { goTo(currentIdx - 1) }
  function goNext() { goTo(currentIdx + 1) }

  function togglePlay() {
    const v = currentVideo()
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  function toggleMute() {
    const v = currentVideo()
    setMuted((m) => {
      if (v) v.muted = !m
      return !m
    })
  }

  // when currentIdx changes: pause old, play new, update preload window
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      // preload current + next 2, drop everything else
      v.preload = i >= currentIdx && i <= currentIdx + 2 ? 'auto' : 'none'
      if (i !== currentIdx) { v.pause(); v.currentTime = 0 }
    })
    const v = videoRefs.current[currentIdx]
    if (v) {
      v.muted = muted
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [currentIdx])

  // scroll to start slide instantly on open
  useEffect(() => {
    slideRefs.current[startIndex]?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  // IntersectionObserver — detect current slide + trigger load-more near end
  useEffect(() => {
    const observers = []
    slideRefs.current.forEach((el, idx) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentIdx(idx)
            if (onLoadMore && idx >= items.length - 3) onLoadMore()
          }
        },
        { threshold: 0.6 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [items.length])

  // keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')                            onClose()
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIdx])

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const item = items[currentIdx]

  return (
    <div className="fixed inset-0 z-50 bg-black">

      {/* ── fixed top bar ── */}
      <div className="fixed top-0 inset-x-0 z-20 flex items-center justify-end gap-2 px-4 py-3">
        {loadingMore && (
          <svg className="h-5 w-5 animate-spin text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── fixed right-side controls ── */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">

        <RightBtn onClick={goPrev} label="Prev">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </RightBtn>

        <RightBtn onClick={togglePlay} large active={!playing}>
          {playing ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </RightBtn>

        <RightBtn onClick={goNext} label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </RightBtn>

        <div className="w-8 h-px bg-white/20" />

        <RightBtn onClick={toggleMute} label={muted ? 'Unmute' : 'Mute'}>
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </RightBtn>

      </div>

      {/* ── scrollable video list ── */}
      <div
        className="h-full w-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <div
            key={item._id ?? item.instagramMediaId ?? idx}
            ref={(el) => { slideRefs.current[idx] = el }}
            style={{ scrollSnapAlign: 'start', height: '100dvh' }}
          >
            <ReelSlide
              item={item}
              rank={item.currentRank ?? idx + 1}
              playing={idx === currentIdx ? playing : false}
              muted={muted}
              onTogglePlay={togglePlay}
              onEnded={goNext}
              setVideoEl={(el) => {
                videoRefs.current[idx] = el
                if (el) el.preload = idx >= startIndex && idx <= startIndex + 2 ? 'auto' : 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grid thumbnail ────────────────────────────────────────────────────────────
function VideoTile({ item, rank, onClick }) {
  const thumb = item.media?.thumbnailUrl || item.media?.mediaUrl
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef(null)

  function handleMouseEnter() {
    setHovered(true)
    videoRef.current?.play().catch(() => {})
  }
  function handleMouseLeave() {
    setHovered(false)
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 }
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      {thumb && (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hovered ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      <video
        ref={videoRef}
        src={item.media?.mediaUrl}
        muted
        loop
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
      />

      <span className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">
        #{rank}
      </span>

      {!hovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <p className="truncate text-xs font-semibold text-white">
          @{item.userData?.username || item.media?.username || '—'}
        </p>
        <p className="text-[10px] text-white/70">
          {fmt(item.insights?.lifeTimeViews ?? item.insights?.views)} views
        </p>
      </div>
    </button>
  )
}

const LIMIT = 20

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function WatchPage() {
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]         = useState(null)
  const [hasMore, setHasMore]     = useState(false)
  const [page, setPage]           = useState(1)
  const [activeIdx, setActiveIdx] = useState(null)
  const [filterCategory, setCategory] = useState('')
  const [filterCountry, setCountry]   = useState('')
  const sentinelRef = useRef(null)

  async function fetchPage(pageNum, replace = false) {
    try {
      const res = await instagramApi.getWatchFeed({ page: pageNum, limit: LIMIT })
      const items = (res.items ?? []).filter((p) => p.media?.mediaUrl)
      setPosts((prev) => replace ? items : [...prev, ...items])
      setHasMore(res.pagination?.hasMore ?? false)
    } catch (err) {
      if (replace) setError(err.message ?? 'Failed to load')
    }
  }

  // initial load
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPage(1)
    fetchPage(1, true).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // infinite scroll — observe sentinel at bottom of grid
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          setLoadingMore(true)
          const next = page + 1
          setPage(next)
          fetchPage(next).finally(() => setLoadingMore(false))
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page])

  const categories = [...new Set(posts.flatMap((p) => p.category ?? []).filter(Boolean))]
  const countries  = [...new Set(posts.map((p) => p.userData?.country).filter(Boolean))]

  const filtered = posts.filter((p) => {
    if (filterCategory && !(p.category ?? []).includes(filterCategory)) return false
    if (filterCountry  && p.userData?.country !== filterCountry) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Watch</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterCountry}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          >
            <option value="">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* initial skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-16 text-center">
          <p className="text-sm text-gray-400">No videos found</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((item, i) => (
              <VideoTile
                key={item._id ?? item.instagramMediaId ?? i}
                item={item}
                rank={item.currentRank ?? i + 1}
                onClick={() => setActiveIdx(i)}
              />
            ))}
          </div>

          {/* sentinel + load-more skeleton */}
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          )}
        </>
      )}

      {activeIdx !== null && (
        <ReelPlayer
          items={filtered}
          startIndex={activeIdx}
          loadingMore={loadingMore}
          onClose={() => setActiveIdx(null)}
          onLoadMore={() => {
            if (!hasMore || loadingMore) return
            setLoadingMore(true)
            const next = page + 1
            setPage(next)
            fetchPage(next).finally(() => setLoadingMore(false))
          }}
        />
      )}
    </div>
  )
}
