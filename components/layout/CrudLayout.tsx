"use client";
import { ReactNode } from "react";

interface CrudLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function CrudLayout({ title, subtitle, actions, children }: CrudLayoutProps) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {/* Content */}
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
}
