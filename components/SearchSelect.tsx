"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Plus } from "lucide-react";

export interface SearchSelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

export interface QuickCreateConfig {
  label: string; // e.g. "Add New Vendor"
  fields: Array<{
    key: string;
    label: string;
    required?: boolean;
    type?: "text" | "email" | "tel";
    placeholder?: string;
  }>;
  onSave: (data: Record<string, string>) => Promise<{ id: number | string; name: string }>;
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
  quickCreate?: QuickCreateConfig;
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
  quickCreate,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState<Record<string, string>>({});
  const [modalSaving, setModalSaving] = useState(false);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
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

  function openQuickCreate() {
    setOpen(false);
    setSearch("");
    const initial: Record<string, string> = {};
    quickCreate?.fields.forEach((f) => { initial[f.key] = ""; });
    setModalForm(initial);
    setModalErrors({});
    setShowModal(true);
  }

  async function handleModalSave() {
    if (!quickCreate) return;
    const errors: Record<string, string> = {};
    quickCreate.fields.forEach((f) => {
      if (f.required && !modalForm[f.key]?.trim()) {
        errors[f.key] = `${f.label} is required`;
      }
    });
    if (Object.keys(errors).length > 0) { setModalErrors(errors); return; }
    setModalSaving(true);
    try {
      const result = await quickCreate.onSave(modalForm);
      onChange(result.id, { value: result.id, label: result.name });
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create";
      setModalErrors({ _global: msg });
    } finally {
      setModalSaving(false);
    }
  }

  const borderCls = hasError ? "border-red-500" : "border-input";
  const triggerCls = `w-full flex items-center justify-between rounded-md border ${borderCls} px-3 py-2 text-sm bg-white transition-colors ${
    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 focus:outline-none cursor-pointer"
  }`;
  const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400";

  return (
    <>
      <div ref={containerRef} className={`relative ${className ?? ""}`}>
        <button type="button" className={triggerCls} onClick={openDropdown} disabled={disabled}>
          <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
            {loading ? "Loading…" : selected ? selected.label : placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {clearable && value != null && (
              <span onClick={clear} className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100">
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
            {quickCreate && (
              <div className="border-t p-1">
                <button
                  type="button"
                  onClick={openQuickCreate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  {quickCreate.label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Create Modal */}
      {showModal && quickCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !modalSaving && setShowModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-800">{quickCreate.label}</h2>
              </div>
              <button
                type="button"
                onClick={() => !modalSaving && setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {modalErrors._global && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">
                  {modalErrors._global}
                </div>
              )}
              {quickCreate.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder ?? field.label}
                    value={modalForm[field.key] ?? ""}
                    onChange={(e) => setModalForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    className={modalErrors[field.key] ? errInputCls : inputCls}
                    disabled={modalSaving}
                  />
                  {modalErrors[field.key] && (
                    <p className="text-xs text-red-500 mt-1">{modalErrors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={modalSaving}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                disabled={modalSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {modalSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
