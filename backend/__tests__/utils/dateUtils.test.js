const { describe, test, expect } = require('@jest/globals');
const { toTimestamp, fromTimestamp, formatDate } = require('../../src/utils/dateUtils');

describe('dateUtils', () => {
  describe('toTimestamp', () => {
    test('converts ISO string to Firebase Timestamp', () => {
      const isoString = '2025-11-23T10:00:00.000Z';
      const timestamp = toTimestamp(isoString);
      
      expect(timestamp).toBeDefined();
      expect(timestamp.toDate).toBeDefined();
      expect(timestamp.seconds).toBeDefined();
    });

    test('handles null input', () => {
      const result = toTimestamp(null);
      expect(result).toBeNull();
    });

    test('handles undefined input', () => {
      const result = toTimestamp(undefined);
      expect(result).toBeNull();
    });

    test('handles empty string', () => {
      const result = toTimestamp('');
      expect(result).toBeNull();
    });

    test('creates timestamp from valid date string', () => {
      const dateString = '2025-12-01';
      const timestamp = toTimestamp(dateString);
      
      expect(timestamp).toBeDefined();
      const date = timestamp.toDate();
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // December (0-indexed)
      expect(date.getDate()).toBe(1);
    });
  });

  describe('fromTimestamp', () => {
    test('converts Firebase Timestamp to ISO string', () => {
      const date = new Date('2025-11-23T10:00:00.000Z');
      const mockTimestamp = {
        toDate: () => date
      };
      
      const result = fromTimestamp(mockTimestamp);
      expect(result).toBe('2025-11-23T10:00:00.000Z');
    });

    test('handles null input', () => {
      const result = fromTimestamp(null);
      expect(result).toBeNull();
    });

    test('handles undefined input', () => {
      const result = fromTimestamp(undefined);
      expect(result).toBeNull();
    });

    test('converts timestamp with correct timezone', () => {
      const date = new Date('2025-01-15T14:30:00.000Z');
      const mockTimestamp = {
        toDate: () => date
      };
      
      const result = fromTimestamp(mockTimestamp);
      expect(result).toContain('2025-01-15');
      expect(result).toContain('14:30:00');
    });
  });

  describe('formatDate', () => {
    test('formats date to readable string', () => {
      const date = new Date('2025-11-23T10:00:00.000Z');
      const result = formatDate(date);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles null input', () => {
      const result = formatDate(null);
      expect(result).toBeNull();
    });

    test('formats ISO string input', () => {
      const isoString = '2025-12-01T15:30:00.000Z';
      const result = formatDate(isoString);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
