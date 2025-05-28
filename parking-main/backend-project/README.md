# SmartPark - Parking Management System Backend

A comprehensive parking management system backend API for SmartPark Rwanda, located in Rubavu District, West Province, Rwanda.

## 🏢 Company Information
- **Company**: SmartPark Rwanda
- **Location**: Rubavu District, West Province, Rwanda
- **Purpose**: Digital parking space management system

## 🚀 Features

### Core Functionality
- **User Authentication**: Login system for parking managers (no registration - users added to database)
- **Car Management**: Register and manage car details (plate number, driver info, phone)
- **Parking Slot Management**: Real-time slot availability tracking
- **Parking Records**: Automatic entry/exit recording with duration calculation
- **Payment Processing**: Digital payment recording and receipt generation
- **Real-time Updates**: Automatic slot status updates
- **Reporting**: Revenue reports and parking statistics

### Entity Relationship Design
1. **Users** - Authentication and authorization
2. **Parking Slots** - Slot management (Regular, VIP, Disabled)
3. **Cars** - Vehicle information
4. **Parking Records** - Entry/exit tracking with automatic duration calculation
5. **Payments** - Payment processing and receipt generation

## 🛠 Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Express Sessions
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## 📋 Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartpark_db
DB_PORT=3306

# Session Configuration
SESSION_SECRET=smartpark_secret_key_2025_rwanda_rubavu

# Parking Configuration
HOURLY_RATE=1000
CURRENCY=RWF
```

### 3. Database Setup
```bash
# Setup database and seed initial data
npm run setup
```

### 4. Start Development Server
```bash
# Start with auto-reload
npm run dev

# Or start production server
npm start
```

## 🗄 Database Schema

### Tables Structure
- **users**: Authentication and user management
- **parking_slots**: Parking space management
- **cars**: Vehicle information
- **parking_records**: Entry/exit tracking
- **payments**: Payment processing

### Default Users
- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager1`, password: `admin123`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/check` - Check authentication status

### Parking Management
- `GET /api/parking/records` - Get all parking records
- `GET /api/parking/records/active` - Get active parkings
- `POST /api/parking/entry` - Record car entry
- `PUT /api/parking/exit/:id` - Record car exit
- `GET /api/parking/dashboard` - Get dashboard data

### Slot Management
- `GET /api/slots` - Get all parking slots
- `GET /api/slots/available` - Get available slots
- `GET /api/slots/map` - Get slot occupancy map
- `PUT /api/slots/:slot_number/status` - Update slot status

### Payment Management
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id/invoice` - Generate invoice

### Car Management
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Register new car
- `GET /api/cars/:plate_number/history` - Get parking history

## 🔐 Authentication & Authorization

### Roles
- **Admin**: Full system access
- **Manager**: Parking operations access

### Session Management
- Session-based authentication
- 24-hour session duration
- Secure cookie configuration

## 💰 Pricing Structure
- **Regular Slots**: 1000 RWF/hour
- **VIP Slots**: 2000 RWF/hour
- **Disabled Slots**: 1000 RWF/hour

## 📊 Business Logic

### Parking Process
1. **Car Entry**: Register car → Assign slot → Create parking record
2. **Duration Tracking**: Automatic calculation from entry to exit
3. **Fee Calculation**: Duration × Hourly rate (rounded up to nearest hour)
4. **Car Exit**: Complete record → Calculate fee → Update slot status
5. **Payment**: Process payment → Generate receipt

### Slot Management
- Real-time availability tracking
- Automatic status updates (available/occupied/maintenance)
- Slot type categorization

## 🚦 Error Handling
- Comprehensive error messages
- Input validation
- Database transaction safety
- Graceful error responses

## 📈 Monitoring & Logging
- Request logging
- Error tracking
- Health check endpoint (`/health`)

## 🔧 Development

### Project Structure
```
backend-project/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Authentication & validation
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Setup scripts
├── database/        # SQL schema and seeds
├── app.js          # Main application
└── package.json    # Dependencies
```

### Available Scripts
- `npm run dev` - Development with auto-reload
- `npm start` - Production server
- `npm run setup` - Database setup
- `npm run setup:dev` - Setup + start development

## 🌐 API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## 📝 License
ISC License

## 👨‍💻 Author
BYIRINGIRO EMMANUEL

---

**SmartPark Rwanda** - Digitizing parking management in Rubavu District, West Province, Rwanda.
