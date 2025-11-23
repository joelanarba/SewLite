const logger = require('./logger');

/**
 * Socket Room Management Utilities
 * 
 * Provides helper functions for managing socket.io rooms and targeted event emission.
 * Use rooms to prevent broadcasting events to all connected clients.
 */

/**
 * Room naming conventions
 */
const ROOM_PREFIXES = {
  CUSTOMER: 'customer',
  ORDER: 'order',
  DESIGNER: 'designer',
  BROADCAST: 'broadcast'
};

/**
 * Get room name for a specific customer
 * @param {string} customerId - Customer ID
 * @returns {string} Room name for the customer
 */
function getCustomerRoom(customerId) {
  if (!customerId) {
    throw new Error('customerId is required');
  }
  return `${ROOM_PREFIXES.CUSTOMER}:${customerId}`;
}

/**
 * Get room name for a specific order
 * @param {string} orderId - Order ID
 * @returns {string} Room name for the order
 */
function getOrderRoom(orderId) {
  if (!orderId) {
    throw new Error('orderId is required');
  }
  return `${ROOM_PREFIXES.ORDER}:${orderId}`;
}

/**
 * Get designer role room (for all designers)
 * @returns {string} Room name for designers
 */
function getDesignerRoom() {
  return ROOM_PREFIXES.DESIGNER;
}

/**
 * Get broadcast room (for important announcements to all users)
 * @returns {string} Room name for broadcasts
 */
function getBroadcastRoom() {
  return ROOM_PREFIXES.BROADCAST;
}

/**
 * Emit event to a specific customer's room
 * @param {Object} io - Socket.io server instance
 * @param {string} customerId - Customer ID to target
 * @param {string} eventName - Name of the event
 * @param {Object} payload - Event payload
 */
function emitToCustomer(io, customerId, eventName, payload) {
  const room = getCustomerRoom(customerId);
  logger.debug('Emitting event to customer room', { eventName, customerId, room });
  io.to(room).emit(eventName, payload);
}

/**
 * Emit event to a specific order's room
 * @param {Object} io - Socket.io server instance
 * @param {string} orderId - Order ID to target
 * @param {string} eventName - Name of the event
 * @param {Object} payload - Event payload
 */
function emitToOrder(io, orderId, eventName, payload) {
  const room = getOrderRoom(orderId);
  logger.debug('Emitting event to order room', { eventName, orderId, room });
  io.to(room).emit(eventName, payload);
}

/**
 * Emit event to all designers
 * @param {Object} io - Socket.io server instance
 * @param {string} eventName - Name of the event
 * @param {Object} payload - Event payload
 */
function emitToDesigners(io, eventName, payload) {
  const room = getDesignerRoom();
  logger.debug('Emitting event to designers room', { eventName, room });
  io.to(room).emit(eventName, payload);
}

/**
 * Emit event to all connected clients (use sparingly)
 * @param {Object} io - Socket.io server instance
 * @param {string} eventName - Name of the event
 * @param {Object} payload - Event payload
 */
function emitToAll(io, eventName, payload) {
  logger.warn('Broadcasting event to ALL clients', { eventName });
  io.emit(eventName, payload);
}

/**
 * Join a socket to a customer room
 * @param {Object} socket - Socket instance
 * @param {string} customerId - Customer ID
 */
function joinCustomerRoom(socket, customerId) {
  const room = getCustomerRoom(customerId);
  socket.join(room);
  logger.info('Socket joined customer room', { socketId: socket.id, customerId, room });
}

/**
 * Leave a customer room
 * @param {Object} socket - Socket instance
 * @param {string} customerId - Customer ID
 */
function leaveCustomerRoom(socket, customerId) {
  const room = getCustomerRoom(customerId);
  socket.leave(room);
  logger.debug('Socket left customer room', { socketId: socket.id, customerId, room });
}

module.exports = {
  ROOM_PREFIXES,
  getCustomerRoom,
  getOrderRoom,
  getDesignerRoom,
  getBroadcastRoom,
  emitToCustomer,
  emitToOrder,
  emitToDesigners,
  emitToAll,
  joinCustomerRoom,
  leaveCustomerRoom
};
