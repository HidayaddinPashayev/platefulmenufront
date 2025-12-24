'use client';

import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createCustomerOrder } from '@/lib/api/customer';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const sessionStr = localStorage.getItem('customerSession');
      const branchId = Number(localStorage.getItem('customerBranchId'));
      const tableId = Number(localStorage.getItem('customerTableId'));
      
      if (!sessionStr || !branchId || !tableId) {
        throw new Error('Session missing');
      }

      const session = JSON.parse(sessionStr);

      await createCustomerOrder({
        guestSessionId: session.guestSessionId || 'mock-session',
        branchId,
        tableId,
        items: items.map(i => ({
          menuItemId: i.menuItem.id,
          qty: i.quantity
        }))
      });

      clearCart();
      router.push('/customer/order-success');
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mb-4 text-2xl">
          🛒
        </div>
        <h2 className="text-xl font-bold text-warm-900">Your basket is empty</h2>
        <p className="text-warm-500 mt-2 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <button 
          onClick={() => router.back()}
          className="btn btn-primary"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-warm-900">Your Basket</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.menuItem.id} className="bg-white p-4 rounded-xl border border-warm-100 shadow-sm flex gap-4">
            <div className="w-20 h-20 bg-warm-100 rounded-lg flex-shrink-0" />
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-warm-900">{item.menuItem.name}</h3>
                <p className="font-bold text-warm-900">
                  ${((item.menuItem.priceCents || 0) * item.quantity / 100).toFixed(2)}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-warm-500">
                  ${((item.menuItem.priceCents || 0) / 100).toFixed(2)} each
                </p>
                
                <div className="flex items-center gap-3 bg-warm-50 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-warm-600"
                  >
                    {item.quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-500" /> : <MinusIcon className="w-4 h-4" />}
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-warm-600"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-warm-200 pt-4 space-y-2">
        <div className="flex justify-between text-warm-600">
          <span>Subtotal</span>
          <span>${(totalPrice() / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-warm-600">
          <span>Tax (10%)</span>
          <span>${(totalPrice() * 0.1 / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-warm-900 pt-2">
          <span>Total</span>
          <span>${(totalPrice() * 1.1 / 100).toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={submitting}
        className="w-full btn btn-primary btn-lg shadow-lg shadow-primary-500/20"
      >
        {submitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}
