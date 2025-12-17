# 🔐 SecureYou - Emergency Safety Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E)](https://supabase.com/)
[![Expo](https://img.shields.io/badge/Expo-51.0-000020)](https://expo.dev/)

**Your Safety, One Tap Away** - Emergency SOS alerts and live location sharing with trusted contacts.

> **📱 NEW: Native Mobile App!** Check out the `expo-app/` folder for the Expo/React Native version with cloud-based APK builds (no Android Studio needed)!

---

## 🌟 Features

### 🚨 Emergency Response
- **One-Tap SOS Button** - Instantly alert all emergency contacts with confirmation dialog
- **Real Geolocation Tracking** - HTML5 GPS tracking with live coordinates
- **Background Location Tracking** - Continuous GPS monitoring during active emergencies
- **Offline SOS Queue** - Emergency alerts queued when offline, sent automatically when reconnected
- **Emergency Services Calling** - Direct dial 999 (Bangladesh emergency number)
- **Map Integration** - Google Maps with live location sharing
- **Shake to Alert** - Discreet emergency activation via phone shake (coming soon)
- **Silent Mode** - Disguise app for safety in threatening situations
- **Incident Reporting** - Document and track safety incidents

### 👥 Contact Management
- **Emergency Contacts** - Add unlimited trusted contacts
- **Offline Contact Cache** - Contacts cached locally for 7 days
- **Contact Verification** - Phone and email validation (Bangladesh format)
- **Priority Contacts** - Mark primary contact for immediate alerts
- **Real-time Notifications** - Contacts receive alerts via app notifications

### 🔐 Security & Privacy
- **Secure Authentication** - Supabase Auth with email verification
- **OAuth Support** - Google and Facebook login
- **Password Protection** - Strong password requirements with real-time strength meter
- **Password Reset** - Email-based password recovery with account verification
- **Data Encryption** - End-to-end encrypted communications
- **Privacy Controls** - User controls all data sharing

### 📱 User Experience
- **Progressive Web App (PWA)** - Install on home screen like native app
- **Offline Support** - Core emergency features work without internet
- **Service Worker** - Offline caching for critical resources
- **Dark Mode** - Eye-friendly interface for night use with full theme support
- **Multi-Language** - English, Bengali, Spanish support
- **Responsive Design** - Works on all devices and screen sizes
- **Real-time Status Indicators** - Online/offline badges, SOS status, tracking status

### 📍 Location Features
- **Live GPS Tracking** - Real-time coordinates with accuracy indicators
- **Location History** - Track movement during emergencies (stored in database)
- **Auto Location Sharing** - Periodic location updates to contacts (every 5 minutes)
- **Session Recovery** - Resume tracking after app restart (within 2 hours)
- **Reverse Geocoding** - Convert GPS coordinates to human-readable addresses
- **Google Maps Integration** - View location on map, open in navigation

### 🔧 System Monitoring
- **Emergency System Status** - Real-time cache, queue, and tracking status in Settings
- **Cache Management** - View contact cache status and last sync time
- **Alert Queue Monitoring** - See queued alerts waiting to send
- **Tracking Session Stats** - View active tracking status and location count

---

## 📚 Documentation

### Quick Links
- **[⭐ COMPREHENSIVE_AUDIT_REPORT.md](./COMPREHENSIVE_AUDIT_REPORT.md)** - Complete project audit & analysis
- **[🚀 REORGANIZATION_COMPLETE.md](./REORGANIZATION_COMPLETE.md)** - Code reorganization summary
- **[📖 docs/](./docs/)** - All documentation organized
  - **[guides/](./docs/guides/)** - 12 step-by-step guides (Quick Start, Deployment, Mobile Setup, etc.)
  - **[reports/](./docs/reports/)** - 11 technical reports (Testing, Bugs, Code Quality)
  - **[checklists/](./docs/checklists/)** - 3 pre-launch checklists
- **[🗄️ backend/](./backend/)** - Database schemas & backend documentation
- **[🔧 scripts/](./scripts/)** - Utility scripts (quick-launch, deployment)

### Getting Started
1. **New to SecureYou?** → Read [docs/guides/START_HERE.md](./docs/guides/START_HERE.md)
2. **Quick Start** → Follow [docs/guides/QUICK_START.md](./docs/guides/QUICK_START.md)
3. **Full Analysis** → Read [COMPREHENSIVE_AUDIT_REPORT.md](./COMPREHENSIVE_AUDIT_REPORT.md)

## Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.8** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible components
- **React Router** - Client-side routing

### Backend & Services
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Auth** - Email/password and OAuth authentication
- **Row Level Security (RLS)** - Database-level security policies

### Emergency Features
- **HTML5 Geolocation API** - Real-time GPS tracking
- **Service Workers** - Offline functionality
- **LocalStorage** - Offline contact caching and alert queuing
- **Google Maps API** - Map visualization and navigation
- **OpenStreetMap Nominatim** - Reverse geocoding (coordinates → address)

### Libraries
- **TanStack React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Runtime type validation
- **Lucide React** - Icon library

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) (v7 or newer)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ctrl-ShiftHack/Secure-You.git
   cd Secure-You
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase database:
   - See `SUPABASE_SETUP.md` for detailed instructions
   - Run migrations in order:
     - `migrations/001_initial_schema.sql` - Core tables
     - `migrations/002_add_oauth.sql` - OAuth support (if needed)
     - `migrations/003_location_tracking.sql` - Location tracking tables
   - Or run `fresh-start.sql` for complete setup

5. (Optional) Configure third-party services:
   ```env
   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_api_key
   
   # SMS Provider (Twilio)
   VITE_TWILIO_ACCOUNT_SID=your_sid
   VITE_TWILIO_AUTH_TOKEN=your_token
   
   # Email Provider (SendGrid)
   VITE_SENDGRID_API_KEY=your_api_key
   ```
   **Note**: App works without these, but SMS/email notifications require API keys

6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── SOSButton.tsx   # Emergency SOS button with confirmation
│   ├── ContactCard.tsx # Emergency contact display
│   └── ...             # Other custom components
├── hooks/              # Custom React hooks
│   ├── use-profile.tsx # User profile management
│   └── use-toast.ts    # Toast notifications
├── i18n/               # Internationalization
│   └── locales/        # Translation files (en, es, bn)
├── lib/                # Utility functions and services
│   ├── supabase.ts     # Supabase client configuration
│   ├── emergency.ts    # ⭐ Emergency services (SOS, geolocation, tracking)
│   ├── offline.ts      # ⭐ Offline support (caching, queuing)
│   ├── backgroundTracking.ts  # ⭐ Background GPS tracking
│   ├── validation.ts   # Form validation utilities
│   └── utils.ts        # General utilities
├── pages/              # Application pages/routes
│   ├── Dashboard.tsx   # Main dashboard with SOS button
│   ├── Map.tsx         # ⭐ Live location map
│   ├── Contacts.tsx    # Emergency contact management
│   ├── Incidents.tsx   # Incident reporting
│   ├── Settings.tsx    # ⭐ User settings with emergency system status
│   ├── Login.tsx       # Authentication (email + OAuth)
│   └── ...             # Other pages
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── services/           # API services
│   └── api.ts          # Supabase API calls
├── types/              # TypeScript type definitions
│   └── database.types.ts  # Supabase database types
└── App.tsx            # Root component with routing

public/
├── manifest.json       # PWA manifest
└── sw.js              # Service worker for offline support

migrations/
├── 001_initial_schema.sql      # Core database tables
├── 002_add_oauth.sql           # OAuth providers
└── 003_location_tracking.sql   # ⭐ Location tracking tables

deployment/
├── vercel.md          # Vercel deployment guide
├── netlify.md         # Netlify deployment guide
└── ...                # Other platform guides
```

**⭐ = Emergency feature files**

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features in Detail

### 🚨 Emergency SOS System
**Complete implementation with real alerts**

1. **SOS Button Flow**:
   - User taps SOS button on Dashboard
   - Confirmation dialog appears (prevents false alarms)
   - System checks for emergency contacts
   - Gets current GPS location (HTML5 Geolocation)
   - Sends alerts to all contacts with location
   - Starts background location tracking
   - Enables automatic location sharing (every 5 minutes)

2. **Offline Support**:
   - Contacts cached in localStorage (7-day validity)
   - Alerts queued when offline
   - Automatically sent when connection restored
   - Online/offline status indicator in UI

3. **Real Features**:
   - Creates incident record in database
   - Generates notifications for each contact
   - Includes Google Maps link with coordinates
   - Ready for SMS/email integration (Twilio, SendGrid)
   - Direct emergency calling (tel: protocol)

**See [EMERGENCY_FEATURES.md](./EMERGENCY_FEATURES.md) for complete documentation**

### 📍 Location Tracking
**HTML5 Geolocation API with database persistence**

1. **Real-time GPS**:
   - High accuracy mode enabled
   - Updates every 5 seconds
   - Shows latitude, longitude, accuracy
   - Reverse geocoding (address from coordinates)

2. **Background Tracking**:
   - Continuous GPS monitoring during emergencies
   - Stores location history in database
   - Session recovery after app restart
   - Statistics: distance traveled, average speed, duration

3. **Map Integration**:
   - Google Maps embed with live location
   - Share location with emergency contacts
   - Open in navigation app
   - OpenStreetMap for address lookup

### 👥 Contact Management
**Secure emergency contact system**

- Add contacts with name, phone, email, relationship
- Phone validation (Bangladesh format: 01XXXXXXXXX)
- Email validation (RFC 5322 compliant)
- Cached for offline access
- Edit and delete contacts
- View contact list in Dashboard

### 🔐 Authentication & Security
**Comprehensive auth with Supabase**

1. **Email/Password Auth**:
   - Email verification required
   - Strong password requirements (8+ chars, uppercase, lowercase, number, special)
   - Real-time password strength meter
   - Current password verification for sensitive changes

2. **Password Reset**:
   - Forgot password flow with email
   - Account verification before reset
   - Secure token-based reset
   - Auto-logout after password change

3. **OAuth Support**:
   - Google Sign-In
   - Facebook Login
   - One-click authentication

4. **Profile Management**:
   - Update name, phone, address
   - Change email (with password verification)
   - Change password (requires current password)
   - Input validation and sanitization

### ⚙️ Settings & Monitoring
**Real-time emergency system status**

1. **Emergency System Dashboard** (in Settings):
   - **Offline Cache**: Contact count, last sync time, status badge
   - **Queued Alerts**: Number of alerts waiting to send
   - **Location Tracking**: Active/inactive status, location count
   - Auto-updates every 5 seconds

2. **App Settings**:
   - Dark mode toggle (persisted in localStorage)
   - Language selection (English, Bengali, Spanish)
   - Notification preferences
   - Help center access

3. **Profile Updates**:
   - Secure update flows with validation
   - Password verification for sensitive changes
   - Real-time validation feedback
   - Toast notifications for success/error

### 📱 Progressive Web App
**Full PWA with offline support**

- Install on home screen (Add to Home Screen)
- App manifest with branding
- Service worker with offline caching
- Works like native app
- Push notification ready (requires setup)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use conventional commits
- Write tests for new features
- Follow the existing code style

## Localization

The app supports multiple languages:
- English (en)
- Spanish (es)
- Bengali (bn)

To add a new language, create a new JSON file in `src/i18n/locales/`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository.
