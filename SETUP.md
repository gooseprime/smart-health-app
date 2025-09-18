# Smart Health Monitor - Complete Setup Guide

This guide will help you set up and run the complete Smart Health Monitoring System with both frontend and backend.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- Android Studio (for mobile development)
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd smart-health-app

# Install all dependencies (frontend + backend)
npm run setup:full
```

### 2. Set Up Environment Variables

```bash
# Copy environment example files
cp env.local.example .env.local
cp backend/env.example backend/.env

# Edit the files with your configuration
# .env.local - Frontend configuration
# backend/.env - Backend configuration
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service or run `mongod`
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 4. Run the Application

#### Option A: Run Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option B: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Environment Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### Backend (backend/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-health-monitor
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Mobile App Development

### Build for Android

```bash
# Build and sync with Capacitor
npm run build:mobile

# Run on Android device/emulator
npm run android:dev

# Or open in Android Studio
npm run open:android
```

### Build for iOS

```bash
# Build and sync with Capacitor
npm run build:mobile

# Run on iOS device/simulator
npm run ios:dev

# Or open in Xcode
npm run open:ios
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get reports with filtering
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats` - Get report statistics

### Alerts
- `GET /api/alerts` - Get alerts with filtering
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/alerts/:id/resolve` - Resolve alert
- `GET /api/alerts/stats` - Get alert statistics

### Admin
- `GET /api/admin/alert-rules` - Get alert rules
- `POST /api/admin/alert-rules` - Create alert rule
- `GET /api/admin/village-settings` - Get village settings
- `GET /api/admin/analytics/*` - Analytics endpoints

## Default Users

The system comes with default users for testing:

### Admin User
- **Email**: admin@smarthealth.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full system access

### Health Worker
- **Email**: worker@smarthealth.com
- **Password**: worker123
- **Role**: Health Worker
- **Access**: Report submission and viewing

### Supervisor
- **Email**: supervisor@smarthealth.com
- **Password**: supervisor123
- **Role**: Supervisor
- **Access**: Village management and oversight

## Features

### Frontend Features
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Live notifications and data sync
- ✅ **Advanced Analytics** - Charts and statistics
- ✅ **Multi-language Support** - Internationalization ready
- ✅ **Offline Support** - Works without internet connection
- ✅ **Modern UI/UX** - Beautiful and intuitive interface

### Backend Features
- ✅ **RESTful API** - Complete CRUD operations
- ✅ **Authentication** - JWT-based security
- ✅ **Real-time Notifications** - Socket.IO integration
- ✅ **Data Validation** - Comprehensive input validation
- ✅ **Error Handling** - Robust error management
- ✅ **Logging** - Detailed application logging
- ✅ **Database** - MongoDB with Mongoose ODM

### Mobile Features
- ✅ **Native Performance** - Capacitor-powered mobile app
- ✅ **Offline Capability** - Works without internet
- ✅ **Push Notifications** - Real-time alerts
- ✅ **Camera Integration** - Photo capture for reports
- ✅ **GPS Location** - Automatic location detection
- ✅ **Cross-platform** - Android and iOS support

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running and accessible.

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port or change the port in .env files.

#### 3. Build Errors
```
Error: Cannot find module
```
**Solution**: Run `npm install` in both root and backend directories.

#### 4. Capacitor Sync Issues
```
Error: The web assets directory must contain an index.html file
```
**Solution**: Run `npm run build` first, then `npx cap sync`.

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use tools like Postman or curl to test API endpoints
3. **Database**: Use MongoDB Compass for database management
4. **Logs**: Check console logs for debugging information
5. **Network**: Ensure both frontend and backend are accessible on the network

## Production Deployment

### Backend Deployment
1. Set up MongoDB Atlas or production MongoDB
2. Configure environment variables for production
3. Deploy to your preferred platform (Heroku, AWS, etc.)
4. Set up SSL certificates
5. Configure domain and DNS

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API URL to production backend
4. Configure environment variables

### Mobile App Deployment
1. Build production version: `npm run build:mobile`
2. Generate signed APK/IPA files
3. Upload to Google Play Store / Apple App Store
4. Configure app store settings and metadata

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check the GitHub issues
4. Contact the development team

## License

MIT License - see LICENSE file for details.
