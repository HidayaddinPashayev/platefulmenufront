import type { AxiosInstance } from 'axios';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';
import { USE_MOCK_DATA } from '@/lib/env';
import { MOCK_BRANCHES, MOCK_STAFF, MOCK_TABLES, MOCK_MENU_ITEMS } from '@/data/mock-data';

export interface StaffCreatePayload {
  email: string;
  role: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  salaryAmount?: number;
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface StaffUpdatePayload {
  role?: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  salaryAmount?: number;
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  branchId?: number;
}

export interface TablePayload {
  name?: string | null;
  tableNumber?: number | null;
  seatCount?: number | null;
  restaurantId?: number;
  branchId?: number;
}

const STAFF_ROLES = new Set(['ROLE_WAITER', 'ROLE_KITCHEN']);

export const getBranch = async (api: AxiosInstance, branchId: number): Promise<Branch> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] getBranch');
    const branch = MOCK_BRANCHES.find(b => b.id === branchId);
    if (branch) return branch;
    throw new Error('Branch not found');
  }
  const { data } = await api.get<Branch>(`/branches/${branchId}`);
  return data;
};

export const listStaff = async (api: AxiosInstance, branchId: number): Promise<UserRecord[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listStaff');
    return MOCK_STAFF.filter(user => user.branchId === branchId && STAFF_ROLES.has(user.role));
  }
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { branchId },
  });
  return (data ?? []).filter((user) => STAFF_ROLES.has(user.role));
};

export const createStaff = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: StaffCreatePayload
): Promise<UserRecord> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] createStaff');
    const newStaff: UserRecord = {
      id: Date.now(),
      email: payload.email.toLowerCase(),
      role: payload.role,
      restaurantId,
      branchId,
      fullName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'New Staff',
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      salaryAmount: payload.salaryAmount,
      salaryPeriod: payload.salaryPeriod,
    };
    MOCK_STAFF.push(newStaff);
    return newStaff;
  }
  const body: Record<string, unknown> = {
    email: payload.email.toLowerCase(),
    role: payload.role,
    restaurantId,
    branchId,
  };
  if (payload.password) {
    body.password = payload.password;
  }
  if (payload.firstName?.trim() || payload.lastName?.trim()) {
    const firstName = payload.firstName?.trim() || '';
    const lastName = payload.lastName?.trim() || '';
    body.fullName = `${firstName} ${lastName}`.trim();
  }
  if (payload.phoneNumber !== undefined && payload.phoneNumber !== null) {
    body.phoneNumber = payload.phoneNumber;
  }
  if (payload.salaryAmount !== undefined && payload.salaryAmount !== null) {
    body.salaryAmount = Number(payload.salaryAmount);
  }
  if (payload.salaryPeriod !== undefined && payload.salaryPeriod !== null) {
    body.salaryPeriod = payload.salaryPeriod;
  }
  
  const { data } = await api.post<UserRecord>('/users', body);
  return data;
};

export const updateStaff = async (
  api: AxiosInstance,
  email: string,
  payload: StaffUpdatePayload
): Promise<UserRecord> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] updateStaff');
    const staff = MOCK_STAFF.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (staff) {
      if (payload.role) staff.role = payload.role;
      if (payload.firstName) staff.firstName = payload.firstName;
      if (payload.lastName) staff.lastName = payload.lastName;
      if (payload.firstName || payload.lastName) {
        staff.fullName = `${payload.firstName || staff.firstName || ''} ${payload.lastName || staff.lastName || ''}`.trim();
      }
      if (payload.phoneNumber !== undefined) staff.phoneNumber = payload.phoneNumber;
      if (payload.salaryAmount !== undefined) staff.salaryAmount = payload.salaryAmount;
      if (payload.salaryPeriod !== undefined) staff.salaryPeriod = payload.salaryPeriod;
      if (payload.branchId !== undefined) staff.branchId = payload.branchId;
      return staff;
    }
    throw new Error('Staff not found');
  }
  const body: Record<string, unknown> = {};
  
  if (payload.role) {
    body.role = payload.role;
  }
  if (payload.password) {
    body.password = payload.password;
  }
  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const firstName = payload.firstName?.trim() || '';
    const lastName = payload.lastName?.trim() || '';
    if (firstName) {
      body.firstName = firstName;
    }
    if (lastName) {
      body.lastName = lastName;
    }
    if (firstName || lastName) {
      body.fullName = `${firstName} ${lastName}`.trim();
    }
  }
  if (payload.phoneNumber !== undefined && payload.phoneNumber !== null) {
    body.phoneNumber = payload.phoneNumber;
  }
  if (payload.salaryAmount !== undefined && payload.salaryAmount !== null) {
    body.salaryAmount = Number(payload.salaryAmount);
  }
  if (payload.salaryPeriod !== undefined && payload.salaryPeriod !== null) {
    body.salaryPeriod = payload.salaryPeriod;
  }
  if (payload.branchId !== undefined && payload.branchId !== null) {
    body.branchId = payload.branchId;
  }
  
  const { data } = await api.patch<UserRecord>(`/users/${encodeURIComponent(email.toLowerCase())}`, body);
  return data;
};

