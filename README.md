# Smart Waste Management System

A complete, municipality-grade waste collection tracking system with mobile app, web dashboard, and backend APIs. Designed for reliability, scalability, and real-world deployment.

## System Architecture

```
smart-waste-system/
├── server/                   # Express backend API
├── apps/
│   ├── mobile-app/           # Expo React Native app (Resident + Collector)
│   └── supervisor-dashboard/ # Next.js web dashboard
├── tools/
│   └── import-residents/     # CLI CSV import tool
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20.11.1
- **Framework**: Express 4.18.2
- **Database**: MongoDB 8.1.1
- **Authentication**: JWT + bcryptjs
- **Task Scheduling**: node-cron 3.0.3
- **File Upload**: multer 1.4.5-lts.1

### Mobile App
- **Framework**: Expo ~50.0.14
- **React**: 18.2.0
- **React Native**: 0.73.6
- **State**: React Query 5.18.1
- **Navigation**: React Navigation 6.1.9
- **Storage**: Expo SQLite + SecureStore

### Web Dashboard
- **Framework**: Next.js 14.1.0
- **Styling**: Tailwind CSS 3.4.1
- **HTTP**: Axios

## Quick Start

### Prerequisites
- Node.js 20.11.1 + npm 10.5.0
- MongoDB running locally or remote connection
- Expo CLI (for mobile): `npm install -g expo-cli`

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/smart-waste
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

**Mobile App** (`apps/mobile-app/.env`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

**Dashboard** (`apps/supervisor-dashboard/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Services

**Backend**:
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Mobile App**:
```bash
cd apps/mobile-app
npm start
# Scan QR code with Expo app or press i/a for iOS/Android
```

**Dashboard**:
```bash
cd apps/supervisor-dashboard
npm run dev
# Runs on http://localhost:3000
```

## Database Schema

### residents_master
Property registry with owner and location information.

### users
Authentication for residents, collectors, and supervisors.

### collectors
Collector profiles with assigned wards.

### collections_log
Daily collection records with status tracking.

### issues
Problem reports from residents and collectors.

### monthly_charges
Billing calculation based on collections and missed days.

## API Endpoints

### Authentication
- `POST /api/auth/register/resident` - Register resident
- `POST /api/auth/login` - Login any user
- `GET /api/auth/me` - Get current user

### Resident
- `GET /api/resident/status/today` - Today's collection status
- `POST /api/resident/confirm-collection` - Confirm collection
- `POST /api/resident/dispute-collection` - Dispute collection
- `GET /api/resident/history` - Last 30 days history
- `GET /api/resident/monthly-charges` - View charges
- `POST /api/resident/report-issue` - Report issue

### Collector
- `GET /api/collector/wards` - Get assigned wards
- `GET /api/collector/ward/:wardNo` - Properties in ward
- `POST /api/collector/mark-collection` - Mark collection
- `POST /api/collector/undo-collection` - Undo (same day only)
- `GET /api/collector/today-collections` - Today's collections

### Supervisor
- `POST /api/supervisor/bootstrap` - Create supervisor account
- `POST /api/supervisor/residents/import-preview` - Preview CSV
- `POST /api/supervisor/residents/import-confirm` - Import residents
- `GET /api/supervisor/collectors` - List collectors
- `POST /api/supervisor/collectors` - Create collector
- `PATCH /api/supervisor/collectors/:id/assign-wards` - Assign wards
- `GET /api/supervisor/kpi` - Dashboard metrics
- `GET /api/supervisor/issues` - List issues
- `PATCH /api/supervisor/issues/:id/resolve` - Resolve issue
- `POST /api/supervisor/generate-monthly-charges` - Generate charges
- `GET /api/supervisor/billing/:month` - Billing overview

## CSV Import

### Format
Residents CSV must have these columns (required in order):
- `prop_uid` - Unique property identifier
- `owner_name` - Property owner name
- `zone_no` - Zone number
- `ward_no` - Ward number
- `ward_name` - Ward name
- `address` - Full address
- `mobile` - Phone number
- `lat` (optional) - Latitude
- `lng` (optional) - Longitude

### Methods

**Via Dashboard** (`/dashboard/residents`):
1. Upload CSV file
2. Preview summary and sample data
3. Review any validation errors
4. Confirm import

