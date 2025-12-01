# Customer QR Menu Flow - Implementation Documentation

## Overview

This document describes the complete customer-facing QR menu flow implementation for the Plateful project. The implementation follows the backend API documentation exactly as specified in `COMPLETE_API_ENDPOINTS_DOCUMENTATION.md`.

## File Structure

```
src/
├── app/
│   └── table/
│       └── [tableId]/
│           └── page.tsx          # Main customer menu page
├── components/
│   └── customer/
│       ├── CustomerMenu.tsx       # Menu display component
│       ├── Cart.tsx               # Shopping cart drawer
│       └── OrderSuccess.tsx       # Order confirmation screen
└── lib/
    └── api/
        └── customer.ts            # Customer API functions
```

## Route Structure

### Public Route
- **Path**: `/table/[tableId]`
- **Query Parameters**: `?branchId={branchId}`
- **Example**: `/table/10?branchId=5`
- **Access**: Public (no authentication required)

### QR Code URL Format
The QR code should encode a URL in the format:
```
https://yourdomain.com/table/{tableId}?branchId={branchId}
```

## API Integration

All API calls strictly follow the documented endpoints:

### 1. Start Customer Session
- **Endpoint**: `POST /api/customer/session/start`
- **Request Body**: `{ branchId: number, tableId: number }`
- **Response**: `{ guestSessionId: string, restaurantId: number }`
- **Function**: `startCustomerSession(api, branchId, tableId)`

### 2. Get Customer Menu
- **Endpoint**: `GET /api/customer/menu?branchId={branchId}&tableId={tableId}`
- **Response**: `MenuItem[]`
- **Function**: `getCustomerMenu(api, branchId, tableId)`

### 3. Create Customer Order
- **Endpoint**: `POST /api/customer/orders`
- **Request Body**: 
  ```json
  {
    "guestSessionId": "string",
    "branchId": number,
    "tableId": number,
    "items": [
      { "menuItemId": number, "qty": number }
    ]
  }
  ```
- **Function**: `createCustomerOrder(api, payload)`

## Component Details

### 1. `/table/[tableId]/page.tsx`
Main customer page that:
- Extracts `tableId` from URL params and `branchId` from query params
- Initializes customer session on page load
- Loads menu items
- Manages cart state
- Handles order placement
- Shows loading, error, and success states

**State Management:**
- `guestSessionId`: Stored in component state (from session start)
- `menu`: Menu items fetched from API
- `cart`: Local state array of `CartItem[]`
- `state`: Page state ('loading' | 'menu' | 'success')

### 2. `CustomerMenu.tsx`
Displays menu items grouped by category:
- Groups items by `category` field
- Shows item name, description, price, and availability
- "Add" button for available items
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)

### 3. `Cart.tsx`
Shopping cart drawer component:
- Floating cart button showing item count and total
- Slide-up drawer from bottom
- Quantity controls (+/- buttons)
- Remove item functionality
- Place order button
- Shows empty state when cart is empty

### 4. `OrderSuccess.tsx`
Order confirmation screen:
- Success message with checkmark icon
- "Order More" button to reload and start new order

## Data Flow

### Initialization Flow
1. User scans QR code → navigates to `/table/{tableId}?branchId={branchId}`
2. Page extracts `tableId` and `branchId` from URL
3. Calls `startCustomerSession(api, branchId, tableId)`
4. Receives `guestSessionId` and stores in state
5. Calls `getCustomerMenu(api, branchId, tableId)`
6. Displays menu items

### Order Flow
1. User clicks "Add" on menu items → adds to cart
2. User opens cart drawer → reviews items
3. User adjusts quantities or removes items
4. User clicks "Place Order"
5. Calls `createCustomerOrder(api, { guestSessionId, branchId, tableId, items })`
6. On success → clears cart and shows success screen
7. User can click "Order More" to start new order

## Testing Guide

