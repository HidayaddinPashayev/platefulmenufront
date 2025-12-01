# KDS Token Debugging Guide

## Issue: Getting `{"requiresPin": true}` when accessing kitchen orders

This means the `X-KDS-Token` header is not being sent with the request.

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab. Look for:
- `[API Client] Kitchen endpoint detected:` - Should show branchId and token status
- `[API Client] X-KDS-Token header attached` - Confirms header was added
- `[KdsPinLogin] PIN verified successfully` - Confirms token was stored

### 2. Check localStorage
In browser DevTools Console, run:
```javascript
// Check if token exists
localStorage.getItem('kdsToken_branch_1763914140416')

// Check expiry
localStorage.getItem('kdsExpires_branch_1763914140416')

// Check all KDS tokens
Object.keys(localStorage).filter(k => k.startsWith('kdsToken'))
```

### 3. Check Network Tab
1. Open DevTools → Network tab
2. Try to access `/kitchen/1763914140416`
3. Find the request to `/api/branches/1763914140416/kitchen/orders`
4. Check Request Headers - should see `X-KDS-Token: <token>`
5. If header is missing, the interceptor is not working

### 4. Verify URL Pattern Matching
The API client checks for URLs matching `/branches/{branchId}/kitchen/`
- Full URL: `http://localhost:8080/api/branches/1763914140416/kitchen/orders`
- Relative path in axios: `/branches/1763914140416/kitchen/orders`
- Regex should match: `/\/branches\/\d+\/kitchen/`

## Common Issues

### Issue 1: Token not stored after PIN verification
**Symptom:** PIN login succeeds but token not in localStorage
**Fix:** Check `setKdsToken` function and verify it's being called

### Issue 2: Token expired
**Symptom:** Token exists but `getKdsToken` returns null
**Fix:** Check expiry date in localStorage and verify it's in the future

### Issue 3: URL pattern not matching
**Symptom:** Console shows "Could not extract branchId from URL"
**Fix:** Check the actual URL format in Network tab and update regex if needed

### Issue 4: Header not being sent
**Symptom:** Network tab shows request without `X-KDS-Token` header
**Fix:** Check API interceptor logic and ensure it runs before request is sent

## Quick Test

Run this in browser console after PIN login:
```javascript
// Get token
const token = localStorage.getItem('kdsToken_branch_1763914140416');
console.log('Token:', token);

// Test API call manually
fetch('http://localhost:8080/api/branches/1763914140416/kitchen/orders', {
  headers: {
    'X-KDS-Token': token,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If this works but the app doesn't, the issue is in the API client interceptor.

