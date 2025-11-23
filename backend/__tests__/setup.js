/**
 * Jest Test Setup
 * Configures mocks and test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'error'; // Quiet logs during tests

// Mock Firebase Admin SDK
jest.mock('../src/firebase', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockWhere = jest.fn();
  const mockLimit = jest.fn();
  const mockOrderBy = jest.fn();
  
  // Create chainable mock
  const createMockQuery = () => ({
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: mockGet
  });
  
  const createMockDocRef = () => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    id: 'test-id'
  });
  
  const createMockCollectionRef = () => ({
    doc: jest.fn((...args) => createMockDocRef()),
    where: jest.fn((...args) => createMockQuery()),
    limit: jest.fn((...args) => createMockQuery()),
    orderBy: jest.fn((...args) => createMockQuery()),
    get: mockGet,
    add: jest.fn().mockResolvedValue({ id: 'new-test-id' })
  });
  
  return {
    db: {
      collection: jest.fn((...args) => createMockCollectionRef()),
      runTransaction: jest.fn(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ balance: 0 })
          }),
          set: jest.fn(),
          update: jest.fn()
        };
        return callback(mockTransaction);
      })
    },
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: jest.fn(() => new Date())
        },
        Timestamp: {
          fromDate: jest.fn(date => ({
            toDate: () => date,
            seconds: Math.floor(date.getTime() / 1000)
          }))
        }
      }
    },
    isFirebaseAvailable: jest.fn(() => true)
  };
});

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ 
        sid: 'test-message-sid',
        status: 'sent' 
      })
    }
  }));
});

// Mock Socket.io
const mockSocket = {
  id: 'test-socket-id',
  handshake: {
    query: {}
  },
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn()
};

const mockIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
  on: jest.fn()
};

global.mockSocket = mockSocket;
global.mockIo = mockIo;

// Suppress console logs in tests (unless testing logging)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};
