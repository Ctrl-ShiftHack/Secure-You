-- ============================================
-- ADD DEMO DATA
-- Run this AFTER creating a user account
-- ============================================

-- Get the user_id (this will fail if no user exists)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@secureyou.com' 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION '❌ ERROR: No user found with email test@secureyou.com. Create the user first!';
  END IF;
  
  RAISE NOTICE '✅ Found user: %', test_user_id;
  RAISE NOTICE '';
  
  -- ============================================
  -- Insert Profile Data
  -- ============================================
  
  RAISE NOTICE '👤 Adding profile data...';
  
  INSERT INTO profiles (user_id, full_name, phone_number, address, blood_type, allergies, medical_info)
  VALUES (
    test_user_id,
    'John Smith',
    '+1-555-0100',
    '123 Main Street, Apt 4B, New York, NY 10001',
    'O+',
    'Penicillin, Peanuts',
    'Asthma - uses rescue inhaler. No other chronic conditions.'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    blood_type = EXCLUDED.blood_type,
    allergies = EXCLUDED.allergies,
    medical_info = EXCLUDED.medical_info;
  
  RAISE NOTICE '   ✓ Added profile for John Smith';
  RAISE NOTICE '';
  
  -- ============================================
  -- Insert Emergency Contacts
  -- ============================================
  
  RAISE NOTICE '📞 Adding emergency contacts...';
  
  -- Clear existing contacts first
  DELETE FROM emergency_contacts WHERE user_id = test_user_id;
  
  -- Contact 1: Primary contact (spouse)
  INSERT INTO emergency_contacts (user_id, name, phone_number, email, relationship, is_primary)
  VALUES (
    test_user_id,
    'Sarah Smith',
    '+1-555-0101',
    'sarah.smith@email.com',
    'Spouse',
    TRUE
  );
  
  -- Contact 2: Friend
  INSERT INTO emergency_contacts (user_id, name, phone_number, email, relationship, is_primary)
  VALUES (
    test_user_id,
    'Michael Johnson',
    '+1-555-0102',
    'michael.j@email.com',
    'Friend',
    FALSE
  );
  
  -- Contact 3: Doctor
  INSERT INTO emergency_contacts (user_id, name, phone_number, email, relationship, is_primary)
  VALUES (
    test_user_id,
    'Dr. Emily Chen',
    '+1-555-0103',
    'dr.chen@hospital.com',
    'Doctor',
    FALSE
  );
  
  -- Contact 4: Neighbor
  INSERT INTO emergency_contacts (user_id, name, phone_number, email, relationship, is_primary)
  VALUES (
    test_user_id,
    'Lisa Anderson',
    '+1-555-0104',
    'lisa.anderson@email.com',
    'Neighbor',
    FALSE
  );
  
  RAISE NOTICE '   ✓ Added 4 emergency contacts';
  RAISE NOTICE '';
  
  -- ============================================
  -- Insert Incidents
  -- ============================================
  
  RAISE NOTICE '🚨 Adding incident history...';
  
  -- Clear existing incidents first
  DELETE FROM incidents WHERE user_id = test_user_id;
  
  -- Incident 1: Active SOS
  INSERT INTO incidents (user_id, type, status, location, description, contacted_authorities, notified_contacts, created_at)
  VALUES (
    test_user_id,
    'sos',
    'active',
    '{"latitude": 40.7589, "longitude": -73.9851, "address": "Times Square, New York, NY"}'::JSONB,
    'Need immediate assistance - lost in crowded area',
    FALSE,
    '["Sarah Smith", "Michael Johnson"]'::JSONB,
    NOW() - INTERVAL '5 minutes'
  );
  
  -- Incident 2: Resolved medical emergency
  INSERT INTO incidents (user_id, type, status, location, description, contacted_authorities, notified_contacts, created_at, resolved_at)
  VALUES (
    test_user_id,
    'medical',
    'resolved',
    '{"latitude": 40.7580, "longitude": -73.9855, "address": "123 Main Street, New York, NY"}'::JSONB,
    'Minor injury - cut on hand, needed first aid',
    TRUE,
    '["Sarah Smith", "Dr. Emily Chen"]'::JSONB,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
  );
  
  -- Incident 3: Cancelled fire alarm
  INSERT INTO incidents (user_id, type, status, location, description, contacted_authorities, notified_contacts, created_at, resolved_at)
  VALUES (
    test_user_id,
    'fire',
    'cancelled',
    '{"latitude": 40.7580, "longitude": -73.9855, "address": "123 Main Street, New York, NY"}'::JSONB,
    'Fire alarm triggered - false alarm from cooking',
    FALSE,
    '["Sarah Smith"]'::JSONB,
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week' + INTERVAL '10 minutes'
  );
  
  -- Incident 4: Resolved police incident
  INSERT INTO incidents (user_id, type, status, location, description, contacted_authorities, notified_contacts, created_at, resolved_at)
  VALUES (
    test_user_id,
    'police',
    'resolved',
    '{"latitude": 40.7505, "longitude": -73.9934, "address": "Penn Station, New York, NY"}'::JSONB,
    'Witnessed suspicious activity, reported to authorities',
    TRUE,
    '["Sarah Smith", "Michael Johnson"]'::JSONB,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks' + INTERVAL '1 hour'
  );
  
  -- Incident 5: Resolved other incident
  INSERT INTO incidents (user_id, type, status, location, description, contacted_authorities, notified_contacts, created_at, resolved_at)
  VALUES (
    test_user_id,
    'other',
    'resolved',
    '{"latitude": 40.7614, "longitude": -73.9776, "address": "Central Park, New York, NY"}'::JSONB,
    'Lost keys - contacted building security',
    FALSE,
    '["Lisa Anderson"]'::JSONB,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month' + INTERVAL '2 hours'
  );
  
  RAISE NOTICE '   ✓ Added 5 incidents (1 active, 4 resolved)';
  RAISE NOTICE '';
  
  -- ============================================
  -- Final Verification
  -- ============================================
  
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '✅ DEMO DATA ADDED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data Summary:';
  RAISE NOTICE '   Profile: John Smith (O+ blood type)';
  RAISE NOTICE '   Emergency Contacts: 4 people';
  RAISE NOTICE '   Incidents: 5 total (1 active, 4 resolved)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Login Credentials:';
  RAISE NOTICE '   Email: test@secureyou.com';
  RAISE NOTICE '   Password: Test123456!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Test Your App:';
  RAISE NOTICE '   1. npm run dev';
  RAISE NOTICE '   2. Go to: http://localhost:8080/login';
  RAISE NOTICE '   3. Login with credentials above';
  RAISE NOTICE '   4. You should see:';
  RAISE NOTICE '      - Dashboard with 1 active incident';
  RAISE NOTICE '      - Contacts page with 4 people';
  RAISE NOTICE '      - Incidents page with 5 incidents';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  
END $$;
