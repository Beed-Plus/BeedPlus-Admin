import { useState, useRef, useEffect } from "react";
import CustomButton from "../CustomButton";
import { ChevronDownIcon } from "../icons";

interface SelectSearchInterface {
  onChange: (val: any) => void;
  value: string;
  placeholder?: string;
  onNoResult?: (val: string) => void;
  label?: string;
  showEmptyButton?: boolean;
  items: any[];
  disabled?: boolean;
}

export default function SelectSearch({
  onChange,
  onNoResult,
  disabled,
  placeholder,
  showEmptyButton = false,
  items,
  label,
  value,
}: SelectSearchInterface) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = items?.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (item: any) => {
    setQuery("");
    setOpen(false);
    onChange?.(item);
  };

  const handleClear = (e: any) => {
    e.stopPropagation();
    onChange?.("");
    setQuery("");
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: any) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full max-w-md relative" ref={containerRef}>
      {label && (
        <p className="font-medium text-[16px] py-1">
          {label}
        </p>
      )}
      {/* Input row */}
      <div
        className={`flex items-center bg-[#FFF] border border-[#D5D5D5] px-4 h-10 rounded-md transition-colors duration-200 cursor-text
            ${open ? "ring-2 ring-[#D5D5D5]" : ""}`}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={open || !value ? query : ""}
          placeholder={value ? "" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          className={`
              flex-1 bg-transparent py-3 text-sm outline-none placeholder-gray-500/60 text-black text-[16px]
            `}
          disabled={disabled}
        />
        {/* Selected label overlay */}
        {value && !open && (
          <span className="absolute text-sm text-black pointer-events-none pl-0">
            {value}
          </span>
        )}
        <div className="flex items-center gap-1 pl-2">
          {value && (
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          <ChevronDownIcon />
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute w-[100%] bg-white z-10 mt-1 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 pt-3">
              <p className="text-sm text-center pb-2">No results found</p>
              {showEmptyButton && (
                <CustomButton
                  text="Create new sub-category"
                  onClick={
                    onNoResult
                      ? () => {
                          onNoResult(query);
                          handleSelect(query);
                          setQuery("");
                          setOpen(false);
                        }
                      : () => {}
                  }
                />
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item}
                onMouseDown={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100
                    ${
                      value === item
                        ? "bg-zinc-700 text-white font-medium"
                        : "hover:bg-zinc-800 hover:text-white"
                    }`}
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
