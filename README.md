# PlateMenu Frontend

A comprehensive React-based frontend application for restaurant management system with role-based access control. Features a warm, cozy design system perfect for café and restaurant environments.

## Features

- **Multi-role Support**: Customer, Waiter, Kitchen, Admin, and SuperAdmin roles
- **Real-time Updates**: Polling-based order status updates
- **State Management**: Zustand for global state with persistence
- **API Integration**: Axios with React Query for data fetching
- **Responsive Design**: Mobile-first for customer pages, desktop-first for admin
- **Type Safety**: Full TypeScript implementation
- **Mock Data Mode**: Develop without a backend using realistic fake data
- **Warm & Cozy Design**: Restaurant-appropriate color palette and styling

---

## Design System

The app uses a **warm, functional design** tailored for restaurant/café environments.

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Primary (Orange)** | `#f97316` | Buttons, links, active states |
| **Secondary (Green)** | `#22c55e` | Success states, available items |
| **Warm (Stone)** | `#292524` | Text, borders, backgrounds |

### CSS Utility Classes

Pre-built classes in `globals.css` for rapid development:

#### Cards
```html
<div class="card">Basic card with hover effect</div>
<div class="card-elevated">Card with stronger shadow</div>
<div class="menu-card">Menu item card with image support</div>
```

#### Buttons
```html
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary Action</button>
<button class="btn-outline">Outline Button</button>
<button class="btn-ghost">Ghost Button</button>
<button class="btn-danger">Danger Action</button>
<button class="btn-primary btn-sm">Small Button</button>
<button class="btn-primary btn-lg">Large Button</button>
```

#### Order Status Badges
```html
<span class="badge-ordered">New Order</span>
<span class="badge-preparing">Preparing</span>
<span class="badge-ready">Ready</span>
<span class="badge-served">Served</span>
<span class="badge-cancelled">Cancelled</span>
```

#### Form Elements
```html
<label class="label">Email</label>
<input class="input" placeholder="Enter email..." />
<input class="input-error" /> <!-- For validation errors -->
<p class="error-text">This field is required</p>
```

#### Sidebar Navigation
```html
<nav class="sidebar">
  <div class="sidebar-header">Logo</div>
  <div class="sidebar-nav">
    <a class="sidebar-item">Dashboard</a>
    <a class="sidebar-item-active">Orders</a>
  </div>
  <div class="sidebar-footer">User Info</div>
</nav>
```

---

## Mock Data Mode

Develop the frontend without a running backend by enabling mock data mode.

### Enabling Mock Data

1. Copy the example env file:
```bash
cp .env.example .env.local
```

2. Set the mock data flag:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

3. Restart the dev server:
```bash
npm run dev
```

### Using the Data Provider

The `useDataProvider` hook automatically switches between mock and real API:

```typescript
import { useDataProvider } from '@/hooks/useDataProvider';

function MyComponent() {
  const { getMenuAdmin, getKitchenOrders, isUsingMockData } = useDataProvider();
  
  useEffect(() => {
    async function loadData() {
      const menu = await getMenuAdmin(1);
      const orders = await getKitchenOrders(1);
      // Works the same whether using mock or real API!
    }
    loadData();
  }, []);
  
  return (
    <div>
      {isUsingMockData && <span class="badge-ordered">Mock Mode</span>}
      {/* ... */}
    </div>
  );
}
```

### Available Mock Data

Located in `src/data/mock-data.ts`:

- **Restaurant**: "Cozy Corner Café"
- **Branches**: Downtown Branch, Mall Branch
- **Menu Items**: 18 items across 5 categories (Appetizers, Main Course, Burgers, Drinks, Desserts)
- **Tables**: 6 tables with varying seat counts
- **Staff**: 5 users (SuperAdmin, Admin, Kitchen, 2 Waiters)
- **Orders**: 5 sample orders in different statuses

### Helper Functions

```typescript
import { 
  getMenuByCategory,      // Group menu by category
  getOrdersByStatus,      // Filter orders by status
  getActiveKitchenOrders, // Get orders for kitchen display
  formatPrice,            // Format cents to display (e.g., "12.50 AZN")
  getStatusBadgeClass,    // Get CSS class for status
  getStatusLabel,         // Get human-readable status
} from '@/data/mock-data';
```

---

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/             # Authentication pages
│   ├── admin/              # Admin dashboard
│   ├── kitchen/            # Kitchen display
│   ├── superadmin/         # SuperAdmin panel
│   └── table/              # Customer table view
│
├── components/             # Shared UI components
│   ├── customer/           # Customer-facing components
│   └── dashboard/          # Dashboard components
│
├── data/                   # Mock data for development
│   └── mock-data.ts
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useDataProvider.ts  # Mock/Real API switcher
│
├── lib/                    # Utilities and API clients
│   ├── api/                # API functions by domain
│   │   ├── admin.ts
│   │   ├── customer.ts
│   │   ├── kitchen.ts
│   │   └── superadmin.ts
│   └── env.ts              # Environment configuration
│
├── providers/              # React context providers
│   └── AuthProvider.tsx
│
└── types/                  # TypeScript interfaces
    ├── auth.ts
    └── entities.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8080` (or enable mock data mode)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env.local
# Edit .env.local as needed
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Backend API URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` | Enable mock data mode |

## Role-Based Routes

- **Customer**: `/table/[tableId]` - QR code scanned menu
- **Kitchen**: `/kitchen/[branchId]` - Kitchen display system
- **Admin**: `/admin/*` - Branch management
- **SuperAdmin**: `/superadmin/*` - Restaurant-wide management

## Troubleshooting

### Styling Not Applying
- Ensure Tailwind is properly configured in `tailwind.config.js`
- Check that `globals.css` is imported in your root layout
- Clear `.next` cache: `rm -rf .next && npm run dev`

### Mock Data Not Loading
- Verify `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Restart the dev server after changing env variables
- Check browser console for import errors

### Authentication Issues
- Check localStorage for `auth-storage` key
- Verify JWT token format
- Ensure backend returns proper auth response

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

MIT

