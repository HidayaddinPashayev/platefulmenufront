'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { getBranch, listMenuItems, listStaff, listTables } from '@/lib/api/admin';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

interface DashboardState {
  branch: Branch | null;
  staff: UserRecord[];
  tables: TableEntity[];
  menu: MenuItem[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: DashboardState = {
  branch: null,
  staff: [],
  tables: [],
  menu: [],
  loading: true,
  error: null,
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.branchId || !user.restaurantId) {
        setState({
          branch: null,
          staff: [],
          tables: [],
          menu: [],
          loading: false,
          error: 'Your account is missing branch or restaurant assignments.',
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [branch, staff, tables, menu] = await Promise.all([
          getBranch(api, user.branchId),
          listStaff(api, user.branchId),
          listTables(api, user.restaurantId, user.branchId),
          listMenuItems(api, user.restaurantId),
        ]);

        if (cancelled) return;

        setState({
          branch,
          staff,
          tables,
          menu,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('[AdminDashboard] load error', err);
        if (!cancelled) {
          setState({
            branch: null,
            staff: [],
            tables: [],
            menu: [],
            loading: false,
            error: 'Failed to load branch information.',
          });
        }
      }
    };

    if (user?.role === 'ROLE_ADMIN') {
      void load();
    } else {
      setState(INITIAL_STATE);
    }

    return () => {
      cancelled = true;
    };
  }, [api, user]);

  const stats = useMemo(
    () => ({
      staffCount: state.staff.length,
      tableCount: state.tables.length,
      activeTables: state.tables.filter((table) => table.active).length,
      menuCount: state.menu.length,
    }),
    [state.staff, state.tables, state.menu]
  );

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!user.branchId || !user.restaurantId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing a branch assignment. Please contact your SuperAdmin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="page-header">
        <h1 className="page-title">Branch overview</h1>
        <p className="page-subtitle">
          Review key details for your assigned branch. All metrics are scoped to your branch only.
        </p>
      </header>

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Staff members" value={stats.staffCount} loading={state.loading} />
        <StatCard label="Tables" value={stats.tableCount} loading={state.loading} />
        <StatCard label="Active tables" value={stats.activeTables} loading={state.loading} />
        <StatCard label="Menu items" value={stats.menuCount} loading={state.loading} />
      </section>

      <section className="card">
        <h2 className="section-title">Branch details</h2>
        {state.loading ? (
          <div className="skeleton h-20 w-full"></div>
        ) : state.branch ? (
          <dl className="mt-4 grid gap-4 text-sm text-warm-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Branch name</dt>
              <dd className="mt-1 text-base text-warm-900 font-medium">{state.branch.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Branch ID</dt>
              <dd className="mt-1 text-base text-warm-900 font-medium">{state.branch.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Restaurant ID</dt>
              <dd className="mt-1 text-base text-warm-900 font-medium">{state.branch.restaurantId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-warm-400 font-bold">Assigned admin ID</dt>
              <dd className="mt-1 text-base text-warm-900 font-medium">{state.branch.adminUserId ?? 'You'}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-warm-500">
            Branch data could not be loaded. Try refreshing the page.
          </p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="section-title">Staff</h2>
          {state.loading ? (
            <div className="space-y-2">
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          ) : state.staff.length === 0 ? (
            <div className="empty-state py-6">
              <p className="empty-state-description">No staff registered yet.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-warm-600">
              {state.staff.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-warm-100 px-3 py-2 hover:bg-warm-50 transition-colors"
                >
                  <span className="font-medium">{member.email}</span>
                  <span className="text-xs uppercase text-warm-400 font-bold bg-warm-100 px-2 py-1 rounded">
                    {member.role.replace('ROLE_', '')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Tables</h2>
          {state.loading ? (
            <div className="space-y-2">
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          ) : state.tables.length === 0 ? (
            <div className="empty-state py-6">
              <p className="empty-state-description">
                No tables registered. Create tables to start seating guests.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-warm-600">
              {state.tables.map((table) => (
                <li
                  key={table.id}
                  className="flex items-center justify-between rounded-lg border border-warm-100 px-3 py-2 hover:bg-warm-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-warm-800">
                      Table {table.tableNumber ?? table.id}
                    </p>
                    <p className="text-xs text-warm-500">
                      Seats {table.seatCount ?? 'N/A'} • <span className={table.active ? 'text-green-600 font-medium' : 'text-warm-400'}>{table.active ? 'Active' : 'Inactive'}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Menu preview</h2>
        {state.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-20 w-full"></div>
          </div>
        ) : state.menu.length === 0 ? (
          <div className="empty-state py-6">
            <p className="empty-state-description">
              No menu items available. Menu changes are managed by the SuperAdmin.
            </p>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.menu.slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-xl border border-warm-100 px-4 py-3 hover:shadow-sm hover:border-warm-200 transition-all bg-warm-50/50">
                <p className="text-sm font-semibold text-warm-800">{item.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-primary-600 font-bold">
                    ${((item.priceCents ?? 0) / 100).toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-warm-200 text-warm-600'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  loading: boolean;
}

function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <div className="card flex flex-col justify-between h-full">
      <p className="text-xs uppercase tracking-wide text-warm-400 font-bold">{label}</p>
      <p className="mt-2 text-3xl font-bold text-warm-900">
        {loading ? <span className="skeleton h-8 w-16 inline-block"></span> : value}
      </p>
    </div>
  );
}

