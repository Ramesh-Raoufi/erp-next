"use client";
import { ReactNode } from "react";
import { Pencil, Trash2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
}

interface PageTableProps<T extends { id: number }> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: (row: T) => ReactNode;
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-t animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function PageTable<T extends { id: number }>({
  columns,
  data,
  loading,
  emptyMessage = "No records found.",
  emptyAction,
  onEdit,
  onDelete,
  actions,
}: PageTableProps<T>) {
  const hasActions = !!(onEdit || onDelete || actions);
  const totalCols = columns.length + (hasActions ? 1 : 0) + 1; // +1 for row number

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-600 border-b text-center w-[48px]">#</th>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`px-4 py-3 font-semibold text-gray-600 border-b ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-4 py-3 text-right font-semibold text-gray-600 border-b">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={totalCols} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Inbox className="h-12 w-12 opacity-40" />
                  <p className="font-medium text-gray-500">{emptyMessage}</p>
                  {emptyAction}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id} className="border-t hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 text-center text-gray-400 text-xs w-[48px]">{rowIndex + 1}</td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {actions && actions(row)}
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(row)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => onDelete(row)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
