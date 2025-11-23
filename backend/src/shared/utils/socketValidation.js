const logger = require('./logger');
const { getEventSchema, isValidEvent } = require('../config/socketEvents');

/**
 * Validates a socket event payload against its schema
 * @param {string} eventName - Name of the event
 * @param {Object} payload - Event payload to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateSocketPayload(eventName, payload) {
  const errors = [];
  
  if (!isValidEvent(eventName)) {
    return {
      valid: false,
      errors: [`Unknown event: ${eventName}`]
    };
  }
  
  const schema = getEventSchema(eventName);
  if (!schema) {
    return {
      valid: false,
      errors: [`No schema found for event: ${eventName}`]
    };
  }
  
  // Validate required fields
  Object.entries(schema.payload).forEach(([field, fieldSchema]) => {
    if (fieldSchema.required && !(field in payload)) {
      errors.push(`Missing required field: ${field}`);
    }
    
    // Type validation
    if (field in payload && payload[field] !== null && payload[field] !== undefined) {
      const actualType = Array.isArray(payload[field]) ? 'array' : typeof payload[field];
      if (fieldSchema.type !== actualType) {
        errors.push(`Invalid type for ${field}: expected ${fieldSchema.type}, got ${actualType}`);
      }
      
      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(payload[field])) {
        errors.push(`Invalid value for ${field}: must be one of [${fieldSchema.enum.join(', ')}]`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Emits a socket event with optional validation
 * @param {Object} io - Socket.io server instance
 * @param {string} eventName - Name of the event to emit
 * @param {Object} payload - Event payload
 * @param {Object} options - Options for emission
 * @param {boolean} options.validate - Whether to validate payload (default: true in development)
 * @param {boolean} options.log - Whether to log the emission (default: true in development)
 * @param {string} options.room - Optional room name to emit to (instead of broadcast)
 */
function emitTypedEvent(io, eventName, payload, options = {}) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const shouldValidate = options.validate !== undefined ? options.validate : isDevelopment;
  const shouldLog = options.log !== undefined ? options.log : isDevelopment;
  
  if (shouldValidate) {
    const validation = validateSocketPayload(eventName, payload);
    if (!validation.valid) {
      logger.error('Socket event validation failed', {
        eventName,
        errors: validation.errors,
        payload
      });
      
      // In development, throw error to catch issues early
      if (isDevelopment) {
        throw new Error(`Socket event validation failed for ${eventName}: ${validation.errors.join(', ')}`);
      }
      // In production, log error but still emit (fail gracefully)
    }
  }
  
  if (shouldLog) {
    logger.debug('Emitting socket event', {
      eventName,
      payloadSize: JSON.stringify(payload).length,
      room: options.room || 'broadcast',
      targeted: !!options.room
    });
  }
  
  // Emit to specific room or broadcast to all
  if (options.room) {
    io.to(options.room).emit(eventName, payload);
  } else {
    logger.warn('Socket event emitted to ALL clients (no room specified)', { eventName });
    io.emit(eventName, payload);
  }
}

module.exports = {
  validateSocketPayload,
  emitTypedEvent
};
