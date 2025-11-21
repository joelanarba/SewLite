const { db, admin } = require('../firebase');

const COLLECTION_NAME = 'customers';

// Helper to format dates
const toTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return admin.firestore.Timestamp.fromDate(new Date(dateStr));
};

// GET /customers
exports.getAllCustomers = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// GET /customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Customer not found' });
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
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// POST /customers
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, measurements, item, pickupDate, fittingDate, balance, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required' });
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
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// PUT /customers/:id
exports.updateCustomer = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// DELETE /customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    await db.collection(COLLECTION_NAME).doc(req.params.id).delete();
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
