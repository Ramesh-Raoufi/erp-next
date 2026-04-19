'use client';
import { useState } from 'react';
import { Menu, Box } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SubHeader } from '@/components/layout/SubHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-slate-900 px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 text-slate-300 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Box className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold text-white">ERP</span>
        </div>

        {/* Sub-header */}
        <SubHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
