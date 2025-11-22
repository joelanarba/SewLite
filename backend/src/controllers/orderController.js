const { db, admin } = require('../firebase');
const { sendOrderStatusUpdate } = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/responseHandler');
const { updateCustomerBalance } = require('../utils/balanceCalculator');

const COLLECTION_NAME = 'orders';

// Helper to format dates
const toTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return admin.firestore.Timestamp.fromDate(new Date(dateStr));
};

// GET /orders/customer/:customerId
exports.getOrdersByCustomer = catchAsync(async (req, res, next) => {
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
  
  sendSuccess(res, orders);
});

// POST /orders
exports.createOrder = catchAsync(async (req, res, next) => {
  const { customerId, customerName, customerPhone, item, measurements, price, deposit, pickupDate, fittingDate, notes } = req.body;

  if (!customerId || !item) {
    return next(new AppError('Customer ID and Item are required', 400));
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

  // Update customer balance
  await updateCustomerBalance(customerId);

  sendSuccess(res, { id: docRef.id }, 'Order created successfully', 201);
});

// PUT /orders/:id
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, measurements, price, deposit, pickupDate, fittingDate, notes } = req.body;
  
  const orderRef = db.collection(COLLECTION_NAME).doc(id);
  const doc = await orderRef.get();
  
  if (!doc.exists) {
    return next(new AppError('Order not found', 404));
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

  // Update customer balance
  await updateCustomerBalance(currentOrder.customerId);

  sendSuccess(res, { order: updatedOrder }, 'Order updated successfully');
});

// POST /orders/track
exports.trackOrder = catchAsync(async (req, res, next) => {
    const { phone } = req.body;
    if (!phone) {
        return next(new AppError('Phone number is required', 400));
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

    sendSuccess(res, orders);
});

