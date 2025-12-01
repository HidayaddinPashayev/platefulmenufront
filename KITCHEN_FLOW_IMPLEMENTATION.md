# Kitchen KDS Flow Implementation

## ✅ Implementation Complete

The kitchen flow has been rewritten based on backend requirements with a redirect-based approach.

## Flow Overview

### 1. PIN Entry Page (`/kitchen/[branchId]`)

**File:** `src/app/kitchen/[branchId]/page.tsx`

**Behavior:**
- On page load: Checks for stored KDS token
- If token exists → Redirects to `/kitchen/[branchId]/orders`
- If no token → Shows PIN entry screen
- After PIN verification → Stores token and redirects to orders page

**Key Code:**
```typescript
// Check for token on load
const kdsToken = getKdsToken(branchId);
if (kdsToken) {
  router.push(`/kitchen/${branchId}/orders`);
} else {
  // Show PIN screen
}

// After PIN success
const handlePinSuccess = () => {
  const token = getKdsToken(branchId);
  if (token) {
    router.push(`/kitchen/${branchId}/orders`);
  }
};
```

### 2. Orders Display Page (`/kitchen/[branchId]/orders`)

**File:** `src/app/kitchen/[branchId]/orders/page.tsx`

**Behavior:**
- On page load: Checks for valid KDS token
- If token missing/expired → Redirects to `/kitchen/[branchId]`
- If token valid → Shows orders display
- All API calls automatically include `X-KDS-Token` header

**Key Code:**
```typescript
useEffect(() => {
  const kdsToken = getKdsToken(branchId);
  const expiresAt = localStorage.getItem(`kdsExpires_branch_${branchId}`);
  
  if (!kdsToken || !expiresAt || new Date(expiresAt) <= new Date()) {
    // Token missing or expired - redirect to PIN
    router.push(`/kitchen/${branchId}`);
    return;
  }
  
  // Token valid - show orders
  setAuthorized(true);
}, [branchId, router]);
```

### 3. Token Storage

**File:** `src/lib/kds-token.ts`

**Storage Keys:**
- Token: `kdsToken_branch_{branchId}`
- Expiry: `kdsExpires_branch_{branchId}`

**Functions:**
- `getKdsToken(branchId)` - Gets token and validates expiry
- `setKdsToken(branchId, token, expiresAt)` - Stores token and expiry
- `clearKdsToken(branchId)` - Removes token and expiry

### 4. API Client Header Attachment

**File:** `src/lib/api.ts`

**Behavior:**
- Automatically detects kitchen endpoints: `/branches/{branchId}/kitchen/*`
- Extracts branchId from URL
- Reads KDS token from localStorage at request time
- Attaches `X-KDS-Token` header if token exists

**Key Code:**
```typescript
instance.interceptors.request.use((config) => {
  const isKitchenEndpoint = /\/branches\/\d+\/kitchen/.test(urlPath) 
    && !urlPath.includes('/kitchen/pin');
  
  if (isKitchenEndpoint) {
    const branchId = extractBranchIdFromUrl(urlPath);
    if (branchId) {
      const kdsToken = getKdsToken(branchId);
      if (kdsToken) {
        config.headers['X-KDS-Token'] = kdsToken;
      }
    }
  }
  return config;
});
```

## Complete Flow

### Initial Visit (No Token)
1. User opens `/kitchen/1763914140416`
2. Page checks localStorage → No token found
3. Shows PIN entry screen
4. User enters PIN → `POST /api/branches/1763914140416/kitchen/pin/verify`
5. Backend returns: `{ branchId, kdsToken, expiresAt }`
6. Frontend stores: `localStorage.setItem('kdsToken_branch_1763914140416', kdsToken)`
7. Frontend redirects: `router.push('/kitchen/1763914140416/orders')`
8. Orders page loads → Checks token → Valid → Shows orders
9. Orders component fetches: `GET /api/branches/1763914140416/kitchen/orders`
10. API client attaches: `X-KDS-Token: {kdsToken}` header
11. Backend validates token → Returns orders

### Subsequent Visit (With Token)
1. User opens `/kitchen/1763914140416`
2. Page checks localStorage → Token found
3. Redirects immediately: `router.push('/kitchen/1763914140416/orders')`
4. Orders page loads → Token valid → Shows orders directly

### Token Expired
1. User opens `/kitchen/1763914140416/orders`
2. Page checks token → Expired
3. Clears token from localStorage
4. Redirects to: `/kitchen/1763914140416`
5. Shows PIN entry screen

## Files Modified

1. ✅ `src/app/kitchen/[branchId]/page.tsx` - PIN entry page with redirect
2. ✅ `src/app/kitchen/[branchId]/orders/page.tsx` - Orders page with token check
3. ✅ `src/lib/kds-token.ts` - Token storage/retrieval (already correct)
4. ✅ `src/lib/api.ts` - API client with X-KDS-Token header (already correct)
5. ✅ `src/components/kitchen/KdsPinLogin.tsx` - PIN verification (already correct)

## Testing Checklist

✅ Open `/kitchen/1763914140416` → Should show PIN screen
✅ Enter correct PIN → Should redirect to `/kitchen/1763914140416/orders`
✅ Orders page should display orders
✅ Refresh orders page → Should stay on orders (token valid)
✅ Clear localStorage → Should redirect to PIN screen
✅ Enter wrong PIN → Should show error and stay on PIN screen

## Key Points

1. **Redirect-based flow** - Uses Next.js router for navigation
2. **Token validation** - Checks token on both pages
3. **Automatic header** - API client attaches X-KDS-Token automatically
4. **Consistent keys** - Uses `kdsToken_branch_{branchId}` format
5. **Expiry handling** - Validates token expiry before use

