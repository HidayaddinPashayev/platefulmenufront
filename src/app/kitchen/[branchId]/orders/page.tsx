'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/env';
import type { Order } from '@/types/entities';

type OrdersByStatus = {
  ORDERED: Order[];
  PREPARING: Order[];
  PREPARED_WAITING: Order[];
};

export default function KitchenOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = Number(params.branchId);

  const [isClient, setIsClient] = useState(false);
  const hasInitializedRef = useRef(false);

  const [orders, setOrders] = useState<OrdersByStatus>({
    ORDERED: [],
    PREPARING: [],
    PREPARED_WAITING: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isClient) return;
    if (typeof window === 'undefined') return;
    if (isNaN(branchId)) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/branches/${branchId}/kitchen/orders`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const data = await response.json().catch(() => ({}));
          if (data.requiresPin === true) {
            console.log('[KDS] PIN authentication required - redirecting');
            router.replace(`/kitchen/${branchId}`);
            return;
          }
        }

        if (response.status === 403) {
          console.log('[KDS] Access denied - redirecting to PIN page');
          setError('Access denied. Try logging in again.');
          router.replace(`/kitchen/${branchId}`);
          return;
        }

        setError('Failed to load orders. Please try again.');
        setLoading(false);
        return;
      }

      const fetchedOrders: Order[] = await response.json();

      // Group orders by status
      const grouped: OrdersByStatus = {
        ORDERED: [],
        PREPARING: [],
        PREPARED_WAITING: [],
      };

      fetchedOrders.forEach((order) => {
        if (order.status === 'ORDERED' || order.status === 'PREPARING' || order.status === 'PREPARED_WAITING') {
          grouped[order.status].push(order);
        }
      });

      setOrders(grouped);
      console.log('[KDS] Orders fetched successfully');
    } catch (err: any) {
      console.error('[KDS] Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [branchId, router, isClient]);

  useEffect(() => {
    setIsClient(true);
    console.log('[KDS] Client-side mounted');
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (hasInitializedRef.current) return;

    if (isNaN(branchId)) {
      console.error('[KDS Orders] ❌ Invalid branch ID:', params.branchId);
      setError('Invalid branch ID');
      setLoading(false);
      return;
    }

    hasInitializedRef.current = true;
    console.log('[KDS] Fetching orders');
    void fetchOrders();
  }, [branchId, params.branchId, isClient, fetchOrders]);

  // Auto-refresh orders every 5 seconds - ONLY client-side
  useEffect(() => {
    if (!isClient) return;
    if (typeof window === 'undefined') return;
    if (loading) return;

    const interval = setInterval(() => {
      void fetchOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loading, fetchOrders, isClient]);

  if (!isClient) {
    return null;
  }

  // Handle accept order (ORDERED -> PREPARING)
  const handleAcceptOrder = async (orderId: number) => {
    if (typeof window === 'undefined') return;
    if (isNaN(branchId)) return;

    try {
      setProcessingOrderId(orderId);

      const response = await fetch(`${API_BASE_URL}/branches/${branchId}/kitchen/orders/${orderId}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.replace(`/kitchen/${branchId}`);
          return;
        }
        alert('Failed to accept order. Please try again.');
        return;
      }

      // Refresh orders
      await fetchOrders();
    } catch (err: any) {
      console.error('[KDS] Error accepting order:', err);
      alert('Failed to accept order. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handle mark order ready (PREPARING -> PREPARED_WAITING)
  const handleMarkReady = async (orderId: number) => {
    if (typeof window === 'undefined') return;
    if (isNaN(branchId)) return;

    try {
      setProcessingOrderId(orderId);

      const response = await fetch(`${API_BASE_URL}/branches/${branchId}/kitchen/orders/${orderId}/ready`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.replace(`/kitchen/${branchId}`);
          return;
        }
        alert('Failed to mark order as ready. Please try again.');
        return;
      }

      // Refresh orders
      await fetchOrders();
    } catch (err: any) {
      console.error('[KDS] Error marking order ready:', err);
      alert('Failed to mark order as ready. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isNaN(branchId)) {
    return (
      <main className="min-h-screen bg-slate-900 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-red-300">
            Invalid branch ID
          </div>
        </div>
      </main>
    );
  }

  if (loading && orders.ORDERED.length === 0 && orders.PREPARING.length === 0 && orders.PREPARED_WAITING.length === 0) {
    return (
      <main className="min-h-screen bg-slate-900 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-white">Loading orders...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Kitchen - Branch {branchId}</h1>
          <button
            onClick={() => {
              router.replace(`/kitchen/${branchId}`);
            }}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* New Orders */}
          <section className="rounded-lg bg-slate-800 p-4">
            <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl font-bold text-white">
              New Orders
            </h2>
            {orders.ORDERED.length === 0 ? (
              <p className="text-center text-slate-400">No orders</p>
            ) : (
              <div className="space-y-3">
                {orders.ORDERED.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-slate-600 bg-slate-700 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Order #{order.id}</p>
                        <p className="text-xs text-slate-400">Table: {order.tableName || order.tableId}</p>
                        {order.createdAt && (
                          <p className="text-xs text-slate-400">{formatTime(order.createdAt)}</p>
                        )}
                      </div>
                      {order.totalCents && (
                        <p className="text-sm font-medium text-white">{formatPrice(order.totalCents)}</p>
                      )}
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-300">
                          <span className="font-medium">{item.qty}x</span> {item.menuItemName || `Item ${item.menuItemId}`}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mb-3 text-xs text-yellow-400">Note: {order.notes}</p>
                    )}

                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={processingOrderId === order.id}
                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingOrderId === order.id ? 'Processing...' : 'Accept Order'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Preparing */}
          <section className="rounded-lg bg-slate-800 p-4">
            <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl font-bold text-white">
              Preparing
            </h2>
            {orders.PREPARING.length === 0 ? (
              <p className="text-center text-slate-400">No orders</p>
            ) : (
              <div className="space-y-3">
                {orders.PREPARING.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-slate-600 bg-slate-700 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Order #{order.id}</p>
                        <p className="text-xs text-slate-400">Table: {order.tableName || order.tableId}</p>
                        {order.createdAt && (
                          <p className="text-xs text-slate-400">{formatTime(order.createdAt)}</p>
                        )}
                      </div>
                      {order.totalCents && (
                        <p className="text-sm font-medium text-white">{formatPrice(order.totalCents)}</p>
                      )}
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-300">
                          <span className="font-medium">{item.qty}x</span> {item.menuItemName || `Item ${item.menuItemId}`}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mb-3 text-xs text-yellow-400">Note: {order.notes}</p>
                    )}

                    <button
                      onClick={() => handleMarkReady(order.id)}
                      disabled={processingOrderId === order.id}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingOrderId === order.id ? 'Processing...' : 'Mark Ready'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ready */}
          <section className="rounded-lg bg-slate-800 p-4">
            <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl font-bold text-white">
              Ready
            </h2>
            {orders.PREPARED_WAITING.length === 0 ? (
              <p className="text-center text-slate-400">No orders</p>
            ) : (
              <div className="space-y-3">
                {orders.PREPARED_WAITING.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-slate-600 bg-slate-700 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Order #{order.id}</p>
                        <p className="text-xs text-slate-400">Table: {order.tableName || order.tableId}</p>
                        {order.createdAt && (
                          <p className="text-xs text-slate-400">{formatTime(order.createdAt)}</p>
                        )}
                      </div>
                      {order.totalCents && (
                        <p className="text-sm font-medium text-white">{formatPrice(order.totalCents)}</p>
                      )}
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-300">
                          <span className="font-medium">{item.qty}x</span> {item.menuItemName || `Item ${item.menuItemId}`}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mb-3 text-xs text-yellow-400">Note: {order.notes}</p>
                    )}

                    <div className="rounded-lg bg-green-500/20 border border-green-500/50 px-3 py-2 text-center text-sm font-medium text-green-300">
                      Ready for Pickup
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

