import { useState, useRef, useEffect } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "../icons";

interface CDIInterface extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  value: string;
  placeholder?: string;
  errormsg?: string;
  description?: string;
  items?: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function CustomDropDownInput(props: CDIInterface) {
  const {
    label,
    value,
    placeholder,
    errormsg,
    description,
    items,
    onChange,
    name,
  } = props;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = items?.find((i) => i.value === value)?.label;

  // Simulate a native onChange event so existing form logic stays compatible
  const handleSelect = (itemValue: string) => {
    if (onChange) {
      const nativeEvent = {
        target: { value: itemValue, name: name ?? "" },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(nativeEvent);
    }
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="my-4 relative" ref={containerRef}>
      {label && (
        <p className="font-medium text-[16px] py-1">
          {label}
        </p>
      )}

      {/* Trigger */}
      <div
        onClick={() => !props.disabled && setOpen((o) => !o)}
        className={`
                    flex items-center justify-between cursor-pointer
                    text-[14px] md:text-[16px] bg-[#FFF] border border-[#D5D5D5] h-10 rounded-lg py-2 px-3 w-full
                    transition-all duration-200 select-none
                    ${open ? "ring-2 ring-[#D5D5D5]" : ""}
                    ${errormsg ? "ring-2 ring-[#F87A15]" : ""}
                `}
      >
        <span className={selectedLabel ? "text-gray-900" : "text-gray-500/60"}>
          {selectedLabel ?? placeholder ?? "Select an option"}
        </span>
        <ChevronDownIcon />
      </div>

      {/* Dropdown panel */}
      <div
        className={`
                    absolute w-full z-50 mt-2 overflow-hidden transition-all duration-200 ease-out w-auto
                    ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
                `}
      >
        <div className="bg-white border border-zinc-700 shadow-2xl rounded-[18px] shadow-lg overflow-y-auto max-h-60">
          {items && items.length > 0 ? (
            items.map((item, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(item.value)}
                className={`
                                    w-full text-left px-4 py-2.5 text-[14px] md:text-[16px] transition-colors duration-100
                                    first:rounded-t-[18px] last:rounded-b-[18px]
                                    ${
                                      value === item.value
                                        ? "bg-[#E3E3E3] text-gray-900 font-medium"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }
                                `}
              >
                {item.label}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-400">
              No options available
            </p>
          )}
        </div>
      </div>

      {description && (
        <div className="text-[12px] text-[#ADADAD] my-2 pl-4">
          {description}
        </div>
      )}
      {errormsg && <div className="text-[#F87A15] my-2 pl-4">{errormsg}</div>}
    </div>
  );
}
