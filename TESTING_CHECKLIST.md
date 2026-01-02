# Laundry Shop Manager - Quality Assurance Checklist

Use this checklist to verify that all features of the application are working correctly before deployment.

## 1. Public Customer Features
**Goal:** Ensure customers can track their laundry without logging in.

- [x] **Landing Page Load**
    - Open the homepage (`/`).
    - Verify "Customer Tracker" and "Staff Dashboard" links exist.
- [x] **Tracker Search (Order ID)**
    - Go to `/track`.
    - Enter a valid **Order ID** (UUID) from a previous order.
    - Verify the correct order details (Status, Items, Total) appear.
- [x] **Tracker Search (Phone Number)**
    - Enter a **Phone Number** associated with an active order.
    - Verify it shows the *latest active* order for that customer.
- [x] **Tracker Privacy**
    - Enter a random/invalid ID.
    - Verify it shows "No active order found".
    - *Security Check:* Ensure you cannot see orders that don't match the exact ID or Phone.
- [x] **Mobile View**
    - Resize browser window to mobile size (approx 375px width).
    - Verify the input field and button are aligned and readable.

## 2. Staff Dashboard & Authentication
**Goal:** Ensure staff can manage operations securely.

- [x] **Login Protection**
    - Try to access `/staff` without logging in.
    - Verify you are redirected to `/login`.
- [x] **Login Success**
    - Enter valid staff credentials.
    - Verify redirection to the Staff Dashboard.
- [x] **Logout**
    - Click "Logout".
    - Verify you are redirected to Login and cannot access `/staff` anymore.

## 3. Service Management
**Goal:** Ensure price list can be updated.

- [x] **Add Service**
    - Go to "Services" tab.
    - Add a new service (e.g., "Comforter", Price: 150, Unit: pcs).
    - Verify it appears in the list immediately.
- [x] **Edit Service**
    - Edit the price of an existing service.
    - Verify the change is saved.

## 4. Order Management
**Goal:** Ensure the core business flow works.

- [x] **Create Order**
    - Go to "Orders" tab.
    - Create a new order (Customer Name, Phone, Select Service).
    - Verify the order appears at the top of the "Active Orders" list.
    - Verify the status is "PENDING" (Yellow border).
- [x] **Update Status**
    - Find the new order card.
    - Change the status dropdown from "Pending" to "Washing".
    - Verify the card border color changes (Yellow -> Blue).
    - Change it to "Ready" (Green) and then "Completed" (Gray/Hidden).
- [x] **Record Payment**
    - Click "Pay" on an order.
    - Select "GCash" or "Cash".
    - Verify the status changes to "PAID".

## 5. Operations & Hardware
**Goal:** Ensure physical shop management works.

- [x] **Machine Timer**
    - Go to "Machines" tab.
    - Click "Start" on a Washer.
    - Verify the timer starts counting down (45 mins).
    - Verify the "Start" button disappears and is replaced by "Finish".
    - Verify the status text says "IN USE".
- [x] **Receipt Printing**
    - In the Order Manager, click "Print Receipt" for an order.
    - Verify a new tab opens with the thermal receipt layout.
    - Press `Ctrl+P` (or Command+P) and check the preview:
        - [x] Paper size should be appropriate (80mm/58mm width style).
        - [x] Text should be black.
        - [x] No extra headers/footers (if configured).

## 6. System Resilience
**Goal:** Ensure the app handles edge cases.

- [x] **Offline Handling**
    - Disconnect your internet (or set "Offline" in Chrome DevTools > Network).
    - Verify an **Orange Alert Bar** appears at the bottom: "You are currently offline".
    - Reconnect and verify the bar disappears.
- [x] **Data Isolation (RLS)**
    - *Requires 2 accounts or Incognito window.*
    - Open the app in Incognito (Public User).
    - Try to access `/staff`.
    - Verify access is denied.
