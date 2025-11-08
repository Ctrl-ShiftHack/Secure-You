# 🚀 Fresh Start - Supabase Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Reset Database (1 minute)

1. **Go to Supabase SQL Editor**  
   👉 https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/sql/new

2. **Copy ALL contents from:** `fresh-start.sql`

3. **Paste and click RUN**

4. **Wait for success messages:**
   - ✅ Dropped old tables
   - ✅ Created 3 new tables  
   - ✅ Created 6 indexes
   - ✅ Enabled RLS with 12 policies
   - ✅ Created auto-profile trigger

---

### Step 2: Create User Account (1 minute)

1. **Go to Supabase Auth**  
   👉 https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/auth/users

2. **Click:** `Add User` → `Create new user`

3. **Enter:**
   - Email: `test@secureyou.com`
   - Password: `Test123456!`
   - ✅ Check: `Auto Confirm User`

4. **Click:** `Create user`

---

### Step 3: Add Demo Data (1 minute)

1. **Go to SQL Editor (New Query)**  
   👉 https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/sql/new

2. **Copy ALL contents from:** `add-demo-data.sql`

3. **Paste and click RUN**

4. **Wait for success message:**
   - ✅ Profile added: John Smith
   - ✅ 4 emergency contacts added
   - ✅ 5 incidents added (1 active, 4 resolved)

---

### Step 4: Test Your App (2 minutes)

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Open browser:**  
   👉 http://localhost:8080/login

3. **Login with:**
   - Email: `test@secureyou.com`
   - Password: `Test123456!`

4. **Verify data appears:**
   - ✅ Dashboard shows 1 active incident
   - ✅ Contacts page shows 4 people
   - ✅ Incidents page shows 5 incidents

---

## What Was Created

### Database Tables

1. **profiles** - User profile information
   - Full name, phone, address
   - Medical info: blood type, allergies
   - Links to auth.users

2. **emergency_contacts** - Emergency contact list
   - Name, phone, email, relationship
   - Primary contact flag
   - Linked to user

3. **incidents** - Emergency incident history
   - Type: SOS, medical, fire, police, other
   - Status: active, resolved, cancelled
   - Location data, description
   - Tracked authorities and notified contacts

### Demo Data

- **Profile:** John Smith (O+ blood type, has allergies)
- **Contacts:** 4 people (spouse, friend, doctor, neighbor)
- **Incidents:** 5 total
  - 1 active SOS (5 minutes ago)
  - 4 resolved incidents (past week to month)

### Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ 12 security policies created
- ✅ Auto-profile creation on signup

---

## Files

- **fresh-start.sql** - Drops everything and recreates clean database
- **add-demo-data.sql** - Adds realistic test data
- **START_HERE.md** - This guide

---

## Troubleshooting

### "No user found" error when adding demo data?
→ Make sure you created the user account in Step 2

### Tables still have old data?
→ fresh-start.sql drops everything first, so this shouldn't happen

### Can't login to app?
→ Make sure you checked "Auto Confirm User" when creating the account

### App shows "No data"?
→ Verify data exists in Supabase Table Editor:
   - https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/editor

---

## Need to Start Over Again?

Just run **fresh-start.sql** again - it drops everything and starts clean!

---

## Support

- Supabase Docs: https://supabase.com/docs
- Project Dashboard: https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd
