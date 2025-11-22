# API Versioning Guide

## Overview

The Fashion Designer Backend API uses **URL path versioning** to manage API versions. This allows us to evolve the API while maintaining backward compatibility for existing clients.

## Versioning Strategy

### URL Path Versioning

All versioned API endpoints follow this pattern:

```
https://api.yourapp.com/api/{version}/{resource}
```

Example:
```
https://api.yourapp.com/api/v1/customers
https://api.yourapp.com/api/v1/orders
```

### Why URL Path Versioning?

- **Explicit**: Version is clearly visible in the URL
- **Browser-friendly**: Easy to test and debug in browsers
- **Standard**: Used by GitHub, Stripe, Twitter, and many other major APIs
- **Simple routing**: Easy to implement and maintain
- **Documentation**: Clear separation of different API versions

## Current Versions

### Version 1 (v1) - Current

**Status**: Active  
**Base URL**: `/api/v1`  
**Introduced**: November 2025

Available endpoints:
- `GET /api/v1/customers` - List all customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `POST /api/v1/customers` - Create a new customer
- `PUT /api/v1/customers/:id` - Update a customer
- `DELETE /api/v1/customers/:id` - Delete a customer
- `GET /api/v1/orders/customer/:customerId` - Get orders by customer
- `POST /api/v1/orders` - Create a new order
- `PUT /api/v1/orders/:id` - Update an order
- `POST /api/v1/orders/track` - Track an order

## Legacy Routes (Deprecated)

**⚠️ Deprecation Notice**

The following unversioned routes are **deprecated** and will be removed on **June 1, 2026**:

- `/customers/*` → Use `/api/v1/customers/*` instead
- `/orders/*` → Use `/api/v1/orders/*` instead

### Migration Timeline

- **November 2025**: Versioning introduced, legacy routes deprecated
- **December 2025 - May 2026**: Deprecation warning period
- **June 1, 2026**: Legacy routes will be removed

### Deprecation Headers

When using legacy routes, you will receive the following headers:

```http
Deprecation: true
X-API-Warn: Unversioned endpoints are deprecated. Please use /api/v1/* instead.
Sunset: Mon, 01 Jun 2026 00:00:00 GMT
Link: <https://docs.yourapp.com/api/versioning>; rel="deprecation"
```

## Making Requests

### Versioned Requests (Recommended)

```bash
# Get all customers
curl https://api.yourapp.com/api/v1/customers

# Create a customer
curl -X POST https://api.yourapp.com/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phoneNumber":"+1234567890"}'
```

### Legacy Requests (Deprecated)

```bash
# This still works but will be removed soon
curl https://api.yourapp.com/customers
```

## Response Headers

All API responses include version information in headers:

```http
X-API-Version: v1
X-API-Latest-Version: v1
```

For deprecated endpoints, additional headers are included:

```http
Deprecation: true
X-API-Warn: Unversioned endpoints are deprecated. Please use /api/v1/* instead.
Sunset: Mon, 01 Jun 2026 00:00:00 GMT
```

## Version Lifecycle

### Active

The version is fully supported and recommended for use.

### Deprecated

The version still works but is no longer recommended. Deprecation warnings are included in responses. Plan to migrate before the sunset date.

### Sunset

The version will be removed on the specified sunset date and will no longer be accessible.

## Best Practices

### For Client Developers

1. **Always use versioned endpoints**: Use `/api/v1/*` instead of legacy unversioned routes
2. **Monitor deprecation headers**: Check for `Deprecation` and `Sunset` headers in responses
3. **Subscribe to API updates**: Stay informed about version releases and deprecations
4. **Test early**: When a new version is released, test it before the old version is deprecated
5. **Use version headers**: The `X-API-Version` header tells you which version processed your request

### For API Consumers

```javascript
// Example: React Native app
const API_BASE_URL = 'https://api.yourapp.com/api/v1';

// Always use the versioned base URL
const response = await fetch(`${API_BASE_URL}/customers`);
```

```javascript
// Example: Node.js client
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api.yourapp.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// All requests automatically use the correct version
const customers = await apiClient.get('/customers');
```

## Migration Guide

### From Legacy to v1

The v1 API is functionally identical to the legacy unversioned API. The only change is the URL path.

**Before (Legacy)**:
```javascript
const response = await fetch('https://api.yourapp.com/customers');
```

**After (v1)**:
```javascript
const response = await fetch('https://api.yourapp.com/api/v1/customers');
```

### Update Environment Variables

```bash
# .env (Before)
API_BASE_URL=https://api.yourapp.com

# .env (After)
API_BASE_URL=https://api.yourapp.com/api/v1
```

### Update API Service Layer

```javascript
// services/api.js (Before)
const BASE_URL = 'https://api.yourapp.com';

export const getCustomers = () => {
  return fetch(`${BASE_URL}/customers`);
};

// services/api.js (After)
const BASE_URL = 'https://api.yourapp.com/api/v1';

export const getCustomers = () => {
  return fetch(`${BASE_URL}/customers`);
};
```

## Future Versions

When breaking changes are needed, we will introduce v2:

1. **Announce**: Email notification and API announcements
2. **Release**: v2 endpoints become available
3. **Parallel support**: Both v1 and v2 work simultaneously
4. **Deprecation notice**: v1 is marked as deprecated
5. **Grace period**: 6+ months for migration
6. **Sunset**: v1 is removed

## API Information Endpoints

### Get API Information

```bash
GET /api
```

Response:
```json
{
  "success": true,
  "data": {
    "name": "Fashion Designer Backend API",
    "currentVersion": "v1",
    "supportedVersions": ["v1"],
    "baseUrl": "https://api.yourapp.com/api",
    "documentation": "https://docs.yourapp.com/api",
    "endpoints": {
      "v1": "/api/v1"
    }
  },
  "message": "API Information"
}
```

### Get Version Information

```bash
GET /api/v1
```

Response:
```json
{
  "success": true,
  "data": {
    "version": "v1",
    "status": "active",
    "endpoints": {
      "customers": "/api/v1/customers",
      "orders": "/api/v1/orders"
    },
    "documentation": "https://docs.yourapp.com/api/v1"
  },
  "message": "API v1"
}
```

## Error Handling

### Unsupported Version

```bash
GET /api/v99/customers
```

Response (404):
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "status": "fail",
    "message": "API version 'v99' is not supported. Supported versions: v1",
    "isOperational": true
  }
}
```

## Support

For questions or issues:
- Documentation: https://docs.yourapp.com/api
- Email: api-support@yourapp.com
- GitHub Issues: https://github.com/yourapp/backend/issues

## Changelog

### v1 (November 2025)
- Initial versioned release
- All existing endpoints moved to `/api/v1`
- Legacy unversioned routes deprecated
