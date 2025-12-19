# Mock Data Mode - Quick Start Guide

## How to Switch Between Mock and Real API

### Enable Mock Mode (No Backend Needed)

1. **Set environment variable** in `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Login with mock credentials**:
   - **SuperAdmin**: 
     - Email: `superadmin@cozycorner.com`
     - Password: `admin123`
   
   - **Admin**:
     - Email: `admin@downtown.cozycorner.com`
     - Password: `admin123`
   
   - **Kitchen**:
     - Email: `kitchen1@cozycorner.com`
     - Password: `kitchen123`

### Switch to Real API

1. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

2. **Ensure backend is running** on `http://localhost:8080`

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Login with real credentials** from your backend

---

## What Works in Mock Mode

✅ **Authentication** - Login with mock users
✅ **Menu Items** - 18 sample items across 5 categories
✅ **Orders** - 5 sample orders in various statuses
✅ **Kitchen Display** - Active orders (ORDERED, PREPARING, PREPARED_WAITING)
✅ **Tables** - 6 sample tables
✅ **Staff** - 5 sample users
✅ **Branches** - 2 sample branches

---

## How It Works

The `useDataProvider` hook automatically detects mock mode and returns fake data instead of calling the backend:

```typescript
import { useDataProvider } from '@/hooks/useDataProvider';

function MyPage() {
  const { getMenuAdmin, isUsingMockData } = useDataProvider();
  
  // This will return mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
  const menu = await getMenuAdmin(1);
}
```

---

## Troubleshooting

### "Cannot connect to backend" error
- Check that `NEXT_PUBLIC_USE_MOCK_DATA=true` is set
- Restart the dev server after changing `.env.local`
- Clear browser cache and reload

### Mock data not appearing
- Verify `.env.local` is in the project root (not in `src/`)
- Check browser console for the message: `[Auth] Mock mode enabled`
- Ensure you restarted the dev server

### Login fails in mock mode
- Use the exact email addresses listed above
- Password is case-sensitive: `admin123`
- Check browser console for error messages
