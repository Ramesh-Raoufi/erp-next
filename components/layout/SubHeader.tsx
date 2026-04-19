'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  transfers: 'Transfers',
  tracking: 'Tracking',
  drivers: 'Drivers',
  payments: 'Payments',
  'customer-payments': 'Customer Payments',
  invoices: 'Invoices',
  bills: 'Bills',
  expenses: 'Expenses',
  adjustments: 'Adjustments',
  'purchase-orders': 'Purchase Orders',
  vendors: 'Vendors',
  products: 'Products',
  'unit-measures': 'Unit Measures',
  customers: 'Customers',
  accounts: 'Accounts',
  'account-types': 'Account Types',
  'chart-of-accounts': 'Chart of Accounts',
  reports: 'Reports',
  users: 'Users',
  settings: 'Settings',
};

const sectionNames: Record<string, string> = {
  orders: 'Operations',
  transfers: 'Operations',
  tracking: 'Operations',
  drivers: 'Operations',
  payments: 'Finance',
  'customer-payments': 'Finance',
  invoices: 'Finance',
  bills: 'Finance',
  expenses: 'Finance',
  adjustments: 'Finance',
  'purchase-orders': 'Purchasing',
  vendors: 'Purchasing',
  products: 'Catalog',
  'unit-measures': 'Catalog',
  customers: 'Catalog',
  accounts: 'Accounting',
  'account-types': 'Accounting',
  'chart-of-accounts': 'Accounting',
  reports: 'Accounting',
  users: 'Admin',
  settings: 'Admin',
};

interface SubHeaderProps {
  actions?: React.ReactNode;
}

export function SubHeader({ actions }: SubHeaderProps) {
  const pathname = usePathname();
  // Extract the last segment e.g. /app/invoices -> invoices
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? 'dashboard';
  const pageName = routeNames[lastSegment] ?? lastSegment;
  const section = sectionNames[lastSegment];

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/app/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          Home
        </Link>
        {section && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-gray-400">{section}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-medium text-gray-700">{pageName}</span>
      </nav>

      {/* Page actions slot */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
