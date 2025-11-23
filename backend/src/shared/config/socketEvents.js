/**
 * Socket.io Event Definitions and Schemas
 * 
 * This file defines all socket events emitted by the server with their schemas.
 * Use these constants to emit events and validate payloads.
 */

/**
 * Socket Event Names - Use these constants instead of strings
 */
const SOCKET_EVENT_NAMES = {
  ORDER_UPDATED: 'orderUpdated',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect'
};

/**
 * Socket Event Schemas
 * Defines the structure of each event's payload
 */
const SOCKET_EVENT_SCHEMAS = {
  /**
   * orderUpdated Event
   * Emitted when an order is created or updated
   */
  [SOCKET_EVENT_NAMES.ORDER_UPDATED]: {
    eventName: SOCKET_EVENT_NAMES.ORDER_UPDATED,
    description: 'Emitted when an order is created or updated',
    emittedBy: ['createOrder', 'updateOrder'],
    payload: {
      id: {
        type: 'string',
        required: true,
        description: 'Unique order ID'
      },
      customerId: {
        type: 'string',
        required: true,
        description: 'ID of the customer who owns this order'
      },
      item: {
        type: 'string',
        required: true,
        description: 'Description of the item being tailored'
      },
      measurements: {
        type: 'object',
        required: false,
        description: 'Custom measurements for the item',
        default: {}
      },
      price: {
        type: 'number',
        required: true,
        description: 'Total price of the order'
      },
      deposit: {
        type: 'number',
        required: true,
        description: 'Amount paid as deposit'
      },
      balance: {
        type: 'number',
        required: true,
        description: 'Remaining balance (price - deposit)'
      },
      status: {
        type: 'string',
        required: true,
        description: 'Current order status',
        enum: ['pending', 'in-progress', 'ready', 'completed', 'cancelled']
      },
      pickupDate: {
        type: 'string',
        required: false,
        description: 'ISO 8601 date when the order should be picked up',
        format: 'ISO 8601'
      },
      fittingDate: {
        type: 'string',
        required: false,
        description: 'ISO 8601 date for fitting appointment',
        format: 'ISO 8601'
      },
      notes: {
        type: 'string',
        required: false,
        description: 'Additional notes about the order',
        default: ''
      },
      createdAt: {
        type: 'string',
        required: true,
        description: 'ISO 8601 timestamp when order was created',
        format: 'ISO 8601'
      },
      updatedAt: {
        type: 'string',
        required: true,
        description: 'ISO 8601 timestamp when order was last updated',
        format: 'ISO 8601'
      }
    },
    example: {
      id: 'order123',
      customerId: 'customer456',
      item: 'Blue suit with custom measurements',
      measurements: {
        chest: '40',
        waist: '32',
        inseam: '30'
      },
      price: 500,
      deposit: 200,
      balance: 300,
      status: 'in-progress',
      pickupDate: '2025-12-01T10:00:00.000Z',
      fittingDate: '2025-11-25T14:00:00.000Z',
      notes: 'Customer prefers slim fit',
      createdAt: '2025-11-23T02:00:00.000Z',
      updatedAt: '2025-11-23T02:15:00.000Z'
    }
  }
};

/**
 * Get event schema by name
 * @param {string} eventName - Name of the event
 * @returns {Object|null} Event schema or null if not found
 */
function getEventSchema(eventName) {
  return SOCKET_EVENT_SCHEMAS[eventName] || null;
}

/**
 * Check if an event name is valid
 * @param {string} eventName - Name of the event to validate
 * @returns {boolean} True if event exists
 */
function isValidEvent(eventName) {
  return Object.values(SOCKET_EVENT_NAMES).includes(eventName);
}

module.exports = {
  SOCKET_EVENT_NAMES,
  SOCKET_EVENT_SCHEMAS,
  getEventSchema,
  isValidEvent
};
