# Smart Health Monitor API Documentation

## Overview

The Smart Health Monitor API provides comprehensive endpoints for managing health reports, alerts, users, and village settings in a tribal health monitoring system.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except authentication) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Report endpoints**: 50 requests per 15 minutes

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Optional message",
  "error": {
    "message": "Error message",
    "type": "Error type",
    "details": [...]
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "health_worker",
  "village": "Village Name",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "health_worker",
      "village": "Village Name",
      "phone": "+1234567890",
      "isActive": true
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "health_worker",
      "village": "Village Name",
      "phone": "+1234567890",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "token": "jwt_token"
  }
}
```

### GET /auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "health_worker",
      "village": "Village Name",
      "phone": "+1234567890",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### POST /auth/logout

Logout current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Report Endpoints

### POST /reports

Create a new health report.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientName": "Jane Smith",
  "age": 35,
  "gender": "female",
  "symptoms": ["fever", "headache", "nausea"],
  "severity": "high",
  "village": "Village Name",
  "location": {
    "latitude": 12.3456,
    "longitude": 78.9012,
    "address": "Village Center"
  },
  "waterTestResults": {
    "phLevel": 7.2,
    "contaminationLevel": "low",
    "bacteriaCount": 5
  },
  "notes": "Patient showing signs of dehydration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report_id",
      "patientName": "Jane Smith",
      "age": 35,
      "gender": "female",
      "symptoms": ["fever", "headache", "nausea"],
      "severity": "high",
      "village": "Village Name",
      "status": "pending",
      "submittedBy": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "health_worker"
      },
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Report created successfully"
}
```

### GET /reports

Get reports with filtering and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (pending, reviewed, flagged, resolved)
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `village` (optional): Filter by village name
- `dateFrom` (optional): Start date (ISO 8601)
- `dateTo` (optional): End date (ISO 8601)
- `sortBy` (optional): Sort field (submittedAt, severity, village, status)
- `sortOrder` (optional): Sort order (asc, desc)

**Example:**
```
GET /reports?page=1&limit=10&status=pending&severity=high&sortBy=submittedAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_id",
        "patientName": "Jane Smith",
        "age": 35,
        "gender": "female",
        "symptoms": ["fever", "headache"],
        "severity": "high",
        "village": "Village Name",
        "status": "pending",
        "submittedBy": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "submittedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /reports/:id

Get a specific report by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report_id",
      "patientName": "Jane Smith",
      "age": 35,
      "gender": "female",
      "symptoms": ["fever", "headache", "nausea"],
      "severity": "high",
      "village": "Village Name",
      "status": "pending",
      "submittedBy": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "health_worker"
      },
      "submittedAt": "2024-01-15T10:30:00Z",
      "notes": "Patient showing signs of dehydration"
    }
  }
}
```

### PUT /reports/:id