**Via CLI**:
```bash
node tools/import-residents/cli.js residents.csv
```

Prevents duplicate `prop_uid` and validates all rows.

## Mobile App Features

### Resident
- Register with valid property ID
- View today's collection status prominently
- Confirm or dispute collections
- 30-day collection history
- Monthly billing overview
- Report issues
- Offline-first: auto-sync when online

### Collector
- Login and view assigned wards
- One-tap collection marking
- Undo collections same day
- Offline support with local SQLite storage
- Auto-sync when network available
- Offline indicator visible when disconnected

## Dashboard Features

### Supervisor Login
- Bootstrap first supervisor account
- Subsequent logins for existing supervisor

### KPI Dashboard
- Total residents count
- Active collectors
- Collections today
- Pending issues

### Collector Management
- Create new collectors
- View all collectors
- Assign wards to collectors
- Toggle active status

### Resident Import
- Upload CSV with preview
- Validation and error reporting
- Sample data review before import
- Duplicate prevention

### Issues Management
- View all reported issues
- Filter by status (pending/resolved)
- Mark issues as resolved
- See who reported issue

### Billing
- Generate monthly charges
- View billing summary
- Per-property breakdown
- Track payment status

## Architecture Decisions

### Offline-First Mobile
- Local SQLite database for collections
- Secure storage for auth tokens
- Auto-sync when network returns
- Graceful handling of network loss

### Single Database of Truth
- MongoDB is the authoritative source
- All clients eventually sync with server
- Conflicts resolved server-side

### Role-Based Access Control
- Three roles: resident, collector, supervisor
- JWT-based authentication
- Middleware checks at every endpoint
- Row-level data isolation

### CSV Import
- Shared validation logic between CLI and dashboard
- Prevents duplicate properties
- Detailed error reporting
- Transaction-safe imports

### Status-First UI
- Collection status visible without scrolling
- Action buttons for residents only if needed
- Simple, boring design (no animations/tricks)
- Accessibility-first approach

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with 7-day expiration
- CORS enabled for web + mobile
- Role-based middleware on all routes
- No sensitive data in tokens
- Database validation on all inputs

## Performance

- MongoDB indexes on frequently queried fields
- Query pagination for large datasets
- Local caching in mobile app
- Efficient bundle sizes
- CSS-in-JS (no external stylesheets)

## Testing Flows

### Resident Flow
1. Open app → Register with property ID → Login
2. View today's status → Confirm collection
3. Check 30-day history and charges
4. Report issue if problem exists

### Collector Flow
1. Open app → Login (created by supervisor)
2. View assigned wards → Select ward
3. One-tap mark collection on each property
4. Works offline with auto-sync

### Supervisor Flow
1. Dashboard → Bootstrap account on first visit
2. Import residents via CSV with preview
3. Create and assign collectors
4. Monitor KPI dashboard
5. Resolve reported issues
6. Generate and review monthly charges

## Production Deployment

### Environment Variables
Change these for production:
- `JWT_SECRET` - Generate strong secret
- `MONGODB_URI` - Use managed database (Atlas, etc)
- `NODE_ENV` - Set to `production`
- `NEXT_PUBLIC_API_URL` - Use production API URL
- `EXPO_PUBLIC_API_URL` - Use production API URL

### Database
- Use MongoDB Atlas or similar managed service
- Enable authentication and encryption
- Regular backups
- Index all query fields

### Backend
- Deploy to Vercel, AWS, or similar
- Enable HTTPS only
- Set secure CORS origins
- Use environment variables for secrets
- Monitor error rates and performance

### Dashboard
- Deploy to Vercel for optimal Next.js performance
- Enable ISR for static content
- Use API routes for secure operations
- Monitor lighthouse scores

### Mobile App
- Build APK/IPA with Expo Build
- Sign with certificates
- Distribute via App Store/Google Play
- Implement auto-update with Expo Updates

## File Size Checklist

- No unused dependencies ✓
- No experimental APIs ✓
- No mock/placeholder data ✓
- All flows implemented end-to-end ✓
- CSV import working both ways ✓
- Offline sync operational ✓

## Support & Issues

For integration issues:
1. Check logs in server console
2. Verify MongoDB connection
3. Confirm environment variables
4. Check API endpoints with curl/Postman
5. Review React Native logs with Expo

## License

Proprietary - Smart Waste Management System
