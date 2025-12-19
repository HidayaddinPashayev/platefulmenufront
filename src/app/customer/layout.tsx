'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const totalItems = useCart((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/customer/menu" className="font-bold text-warm-900 text-lg">
            Cozy Corner Café
          </Link>
          
          {mounted && totalItems > 0 && (
            <Link 
              href="/customer/cart"
              className="relative p-2 text-warm-600 hover:bg-warm-50 rounded-full transition-colors"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24">
        {children}
      </main>

      {/* Bottom Floating Action Button (if items in cart) */}
      {mounted && totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link 
              href="/customer/cart"
              className="w-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 rounded-xl py-3 px-4 flex items-center justify-between font-semibold active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                  {totalItems}
                </span>
                <span>View Basket</span>
              </div>
              <span className="text-primary-100 text-sm">Checkout →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
