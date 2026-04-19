"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string;
  unitMeasure?: string | null;
}

interface ProductSelectorProps {
  value: number | null;
  onChange: (product: { id: number; name: string; price: string; unitMeasure?: string }) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSelector({
  value,
  onChange,
  placeholder = "Select product…",
  className = "",
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    fetch("/api/products", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
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

  const selected = products.find((p) => p.id === value);
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function select(product: Product) {
    onChange({
      id: product.id,
      name: product.name,
      price: product.price,
      unitMeasure: product.unitMeasure ?? undefined,
    });
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded border border-input px-2 py-1.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      >
        <span className={selected ? "text-gray-900 truncate" : "text-gray-400 truncate"}>
          {loading ? "Loading…" : selected ? selected.name : placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1 shrink-0" />
      </button>

      {open && !loading && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b">
            <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none placeholder-gray-400"
            />
          </div>
          {/* Options */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No products found</li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => select(p)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 ${
                      p.id === value ? "bg-blue-50 font-medium" : ""
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">${Number(p.price).toFixed(2)}</span>
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
