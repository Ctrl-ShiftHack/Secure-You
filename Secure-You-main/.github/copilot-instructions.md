# SecureYou - AI Agent Instructions

## Project Overview
Emergency safety application built with React 18 + TypeScript + Vite, featuring SOS alerts, real-time GPS tracking, offline-first emergency features, and Supabase backend with Row Level Security (RLS).

## Architecture

### Core Emergency System (Critical Files)
- **`src/lib/emergency.ts`**: GPS tracking, SOS alerts, Google Maps integration
- **`src/lib/offline.ts`**: Offline contact caching (7-day TTL), alert queuing system using localStorage
- **`src/lib/backgroundTracking.ts`**: Continuous GPS monitoring during active emergencies (5-min intervals)
- **`src/components/SOSButton.tsx`**: Main emergency UI with confirmation dialog (prevents accidental triggers)

### Data Flow Pattern
1. User auth via `AuthContext` (manages session + profile state)
2. Emergency contacts cached locally on login via `initializeOfflineSupport(userId)`
3. SOS alerts queued in localStorage if offline, auto-sent when reconnected
4. All Supabase queries go through `src/services/api.ts` service layer (profileService, contactsService, incidentsService)
5. React Query (`@tanstack/react-query`) manages server state with minimal retry (configured in `App.tsx`)

### Database (Supabase PostgreSQL)
- **Setup**: Run `fresh-start.sql` for complete schema + RLS policies (not migrations individually)
- **Tables**: `profiles`, `emergency_contacts`, `incidents`, `incident_posts` (social feed)
- **RLS**: Each table has 4 policies (SELECT/INSERT/UPDATE/DELETE) filtering by `auth.uid() = user_id`
- **Types**: `src/types/database.types.ts` auto-generated from Supabase schema
- **Demo data**: `add-demo-data.sql` creates test user with contacts/incidents

## Development Workflows

### Local Setup
```powershell
npm install                          # Install dependencies
cp .env.example .env                 # Configure Supabase credentials
npm run dev                          # Dev server on http://localhost:8080
```

**Required env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Testing
```powershell
npm run test:e2e                     # Playwright tests (see e2e/contacts.spec.ts)
npm run test:supabase                # Verify Supabase connection
```

### Build & Deploy
```powershell
npm run build                        # Production build to dist/
npm run build:dev                    # Dev build with source maps
npm run deploy                       # Build + deploy to Vercel
```

**Deployment targets**: Vercel (primary), Netlify, Cloudflare Pages (see `DEPLOYMENT_GUIDE.md`)

## Project-Specific Conventions

### Component Patterns
- **UI Components**: shadcn/ui in `src/components/ui/` (import via `@/components/ui/*`)
- **Feature Components**: Custom components at `src/components/*.tsx` (e.g., ContactCard, IncidentCard)
- **Page Components**: All routes in `src/pages/*.tsx` with ProtectedRoute wrapper for auth
- **Auth Pattern**: Always destructure from `useAuth()` hook, never access supabase.auth directly

### State Management
- **Server State**: TanStack React Query for all Supabase data
- **Auth State**: `AuthContext` (user, session, profile)
- **Local State**: React hooks (useState, useReducer)
- **Persistent State**: localStorage for offline features only (STORAGE_KEYS in `offline.ts`)

### File Organization
```
src/
├── components/       # Reusable UI (SOSButton, ContactCard, BottomNav)
│   └── ui/          # shadcn components (button, dialog, toast)
├── contexts/        # AuthContext only (do NOT create new contexts)
├── hooks/           # Custom hooks (use-profile.tsx, use-toast.ts)
├── lib/             # ⭐ Core services (emergency.ts, offline.ts, supabase.ts)
├── pages/           # All routes (Dashboard, Map, Contacts, Settings, etc.)
├── services/        # Supabase API layer (api.ts with typed services)
└── types/           # TypeScript types (database.types.ts from Supabase)
```

### Styling
- **TailwindCSS** utility classes (no CSS modules)
- **Custom colors**: `emergency` (red), `primary` (blue), `success` (green)
- **Dark mode**: Handled via `next-themes` with class-based strategy
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

## Integration Points

### Supabase Client Configuration
```typescript
// src/lib/supabase.ts - Pre-configured with:
- PKCE auth flow
- Auto token refresh
- Session persistence in localStorage ('secureyou-auth' key)
- Redirect to /setup after auth
```

### External APIs (Optional)
- **Google Maps**: `VITE_GOOGLE_MAPS_API_KEY` for live location map
- **OpenStreetMap Nominatim**: Reverse geocoding (no API key needed)
- **SMS/Email**: Twilio/SendGrid keys optional (app works without)

### Offline Support
```typescript
// Emergency contacts cached for 7 days
await cacheEmergencyContacts(userId);

// Alerts queued when offline, auto-retry on reconnect
await queueOfflineAlert({ userId, location, contacts });
await processQueuedAlerts(); // Called on window 'online' event
```

## Critical Developer Notes

### Emergency Features Testing
1. **Always test SOS flow**: Dashboard → Press SOS → Confirm → Verify incident created
2. **Test offline**: DevTools → Network → Offline → Add contact → Go online → Verify sync
3. **GPS permissions**: HTTPS required for geolocation (use localhost or tunnel)

### Database Migrations
- **DO NOT run individual migration files** - they're outdated
- **Always use `fresh-start.sql`** for clean setup (drops all tables, recreates with RLS)
- **Add new migrations**: Create new `.sql` file AND update `fresh-start.sql`

### Authentication Flow
```
Splash → Login/Signup → VerifyEmail (if needed) → Setup (profile) → Dashboard
```
- Auto-create profile via trigger on `auth.users` insert
- `ProtectedRoute` component checks auth state, redirects to /login
- Password reset via email link (Supabase Auth handles tokens)

### PWA Features
- **Service worker**: `public/sw.js` caches critical assets
- **Manifest**: `public/manifest.json` for home screen install
- **Offline pages**: Dashboard, Contacts work offline (Map requires network)

## Common Pitfalls

1. **RLS Policy Errors**: If queries fail with "permission denied", check `auth.uid()` matches `user_id` in policy
2. **Type Errors**: Regenerate `database.types.ts` after schema changes (Supabase CLI: `supabase gen types typescript`)
3. **Offline Sync**: Always call `initializeOfflineSupport(userId)` on login/app start
4. **Location Tracking**: Stop tracking on logout via `stopBackgroundTracking()` to prevent battery drain
5. **Emergency Button**: Confirmation dialog prevents accidental SOS (see `SOSButton.tsx`)

## Mobile App (Expo/React Native)
Separate codebase in `mobile-new/` directory:
- Uses same Supabase backend
- File-based routing with Expo Router
- Shared types in `types/database.types.ts`
- See `mobile-new/README.md` for mobile-specific setup

## Key Documentation Files
- **START_HERE.md**: 5-minute quickstart with demo data
- **EMERGENCY_FEATURES.md**: Complete emergency system documentation
- **DEPLOYMENT_GUIDE.md**: Web + mobile deployment instructions
- **SUPABASE_CONFIG_GUIDE.md**: Database setup and RLS policies

---

**When in doubt**: Check `src/lib/emergency.ts` for emergency patterns, `src/services/api.ts` for database queries, and `fresh-start.sql` for schema reference.