Update a report (admin/supervisor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "reviewed",
  "notes": "Reviewed and confirmed diagnosis",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report_id",
      "status": "reviewed",
      "notes": "Reviewed and confirmed diagnosis",
      "priority": "high",
      "reviewedBy": {
        "id": "admin_id",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "reviewedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### DELETE /reports/:id

Delete a report (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### GET /reports/stats

Get report statistics (admin/supervisor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 150,
      "pending": 25,
      "reviewed": 100,
      "flagged": 25
    },
    "severityDistribution": [
      { "_id": "high", "count": 50 },
      { "_id": "medium", "count": 75 },
      { "_id": "low", "count": 25 }
    ],
    "villageDistribution": [
      { "_id": "Village A", "count": 60 },
      { "_id": "Village B", "count": 45 },
      { "_id": "Village C", "count": 45 }
    ],
    "recentReports": [
      {
        "id": "report_id",
        "patientName": "Jane Smith",
        "severity": "high",
        "submittedAt": "2024-01-15T10:30:00Z",
        "submittedBy": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "trends": [
      {
        "_id": { "year": 2024, "month": 1, "day": 15 },
        "count": 12
      }
    ]
  }
}
```

### GET /reports/export

Export reports (admin/supervisor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `format` (optional): Export format (csv, json) - default: json
- Same filtering parameters as GET /reports

**Response:**
- **CSV**: Returns CSV file with Content-Type: text/csv
- **JSON**: Returns JSON response with reports array

---

## Alert Endpoints

### GET /alerts

Get alerts with filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (active, acknowledged, resolved)
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `type` (optional): Filter by type (water_contamination, disease_outbreak)
- `village` (optional): Filter by village name

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_id",
        "title": "High Water Contamination Detected",
        "type": "water_contamination",
        "severity": "high",
        "message": "High water contamination detected in Village A",
        "village": "Village A",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "createdBy": {
          "id": "user_id",
          "name": "John Doe"
        }
      }
    ]
  }
}
```

### POST /alerts/:id/acknowledge

Acknowledge an alert.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alert": {
      "id": "alert_id",
      "status": "acknowledged",
      "acknowledgedBy": {
        "id": "user_id",
        "name": "John Doe"
      },
      "acknowledgedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### POST /alerts/:id/resolve

Resolve an alert.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "resolution": "Water source treated and tested clean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alert": {
      "id": "alert_id",
      "status": "resolved",
      "resolvedBy": {
        "id": "user_id",
        "name": "John Doe"
      },
      "resolvedAt": "2024-01-15T12:00:00Z",
      "resolution": "Water source treated and tested clean"
    }
  }
}
```

---

## Admin Endpoints

### GET /admin/users

Get all users (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "health_worker",
        "village": "Village Name",
        "isActive": true,
        "lastLogin": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### GET /admin/alert-rules

Get alert rules (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule_id",
        "name": "High Water Contamination",
        "description": "Alert when water contamination is high",
        "condition": {
          "field": "waterTestResults.contaminationLevel",
          "operator": "equals",
          "value": "high"
        },
        "severity": "high",
        "type": "water_contamination",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /admin/alert-rules

Create new alert rule (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Disease Outbreak Detection",
  "description": "Alert when multiple similar symptoms reported",
  "condition": {
    "field": "symptoms",
    "operator": "count",
    "value": 5,
    "timeframe": "7d"
  },
  "severity": "critical",
  "type": "disease_outbreak",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": {
      "id": "rule_id",
      "name": "Disease Outbreak Detection",
      "description": "Alert when multiple similar symptoms reported",
      "condition": {
        "field": "symptoms",
        "operator": "count",
        "value": 5,
        "timeframe": "7d"
      },
      "severity": "critical",
      "type": "disease_outbreak",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Village Endpoints

### GET /villages

Get village settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "villages": [
      {
        "id": "village_id",
        "villageName": "Village A",
        "healthWorkerCount": 5,
        "population": 1000,
        "waterSource": "Well",
        "lastUpdated": "2024-01-15T10:30:00Z",
        "updatedBy": {
          "id": "user_id",
          "name": "John Doe"
        }
      }
    ]
  }
}
```

### PUT /villages/:id

Update village settings (admin/supervisor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "healthWorkerCount": 6,
  "population": 1050,
  "waterSource": "Well and River"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "village": {
      "id": "village_id",
      "villageName": "Village A",
      "healthWorkerCount": 6,
      "population": 1050,
      "waterSource": "Well and River",
      "lastUpdated": "2024-01-15T11:00:00Z",
      "updatedBy": {
        "id": "user_id",
        "name": "John Doe"
      }
    }
  }
}
```

---

## Health Check Endpoints

### GET /health

Basic health check.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "used": 45.2,
    "total": 128.0,
    "external": 2.1
  },
  "cpu": {
    "usage": {
      "user": 1000000,
      "system": 500000
    }
  }
}
```

### GET /health/detailed

Detailed health check with database status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "readyState": 1
  },
  "memory": {
    "used": 45.2,
    "total": 128.0,
    "external": 2.1,
    "rss": 67.8
  },
  "cpu": {
    "usage": {
      "user": 1000000,
      "system": 500000
    },
    "loadAverage": [0.5, 0.3, 0.2]
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v18.17.0",
    "pid": 12345
  }
}
```

---

## WebSocket Events

The API also supports real-time notifications via WebSocket connections.

### Connection

Connect to WebSocket at: `ws://localhost:5000`