### Prerequisites
1. Backend API running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`
3. At least one table created with `branchId` and `tableId`
4. Menu items available in the database

### Step-by-Step Testing

#### 1. Generate QR Code URL
From the admin panel, get a table's `tableId` and `branchId`. The QR code should point to:
```
http://localhost:3000/table/{tableId}?branchId={branchId}
```

**Example:**
```
http://localhost:3000/table/10?branchId=5
```

#### 2. Test Session Initialization
1. Navigate to the table URL directly in browser
2. Verify loading spinner appears
3. Check browser console for API calls:
   - `POST /api/customer/session/start` should return `guestSessionId`
   - `GET /api/customer/menu?branchId=5&tableId=10` should return menu items
4. Verify menu displays after loading

#### 3. Test Menu Display
1. Verify menu items are grouped by category
2. Check that unavailable items show "Unavailable" and can't be added
3. Verify prices display correctly (cents converted to dollars)
4. Test responsive layout on different screen sizes

#### 4. Test Cart Functionality
1. Click "Add" on multiple menu items
2. Verify floating cart button appears with correct count and total
3. Click cart button to open drawer
4. Test quantity increase/decrease buttons
5. Test remove item (× button)
6. Verify total updates correctly

#### 5. Test Order Placement
1. Add items to cart
2. Click "Place Order" button
3. Verify button shows "Placing Order..." during submission
4. Check browser console for:
   - `POST /api/customer/orders` with correct payload
   - Response should be successful
5. Verify success screen appears
6. Verify cart is cleared
7. Click "Order More" to verify it reloads the page

#### 6. Test Error Handling
1. Test with invalid `tableId` or `branchId`:
   - Should show error message
   - Should not crash the app
2. Test with network error:
   - Disconnect network
   - Try to place order
   - Should show error message
3. Test with empty cart:
   - "Place Order" button should be disabled

### Manual QR Code Testing
1. Create a QR code using any QR generator
2. Encode the table URL: `http://localhost:3000/table/10?branchId=5`
3. Scan with mobile device
4. Verify it opens the menu page
5. Complete a full order flow

## API Payload Examples

### Start Session Request
```json
{
  "branchId": 5,
  "tableId": 10
}
```

### Start Session Response
```json
{
  "guestSessionId": "550e8400-e29b-41d4-a716-446655440000",
  "restaurantId": 1
}
```

### Create Order Request
```json
{
  "guestSessionId": "550e8400-e29b-41d4-a716-446655440000",
  "branchId": 5,
  "tableId": 10,
  "items": [
    {
      "menuItemId": 100,
      "qty": 2
    },
    {
      "menuItemId": 101,
      "qty": 1
    }
  ]
}
```

## Key Features

✅ **No Authentication Required** - Customer flow works without login
✅ **Session Management** - Guest session ID stored in component state
✅ **Real-time Cart** - Local state management for cart items
✅ **Error Handling** - Comprehensive error messages and loading states
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Category Grouping** - Menu items organized by category
✅ **Availability Check** - Unavailable items are disabled
✅ **Price Formatting** - Cents converted to dollars with 2 decimal places

## Notes

- The `guestSessionId` is stored in component state and persists during the session
- Cart state is local to the component and cleared after successful order
- The route is public and bypasses authentication middleware
- All API calls use the base API client without authentication tokens
- The implementation strictly follows the documented API endpoints without modifications

## Troubleshooting

### Menu Not Loading
- Check browser console for API errors
- Verify `branchId` and `tableId` are valid numbers
- Ensure backend is running and accessible
- Check CORS settings if accessing from different domain

### Order Fails
- Verify `guestSessionId` is still valid (session might have expired)
- Check that all required fields are present in order payload
- Ensure menu items exist and are available
- Check backend logs for validation errors

### QR Code Not Working
- Verify QR code URL format is correct
- Ensure both `tableId` and `branchId` are in the URL
- Test URL directly in browser first
- Check that route is accessible (not blocked by middleware)

