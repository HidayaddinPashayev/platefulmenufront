'use client';

import { useEffect, useState } from 'react';
import { getCustomerMenu } from '@/lib/api/customer';
import { useCart } from '@/store/cart';
import type { MenuItem } from '@/types/entities';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        // Get session info from local storage
        const branchId = Number(localStorage.getItem('customerBranchId') || 1);
        const tableId = Number(localStorage.getItem('customerTableId') || 1);
        
        const items = await getCustomerMenu(branchId, tableId);
        setMenu(items);
      } catch (err) {
        console.error('Failed to load menu', err);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category || 'Other')))];

  const filteredMenu = activeCategory === 'All' 
    ? menu 
    : menu.filter(item => (item.category || 'Other') === activeCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeCategory === cat 
                ? 'bg-warm-800 text-white shadow-md' 
                : 'bg-white text-warm-600 border border-warm-200'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredMenu.map((item) => (
          <div key={item.id} className="menu-card group">
            <div className="menu-card-image relative">
              {/* Placeholder image since we don't have real URLs yet */}
              <div className="absolute inset-0 flex items-center justify-center text-warm-300 bg-warm-100">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
            <div className="menu-card-body">
              <h3 className="menu-card-title text-sm md:text-base">{item.name}</h3>
              <p className="menu-card-description text-xs">{item.description}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="menu-card-price text-base">
                  ${((item.priceCents || 0) / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => addItem(item)}
                  className="p-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 active:scale-90 transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
