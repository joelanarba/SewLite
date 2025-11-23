# Socket.io Events Documentation

This document provides comprehensive documentation for all socket.io events emitted by the Fashion Designer Backend server.

## Overview

The server uses [Socket.io](https://socket.io/) for real-time communication with clients. Socket events enable instant updates when data changes, providing a responsive user experience without requiring clients to poll for updates.

### Connection Setup

**Server Configuration:**
```javascript
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
```

**Client Connection (JavaScript):**
```javascript
import { io } from 'socket.io-client';

// IMPORTANT: Pass customerId to receive targeted events
const socket = io('http://localhost:3000', {
  query: {
    customerId: 'customer123' // Your authenticated customer ID
  }
});

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## Room-Based Targeting Strategy

**The server uses Socket.io rooms to prevent unnecessary broadcasting.**

### Why Rooms?

Without rooms, every event is broadcast to ALL connected clients:
- 1000 clients connected = 1000 messages sent per event
- Wastes bandwidth
- Poor scalability (limited to ~100 concurrent users)

With rooms, events only go to relevant clients:
- 1000 clients connected = 1 message sent (to the customer who owns the order)
- **99% bandwidth reduction**
- Scales to thousands of concurrent users

### Room Naming Conventions

| Room Name Pattern | Description |
|-------------------|-------------|
| `customer:{customerId}` | Customer-specific room for order updates |
| `order:{orderId}` | Order-specific room (future) |
| `designer` | Designer dashboard receiving all order updates (future) |

### How It Works

1. **Client connects with customerId:**
   ```javascript
   const socket = io('http://localhost:3000', {
     query: { customerId: 'customer123' }
   });
   ```

2. **Server automatically joins client to room:**
   ```javascript
   // Server-side (automatic)
   socket.join('customer:customer123');
   ```

3. **Events are targeted to specific rooms:**
   ```javascript
   // Server-side
   io.to('customer:customer123').emit('orderUpdated', order);
   ```

4. **Only relevant clients receive events:**
   - Customer A's app only gets updates for their orders
   - Customer B's app doesn't receive Customer A's events
   - Dramatically reduced network traffic

### Client Integration with Rooms

**React Native Example:**
```javascript
import { io } from 'socket.io-client';
import { useEffect } from 'react';

function useOrderUpdates(customerId, onOrderUpdate) {
  useEffect(() => {
    // Connect with customerId to join customer-specific room
    const socket = io('http://localhost:3000', {
      query: { customerId }
    });
    
    socket.on('orderUpdated', (order) => {
      // Only receives updates for this customer's orders
      onOrderUpdate(order);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [customerId, onOrderUpdate]);
}

// Usage
function OrdersScreen({ currentUser }) {
  const [orders, setOrders] = useState([]);
  
  useOrderUpdates(currentUser.id, (updatedOrder) => {
    // Update order in list
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === updatedOrder.id);
      if (index >= 0) {
        const newOrders = [...prev];
        newOrders[index] = updatedOrder;
        return newOrders;
      }
      return [updatedOrder, ...prev];
    });
  });
  
  return (
    <View>
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </View>
  );
}
```

> [!IMPORTANT]
> **Authentication Note:** Always validate that the `customerId` in the query parameter matches the authenticated user to prevent clients from joining other customers' rooms.



## Events

### `orderUpdated`

**Description:** Emitted whenever an order is created or updated. Clients listening to this event will receive real-time updates about order changes.

**Triggered By:**
- `POST /api/v1/orders` - Creating a new order
- `PUT /api/v1/orders/:id` - Updating an existing order

**Payload Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique order ID |
| `customerId` | string | ✅ | ID of the customer who owns this order |
| `item` | string | ✅ | Description of the item being tailored |
| `measurements` | object | ❌ | Custom measurements for the item (default: `{}`) |
| `price` | number | ✅ | Total price of the order |
| `deposit` | number | ✅ | Amount paid as deposit |
| `balance` | number | ✅ | Remaining balance (`price - deposit`) |
| `status` | string | ✅ | Current order status (see [Order Status Values](#order-status-values)) |
| `pickupDate` | string\|null | ❌ | ISO 8601 date when order should be picked up |
| `fittingDate` | string\|null | ❌ | ISO 8601 date for fitting appointment |
| `notes` | string | ❌ | Additional notes about the order (default: `''`) |
| `createdAt` | string | ✅ | ISO 8601 timestamp when order was created |
| `updatedAt` | string | ✅ | ISO 8601 timestamp when order was last updated |

**Order Status Values:**
- `pending` - Order has been placed but not started
- `in-progress` - Work on the order is in progress
- `ready` - Order is ready for pickup
- `completed` - Order has been picked up
- `cancelled` - Order was cancelled

**Example Payload:**
```json
{
  "id": "order123",
  "customerId": "customer456",
  "item": "Blue suit with custom measurements",
  "measurements": {
    "chest": "40",
    "waist": "32",
    "inseam": "30"
  },
  "price": 500,
  "deposit": 200,
  "balance": 300,
  "status": "in-progress",
  "pickupDate": "2025-12-01T10:00:00.000Z",
  "fittingDate": "2025-11-25T14:00:00.000Z",
  "notes": "Customer prefers slim fit",
  "createdAt": "2025-11-23T02:00:00.000Z",
  "updatedAt": "2025-11-23T02:15:00.000Z"
}
```

**Client Integration:**

```javascript
// Listen for order updates
socket.on('orderUpdated', (order) => {
  console.log('Order updated:', order);
  
  // Update UI with new order data
  updateOrderInList(order);
  
  // Show notification if order status changed
  if (order.status === 'ready') {
    showNotification(`Order ${order.item} is ready for pickup!`);
  }
});
```

**React Native Example:**
```javascript
import { io } from 'socket.io-client';
import { useEffect } from 'react';

function useOrderUpdates(onOrderUpdate) {
  useEffect(() => {
    const socket = io('http://localhost:3000');
    
    socket.on('orderUpdated', (order) => {
      onOrderUpdate(order);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [onOrderUpdate]);
}

// Usage in component
function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  
  useOrderUpdates((updatedOrder) => {
    setOrders(prevOrders => {
      const index = prevOrders.findIndex(o => o.id === updatedOrder.id);
      if (index >= 0) {
        // Update existing order
        const newOrders = [...prevOrders];
        newOrders[index] = updatedOrder;
        return newOrders;
      } else {
        // Add new order
        return [updatedOrder, ...prevOrders];
      }
    });
  });
  
  return (
    <View>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </View>
  );
}
```

---

## Connection Events

### `connection`

**Description:** Built-in Socket.io event fired when a client connects to the server.

**Server-side handling:**
```javascript
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

### `disconnect`

**Description:** Built-in Socket.io event fired when a client disconnects from the server.

**Client-side handling:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server forcibly disconnected, reconnect manually
    socket.connect();
  }
  // Otherwise, Socket.io will automatically attempt to reconnect
});
```

---

## Best Practices

### Error Handling

Always handle connection errors gracefully:

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show user-friendly error message
  showNotification('Unable to connect to server. Retrying...');
});
```

