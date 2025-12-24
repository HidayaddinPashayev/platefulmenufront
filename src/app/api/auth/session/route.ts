import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, USE_MOCK_DATA } from '@/lib/env';
import type { AuthSession, AuthUser } from '@/types/auth';
import { applyClaimsToUser, buildAuthUser, buildUserFromClaims } from '@/lib/auth';
import { parseJwt } from '@/lib/token';

// Mock token to user mapping
const MOCK_TOKENS: Record<string, AuthUser> = {
  'mock-token-superadmin-12345': {
    id: 1,
    email: 'superadmin@cozycorner.com',
    role: 'ROLE_SUPERADMIN',
    restaurantId: 1,
    branchId: null,
    permissions: [],
  },
  'mock-token-admin-67890': {
    id: 2,
    email: 'admin@downtown.cozycorner.com',
    role: 'ROLE_ADMIN',
    restaurantId: 1,
    branchId: 1,
    permissions: [],
  },
  'mock-token-kitchen-11111': {
    id: 3,
    email: 'kitchen1@cozycorner.com',
    role: 'ROLE_KITCHEN',
    restaurantId: 1,
    branchId: 1,
    permissions: [],
  },
};

export async function GET() {
  const token = cookies().get('token')?.value;

  if (!token) {
    const session: AuthSession = { token: null, user: null };
    return NextResponse.json(session);
  }

  // Mock mode
  if (USE_MOCK_DATA) {
    const user = MOCK_TOKENS[token];
    
    if (!user) {
      const response = NextResponse.json<AuthSession>({ token: null, user: null }, { status: 200 });
      response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
      response.cookies.set('role', '', { path: '/', maxAge: 0 });
      return response;
    }

    const session: AuthSession = { token, user };
    return NextResponse.json(session);
  }

  // Real API mode
  const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  }).catch((error) => {
    console.error('[Auth] profile fetch failed', error);
    return undefined;
  });

  if (!profileResponse || !profileResponse.ok) {
    const response = NextResponse.json<AuthSession>({ token: null, user: null }, { status: 200 });
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    response.cookies.set('role', '', { path: '/', maxAge: 0 });
    return response;
  }

  const rawUser = await profileResponse.json();
  const claims = parseJwt(token);
  let user = buildAuthUser(rawUser, claims) ?? buildUserFromClaims(claims) ?? null;

  if (user) {
    applyClaimsToUser(user, claims);
  }

  const session: AuthSession = { token, user };

  if (!user) {
    const response = NextResponse.json<AuthSession>({ token: null, user: null }, { status: 200 });
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    response.cookies.set('role', '', { path: '/', maxAge: 0 });
    return response;
  }

  const response = NextResponse.json(session);
  response.cookies.set('role', user.role, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return response;
}

