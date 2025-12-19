import type { MenuItem, Order } from '@/types/entities';
import { USE_MOCK_DATA } from '@/lib/env';
import { MOCK_MENU_ITEMS, MOCK_RESTAURANT, MOCK_ORDERS, startMockCustomerSession } from '@/data/mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface StartSessionRequest {
  branchId: number;
  tableId: number;
}

export interface StartSessionResponse {
  guestSessionId: string;
  restaurantId: number;
}

export interface CreateOrderRequest {
  guestSessionId: string;
  branchId: number;
  tableId: number;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  menuItemId: number;
  qty: number;
}

/**
 * Start a customer session
 * POST /api/customer/session/start
 */
export const startCustomerSession = async (
  branchId: number,
  tableId: number
): Promise<StartSessionResponse> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] startCustomerSession');
    const session = startMockCustomerSession(branchId, tableId);
    return {
      guestSessionId: session.guestSessionId,
      restaurantId: MOCK_RESTAURANT.id,
    };
  }
  
  const response = await fetch(`${BASE_URL}/api/customer/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branchId,
      tableId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to start session: ${response.statusText}`);
  }

  return response.json();
};

/**
 * End a customer session
 * POST /api/customer/session/end
 */
export const endCustomerSession = async (guestSessionId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] endCustomerSession');
    return;
  }
  
  const response = await fetch(`${BASE_URL}/api/customer/session/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guestSessionId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to end session: ${response.statusText}`);
  }
};

/**
 * Get menu for customer
 * GET /api/customer/menu?branchId={branchId}&tableId={tableId}
 */
export const getCustomerMenu = async (
  branchId: number,
  tableId: number
): Promise<MenuItem[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] getCustomerMenu');
    // Filter menu items by restaurantId (assuming mock restaurant id 1) and availability
    // In a real app, we would look up the branch to find the restaurantId
    return MOCK_MENU_ITEMS.filter(item => item.restaurantId === 1 && item.isAvailable);
  }
  
  const url = new URL(`${BASE_URL}/api/customer/menu`);
  url.searchParams.set('branchId', String(branchId));
  url.searchParams.set('tableId', String(tableId));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to load menu: ${response.statusText}`);
  }

  const data = await response.json();
  return data ?? [];
};

/**
 * Create customer order
 * POST /api/customer/orders
 */
export const createCustomerOrder = async (
  payload: CreateOrderRequest
): Promise<Order> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] createCustomerOrder');
    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      branchId: payload.branchId,
      tableId: payload.tableId,
      status: 'ORDERED',
      items: payload.items.map((item, index) => {
        const menuItem = MOCK_MENU_ITEMS.find(m => m.id === item.menuItemId);
        return {
          id: index + 1,
          menuItemId: item.menuItemId,
          name: menuItem?.name || 'Unknown Item',
          qty: item.qty,
          price: menuItem?.price || 0,
        };
      }),
      totalPrice: payload.items.reduce((sum, item) => {
        const menuItem = MOCK_MENU_ITEMS.find(m => m.id === item.menuItemId);
        return sum + (menuItem?.price || 0) * item.qty;
      }, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_ORDERS.push(newOrder);
    return newOrder;
  }
  
  const response = await fetch(`${BASE_URL}/api/customer/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create order: ${response.statusText}`);
  }

  return response.json();
};

