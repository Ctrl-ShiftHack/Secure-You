# Backend - SecureYou

## Database Schemas

All database schemas are in `database/schemas/`:

1. **001-core-tables.sql** - Main tables (profiles, emergency_contacts, incidents)
2. **002-social-feed.sql** - Social features (posts, reactions, comments)
3. **003-location-tracking.sql** - Location history and tracking sessions
4. **004-demo-data.sql** - Demo/seed data for testing
5. **005-storage-policies.sql** - Supabase Storage policies

## Database Setup

### Initial Setup
Run schemas in order in Supabase SQL Editor:

```sql
-- 1. Core tables (profiles, contacts, incidents)
\i 001-core-tables.sql

-- 2. Social feed features
\i 002-social-feed.sql

-- 3. Location tracking
\i 003-location-tracking.sql

-- 4. Demo data (optional)
\i 004-demo-data.sql

-- 5. Storage policies
\i 005-storage-policies.sql
```

### Reset Database
To completely reset the database:
```sql
\i 001-core-tables.sql
```
This will drop and recreate all tables.

## Supabase Configuration

**Project ID:** xgytbxirkeqkstofupvd  
**Project URL:** https://xgytbxirkeqkstofupvd.supabase.co  
**Anon Key:** See `.env` file in frontend root

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Auto-profile creation on signup
- ✅ Triggers for timestamp updates
- ✅ 12 RLS policies enforcing data isolation

## Migrations

Future database changes go in `database/migrations/` with naming convention:
- `001_feature_name.sql`
- `002_another_feature.sql`

## Future: Edge Functions

When implementing serverless functions (e.g., for SMS/Email sending), place Supabase Edge Functions in `functions/` directory:

```
functions/
├── send-sms/
│   └── index.ts
└── send-email/
    └── index.ts
```

## Tables Schema

### profiles
- User profile information
- Medical data (blood type, allergies)
- Location sharing preferences

### emergency_contacts
- Emergency contact details
- Primary contact designation
- Relationship information

### incidents
- SOS incidents & emergency alerts
- Status tracking (active, resolved, cancelled)
- Location data & notifications log

### incident_posts (Social Feed)
- Community incident sharing
- Public safety awareness

### post_reactions & post_comments
- User engagement on incident posts

### location_history & tracking_sessions
- Background location tracking
- Emergency route history
