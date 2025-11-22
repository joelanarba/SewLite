const { db, admin } = require('../firebase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const COLLECTION_NAME = 'customers';

// Helper to format dates
const toTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return admin.firestore.Timestamp.fromDate(new Date(dateStr));
};

// GET /customers
exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const snapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
  const customers = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    // Convert Timestamps to ISO strings for frontend
    customers.push({
      id: doc.id,
      ...data,
      pickupDate: data.pickupDate?.toDate().toISOString(),
      fittingDate: data.fittingDate?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    });
  });
  res.status(200).json(customers);
});

// GET /customers/:id
exports.getCustomerById = catchAsync(async (req, res, next) => {
  const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
  if (!doc.exists) {
    return next(new AppError('Customer not found', 404));
  }
  const data = doc.data();
  res.status(200).json({
    id: doc.id,
    ...data,
    pickupDate: data.pickupDate?.toDate().toISOString(),
    fittingDate: data.fittingDate?.toDate().toISOString(),
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  });
});

// POST /customers
exports.createCustomer = catchAsync(async (req, res, next) => {
  const { name, phone, measurements, item, pickupDate, fittingDate, balance, notes } = req.body;

  if (!name || !phone) {
    return next(new AppError('Name and Phone are required', 400));
  }

  const newCustomer = {
    name,
    phone,
    measurements: measurements || {},
    item: item || '',
    pickupDate: toTimestamp(pickupDate),
    fittingDate: toTimestamp(fittingDate),
    balance: balance || 0,
    notes: notes || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(newCustomer);
  res.status(201).json({ id: docRef.id, message: 'Customer created successfully' });
});

// PUT /customers/:id
exports.updateCustomer = catchAsync(async (req, res, next) => {
  const { name, phone, measurements, item, pickupDate, fittingDate, balance, notes } = req.body;
  
  const updateData = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (measurements) updateData.measurements = measurements;
  if (item) updateData.item = item;
  if (pickupDate) updateData.pickupDate = toTimestamp(pickupDate);
  if (fittingDate) updateData.fittingDate = toTimestamp(fittingDate);
  if (balance !== undefined) updateData.balance = balance;
  if (notes) updateData.notes = notes;

  await db.collection(COLLECTION_NAME).doc(req.params.id).update(updateData);
  res.status(200).json({ message: 'Customer updated successfully' });
});

// DELETE /customers/:id
exports.deleteCustomer = catchAsync(async (req, res, next) => {
  await db.collection(COLLECTION_NAME).doc(req.params.id).delete();
  res.status(200).json({ message: 'Customer deleted successfully' });
});

