/**
 * Test Helpers
 * Reusable test utilities for creating test data
 */

/**
 * Create a test customer object
 */
function createTestCustomer(overrides = {}) {
  return {
    name: 'Test Customer',
    phone: '1234567890',
    email: 'test@example.com',
    address: '123 Test St',
    pickupDate: null,
    fittingDate: null,
    notes: '',
    balance: 0,
    ...overrides
  };
}

/**
 * Create a test order object
 */
function createTestOrder(customerId = 'test-customer-id', overrides = {}) {
  return {
    customerId,
    item: 'Test Suit',
    measurements: {
      chest: '40',
      waist: '32',
      inseam: '30'
    },
    price: 500,
    deposit: 200,
    balance: 300,
    status: 'pending',
    pickupDate: null,
    fittingDate: null,
    notes: '',
    ...overrides
  };
}

/**
 * Mock Firestore snapshot
 */
function createMockSnapshot(docs = []) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map(data => ({
      id: data.id || 'test-id',
      data: () => data,
      exists: true
    })),
    forEach: function(callback) {
      this.docs.forEach(callback);
    }
  };
}

/**
 * Mock Firestore document
 */
function createMockDoc(data = null, id = 'test-id') {
  return {
    id,
    exists: data !== null,
    data: () => data
  };
}

/**
 * Create mock Express request
 */
function createMockRequest(overrides = {}) {
  return {
    params: {},
    query: {},
    body: {},
    app: {
      get: jest.fn((key) => {
        if (key === 'io') return global.mockIo;
        return null;
      })
    },
    ...overrides
  };
}

/**
 * Create mock Express response
 */
function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return res;
}

/**
 * Create mock Express next function
 */
function createMockNext() {
  return jest.fn();
}

module.exports = {
  createTestCustomer,
  createTestOrder,
  createMockSnapshot,
  createMockDoc,
  createMockRequest,
  createMockResponse,
  createMockNext
};
