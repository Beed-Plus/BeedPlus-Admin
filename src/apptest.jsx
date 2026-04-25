import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
  3 PERSISTENT PLAYER FEED ENGINE
  React + Tailwind

  CORE IDEA:
  - 100 scroll slides (stable UI)
  - ONLY 3 real video elements:
      prev / current / next
  - players reused, not remounted
  - smoother Safari behavior

  Replace DEMO urls with your real data
*/

const TOTAL = 100;

const videos = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  rank: i + 1,
  title: Video #${i + 1},
  url: "https://www.w3schools.com/html/mov_bbb.mp4",
}));

export default function CriueFeed() {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(55);

  return (
    <div className="min-h-screen bg-black text-white">
      {!open ? (
        <Chart
          onOpen={(index) => {
            setStartIndex(index);
            setOpen(true);
          }}
        />
      ) : (
        <Viewer
          startIndex={startIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* -------------------------- */
/* CHART */
/* -------------------------- */

function Chart({ onOpen }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        Top 100 Videos
      </h1>

      <div className="space-y-3">
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => onOpen(index)}
            className="w-full rounded-xl bg-zinc-900 px-4 py-4 flex justify-between"
          >
            <span>#{video.rank}</span>
            <span>{video.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- */
/* VIEWER */
/* -------------------------- */

function Viewer({ startIndex, onClose }) {
  const containerRef = useRef(null);

  const prevRef = useRef(null);
  const currentRef = useRef(null);
  const nextRef = useRef(null);

  const [activeIndex, setActiveIndex] =
    useState(startIndex);

  const scrollTimer = useRef(null);

  /* -------------------------- */
  /* Assign sources to 3 players */
  /* -------------------------- */

  const prevVideo =
    activeIndex > 0
      ? videos[activeIndex - 1]
      : null;

  const currentVideo =
    videos[activeIndex];

  const nextVideo =
    activeIndex < TOTAL - 1
      ? videos[activeIndex + 1]
      : null;

  useEffect(() => {
    bindSource(prevRef.current, prevVideo?.url);
    bindSource(
      currentRef.current,
      currentVideo?.url
    );
    bindSource(nextRef.current, nextVideo?.url);

    playCurrent();
  }, [activeIndex]);

  const bindSource = (el, src) => {
    if (!el || !src) return;

    if (el.dataset.src === src) return;

    el.pause();
    el.src = src;
    el.load();

    el.dataset.src = src;
  };

  const playCurrent = async () => {
    try {
      prevRef.current?.pause();
      nextRef.current?.pause();

      await currentRef.current?.play();
    } catch {}
  };

  /* -------------------------- */
  /* Start at clicked rank */
  /* -------------------------- */

  useEffect(() => {
    requestAnimationFrame(() => {
      const target =
        document.getElementById(
          slide-${startIndex}
        );

      target?.scrollIntoView({
        block: "start",
      });
    });
  }, []);

  /* -------------------------- */
  /* Scroll settles -> update index once */
  /* -------------------------- */

  const onScroll = () => {
    clearTimeout(scrollTimer.current);

    scrollTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;

      const index = Math.round(
        el.scrollTop /
          window.innerHeight
      );

      if (
        index !== activeIndex &&
        index >= 0 &&
        index < TOTAL
      ) {
        setActiveIndex(index);
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* top controls */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 bg-white/20 px-4 py-2 rounded-lg"
      >
        Back
      </button>

      <div className="absolute top-4 right-4 z-50 bg-white/20 px-4 py-2 rounded-lg">
        #{activeIndex + 1}
      </div>

      {/* Hidden persistent players */}
      <video
        ref={prevRef}
        muted
        playsInline
        preload="metadata"
        className="hidden"
      />

      <video
        ref={currentRef}
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      <video
        ref={nextRef}
        muted
        playsInline
        preload="metadata"
        className="hidden"
      />

      {/* Stable 100-slide feed */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {videos.map((video, index) => (
          <section
            key={video.id}
            id={slide-${index}}
            className="h-screen snap-start relative bg-black"
          >
            {/* Only active slide displays current player */}
            {index === activeIndex ? (
              <VideoPortal
                sourceRef={currentRef}
              />
            ) : (
              <div className="h-full w-full bg-zinc-900" />
            )}

            <div className="absolute bottom-8 left-4">
              <p className="text-2xl font-bold">
                #{video.rank}
              </p>
              <p>{video.title}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- */
/* Move persistent player into active slide */
/* -------------------------- */

function VideoPortal({ sourceRef }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const video = sourceRef.current;

    if (!host || !video) return;

    host.appendChild(video);

    video.className =
      "h-full w-full object-cover block";

    return () => {};
  }, [sourceRef]);

  return (
    <div
      ref={hostRef}
      className="h-full w-full"
    />
  );
}