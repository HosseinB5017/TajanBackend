# Quick Reference: Water & Bread Services

## 🔗 User Navigation Routes

| Route | Purpose |
|-------|---------|
| `/water-order` | Start water supply order |
| `/bread-order` | Start bread order |
| `/service-orders` | View all orders & history |

## 🏪 Shop Owner Routes

| Route | Purpose |
|-------|---------|
| `/shop-owner/dashboard` | Dashboard with KPIs |
| `/shop-owner/orders` | View all shop orders |
| `/shop-owner/orders/[id]` | Order details & actions |
| `/shop-owner/inventory` | Manage stock levels |
| `/shop-owner/profile` | Shop settings & team |

## 👨‍💼 Admin Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/shops` | Manage all shops |
| `/admin/water-orders` | Water orders management |
| `/admin/bread-orders` | Bread orders management |

---

## 🔑 Key Components

### Shop Selection
```tsx
import ShopSelection from '@/components/services/shop-selection'

<ShopSelection
  serviceType="water"
  onShopSelect={(shop) => setSelectedShop(shop)}
/>
```

### Product Selection
```tsx
import ProductSelection from '@/components/services/product-selection'

<ProductSelection
  products={shopProducts}
  onItemsChange={(items) => setOrderItems(items)}
/>
```

---

## 📡 Common API Calls

### Create Order
```tsx
import { createWaterOrder } from '@/lib/api/water-orders'

const order = await createWaterOrder({
  shop: shopId,
  orderedProducts: [{
    product: productId,
    variant: variantId,
    quantity: 2,
    unitPrice: 15000
  }],
  address: addressId,
  slot: 'Saturday_10:00-12:00'
})
```

### Get Orders
```tsx
// User
const myOrders = await getMyWaterOrders({ page: 1 })

// Shop Owner
const shopOrders = await getShopWaterOrders(shopId, { status: 'pending' })

// Admin
const allOrders = await getAllWaterOrders({ page: 1, status: 'pending' })
```

### Update Order Status
```tsx
await acceptWaterOrder(orderId)
await readyWaterOrder(orderId)
await shippedWaterOrder(orderId)
await deliveredWaterOrder(orderId)
await rejectWaterOrder(orderId, 'manual_rejection', 'Out of stock')
```

---

## 🎨 Color Scheme

| Element | Water | Bread |
|---------|-------|-------|
| Primary | Blue (500) | Amber (500) |
| Status Pending | Amber | Amber |
| Status Accepted | Blue | Amber |
| Status Delivered | Green | Green |
| Status Cancelled | Red | Red |

---

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile** (320px+): Single column, touch-optimized buttons
- **Tablet** (640px+): Multi-column grid layouts
- **Desktop** (1024px+): Full-width layouts with sidebars

---

## 🔍 Search & Filter Features

### Orders Filtering
- By status (pending, accepted, ready, shipped, delivered, cancelled)
- By city (location-based)
- By search query (customer name, order ID)

### Shops Filtering
- By type (water/bread)
- By status (active/inactive)
- By city
- By search query (shop name)

---

## ⚠️ Important Notes

1. **Stock Management**: Always check `product.available` before creating order
2. **Time Slots**: Verify time slot availability before order creation
3. **Addresses**: Orders require valid address with city, boulevard, alley
4. **Status Flow**: Only specific transitions are allowed (see service-validation.ts)
5. **Cancellation**: Can only cancel pending/accepted orders

---

## 🐛 Common Issues & Solutions

### Issue: "فروشگاهی یافت نشد" (No shops found)
- **Solution**: Ensure shops exist in database and are marked as active

### Issue: "محصول موجود نیست" (Product not available)
- **Solution**: Check product stock and variant availability before ordering

### Issue: Order status won't update
- **Solution**: Verify current status allows transition to target status

### Issue: Empty inventory list
- **Solution**: Ensure shop has products added (may need admin to create products)

---

## 📞 Support

For issues or questions:
1. Check `service-validation.ts` for error codes
2. Review API documentation in `lib/api/*.ts` files
3. Check component props in source files
4. Review this Quick Reference Guide

---

**Last Updated**: Implementation Complete  
**Version**: 1.0.0  
**Status**: Production Ready