export const deleteStaff = async (api: AxiosInstance, email: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] deleteStaff');
    const index = MOCK_STAFF.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) MOCK_STAFF.splice(index, 1);
    return;
  }
  await api.delete(`/users/${encodeURIComponent(email.toLowerCase())}`);
};

export const listTables = async (api: AxiosInstance, restaurantId: number, branchId: number): Promise<TableEntity[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listTables');
    return MOCK_TABLES.filter(table => table.branchId === branchId);
  }
  const { data } = await api.get<TableEntity[]>('/tables', {
    params: { restId: restaurantId },
  });
  return (data ?? []).filter((table) => table.branchId === branchId);
};

export const createTable = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: TablePayload
): Promise<TableEntity> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] createTable');
    const newTable: TableEntity = {
      id: Date.now(),
      restaurantId,
      branchId,
      name: payload.name ?? 'New Table',
      tableNumber: payload.tableNumber ?? null,
      seatCount: payload.seatCount ?? null,
      active: true,
      qrCode: `QR-${Date.now()}`,
    };
    MOCK_TABLES.push(newTable);
    return newTable;
  }
  const { data } = await api.post<TableEntity>('/tables', {
    restaurantId,
    branchId,
    name: payload.name ?? '',
    tableNumber: payload.tableNumber ?? null,
    seatCount: payload.seatCount ?? null,
  });
  return data;
};

export const updateTable = async (
  api: AxiosInstance,
  tableId: number,
  payload: TablePayload
): Promise<TableEntity> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] updateTable');
    const table = MOCK_TABLES.find(t => t.id === tableId);
    if (table) {
      if (payload.name !== undefined) table.name = payload.name ?? '';
      if (payload.tableNumber !== undefined) table.tableNumber = payload.tableNumber;
      if (payload.seatCount !== undefined) table.seatCount = payload.seatCount;
      return table;
    }
    throw new Error('Table not found');
  }
  const body: Record<string, unknown> = {
    name: payload.name ?? '',
    tableNumber: payload.tableNumber ?? null,
    seatCount: payload.seatCount ?? null,
  };
  if (payload.restaurantId !== undefined) {
    body.restaurantId = payload.restaurantId;
  }
  if (payload.branchId !== undefined) {
    body.branchId = payload.branchId;
  }
  const { data } = await api.put<TableEntity>(`/tables/${tableId}`, body);
  return data;
};

export const deleteTable = async (api: AxiosInstance, tableId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] deleteTable');
    const index = MOCK_TABLES.findIndex(t => t.id === tableId);
    if (index !== -1) MOCK_TABLES.splice(index, 1);
    return;
  }
  await api.delete(`/tables/${tableId}`);
};

export const listMenuItems = async (api: AxiosInstance, restaurantId: number): Promise<MenuItem[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listMenuItems');
    return MOCK_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
  }
  const { data } = await api.get<MenuItem[]>('/menu/admin/all', {
    params: { restId: restaurantId },
  });
  return data ?? [];
};

