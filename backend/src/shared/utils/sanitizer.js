const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Trim whitespace
  let sanitized = str.trim();
  // Basic HTML escape to prevent XSS (though less critical for API -> Mobile/React)
  // This is a simple implementation. For robust XSS protection, use a library like 'xss' or 'dompurify'.
  // For this specific request, we focus on trimming and basic cleanup.
  return sanitized;
};

const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitizedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'phone' || key === 'customerPhone') {
      sanitizedObj[key] = sanitizePhone(value);
    } else if (typeof value === 'string') {
      sanitizedObj[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitizedObj[key] = sanitizeObject(value);
    } else {
      sanitizedObj[key] = value;
    }
  }
  return sanitizedObj;
};

module.exports = {
  sanitizeString,
  sanitizePhone,
  sanitizeObject,
};
