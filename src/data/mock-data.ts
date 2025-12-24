/**
 * Mock Data for Development
 * admin@downtown.cozycorner.com
 * admin123
 * 
 * This file contains realistic mock data for development without a backend.
 * To enable mock data, set NEXT_PUBLIC_USE_MOCK_DATA=true in your .env.local file.
 */

import type { Restaurant, Branch, UserRecord, MenuItem, TableEntity, Order, OrderStatus } from '@/types/entities';

// ===== RESTAURANT =====
export const MOCK_RESTAURANT: Restaurant = {
  id: 1,
  name: 'Cozy Corner Café',
  ownerSuperAdminId: 1,
  timezone: 'Europe/Baku',
  currency: 'AZN',
  settingsJson: JSON.stringify({
    theme: 'warm',
    logoUrl: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=200&h=200&fit=crop',
  }),
};

// ===== BRANCHES =====
export const MOCK_BRANCHES: Branch[] = [
  {
    id: 1,
    restaurantId: 1,
    name: 'Downtown Branch',
    adminUserId: 2,
  },
  {
    id: 2,
    restaurantId: 1,
    name: 'Mall Branch',
    adminUserId: 3,
  },
];

// ===== STAFF / USERS =====
export const MOCK_STAFF: UserRecord[] = [
  {
    id: 1,
    email: 'superadmin@cozycorner.com',
    role: 'ROLE_SUPERADMIN',
    restaurantId: 1,
    branchId: null,
    fullName: 'Ali Mammadov',
    firstName: 'Ali',
    lastName: 'Mammadov',
    phone: '+994501234567',
  },
  {
    id: 2,
    email: 'admin@downtown.cozycorner.com',
    role: 'ROLE_ADMIN',
    restaurantId: 1,
    branchId: 1,
    fullName: 'Leyla Huseynova',
    firstName: 'Leyla',
    lastName: 'Huseynova',
    phone: '+994502345678',
  },
  {
    id: 3,
    email: 'kitchen1@cozycorner.com',
    role: 'ROLE_KITCHEN',
    restaurantId: 1,
    branchId: 1,
    fullName: 'Rashad Aliyev',
    firstName: 'Rashad',
    lastName: 'Aliyev',
    phone: '+994503456789',
    salaryAmount: 800,
    salaryPeriod: 'MONTHLY',
  },
  {
    id: 4,
    email: 'waiter1@cozycorner.com',
    role: 'ROLE_WAITER',
    restaurantId: 1,
    branchId: 1,
    fullName: 'Aysel Hasanova',
    firstName: 'Aysel',
    lastName: 'Hasanova',
    phone: '+994504567890',
    salaryAmount: 600,
    salaryPeriod: 'MONTHLY',
  },
  {
    id: 5,
    email: 'waiter2@cozycorner.com',
    role: 'ROLE_WAITER',
    restaurantId: 1,
    branchId: 1,
    fullName: 'Farid Guliyev',
    firstName: 'Farid',
    lastName: 'Guliyev',
    phone: '+994505678901',
    salaryAmount: 50,
    salaryPeriod: 'DAILY',
  },
];

// ===== MENU ITEMS =====
// Using Unsplash images for realistic food photos
export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Appetizers
  {
    id: 1,
    restaurantId: 1,
    name: 'French fries',
    description: 'Creamy homemade hummus served with warm pita bread and olive oil drizzle',
    priceCents: 890,
    category: 'Appetizers',
    isAvailable: true,
    image: '/imgs/fries.jpg',
  },
 

  {
    id: 2,
    restaurantId: 1,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan, croutons, and house-made Caesar dressing',
    priceCents: 1100,
    category: 'Appetizers',
    isAvailable: true,
    image: '/imgs/salad.jpg',
  },

  // Main Courses
  {
    id: 3,
    restaurantId: 1,
    name: 'Grilled Salmon(Sushi)',
    description: 'Fresh Atlantic salmon with lemon butter sauce, served with seasonal vegetables',
    priceCents: 2450,
    category: 'Main Course',
    isAvailable: true,
    image: '/imgs/sushi.jpg',
  },
  
  {
    id: 4,
    restaurantId: 1,
    name: 'Vegetable Risotto',
    description: 'Creamy arborio rice with seasonal vegetables and parmesan',
    priceCents: 1450,
    category: 'Main Course',
    isAvailable: true,
    image: '/imgs/salad.jpg',
  },
  {
    id: 5,
    restaurantId: 1,
    name: 'Chicken',
    description: 'Herb-crusted lamb chops with rosemary jus and roasted potatoes',
    priceCents: 3250,
    category: 'Main Course',
    isAvailable: false,
    image: '/imgs/chicken.jpg',
  },

  // Burgers & Sandwiches
  {
    id: 6,
    restaurantId: 1,
    name: 'Classic Burger',
    description: 'Angus beef patty with lettuce, tomato, cheese, and special sauce',
    priceCents: 1450,
    category: 'Burgers',
    isAvailable: true,
    image: '/imgs/hamburger.jpg',
  },
 

  // Drinks
 
 
 
  {
    id: 7,
    restaurantId: 1,
    name: 'Coffee',
    description: 'House-made fresh lemonade with mint',
    priceCents: 400,
    category: 'Drinks',
    isAvailable: true,
    image: '/imgs/coffee.jpg',
  },

  // Desserts
  {
    id: 8,
    restaurantId: 1,
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    priceCents: 850,
    category: 'Desserts',
    isAvailable: true,
    image: '/imgs/cake.jpg',
  },
 

];

