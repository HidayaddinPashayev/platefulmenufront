'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { getRestaurant, listBranches } from '@/lib/api/superadmin';
import type { Branch, Restaurant } from '@/types/entities';

interface DashboardState {
  restaurant: Restaurant | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: DashboardState = {
  restaurant: null,
  branches: [],
  loading: true,
  error: null,
};

export default function SuperadminDashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.restaurantId) {
        setState({ restaurant: null, branches: [], loading: false, error: 'Restaurant assignment missing in token.' });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [restaurant, branches] = await Promise.all([
          getRestaurant(api, user.restaurantId),
          listBranches(api, user.restaurantId),
        ]);
        if (cancelled) return;
        setState({ restaurant, branches, loading: false, error: null });
      } catch (error) {
        console.error('[SuperadminDashboard] load error', error);
        if (cancelled) return;
        setState({ restaurant: null, branches: [], loading: false, error: 'Failed to load restaurant information.' });
      }
    };

    if (user?.role === 'ROLE_SUPERADMIN') {
      void load();
    } else {
      setState(INITIAL_STATE);
    }

    return () => {
      cancelled = true;
    };
  }, [api, user]);

  if (user?.role !== 'ROLE_SUPERADMIN') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to SuperAdmin role.
      </div>
    );
  }

  if (!user.restaurantId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your JWT is missing the required restaurant identifier. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="page-header">
        <h1 className="page-title">Restaurant overview</h1>
        <p className="page-subtitle">
          You are managing a single restaurant tenant. All data shown belongs to that restaurant only.
        </p>
      </header>

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.loading ? (
        <div className="card">
          <div className="skeleton h-40 w-full"></div>
        </div>
      ) : state.restaurant ? (
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4 flex-1 min-w-[300px]">
              <h2 className="text-2xl font-bold text-warm-900">{state.restaurant.name}</h2>
              <dl className="grid gap-4 text-sm text-warm-600 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Owner SuperAdmin ID</dt>
                  <dd className="mt-1 text-base text-warm-900 font-medium">{state.restaurant.ownerSuperAdminId}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Timezone</dt>
                  <dd className="mt-1 text-base text-warm-900 font-medium">{state.restaurant.timezone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Currency</dt>
                  <dd className="mt-1 text-base text-warm-900 font-medium">{state.restaurant.currency ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Settings JSON</dt>
                  <dd className="mt-1 break-words text-xs text-warm-500 font-mono bg-warm-50 p-2 rounded">
                    {state.restaurant.settingsJson ? state.restaurant.settingsJson.slice(0, 120) + (state.restaurant.settingsJson.length > 120 ? '…' : '') : '—'}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-warm-200 bg-warm-50 px-6 py-5 text-sm text-warm-600 min-w-[200px]">
              <p className="text-xs uppercase tracking-wide text-warm-400 font-bold">Branches</p>
              <p className="mt-2 text-4xl font-bold text-primary-600">{state.branches.length}</p>
              <p className="mt-2 text-xs text-warm-500">
                {state.branches.length === 1
                  ? '1 branch linked'
                  : `${state.branches.length} branches linked`}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="card">
          <p className="text-warm-500">Restaurant information is not available.</p>
        </div>
      )}
    </div>
  );
}

