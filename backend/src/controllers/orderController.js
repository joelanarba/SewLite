const { db, admin } = require('../firebase');
const { sendOrderStatusUpdate } = require('../services/notificationService');

const COLLECTION_NAME = 'orders';

// Helper to format dates
const toTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return admin.firestore.Timestamp.fromDate(new Date(dateStr));
};

// GET /orders/customer/:customerId
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('customerId', '==', customerId)
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        pickupDate: data.pickupDate?.toDate().toISOString(),
        fittingDate: data.fittingDate?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      });
    });

    // Sort in memory
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// POST /orders
exports.createOrder = async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, item, measurements, price, deposit, pickupDate, fittingDate, notes } = req.body;

    if (!customerId || !item) {
      return res.status(400).json({ error: 'Customer ID and Item are required' });
    }

    const newOrder = {
      customerId,
      customerName, // Denormalized for easier display
      customerPhone, // Denormalized for easier lookup
      item,
      measurements: measurements || {},
      price: parseFloat(price) || 0,
      deposit: parseFloat(deposit) || 0,
      balance: (parseFloat(price) || 0) - (parseFloat(deposit) || 0),
      status: 'Pending', // Pending, In Progress, Ready, Picked Up
      pickupDate: toTimestamp(pickupDate),
      fittingDate: toTimestamp(fittingDate),
      notes: notes || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newOrder);
    
    // Emit socket event if io is attached to app
    const io = req.app.get('io');
    if (io) {
      io.emit('orderUpdated', { orderId: docRef.id, ...newOrder, id: docRef.id });
    }

    res.status(201).json({ id: docRef.id, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// PUT /orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, measurements, price, deposit, pickupDate, fittingDate, notes } = req.body;
    
    const orderRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await orderRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = doc.data();
    
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (measurements) updateData.measurements = measurements;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (deposit !== undefined) {
        updateData.deposit = parseFloat(deposit);
        // Recalculate balance if price or deposit changes
        const newPrice = price !== undefined ? parseFloat(price) : currentOrder.price;
        updateData.balance = newPrice - parseFloat(deposit);
    } else if (price !== undefined) {
        updateData.balance = parseFloat(price) - currentOrder.deposit;
    }

    if (pickupDate) updateData.pickupDate = toTimestamp(pickupDate);
    if (fittingDate) updateData.fittingDate = toTimestamp(fittingDate);
    if (notes) updateData.notes = notes;

    await orderRef.update(updateData);

    // Fetch updated document for socket emission
    const updatedDoc = await orderRef.get();
    const updatedOrder = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        pickupDate: updatedDoc.data().pickupDate?.toDate().toISOString(),
        fittingDate: updatedDoc.data().fittingDate?.toDate().toISOString(),
        createdAt: updatedDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: updatedDoc.data().updatedAt?.toDate().toISOString(),
    };

    // Notify Customer if status changed
    if (status && status !== currentOrder.status) {
      await sendOrderStatusUpdate(currentOrder.customerPhone, currentOrder.customerName, currentOrder.item, status);
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('orderUpdated', updatedOrder);
    }

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// POST /orders/track
exports.trackOrder = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Normalize phone - simple check for now, ideally use a library or strict format
        // Assuming exact match for MVP
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('customerPhone', '==', phone)
            .orderBy('createdAt', 'desc')
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Only show active orders or recent ones? For now show all.
            orders.push({
                id: doc.id,
                ...data,
                pickupDate: data.pickupDate?.toDate().toISOString(),
                fittingDate: data.fittingDate?.toDate().toISOString(),
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            });
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ error: 'Failed to track orders' });
    }
};
