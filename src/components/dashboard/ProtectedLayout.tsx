'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface ProtectedLayoutProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedLayout({ allowedRoles, children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace('/login');
    }
  }, [allowedRoles, loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <div className="text-sm font-medium text-warm-600">
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-warm-50">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-warm-200 px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-warm-600 hover:bg-warm-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-bold text-warm-900">Cozy Corner</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
            {user.email.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

