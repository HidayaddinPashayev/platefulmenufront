export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:8080/api';

/**
 * Enable mock data mode for development without a backend.
 * Set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local to enable.
 */
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

import type { UserRole } from '@/types/auth';
import { rolePathMap } from './roles';

export const DASHBOARD_REDIRECTS: Record<UserRole, string> = rolePathMap;

