import { useState, useEffect, useRef } from "react";

interface TooltipInterface {
    content?: string;
    title?: string; 
}


export function Tooltip({ content, title } : TooltipInterface) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ vertical: "top", horizontal: "center" });
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: any) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalculate position whenever tooltip opens
  useEffect(() => {
    if (!open || !btnRef.current || !tipRef.current) return;

    const btn = btnRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    //const vh = window.innerHeight;
    const margin = 8;

    // Vertical: prefer top, fall back to bottom
    const vertical = btn.top - tip.height - margin < 0 ? "bottom" : "top";

    // Horizontal: prefer center, nudge left or right if clipping
    const centeredLeft = btn.left + btn.width / 2 - tip.width / 2;
    let horizontal = "center";
    if (centeredLeft < margin) horizontal = "left";
    else if (centeredLeft + tip.width > vw - margin) horizontal = "right";

    setPos({ vertical, horizontal });
  }, [open]);

  const verticalClasses =
    pos.vertical === "top" ? "bottom-full mb-2" : "top-full mt-2";

  const horizontalClasses =
    pos.horizontal === "center"
      ? "left-1/2 -translate-x-1/2"
      : pos.horizontal === "left"
      ? "left-0"
      : "right-0";

  const caretClasses =
    pos.vertical === "top"
      ? "top-full border-t-neutral-200 border-x-transparent border-b-transparent"
      : "bottom-full border-b-neutral-200 border-x-transparent border-t-transparent";

  const caretHorizontal =
    pos.horizontal === "center"
      ? "left-1/2 -translate-x-1/2"
      : pos.horizontal === "left"
      ? "left-3"
      : "right-3";

  return (
    <div ref={wrapRef} className="relative inline-flex items-center">
      <button
        ref={btnRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className={`w-[18px] h-[18px] rounded-full border text-[11px] font-medium
          inline-flex items-center justify-center shrink-0 outline-none cursor-pointer
          transition-colors duration-150
          ${open
            ? "border-blue-300 bg-blue-50 text-blue-600"
            : "border-neutral-300 bg-neutral-100 text-neutral-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          }`}
      >
        i
      </button>

      <div
        ref={tipRef}
        className={`absolute z-50 w-52 bg-white border border-neutral-200 rounded-xl
          px-3 py-2.5 shadow-sm transition-all duration-150
          ${verticalClasses} ${horizontalClasses}
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : pos.vertical === "top"
            ? "opacity-0 translate-y-1 pointer-events-none"
            : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
      >
        {title && (
          <p className="text-[13px] text-left font-medium text-neutral-800 mb-0.5">{title}</p>
        )}
        <p className="text-[13px] leading-relaxed text-left text-neutral-500">{content}</p>

        {/* Caret */}
        <span
          className={`absolute border-[5px] ${caretClasses} ${caretHorizontal}`}
        />
      </div>
    </div>
  );
}