### Events

#### Join Rooms
```javascript
// Join user-specific room
socket.emit('join-user-room', userId)

// Join admin room
socket.emit('join-admin-room')

// Join village-specific room
socket.emit('join-village-room', villageName)
```

#### Receive Events
```javascript
// New alert notification
socket.on('new-alert', (alert) => {
  console.log('New alert:', alert)
})

// Report status update
socket.on('report-updated', (report) => {
  console.log('Report updated:', report)
})
```

---

## Data Models

### User
```typescript
interface User {
  id: string
  name: string
  email: string
  password: string (hashed)
  role: 'admin' | 'supervisor' | 'health_worker'
  village?: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Report
```typescript
interface Report {
  id: string
  patientName: string
  age: number
  gender: 'male' | 'female' | 'other'
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  village: string
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  waterTestResults?: {
    phLevel: number
    contaminationLevel: 'low' | 'medium' | 'high'
    bacteriaCount: number
  }
  status: 'pending' | 'reviewed' | 'flagged' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  tags?: string[]
  submittedBy: ObjectId
  submittedAt: Date
  reviewedBy?: ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Alert
```typescript
interface Alert {
  id: string
  title: string
  type: 'water_contamination' | 'disease_outbreak' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  village?: string
  reportId?: ObjectId
  status: 'active' | 'acknowledged' | 'resolved'
  createdBy: ObjectId
  createdAt: Date
  acknowledgedBy?: ObjectId
  acknowledgedAt?: Date
  resolvedBy?: ObjectId
  resolvedAt?: Date
  resolution?: string
}
```

---

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "type": "validation",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address",
        "value": "invalid-email"
      }
    ]
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "message": "Invalid token",
    "type": "JsonWebTokenError"
  }
}
```

### Rate Limit Errors
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "type": "RateLimitError"
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
class SmartHealthAPI {
  private baseURL: string
  private token: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  async createReport(reportData: any) {
    const response = await fetch(`${this.baseURL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(reportData)
    })
    return response.json()
  }

  async getReports(filters: any = {}) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseURL}/reports?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    return response.json()
  }
}

// Usage
const api = new SmartHealthAPI('http://localhost:5000/api')
api.setToken('your-jwt-token')

const report = await api.createReport({
  patientName: 'Jane Smith',
  age: 35,
  gender: 'female',
  symptoms: ['fever', 'headache'],
  severity: 'high',
  village: 'Village A'
})
```

### Python
```python
import requests
import json

class SmartHealthAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None

    def set_token(self, token):
        self.token = token

    def create_report(self, report_data):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        response = requests.post(
            f'{self.base_url}/reports',
            headers=headers,
            data=json.dumps(report_data)
        )
        return response.json()

    def get_reports(self, filters=None):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(
            f'{self.base_url}/reports',
            headers=headers,
            params=filters or {}
        )
        return response.json()

# Usage
api = SmartHealthAPI('http://localhost:5000/api')
api.set_token('your-jwt-token')

report = api.create_report({
    'patientName': 'Jane Smith',
    'age': 35,
    'gender': 'female',
    'symptoms': ['fever', 'headache'],
    'severity': 'high',
    'village': 'Village A'
})
```

---

## Testing

### Postman Collection

Import the following collection for testing:

```json
{
  "info": {
    "name": "Smart Health Monitor API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  }
}
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smarthealth.com","password":"admin123"}'

# Create Report
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientName": "Jane Smith",
    "age": 35,
    "gender": "female",
    "symptoms": ["fever", "headache"],
    "severity": "high",
    "village": "Village A"
  }'

# Get Reports
curl -X GET "http://localhost:5000/api/reports?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

### Version 1.0.0
- Initial API release
- Authentication system
- Report management
- Alert system
- Admin panel
- Village management
- Real-time notifications
- Health monitoring
- Comprehensive validation
- Rate limiting
- Error handling
