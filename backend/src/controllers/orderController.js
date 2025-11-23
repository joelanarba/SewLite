const { db, admin } = require('../firebase');
const { sendOrderStatusUpdate } = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/responseHandler');
const { updateCustomerBalance } = require('../utils/balanceCalculator');
const { toTimestamp } = require('../utils/dateUtils');
const { COLLECTIONS, ORDER_STATUS } = require('../config/constants');

const COLLECTION_NAME = COLLECTIONS.ORDERS;



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
  const { customerId, item, measurements, price, deposit, pickupDate, fittingDate, notes } = req.body;

  if (!customerId || !item) {
    return next(new AppError('Customer ID and Item are required', 400));
  }

  const newOrderData = {
    customerId,
    // customerName and customerPhone are removed for normalization
    item,
    measurements: measurements || {},
    price: parseFloat(price) || 0,
    deposit: parseFloat(deposit) || 0,
    balance: (parseFloat(price) || 0) - (parseFloat(deposit) || 0),
    status: ORDER_STATUS.PENDING,
    pickupDate: toTimestamp(pickupDate),
    fittingDate: toTimestamp(fittingDate),
    notes: notes || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const result = await db.runTransaction(async (t) => {
    // 1. Get customer ref and doc
    const customerRef = db.collection(COLLECTIONS.CUSTOMERS).doc(customerId);
    const customerDoc = await t.get(customerRef);

    if (!customerDoc.exists) {
      throw new AppError('Customer not found', 404);
    }

    // 2. Create new order ref
    const orderRef = db.collection(COLLECTION_NAME).doc();
    
    // 3. Calculate new customer balance
    const currentBalance = customerDoc.data().balance || 0;
    const newCustomerBalance = currentBalance + newOrderData.balance;

    // 4. Perform writes
    t.set(orderRef, newOrderData);
    t.update(customerRef, { balance: newCustomerBalance });

    return { orderId: orderRef.id, newOrderData };
  });
  
  // Emit socket event if io is attached to app
  const io = req.app.get('io');
  if (io) {
    io.emit('orderUpdated', { orderId: result.orderId, ...result.newOrderData, id: result.orderId });
  }

  // Note: updateCustomerBalance is no longer needed as we updated it atomically

  sendSuccess(res, { id: result.orderId }, 'Order created successfully', 201);
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
    // Fetch customer details for notification since they are no longer in the order
    const customerDoc = await db.collection(COLLECTIONS.CUSTOMERS).doc(currentOrder.customerId).get();
    if (customerDoc.exists) {
        const customerData = customerDoc.data();
        await sendOrderStatusUpdate(customerData.phone, customerData.name, currentOrder.item, status);
    }
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

    // 1. Find customer by phone
    const customerSnapshot = await db.collection(COLLECTIONS.CUSTOMERS)
        .where('phone', '==', phone)
        .limit(1)
        .get();

    if (customerSnapshot.empty) {
        // No customer found with this phone, return empty list or specific message
        // Returning empty list to avoid leaking customer existence? Or just empty list is fine.
        return sendSuccess(res, []);
    }

    const customerId = customerSnapshot.docs[0].id;

    // 2. Find orders by customerId
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

    // Sort in memory to avoid index requirement
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sendSuccess(res, orders);
});

