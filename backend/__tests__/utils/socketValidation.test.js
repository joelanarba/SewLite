const { describe, test, expect, jest, beforeEach } = require('@jest/globals');
const { validateSocketPayload, emitTypedEvent } = require('../../src/utils/socketValidation');
const { SOCKET_EVENT_NAMES } = require('../../src/config/socketEvents');

describe('socketValidation', () => {
  describe('validateSocketPayload', () => {
    test('validates valid orderUpdated payload', () => {
      const payload = {
        id: 'order123',
        customerId: 'customer456',
        item: 'Blue suit',
        measurements: {},
        price: 500,
        deposit: 200,
        balance: 300,
        status: 'pending',
        pickupDate: '2025-12-01T10:00:00.000Z',
        fittingDate: null,
        notes: '',
        createdAt: '2025-11-23T02:00:00.000Z',
        updatedAt: '2025-11-23T02:00:00.000Z'
      };

      const result = validateSocketPayload(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('detects missing required fields', () => {
      const payload = {
        id: 'order123'
        // Missing customerId, item, etc.
      };

      const result = validateSocketPayload(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Missing required field: customerId');
    });

    test('validates field types', () => {
      const payload = {
        id: 'order123',
        customerId: 'customer456',
        item: 'Blue suit',
        measurements: {},
        price: '500', // Should be number
        deposit: 200,
        balance: 300,
        status: 'pending',
        createdAt: '2025-11-23T02:00:00.000Z',
        updatedAt: '2025-11-23T02:00:00.000Z'
      };

      const result = validateSocketPayload(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid type for price: expected number, got string');
    });

    test('validates enum values for status', () => {
      const payload = {
        id: 'order123',
        customerId: 'customer456',
        item: 'Blue suit',
        measurements: {},
        price: 500,
        deposit: 200,
        balance: 300,
        status: 'invalid-status', // Invalid enum value
        createdAt: '2025-11-23T02:00:00.000Z',
        updatedAt: '2025-11-23T02:00:00.000Z'
      };

      const result = validateSocketPayload(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('status'))).toBe(true);
    });

    test('returns error for unknown event', () => {
      const result = validateSocketPayload('unknownEvent', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown event: unknownEvent');
    });
  });

  describe('emitTypedEvent', () => {
    let mockIo;

    beforeEach(() => {
      mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };
    });

    test('emits event to specific room', () => {
      const payload = {
        id: 'order123',
        customerId: 'customer456',
        item: 'Test',
        measurements: {},
        price: 100,
        deposit: 50,
        balance: 50,
        status: 'pending',
        createdAt: '2025-11-23T02:00:00.000Z',
        updatedAt: '2025-11-23T02:00:00.000Z'
      };

      emitTypedEvent(mockIo, SOCKET_EVENT_NAMES.ORDER_UPDATED, payload, {
        room: 'customer:customer456',
        validate: false,
        log: false
      });

      expect(mockIo.to).toHaveBeenCalledWith('customer:customer456');
      expect(mockIo.emit).toHaveBeenCalledWith(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
    });

    test('emits broadcast when no room specified', () => {
      const payload = {
        id: 'order123',
        customerId: 'customer456',
        item: 'Test',
        measurements: {},
        price: 100,
        deposit: 50,
        balance: 50,
        status: 'pending',
        createdAt: '2025-11-23T02:00:00.000Z',
        updatedAt: '2025-11-23T02:00:00.000Z'
      };

      emitTypedEvent(mockIo, SOCKET_EVENT_NAMES.ORDER_UPDATED, payload, {
        validate: false,
        log: false
      });

      expect(mockIo.emit).toHaveBeenCalledWith(SOCKET_EVENT_NAMES.ORDER_UPDATED, payload);
      expect(mockIo.to).not.toHaveBeenCalled();
    });
  });
});