### Reconnection Strategy

Socket.io handles reconnection automatically, but you can customize it:

```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### Memory Leaks

Always clean up socket listeners when components unmount:

```javascript
useEffect(() => {
  const socket = io('http://localhost:3000');
  
  const handleOrderUpdate = (order) => {
    // Handle update
  };
  
  socket.on('orderUpdated', handleOrderUpdate);
  
  return () => {
    socket.off('orderUpdated', handleOrderUpdate);
    socket.disconnect();
  };
}, []);
```

### Event Validation

Validate received events to prevent runtime errors:

```javascript
socket.on('orderUpdated', (order) => {
  // Validate required fields
  if (!order || !order.id || !order.customerId) {
    console.error('Invalid order update received:', order);
    return;
  }
  
  // Safe to use order data
  updateOrderInList(order);
});
```

---

## Testing

### Manual Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Connect using Socket.io client tester:**
   ```bash
   npm install -g socket.io-client
   node
   ```
   ```javascript
   const io = require('socket.io-client');
   const socket = io('http://localhost:3000');
   
   socket.on('connect', () => {
     console.log('Connected!');
   });
   
   socket.on('orderUpdated', (order) => {
     console.log('Order update:', JSON.stringify(order, null, 2));
   });
   ```

3. **Trigger an event:**
   - Create or update an order via the API
   - Watch the console for the `orderUpdated` event

### Automated Testing

```javascript
const io = require('socket.io-client');
const assert = require('assert');

describe('Socket Events', () => {
  let socket;
  
  beforeEach((done) => {
    socket = io('http://localhost:3000');
    socket.on('connect', done);
  });
  
  afterEach(() => {
    socket.disconnect();
  });
  
  it('should receive orderUpdated event when order is created', (done) => {
    socket.on('orderUpdated', (order) => {
      assert(order.id);
      assert(order.customerId);
      assert(order.item);
      done();
    });
    
    // Create order via API
    // This will trigger the orderUpdated event
  });
});
```

---

## Troubleshooting

### Client not receiving events

1. **Check CORS configuration** - Ensure your client origin is allowed
2. **Verify connection** - Check `socket.connected` is `true`
3. **Check event names** - Must match exactly (case-sensitive)
4. **Network issues** - Check if WebSocket connection is blocked by firewall

### Events received multiple times

1. **Duplicate listeners** - Ensure you're not adding listeners multiple times
2. **Clean up on unmount** - Always remove listeners when component unmounts
3. **Use `socket.once()`** - For events that should only fire once

### Stale data

1. **Fetch initial data** - Always fetch data via API first, then listen for updates
2. **Implement optimistic updates** - Update UI immediately, revert if event doesn't arrive
3. **Add timestamps** - Compare `updatedAt` to prevent older events from overwriting newer data

---

## Related Documentation

- [API Versioning](./API_VERSIONING.md)
- [Socket.io Official Docs](https://socket.io/docs/v4/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