// Helper to get menu item images (separate from entities for flexibility)
export const MENU_ITEM_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1637949385162-e416fb820e9a?w=400&h=300&fit=crop',
  2: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
  3: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  4: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
  5: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  6: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
  7: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop',
  8: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
  9: 'https://images.unsplash.com/photo-1514516816566-de580c621376?w=400&h=300&fit=crop',
  10: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  11: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
  12: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
  13: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
  14: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
  15: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
  16: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
  17: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  18: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop',
};

// ===== TABLES =====
export const MOCK_TABLES: TableEntity[] = [
  {
    id: 1,
    restaurantId: 1,
    branchId: 1,
    name: 'Window Seat 1',
    tableNumber: 1,
    seatCount: 2,
    active: true,
    qrCode: 'QR-TABLE-001',
  },
  {
    id: 2,
    restaurantId: 1,
    branchId: 1,
    name: 'Window Seat 2',
    tableNumber: 2,
    seatCount: 2,
    active: true,
    qrCode: 'QR-TABLE-002',
  },
  {
    id: 3,
    restaurantId: 1,
    branchId: 1,
    name: 'Center Table',
    tableNumber: 3,
    seatCount: 4,
    active: true,
    qrCode: 'QR-TABLE-003',
  },
  {
    id: 4,
    restaurantId: 1,
    branchId: 1,
    name: 'Family Booth',
    tableNumber: 4,
    seatCount: 6,
    active: true,
    qrCode: 'QR-TABLE-004',
  },
  {
    id: 5,
    restaurantId: 1,
    branchId: 1,
    name: 'Terrace 1',
    tableNumber: 5,
    seatCount: 4,
    active: true,
    qrCode: 'QR-TABLE-005',
  },
  {
    id: 6,
    restaurantId: 1,
    branchId: 1,
    name: 'VIP Room',
    tableNumber: 6,
    seatCount: 8,
    active: false,
    qrCode: 'QR-TABLE-006',
  },
];

