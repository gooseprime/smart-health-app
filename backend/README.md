# Smart Health Monitor - Backend API

A comprehensive backend API for the Smart Health Monitoring System built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📊 **Health Reports Management** - CRUD operations for health reports with validation
- 🚨 **Real-time Alerts** - Automated alert generation with Socket.IO notifications
- 👥 **User Management** - Admin, supervisor, and health worker roles
- 🏘️ **Village Management** - Village settings and configuration
- 📈 **Analytics & Reporting** - Comprehensive statistics and data export
- 🔒 **Security** - Rate limiting, input validation, and error handling
- 📱 **Real-time Updates** - WebSocket support for live notifications

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Express Validator + Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Reports
- `POST /api/reports` - Create new health report
- `GET /api/reports` - Get reports with filtering/pagination
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats` - Get report statistics
- `GET /api/reports/export` - Export reports (CSV/JSON)

### Alerts
- `GET /api/alerts` - Get alerts with filtering
- `GET /api/alerts/:id` - Get specific alert
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/stats` - Get alert statistics

### Admin
- `GET /api/admin/alert-rules` - Get alert rules
- `POST /api/admin/alert-rules` - Create alert rule
- `PUT /api/admin/alert-rules/:id` - Update alert rule
- `DELETE /api/admin/alert-rules/:id` - Delete alert rule
- `GET /api/admin/village-settings` - Get village settings
- `POST /api/admin/village-settings` - Create village settings
- `PUT /api/admin/village-settings/:id` - Update village settings
- `GET /api/admin/analytics/*` - Analytics endpoints

### Users
- `GET /api/users` - Get users (admin/supervisor only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Villages
- `GET /api/villages` - Get villages
- `GET /api/villages/:id` - Get specific village
- `GET /api/villages/:id/reports` - Get village reports
- `GET /api/villages/:id/alerts` - Get village alerts

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-health-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/smart-health-monitor |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Database Schema

### Users
- Basic user information with role-based access
- Password hashing with bcrypt
- Village assignment for supervisors

### Reports
- Health report data with patient information
- Location data with GPS coordinates
- Water test results and contamination levels
- Status tracking and review workflow

### Alerts
- Automated alert generation based on report conditions
- Acknowledgment and resolution tracking
- Real-time notifications via Socket.IO

### Alert Rules
- Configurable rules for alert generation
- Condition-based triggering
- Notification settings per rule

### Village Settings
- Village-specific configuration
- Health facilities and water sources
- Emergency contacts and thresholds

## Real-time Features

The API includes Socket.IO integration for real-time features:

- **New Alerts**: Instant notifications when alerts are generated
- **Report Updates**: Live updates when reports are modified
- **System Notifications**: Admin notifications for system events

### Socket.IO Events

- `join-user-room` - Join user-specific room
- `join-admin-room` - Join admin room for system notifications
- `new-alert` - New alert notification
- `report-updated` - Report status change notification

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Authorization** - Admin, supervisor, health worker roles
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Configurable CORS settings
- **Helmet Security** - Security headers and protection
- **Password Hashing** - Bcrypt password hashing

## Error Handling

- Centralized error handling middleware
- Detailed error logging with Winston
- User-friendly error messages
- Development vs production error details

## Logging

- Structured logging with Winston
- Different log levels (error, warn, info, debug)
- File and console logging
- Request/response logging with Morgan

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

The API follows RESTful conventions with consistent response formats:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [] // Validation errors (development only)
  }
}
```

## Deployment

### Docker
```bash
# Build image
docker build -t smart-health-backend .

# Run container
docker run -p 5000:5000 --env-file .env smart-health-backend
```

### PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name smart-health-backend

# Monitor
pm2 monit
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
