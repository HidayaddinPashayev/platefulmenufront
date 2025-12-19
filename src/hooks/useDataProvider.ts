'use client';

import { useMemo } from 'react';
import { useApi } from './useApi';
import { USE_MOCK_DATA } from '@/lib/env';
import {
  MOCK_MENU_ITEMS,
  MOCK_ORDERS,
  MOCK_TABLES,
  MOCK_STAFF,
  MOCK_BRANCHES,
  MOCK_RESTAURANT,
  getActiveKitchenOrders,
  getStaffByBranch,
  getTablesByBranch,
} from '@/data/mock-data';
import type { MenuItem, Order, TableEntity, UserRecord, Branch, Restaurant } from '@/types/entities';

// API imports
import { listMenuItems, listStaff, listTables } from '@/lib/api/admin';
import { listKitchenOrders } from '@/lib/api/kitchen';
import { getCustomerMenu } from '@/lib/api/customer';

/**
 * Data Provider Hook
 * 
 * Provides a unified interface for fetching data, automatically switching
 * between mock data and real API based on the NEXT_PUBLIC_USE_MOCK_DATA env variable.
 * 
 * Usage:
 * ```tsx
 * const { getMenu, getOrders, isUsingMockData } = useDataProvider();
 * const menu = await getMenu(restaurantId, branchId);
 * ```
 */
export function useDataProvider() {
  const api = useApi();

  const provider = useMemo(() => ({
    /**
     * Whether the provider is using mock data
     */
    isUsingMockData: USE_MOCK_DATA,

    /**
     * Get restaurant info
     */
    getRestaurant: async (): Promise<Restaurant> => {
      if (USE_MOCK_DATA) {
        return MOCK_RESTAURANT;
      }
      // Real API: would need to implement this endpoint
      throw new Error('getRestaurant API not implemented');
    },

    /**
     * Get all branches for a restaurant
     */
    getBranches: async (restaurantId: number): Promise<Branch[]> => {
      if (USE_MOCK_DATA) {
        return MOCK_BRANCHES.filter(b => b.restaurantId === restaurantId);
      }
      // Real API: would need to implement this endpoint
      const { data } = await api.get<Branch[]>('/branches', {
        params: { restaurantId },
      });
      return data ?? [];
    },

    /**
     * Get menu items for admin view (all items)
     */
    getMenuAdmin: async (restaurantId: number): Promise<MenuItem[]> => {
      if (USE_MOCK_DATA) {
        return MOCK_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
      }
      return listMenuItems(api, restaurantId);
    },

    /**
     * Get menu items for customer view (available items only)
     */
    getMenuCustomer: async (branchId: number, tableId: number): Promise<MenuItem[]> => {
      if (USE_MOCK_DATA) {
        return MOCK_MENU_ITEMS.filter(item => item.isAvailable);
      }
      return getCustomerMenu(branchId, tableId);
    },

    /**
     * Get orders for kitchen display
     */
    getKitchenOrders: async (branchId: number): Promise<Order[]> => {
      if (USE_MOCK_DATA) {
        return getActiveKitchenOrders();
      }
      return listKitchenOrders(api, branchId);
    },

    /**
     * Get all orders for a branch
     */
    getAllOrders: async (branchId: number): Promise<Order[]> => {
      if (USE_MOCK_DATA) {
        return MOCK_ORDERS.filter(order => order.branchId === branchId);
      }
      const { data } = await api.get<Order[]>('/orders', {
        params: { branchId },
      });
      return data ?? [];
    },

    /**
     * Get staff members for a branch
     */
    getStaff: async (branchId: number): Promise<UserRecord[]> => {
      if (USE_MOCK_DATA) {
        return getStaffByBranch(branchId);
      }
      return listStaff(api, branchId);
    },

    /**
     * Get tables for a branch
     */
    getTables: async (restaurantId: number, branchId: number): Promise<TableEntity[]> => {
      if (USE_MOCK_DATA) {
        return getTablesByBranch(branchId);
      }
      return listTables(api, restaurantId, branchId);
    },

    /**
     * Simulate delay for mock data (to mimic network latency)
     */
    simulateDelay: async (ms: number = 500): Promise<void> => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, ms));
      }
    },
  }), [api]);

  return provider;
}

/**
 * Type for the data provider
 */
export type DataProvider = ReturnType<typeof useDataProvider>;