// ===== ORDERS =====
const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    restaurantId: 1,
    branchId: 1,
    tableId: 1,
    tableName: 'Window Seat 1',
    guestSessionId: 'session-001',
    status: 'ORDERED',
    items: [
      { id: 1, menuItemId: 1, qty: 1, priceCents: 890, menuItemName: 'Hummus with Pita' },
      { id: 2, menuItemId: 5, qty: 1, priceCents: 2450, menuItemName: 'Grilled Salmon' },
      { id: 3, menuItemId: 13, qty: 2, priceCents: 550, menuItemName: 'Cappuccino' },
    ],
    totalCents: 4440,
    createdAt: tenMinutesAgo.toISOString(),
    updatedAt: tenMinutesAgo.toISOString(),
    notes: 'No onions please',
  },
  {
    id: 2,
    restaurantId: 1,
    branchId: 1,
    tableId: 3,
    tableName: 'Center Table',
    guestSessionId: 'session-002',
    status: 'PREPARING',
    items: [
      { id: 4, menuItemId: 10, qty: 2, priceCents: 1450, menuItemName: 'Classic Burger' },
      { id: 5, menuItemId: 12, qty: 2, priceCents: 450, menuItemName: 'Fresh Orange Juice' },
    ],
    totalCents: 3800,
    createdAt: twentyMinutesAgo.toISOString(),
    updatedAt: tenMinutesAgo.toISOString(),
  },
  {
    id: 3,
    restaurantId: 1,
    branchId: 1,
    tableId: 4,
    tableName: 'Family Booth',
    guestSessionId: 'session-003',
    status: 'PREPARED_WAITING',
    items: [
      { id: 6, menuItemId: 7, qty: 3, priceCents: 1650, menuItemName: 'Chicken Alfredo Pasta' },
      { id: 7, menuItemId: 4, qty: 2, priceCents: 1100, menuItemName: 'Caesar Salad' },
      { id: 8, menuItemId: 16, qty: 2, priceCents: 850, menuItemName: 'Chocolate Lava Cake' },
      { id: 9, menuItemId: 15, qty: 4, priceCents: 400, menuItemName: 'Lemonade' },
    ],
    totalCents: 9550,
    createdAt: thirtyMinutesAgo.toISOString(),
    updatedAt: tenMinutesAgo.toISOString(),
  },
  {
    id: 4,
    restaurantId: 1,
    branchId: 1,
    tableId: 2,
    tableName: 'Window Seat 2',
    guestSessionId: 'session-004',
    status: 'SERVED',
    items: [
      { id: 10, menuItemId: 6, qty: 1, priceCents: 2990, menuItemName: 'Beef Steak' },
      { id: 11, menuItemId: 14, qty: 1, priceCents: 600, menuItemName: 'Iced Latte' },
    ],
    totalCents: 3590,
    createdAt: oneHourAgo.toISOString(),
    updatedAt: thirtyMinutesAgo.toISOString(),
    notes: 'Medium-rare steak',
  },
  {
    id: 5,
    restaurantId: 1,
    branchId: 1,
    tableId: 5,
    tableName: 'Terrace 1',
    guestSessionId: 'session-005',
    status: 'COMPLETED',
    items: [
      { id: 12, menuItemId: 2, qty: 1, priceCents: 750, menuItemName: 'Bruschetta' },
      { id: 13, menuItemId: 17, qty: 2, priceCents: 750, menuItemName: 'Tiramisu' },
      { id: 14, menuItemId: 13, qty: 2, priceCents: 550, menuItemName: 'Cappuccino' },
    ],
    totalCents: 3350,
    createdAt: oneHourAgo.toISOString(),
    updatedAt: thirtyMinutesAgo.toISOString(),
  },
];

// ===== CUSTOMER SESSIONS =====
export interface MockCustomerSession {
  id: number;
  guestSessionId: string;
  tableId: number;
  branchId: number;
  createdAt: string;
  expiresAt: string;
}

export const MOCK_CUSTOMER_SESSIONS: MockCustomerSession[] = [];

// ===== HELPER FUNCTIONS =====

/**
 * Start a mock customer session
 */
export function startMockCustomerSession(branchId: number, tableId: number): MockCustomerSession {
  const session: MockCustomerSession = {
    id: Date.now(),
    guestSessionId: `mock-session-${Date.now()}`,
    tableId,
    branchId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
  };
  MOCK_CUSTOMER_SESSIONS.push(session);
  return session;
}

/**
 * Get menu items grouped by category
 */
export function getMenuByCategory(): Record<string, MenuItem[]> {
  return MOCK_MENU_ITEMS.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
}

/**
 * Get orders by status
 */
export function getOrdersByStatus(status: OrderStatus): Order[] {
  return MOCK_ORDERS.filter(order => order.status === status);
}

/**
 * Get active orders for kitchen (ORDERED, PREPARING, PREPARED_WAITING)
 */
export function getActiveKitchenOrders(): Order[] {
  const activeStatuses: OrderStatus[] = ['ORDERED', 'PREPARING', 'PREPARED_WAITING'];
  return MOCK_ORDERS.filter(order => activeStatuses.includes(order.status));
}

/**
 * Get staff by branch
 */
export function getStaffByBranch(branchId: number): UserRecord[] {
  return MOCK_STAFF.filter(user => user.branchId === branchId);
}

/**
 * Get tables by branch
 */
export function getTablesByBranch(branchId: number): TableEntity[] {
  return MOCK_TABLES.filter(table => table.branchId === branchId);
}

/**
 * Format price from cents to display string
 */
export function formatPrice(cents: number, currency: string = 'AZN'): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: OrderStatus): string {
  const classMap: Record<OrderStatus, string> = {
    ORDERED: 'badge-ordered',
    PREPARING: 'badge-preparing',
    PREPARED_WAITING: 'badge-ready',
    SERVED: 'badge-served',
    COMPLETED: 'badge-served',
    CANCELLED: 'badge-cancelled',
  };
  return classMap[status] || 'badge';
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: OrderStatus): string {
  const labelMap: Record<OrderStatus, string> = {
    ORDERED: 'New Order',
    PREPARING: 'Preparing',
    PREPARED_WAITING: 'Ready',
    SERVED: 'Served',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labelMap[status] || status;
}
