"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface SearchSelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string | number | null;
  onChange: (value: string | number | null, option?: SearchSelectOption) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  hasError?: boolean;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  loading,
  disabled,
  clearable,
  className,
  hasError,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => String(o.value) === String(value ?? "__NONE__"));
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openDropdown() {
    if (disabled) return;
    setOpen(true);
    setSearch("");
    setHighlighted(-1);
    setTimeout(() => searchRef.current?.focus(), 0);
  }

  function select(opt: SearchSelectOption) {
    onChange(opt.value, opt);
    setOpen(false);
    setSearch("");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setSearch(""); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); return; }
    if (e.key === "Enter" && highlighted >= 0 && filtered[highlighted]) { select(filtered[highlighted]); return; }
  }

  const borderCls = hasError ? "border-red-500" : "border-input";
  const triggerCls = `w-full flex items-center justify-between rounded-md border ${borderCls} px-3 py-2 text-sm bg-white transition-colors ${
    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 focus:outline-none cursor-pointer"
  }`;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <button type="button" className={triggerCls} onClick={openDropdown} disabled={disabled}>
        <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
          {loading ? "Loading…" : selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && value != null && (
            <span
              onClick={clear}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b">
            <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlighted(-1); }}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm outline-none placeholder-gray-400"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <li className="px-3 py-2 text-sm text-gray-400">Loading…</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No options found</li>
            ) : (
              filtered.map((opt, i) => (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    onClick={() => select(opt)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                      String(opt.value) === String(value ?? "__NONE__") ? "bg-blue-50 font-medium" : ""
                    } ${i === highlighted ? "bg-blue-100" : ""}`}
                  >
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-gray-400 truncate">{opt.sublabel}</div>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
