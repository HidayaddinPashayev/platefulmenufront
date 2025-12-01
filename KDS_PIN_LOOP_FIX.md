# KDS PIN Infinite Loop Fix

## Root Cause Analysis

The infinite PIN loop was caused by **multiple issues working together**:

### 1. **Complex State Management with Async Operations**
The original implementation tried to fetch orders immediately after PIN verification, which created a race condition:
- Token was stored in localStorage
- Immediately tried to fetch orders
- But the API client might not have picked up the token yet
- Or the token verification happened before localStorage write completed

### 2. **Unnecessary API Calls on Initialization**
The page was making API calls during initialization to check token validity, which could fail and cause loops.

### 3. **Inconsistent Phase Management**
The page used `showPinLogin` boolean state instead of a clear phase-based approach, making state transitions unclear.

## Fixes Implemented

### ✅ 1. Simplified State Management (`src/app/kitchen/[branchId]/page.tsx`)

**Before:**
- Used `showPinLogin: boolean | null` with complex async initialization
- Tried to fetch orders during initialization
- Had separate `handlePinSuccess` that tried to fetch orders again

**After:**
- Uses clear `PagePhase` type: `'loading' | 'pin' | 'orders'`
- On initialization: Only checks localStorage for token (no API call)
- If token exists → set phase to `'orders'`
- If no token → set phase to `'pin'`
- After PIN success: Simply switch phase to `'orders'` (no API call needed)

**Key Change:**
```typescript
// Simple initialization - just check localStorage
const kdsToken = getKdsToken(branchId);
if (kdsToken) {
  setPhase('orders');  // Token exists, show orders
} else {
  setPhase('pin');     // No token, show PIN
}
```

### ✅ 2. Improved Token Storage Verification (`src/components/kitchen/KdsPinLogin.tsx`)

**Before:**
- Stored token and immediately verified
- Called `onSuccess()` which tried to fetch orders

**After:**
- Stores token
- Adds small delay (10ms) to ensure localStorage write completes
- Verifies token was stored correctly
- Only calls `onSuccess()` if verification passes
- `onSuccess()` now just switches phase (no API call)

**Key Change:**
```typescript
setKdsToken(response.branchId, response.kdsToken, response.expiresAt);
await new Promise(resolve => setTimeout(resolve, 10)); // Ensure write completes
const storedToken = getKdsToken(branchId);
if (storedToken && storedToken === response.kdsToken) {
  onSuccess(); // Just switch phase, don't fetch orders
}
```

### ✅ 3. Enhanced Token Retrieval (`src/lib/kds-token.ts`)

**Before:**
- Basic expiry check
- No logging

**After:**
- Improved expiry validation (checks for invalid dates)
- Better logging for debugging
- Consistent key usage

**Key Change:**
```typescript
// Validate expiry date
if (isNaN(expiryDate.getTime())) {
  clearKdsToken(branchId);
  return null;
}
if (expiryDate <= now) {
  clearKdsToken(branchId);
  return null;
}
```

### ✅ 4. Simplified API Client Interceptor (`src/lib/api.ts`)

**Before:**
- Verbose logging that could cause performance issues
- Complex URL matching logic

**After:**
- Streamlined interceptor
- Reads token from localStorage at request time (ensures latest token)
- Minimal logging

**Key Change:**
```typescript
// Read token at request time (not when client is created)
const kdsToken = getKdsToken(branchId);
if (kdsToken) {
  config.headers['X-KDS-Token'] = kdsToken;
}
```

## Flow After Fix

### Initial Page Load:
1. Page loads → `phase = 'loading'`
2. Check localStorage for `kdsToken_branch_{branchId}`
3. If token exists and not expired → `phase = 'orders'` → Show `KdsOrders`
4. If no token or expired → `phase = 'pin'` → Show `KdsPinLogin`

### After PIN Entry:
1. User enters PIN → Verify with backend
2. Backend returns token → Store in localStorage
3. Verify token was stored → `onSuccess()` called
4. `onSuccess()` → `setPhase('orders')` → Show `KdsOrders`
5. `KdsOrders` component loads → Fetches orders with token (API client attaches header automatically)

### On Page Refresh:
1. Page loads → Check localStorage
2. Token exists → `phase = 'orders'` → Show orders directly
3. No token → `phase = 'pin'` → Show PIN screen

## Key Improvements

1. **No API calls during initialization** - Only checks localStorage
2. **Clear phase-based state** - Easy to understand and debug
3. **Token verified before phase switch** - Prevents invalid states
4. **API client reads token at request time** - Always gets latest token
5. **Better error handling** - Clear logging for debugging

## Testing Checklist

✅ Enter correct PIN → Should immediately show orders (no loop)
✅ Refresh page with valid token → Should show orders directly
✅ Refresh page with expired token → Should show PIN screen
✅ Clear localStorage → Should show PIN screen
✅ Enter wrong PIN → Should show error and stay on PIN screen

## Files Modified

1. `src/app/kitchen/[branchId]/page.tsx` - Simplified state management
2. `src/components/kitchen/KdsPinLogin.tsx` - Improved token verification
3. `src/lib/kds-token.ts` - Enhanced token retrieval with better validation
4. `src/lib/api.ts` - Streamlined interceptor

