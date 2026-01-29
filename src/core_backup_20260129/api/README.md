# API Layer - README

## 📚 Overview

This directory contains the API layer for the application - a clean separation between HTTP calls and business logic.

## 🏗️ Architecture

```
api/
├── client/          # HTTP client configuration
│   ├── httpClient.js   # Axios instance with interceptors
│   └── config.js       # API configuration constants
│
└── endpoints/       # Pure API endpoints (no business logic)
    ├── authApi.js
    ├── userApi.js
    ├── taskApi.js
    ├── projectApi.js
    ├── departmentApi.js
    ├── accountApi.js
    └── dashboardApi.js
```

## 🎯 Design Pattern: Hybrid Approach

### Layer 1: API (Pure HTTP Calls)
**Location:** `api/endpoints/`  
**Responsibility:** HTTP calls ONLY - no business logic

```javascript
// api/endpoints/taskApi.js
export const taskApi = {
  getAll: (params) => httpClient.get('/tasks', { params }),
  getById: (id) => httpClient.get(`/tasks/${id}`),
  create: (data) => httpClient.post('/tasks', data),
  update: (id, data) => httpClient.put(`/tasks/${id}`, data),
  delete: (id) => httpClient.delete(`/tasks/${id}`),
};
```

### Layer 2: Services (Business Logic)
**Location:** `../services/`  
**Responsibility:** Business logic, data transformation, validation

```javascript
// services/taskService.js
import { taskApi } from '@core/api';

export const taskService = {
  async getAllTasks(filters = {}) {
    // Call API
    const res = await taskApi.getAll(filters);
    
    // Transform data
    const tasks = res.data.map(mapTaskToFrontend);
    
    // Return formatted response
    return { ok: true, data: tasks };
  },
};
```

## 🔧 HTTP Client Features

### 1. Auto Token Injection
```javascript
// Automatically adds Authorization header
headers: {
  Authorization: `Bearer ${token}`
}
```

### 2. Token Refresh on 401
```javascript
// Automatically refreshes token and retries request
if (error.response?.status === 401) {
  // Refresh token
  // Retry request with new token
}
```

### 3. Consistent Error Handling
```javascript
try {
  const response = await taskApi.getAll();
} catch (error) {
  // error.response.data.message
  // error.response.status
}
```

## 📖 Usage Examples

### Creating API Endpoint

```javascript
// api/endpoints/exampleApi.js
import { httpClient } from '../client/httpClient';

export const exampleApi = {
  getAll: () => httpClient.get('/examples'),
  getById: (id) => httpClient.get(`/examples/${id}`),
  create: (data) => httpClient.post('/examples', data),
};
```

### Using in Service

```javascript
// services/exampleService.js
import { exampleApi } from '@core/api';

export const exampleService = {
  async getExamples() {
    try {
      const res = await exampleApi.getAll();
      return { ok: true, data: res.data };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message };
    }
  },
};
```

### Using in Component

```javascript
// Component.jsx
import { exampleService } from '@core/services/exampleService';

const data = await exampleService.getExamples();
if (data.ok) {
  console.log(data.data);
}
```

## ✅ Benefits

### 1. Separation of Concerns
- API layer = HTTP only
- Service layer = Business logic

### 2. Easy Testing
```javascript
// Mock API layer
jest.mock('@core/api/endpoints/taskApi');

// Test service logic
test('service filters tasks correctly', () => {
  taskApi.getAll.mockResolvedValue({ data: mockTasks });
  // Test business logic
});
```

### 3. Easy Backend Migration
```javascript
// Change API implementation without touching services
// REST → GraphQL, different endpoints, etc.
```

### 4. Reusability
```javascript
// Same API can be used by multiple services
await taskApi.getAll();  // in taskService
await taskApi.getAll();  // in dashboardService
```

## 🔒 Security

**Frontend security = UX optimization ONLY**

Real security enforced by:
1. **Backend API** - validates JWT, checks roles
2. **HTTP Client** - adds token to requests
3. **Interceptors** - handles auth errors

## 📝 Maintenance

### Adding New API Endpoint

1. Create file: `api/endpoints/newApi.js`
```javascript
import { httpClient } from '../client/httpClient';

export const newApi = {
  getAll: () => httpClient.get('/new-resource'),
};
```

2. Export in `api/index.js`:
```javascript
export { newApi } from './endpoints/newApi';
```

3. Use in service:
```javascript
import { newApi } from '@core/api';
```

### Changing Base URL

Update `api/client/httpClient.js`:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3069',
```

---

**Created:** January 2026  
**Pattern:** Hybrid API + Service Layer  
**Inspired by:** React Query, Airbnb, Google best practices
