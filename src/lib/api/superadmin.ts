import type { AxiosInstance } from 'axios';
import type { Branch, Restaurant, UserRecord } from '@/types/entities';
import { USE_MOCK_DATA } from '@/lib/env';
import { MOCK_RESTAURANT, MOCK_BRANCHES, MOCK_STAFF } from '@/data/mock-data';

export interface BranchCreatePayload {
  name: string;
  adminUserId?: number | null;
}

export interface BranchUpdatePayload {
  name?: string;
  adminUserId?: number | null;
}

export interface AdminCreatePayload {
  email: string;
  password: string;
  branchId?: number | null;
}

export interface AdminUpdatePayload {
  password?: string;
  branchId?: number | null;
}

const encodeEmail = (email: string) => encodeURIComponent(email.toLowerCase());

export const getRestaurant = async (api: AxiosInstance, restaurantId: number): Promise<Restaurant> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] getRestaurant');
    return MOCK_RESTAURANT;
  }
  const { data } = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
  return data;
};

export const listBranches = async (api: AxiosInstance, restaurantId: number): Promise<Branch[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listBranches');
    return MOCK_BRANCHES.filter(b => b.restaurantId === restaurantId);
  }
  const { data } = await api.get<Branch[]>(`/restaurants/${restaurantId}/branches`);
  return data ?? [];
};

export const createBranch = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: BranchCreatePayload
): Promise<Branch> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] createBranch');
    const newBranch: Branch = {
      id: Date.now(),
      restaurantId,
      name: payload.name,
      adminUserId: payload.adminUserId ?? null,
    };
    MOCK_BRANCHES.push(newBranch);
    return newBranch;
  }
  const body: Record<string, unknown> = {
    name: payload.name,
    restaurantId,
  };
  if (payload.adminUserId !== undefined && payload.adminUserId !== null) {
    body.adminUserId = payload.adminUserId;
  }
  const { data } = await api.post<Branch>(`/restaurants/${restaurantId}/branches`, body);
  return data;
};

export const updateBranch = async (
  api: AxiosInstance,
  branchId: number,
  payload: BranchUpdatePayload
): Promise<Branch> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] updateBranch');
    const branch = MOCK_BRANCHES.find(b => b.id === branchId);
    if (branch) {
      if (payload.name) branch.name = payload.name;
      if (payload.adminUserId !== undefined) branch.adminUserId = payload.adminUserId;
      return branch;
    }
    throw new Error('Branch not found');
  }
  const { data } = await api.put<Branch>(`/branches/${branchId}`, payload);
  return data;
};

export const deleteBranch = async (api: AxiosInstance, branchId: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] deleteBranch');
    const index = MOCK_BRANCHES.findIndex(b => b.id === branchId);
    if (index !== -1) MOCK_BRANCHES.splice(index, 1);
    return;
  }
  await api.delete(`/branches/${branchId}`);
};

export const assignAdminToBranch = async (
  api: AxiosInstance,
  branchId: number,
  adminUserId: number
): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] assignAdminToBranch');
    const branch = MOCK_BRANCHES.find(b => b.id === branchId);
    if (branch) branch.adminUserId = adminUserId;
    return;
  }
  await api.post(`/branches/${branchId}/assign-admin`, { adminUserId });
};

export const listAdminsForRestaurant = async (api: AxiosInstance, restaurantId: number): Promise<UserRecord[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listAdminsForRestaurant');
    return MOCK_STAFF.filter(user => user.restaurantId === restaurantId && user.role === 'ROLE_ADMIN');
  }
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { restaurantId },
  });
  return (data ?? []).filter((user) => user.role === 'ROLE_ADMIN');
};

export const createAdmin = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: AdminCreatePayload
): Promise<UserRecord> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] createAdmin');
    const newAdmin: UserRecord = {
      id: Date.now(),
      email: payload.email.toLowerCase(),
      role: 'ROLE_ADMIN',
      restaurantId,
      branchId: payload.branchId ?? null,
      fullName: 'New Admin',
    };
    MOCK_STAFF.push(newAdmin);
    return newAdmin;
  }
  const { data } = await api.post<UserRecord>('/superadmin/users', {
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: 'BRANCH_MANAGER',
    restaurantId,
    ...(payload.branchId !== undefined && payload.branchId !== null ? { branchId: payload.branchId } : {}),
  });
  return data;
};

export const updateAdmin = async (
  api: AxiosInstance,
  email: string,
  payload: AdminUpdatePayload
): Promise<UserRecord> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] updateAdmin');
    const admin = MOCK_STAFF.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (admin) {
      if (payload.branchId !== undefined) admin.branchId = payload.branchId;
      return admin;
    }
    throw new Error('Admin not found');
  }
  const { data } = await api.patch<UserRecord>(`/users/${encodeEmail(email)}`, {
    ...(payload.password ? { password: payload.password } : {}),
    ...(payload.branchId !== undefined ? { branchId: payload.branchId } : {}),
  });
  return data;
};

export const resetAdminPassword = async (
  api: AxiosInstance,
  adminId: number,
  newPassword: string
) => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] resetAdminPassword');
    const admin = MOCK_STAFF.find(u => u.id === adminId);
    return {
      status: 'success',
      message: 'Password reset successfully (mock)',
      newPassword,
      adminEmail: admin?.email ?? 'admin@mock.com',
      adminUserId: adminId,
    };
  }
  const { data } = await api.post<{
    status: string;
    message: string;
    newPassword: string;
    adminEmail: string;
    adminUserId: number;
  }>(`/superadmin/admins/${adminId}/reset-password`, {
    newPassword,
  });
  return data;
};

export const deleteAdmin = async (api: AxiosInstance, email: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] deleteAdmin');
    const index = MOCK_STAFF.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) MOCK_STAFF.splice(index, 1);
    return;
  }
  await api.delete(`/users/${encodeEmail(email)}`);
};

export const listRestaurantStaff = async (api: AxiosInstance, restaurantId: number): Promise<UserRecord[]> => {
  if (USE_MOCK_DATA) {
    console.log('[Mock] listRestaurantStaff');
    return MOCK_STAFF.filter(user => 
      user.restaurantId === restaurantId && 
      user.role !== 'ROLE_ADMIN' && 
      user.role !== 'ROLE_SUPERADMIN'
    );
  }
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { restaurantId },
  });
  return (data ?? []).filter((user) => user.role !== 'ROLE_ADMIN');
};

