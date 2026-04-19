'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  MapPin,
  User,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  Building2,
  Package,
  Ruler,
  Users,
  BookOpen,
  Tag,
  BarChart3,
  PieChart,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Box,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', to: '/app/orders', icon: ShoppingBag, roles: ['admin', 'operator', 'driver'] },
      { label: 'Transfers', to: '/app/transfers', icon: Truck, roles: ['admin', 'operator', 'driver'] },
      { label: 'Tracking', to: '/app/tracking', icon: MapPin, roles: ['admin', 'operator', 'driver'] },
      { label: 'Drivers', to: '/app/drivers', icon: User, roles: ['admin', 'operator', 'driver'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments', to: '/app/payments', icon: Wallet, roles: ['admin', 'accountant'] },
      { label: 'Customer Payments', to: '/app/customer-payments', icon: CreditCard, roles: ['admin', 'accountant'] },
      { label: 'Invoices', to: '/app/invoices', icon: Receipt, roles: ['admin', 'accountant', 'operator'] },
      { label: 'Bills', to: '/app/bills', icon: FileText, roles: ['admin', 'accountant'] },
      { label: 'Expenses', to: '/app/expenses', icon: TrendingDown, roles: ['admin', 'accountant'] },
      { label: 'Adjustments', to: '/app/adjustments', icon: RefreshCw, roles: ['admin', 'operator', 'driver'] },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      { label: 'Purchase Orders', to: '/app/purchase-orders', icon: ShoppingCart, roles: ['admin', 'accountant', 'operator'] },
      { label: 'Vendors', to: '/app/vendors', icon: Building2, roles: ['admin', 'accountant'] },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', to: '/app/products', icon: Package, roles: ['admin', 'operator', 'driver'] },
      { label: 'Unit Measures', to: '/app/unit-measures', icon: Ruler, roles: ['admin', 'operator'] },
      { label: 'Customers', to: '/app/customers', icon: Users, roles: ['admin'] },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { label: 'Accounts', to: '/app/accounts', icon: BookOpen, roles: ['admin', 'accountant'] },
      { label: 'Account Types', to: '/app/account-types', icon: Tag, roles: ['admin', 'accountant'] },
      { label: 'Chart of Accounts', to: '/app/chart-of-accounts', icon: BarChart3, roles: ['admin', 'accountant'] },
      { label: 'Reports', to: '/app/reports', icon: PieChart, roles: ['admin', 'accountant'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', to: '/app/users', icon: UserCog, roles: ['admin'] },
      { label: 'Settings', to: '/app/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  const role = user?.role;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  function isVisible(item: NavItem) {
    return !item.roles || (role ? item.roles.includes(role) : false);
  }

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-3">
        <Box className="h-6 w-6 shrink-0 text-blue-400" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">ERP</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(isVisible);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-1">
              {group.label && !collapsed && (
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {group.label}
                </div>
              )}
              {group.label && collapsed && (
                <div className="my-1 mx-2 h-px bg-slate-700" />
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
                      collapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{user?.name ?? 'User'}</div>
              <div className="truncate text-xs text-slate-400 capitalize">{role ?? ''}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded p-1 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded p-1 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center border-t border-slate-700 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-label="Close menu"
          />
          <div className="relative h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
