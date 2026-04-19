"use client";
import { ReactNode, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageFormProps {
  title: string;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: ReactNode;
}

export function PageForm({
  title,
  onBack,
  onSave,
  onCancel,
  saving,
  saveLabel = "Save",
  children,
}: PageFormProps) {
  // Ctrl+S shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Form content */}
      <div className="space-y-5">{children}</div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}
