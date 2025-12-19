import type { AxiosInstance } from 'axios';
import type { Order } from '@/types/entities';
import { USE_MOCK_DATA } from '@/lib/env';
import { MOCK_ORDERS, getActiveKitchenOrders } from '@/data/mock-data';

/**
 * Get active orders for kitchen (branch-scoped)
 * Endpoint: GET /api/branches/{branchId}/kitchen/orders
 * Returns: List<OrderResponseDTO> filtered to kitchen-relevant statuses (ORDERED, PREPARING, PREPARED_WAITING)
 * Authorization: ROLE_KITCHEN, ROLE_ADMIN, or ROLE_SUPERADMIN (or KDS token)
 * 
 * If no authentication is provided, returns 401 with KitchenAuthRequiredResponse:
 * { "requiresPin": true, "message": "PIN authentication required", "branchId": number }
 */
export const listKitchenOrders = async (api: AxiosInstance, branchId: number): Promise<Order[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listKitchenOrders');
    return getActiveKitchenOrders().filter(order => order.branchId === branchId);
  }
  try {
    const { data } = await api.get<Order[]>(`/branches/${branchId}/kitchen/orders`);
    console.log('[listKitchenOrders] Received orders:', data?.length || 0);
    return data ?? [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const responseData = error.response.data;
      if (responseData?.requiresPin) {
        console.log('[listKitchenOrders] PIN authentication required');
        throw error;
      }
    }
    
    console.error('[listKitchenOrders] Error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Accept an order - moves it to PREPARING status (branch-scoped)
 * Endpoint: POST /api/branches/{branchId}/kitchen/orders/{orderId}/accept
 * Authorization: ROLE_KITCHEN, ROLE_ADMIN, or ROLE_SUPERADMIN (or KDS token)
 * Response: OrderResponseDTO with status updated to PREPARING
 */
export const acceptOrder = async (api: AxiosInstance, branchId: number, orderId: number): Promise<Order> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] acceptOrder');
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.status = 'PREPARING';
      order.updatedAt = new Date().toISOString();
      return order;
    }
    throw new Error('Order not found');
  }
  try {
    console.log('[acceptOrder] Accepting order:', orderId);
    const { data } = await api.post<Order>(`/branches/${branchId}/kitchen/orders/${orderId}/accept`);
    console.log('[acceptOrder] Order accepted successfully:', data);
    return data;
  } catch (error: any) {
    console.error('[acceptOrder] Error:', {
      orderId,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Mark order as ready - moves it to PREPARED_WAITING status (branch-scoped)
 * Endpoint: POST /api/branches/{branchId}/kitchen/orders/{orderId}/ready
 * Authorization: ROLE_KITCHEN, ROLE_ADMIN, or ROLE_SUPERADMIN (or KDS token)
 * Response: OrderResponseDTO with status updated to PREPARED_WAITING
 */
export const markOrderReady = async (api: AxiosInstance, branchId: number, orderId: number): Promise<Order> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] markOrderReady');
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.status = 'PREPARED_WAITING';
      order.updatedAt = new Date().toISOString();
      return order;
    }
    throw new Error('Order not found');
  }
  try {
    console.log('[markOrderReady] Marking order as ready:', orderId);
    const { data } = await api.post<Order>(`/branches/${branchId}/kitchen/orders/${orderId}/ready`);
    console.log('[markOrderReady] Order marked ready successfully:', data);
    return data;
  } catch (error: any) {
    console.error('[markOrderReady] Error:', {
      orderId,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Verify Kitchen PIN and get KDS token
 * Endpoint: POST /api/branches/{branchId}/kitchen/pin/verify
 * Authorization: None (public endpoint)
 * Response: KdsLoginResponseDTO with kdsToken and expiresAt
 */
export interface KdsLoginResponse {
  branchId: number;
  kdsToken: string;
  expiresAt: string;
}

export const verifyKitchenPin = async (
  api: AxiosInstance,
  branchId: number,
  pin: string
): Promise<KdsLoginResponse> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] verifyKitchenPin');
    // Accept any 6-digit PIN in mock mode
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      return {
        branchId,
        kdsToken: `mock-kds-token-${branchId}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    throw new Error('Invalid PIN');
  }
  try {
    console.log('[verifyKitchenPin] Verifying PIN for branch:', branchId);
    const { data } = await api.post<KdsLoginResponse>(`/branches/${branchId}/kitchen/pin/verify`, { pin });
    console.log('[verifyKitchenPin] PIN verified successfully');
    return data;
  } catch (error: any) {
    console.error('[verifyKitchenPin] Error:', {
      branchId,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Kitchen PIN Management (Admin only - uses JWT, not KDS token)
 */

export interface KitchenPinInfo {
  branchId: number;
  isSet: boolean;
  lastUpdatedAt?: string | null;
  maskedPin?: string | null;
  pin?: string | null; // Only returned when generating new PIN
}

/**
 * Get Kitchen PIN info
 * Endpoint: GET /api/branches/{branchId}/kitchen/pin
 * Authorization: ROLE_ADMIN or ROLE_SUPERADMIN (JWT)
 */
export const getKitchenPinInfo = async (api: AxiosInstance, branchId: number): Promise<KitchenPinInfo> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] getKitchenPinInfo');
    return {
      branchId,
      isSet: true,
      lastUpdatedAt: new Date().toISOString(),
      maskedPin: '**1234',
    };
  }
  try {
    const { data } = await api.get<KitchenPinInfo>(`/branches/${branchId}/kitchen/pin`);
    return data;
  } catch (error: any) {
    console.error('[getKitchenPinInfo] Error:', {
      branchId,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Generate random Kitchen PIN
 * Endpoint: POST /api/branches/{branchId}/kitchen/pin/generate
 * Authorization: ROLE_ADMIN or ROLE_SUPERADMIN (JWT)
 * Response: KitchenPinInfo with full PIN included (only time it's returned)
 */
export const generateKitchenPin = async (api: AxiosInstance, branchId: number): Promise<KitchenPinInfo> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] generateKitchenPin');
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    return {
      branchId,
      isSet: true,
      lastUpdatedAt: new Date().toISOString(),
      maskedPin: `**${pin.slice(-4)}`,
      pin,
    };
  }
  try {
    const { data } = await api.post<KitchenPinInfo>(`/branches/${branchId}/kitchen/pin/generate`);
    return data;
  } catch (error: any) {
    console.error('[generateKitchenPin] Error:', {
      branchId,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Set custom Kitchen PIN
 * Endpoint: POST /api/branches/{branchId}/kitchen/pin
 * Authorization: ROLE_ADMIN or ROLE_SUPERADMIN (JWT)
 * Request body: { pin: string } (6 digits)
 */
export const setKitchenPin = async (api: AxiosInstance, branchId: number, pin: string): Promise<KitchenPinInfo> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] setKitchenPin');
    return {
      branchId,
      isSet: true,
      lastUpdatedAt: new Date().toISOString(),
      maskedPin: `**${pin.slice(-4)}`,
    };
  }
  try {
    const { data } = await api.post<KitchenPinInfo>(`/branches/${branchId}/kitchen/pin`, { pin });
    return data;
  } catch (error: any) {
    console.error('[setKitchenPin] Error:', {
      branchId,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

