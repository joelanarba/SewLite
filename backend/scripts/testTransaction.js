const { db, admin } = require('../src/firebase');
const { createOrder } = require('../src/controllers/orderController');

// Mock Express objects
const mockReq = (body) => ({
  body,
  app: {
    get: () => null // Mock io
  }
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

const mockNext = (err) => {
  if (err) {
    console.error('Error in controller:', err);
    process.exit(1);
  }
};

async function runTest() {
  console.log('Starting Transaction Test...');

  try {
    // 1. Create a test customer
    const customerRef = await db.collection('customers').add({
      name: 'Test Customer',
      phone: '1234567890',
      balance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Created test customer: ${customerRef.id}`);

    // 2. Create an order using the controller
    const orderData = {
      customerId: customerRef.id,
      item: 'Test Suit',
      price: 100,
      deposit: 20,
      // balance should be 80
      pickupDate: new Date().toISOString(),
      fittingDate: new Date().toISOString()
    };

    const req = mockReq(orderData);
    
    // Wrap controller execution in a promise
    const controllerPromise = new Promise((resolve, reject) => {
        const res = {};
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };
        res.json = (data) => {
            res.data = data;
            resolve(res);
            return res;
        };

        const next = (err) => {
            if (err) {
                console.error('Error in controller:', err);
                reject(err);
            } else {
                resolve();
            }
        };

        createOrder(req, res, next);
    });

    const res = await controllerPromise;

    console.log('Order creation response:', res.data);

    // 3. Verify results
    // Check Order
    const orderId = res.data.data.id;
    const orderDoc = await db.collection('orders').doc(orderId).get();
    const order = orderDoc.data();
    console.log('Order Balance:', order.balance);

    if (order.balance !== 80) {
      throw new Error(`Expected order balance 80, got ${order.balance}`);
    }

    // Check Customer Balance
    const customerDoc = await customerRef.get();
    const customer = customerDoc.data();
    console.log('Customer Balance:', customer.balance);

    if (customer.balance !== 80) {
      throw new Error(`Expected customer balance 80, got ${customer.balance}`);
    }

    console.log('✅ Transaction Test Passed!');

    // Cleanup
    await db.collection('orders').doc(orderId).delete();
    await customerRef.delete();
    console.log('Cleanup complete.');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

// Wait for Firebase to init
setTimeout(runTest, 1000);
