'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NAV_LINKS: Record<
  'ROLE_SUPERADMIN' | 'ROLE_ADMIN' | 'ROLE_WAITER' | 'ROLE_KITCHEN',
  { label: string; href: string; exact?: boolean }[]
> = {
  ROLE_SUPERADMIN: [
    { label: 'Dashboard', href: '/superadmin/dashboard' },
    { label: 'Branches', href: '/superadmin/branches' },
    { label: 'Admins', href: '/superadmin/admins' },
    { label: 'Staff', href: '/superadmin/staff' },
  ],
  ROLE_ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Staff', href: '/admin/staff' },
    { label: 'Tables', href: '/admin/tables' },
    { label: 'Menu', href: '/admin/menu' },
    { label: 'Kitchen settings', href: '/admin/kitchen' },
  ],
  ROLE_WAITER: [],
  ROLE_KITCHEN: [
    { label: 'Orders', href: '/kitchen/orders' },
  ],
};

const isActive = (pathname: string, href: string, exact = false) => {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = NAV_LINKS[user.role] ?? [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-30 h-screen w-72 flex-col bg-white border-r border-warm-200 transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-warm-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-warm-400 font-bold">Signed in as</p>
            <p className="mt-1 text-lg font-bold text-warm-900 truncate max-w-[200px]" title={user.email}>{user.email}</p>
            <p className="text-sm capitalize text-warm-500">
              {user.role.replace('ROLE_', '').toLowerCase()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-warm-500 hover:bg-warm-100 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-2">
          <p className="text-xs text-warm-400 font-medium">
            {user.restaurantName ?? `Restaurant #${user.restaurantId}`}
            {user.branchId ? ` • Branch #${user.branchId}` : ''}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {links.map((link) => {
            const active = isActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onClose()} // Close on mobile when clicking a link
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900'
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-warm-100">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-warm-200 px-4 py-2.5 text-sm font-semibold text-warm-700 transition-all hover:bg-warm-50 hover:text-red-600 hover:border-red-200 active:scale-95"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

