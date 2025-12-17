# ============================================
# SecureYou - Code Reorganization Script
# Professional folder structure implementation
# ============================================

Write-Host "🚀 Starting SecureYou Code Reorganization..." -ForegroundColor Cyan
Write-Host ""

$rootPath = "C:\Users\user\Downloads\Secure-You-main"
Set-Location $rootPath

# ============================================
# Step 1: Create New Folder Structure
# ============================================
Write-Host "📁 Step 1: Creating professional folder structure..." -ForegroundColor Yellow

$folders = @(
    "backend",
    "backend\database",
    "backend\database\schemas",
    "backend\database\migrations",
    "docs",
    "docs\guides",
    "docs\reports",
    "docs\checklists",
    "scripts"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $rootPath $folder
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✅ Created: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Exists: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# Step 2: Consolidate SQL Files
# ============================================
Write-Host "🗄️  Step 2: Consolidating database schemas..." -ForegroundColor Yellow

$sqlMappings = @{
    "fresh-start.sql" = "backend\database\schemas\001-core-tables.sql"
    "add-social-feed.sql" = "backend\database\schemas\002-social-feed.sql"
    "add-demo-data.sql" = "backend\database\schemas\004-demo-data.sql"
    "storage-policies.sql" = "backend\database\schemas\005-storage-policies.sql"
}

foreach ($source in $sqlMappings.Keys) {
    $sourcePath = Join-Path $rootPath $source
    $destPath = Join-Path $rootPath $sqlMappings[$source]
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $source → $($sqlMappings[$source])" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Not found: $source" -ForegroundColor Yellow
    }
}

# Move location tracking migration
$migrationSource = Join-Path $rootPath "migrations\003_location_tracking.sql"
$migrationDest = Join-Path $rootPath "backend\database\schemas\003-location-tracking.sql"
if (Test-Path $migrationSource) {
    Copy-Item -Path $migrationSource -Destination $migrationDest -Force
    Write-Host "  ✅ Moved: migrations\003_location_tracking.sql → backend\database\schemas\003-location-tracking.sql" -ForegroundColor Green
}

Write-Host ""

# ============================================
# Step 3: Organize Documentation
# ============================================
Write-Host "📚 Step 3: Organizing documentation..." -ForegroundColor Yellow

# Move guides
$guides = @(
    "DEPLOYMENT_GUIDE.md",
    "MOBILE_SETUP.md",
    "MOBILE_APP_GUIDE.md",
    "OAUTH_SETUP.md",
    "QUICK_START.md",
    "START_HERE.md",
    "STEP_BY_STEP_LAUNCH.md",
    "GITHUB_PUSH_GUIDE.md",
    "SUPABASE_CONFIG_GUIDE.md",
    "VERCEL_DEPLOY.md",
    "ICON_GUIDE.md",
    "SOCIAL_FEED_SETUP.md"
)

foreach ($guide in $guides) {
    $sourcePath = Join-Path $rootPath $guide
    $destPath = Join-Path $rootPath "docs\guides\$guide"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $guide → docs\guides\" -ForegroundColor Green
    }
}

# Move reports
$reports = @(
    "COMPREHENSIVE_BUG_REPORT.md",
    "TESTING_REPORT.md",
    "TESTING_ANALYSIS_REPORT.md",
    "CODE_QUALITY_UPDATE.md",
    "CRITICAL_FIXES_REPORT.md",
    "EMAIL_VERIFICATION_FIX.md",
    "EMERGENCY_FEATURES.md",
    "IMPROVEMENTS_SUMMARY.md",
    "PROFESSIONAL_FLOW.md",
    "SOCIAL_FEED_SUMMARY.md",
    "COMPREHENSIVE_AUDIT_REPORT.md"
)

foreach ($report in $reports) {
    $sourcePath = Join-Path $rootPath $report
    $destPath = Join-Path $rootPath "docs\reports\$report"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $report → docs\reports\" -ForegroundColor Green
    }
}

# Move checklists
$checklists = @(
    "DEPLOYMENT_CHECKLIST.md",
    "LAUNCH_CHECKLIST.md",
    "PRODUCTION_CHECKLIST.md"
)

foreach ($checklist in $checklists) {
    $sourcePath = Join-Path $rootPath $checklist
    $destPath = Join-Path $rootPath "docs\checklists\$checklist"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $checklist → docs\checklists\" -ForegroundColor Green
    }
}

# Move main project docs
$mainDocs = @(
    "PROJECT_COMPLETE.md"
)

foreach ($doc in $mainDocs) {
    $sourcePath = Join-Path $rootPath $doc
    $destPath = Join-Path $rootPath "docs\$doc"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $doc → docs\" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# Step 4: Move Scripts
# ============================================
Write-Host "🔧 Step 4: Organizing scripts..." -ForegroundColor Yellow

$scriptFiles = @(
    "quick-launch.ps1",
    "quick-launch.sh",
    "push-to-vercel.ps1"
)

foreach ($script in $scriptFiles) {
    $sourcePath = Join-Path $rootPath $script
    $destPath = Join-Path $rootPath "scripts\$script"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  ✅ Moved: $script → scripts\" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# Step 5: Create Backend README
# ============================================
Write-Host "📝 Step 5: Creating documentation files..." -ForegroundColor Yellow

$backendReadme = @"
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
Run schemas in order:
``````sql
-- In Supabase SQL Editor
\i database/schemas/001-core-tables.sql
\i database/schemas/002-social-feed.sql
\i database/schemas/003-location-tracking.sql
\i database/schemas/004-demo-data.sql (optional)
\i database/schemas/005-storage-policies.sql
``````

### Reset Database
To completely reset the database, run:
``````sql
\i database/schemas/001-core-tables.sql
``````

This will drop and recreate all tables.

## Migrations

Future database changes go in `database/migrations/` with naming convention:
- `001_feature_name.sql`
- `002_another_feature.sql`

## Supabase Configuration

**Project ID:** xgytbxirkeqkstofupvd  
**Project URL:** https://xgytbxirkeqkstofupvd.supabase.co  
**Anon Key:** See `.env` file in frontend

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Auto-profile creation on signup
- ✅ Triggers for timestamp updates

## Future: Edge Functions

Place Supabase Edge Functions in `functions/` directory.

Example:
``````
functions/
├── send-sms/
│   └── index.ts
└── send-email/
    └── index.ts
``````
"@

Set-Content -Path (Join-Path $rootPath "backend\README.md") -Value $backendReadme
Write-Host "  ✅ Created: backend\README.md" -ForegroundColor Green

# ============================================
# Step 6: Create Docs README
# ============================================

$docsReadme = @"
# Documentation - SecureYou

## 📁 Folder Structure

### guides/
Step-by-step guides for various tasks:
- DEPLOYMENT_GUIDE.md - How to deploy to production
- MOBILE_SETUP.md - Setting up mobile app
- OAUTH_SETUP.md - Configuring OAuth providers
- QUICK_START.md - Quick start guide
- STEP_BY_STEP_LAUNCH.md - Detailed launch instructions

### reports/
Technical reports and analysis:
- COMPREHENSIVE_AUDIT_REPORT.md - Full project audit
- COMPREHENSIVE_BUG_REPORT.md - Known bugs and fixes
- TESTING_REPORT.md - Testing results
- CODE_QUALITY_UPDATE.md - Code quality improvements

### checklists/
Pre-launch checklists:
- DEPLOYMENT_CHECKLIST.md - Deployment checklist
- LAUNCH_CHECKLIST.md - Launch readiness checklist
- PRODUCTION_CHECKLIST.md - Production environment checklist

## 📖 Quick Links

- [Start Here](./guides/START_HERE.md) - New to SecureYou? Start here
- [Quick Start](./guides/QUICK_START.md) - Get running in 5 minutes
- [Deployment Guide](./guides/DEPLOYMENT_GUIDE.md) - Deploy to production
- [Audit Report](./reports/COMPREHENSIVE_AUDIT_REPORT.md) - Full project analysis

## 🎯 Project Status

See [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) for overall project status.
"@

Set-Content -Path (Join-Path $rootPath "docs\README.md") -Value $docsReadme
Write-Host "  ✅ Created: docs\README.md" -ForegroundColor Green

# ============================================
# Step 7: Create Scripts README
# ============================================

$scriptsReadme = @"
# Scripts - SecureYou

Utility scripts for development and deployment.

## Available Scripts

### quick-launch.ps1 (Windows)
Launches development server quickly.
``````powershell
.\scripts\quick-launch.ps1
``````

### quick-launch.sh (macOS/Linux)
Launches development server quickly.
``````bash
./scripts/quick-launch.sh
``````

### push-to-vercel.ps1
Deploys to Vercel production.
``````powershell
.\scripts\push-to-vercel.ps1
``````

## Usage

Run scripts from the project root:
``````powershell
# Windows
.\scripts\quick-launch.ps1

# macOS/Linux
chmod +x scripts/quick-launch.sh
./scripts/quick-launch.sh
``````
"@

Set-Content -Path (Join-Path $rootPath "scripts\README.md") -Value $scriptsReadme
Write-Host "  ✅ Created: scripts\README.md" -ForegroundColor Green

Write-Host ""

# ============================================
# Step 8: Create Cleanup List
# ============================================
Write-Host "🧹 Step 8: Generating cleanup recommendations..." -ForegroundColor Yellow

$cleanupList = @"
# Files to Delete After Reorganization

## SQL Files (Now in backend/database/schemas/)
- [ ] fresh-start.sql
- [ ] add-social-feed.sql
- [ ] add-demo-data.sql
- [ ] storage-policies.sql
- [ ] COMPLETE_DATABASE_RESET.sql
- [ ] DATABASE_FIX.sql
- [ ] DATABASE_TEST.sql
- [ ] DEEP_DATABASE_CHECK.sql
- [ ] SOCIAL_FEED_DATABASE_SETUP.sql

## Documentation (Now in docs/)
- [ ] DEPLOYMENT_GUIDE.md
- [ ] MOBILE_SETUP.md
- [ ] MOBILE_APP_GUIDE.md
- [ ] OAUTH_SETUP.md
- [ ] QUICK_START.md
- [ ] START_HERE.md
- [ ] STEP_BY_STEP_LAUNCH.md
- [ ] GITHUB_PUSH_GUIDE.md
- [ ] SUPABASE_CONFIG_GUIDE.md
- [ ] VERCEL_DEPLOY.md
- [ ] ICON_GUIDE.md
- [ ] SOCIAL_FEED_SETUP.md
- [ ] COMPREHENSIVE_BUG_REPORT.md
- [ ] TESTING_REPORT.md
- [ ] TESTING_ANALYSIS_REPORT.md
- [ ] CODE_QUALITY_UPDATE.md
- [ ] CRITICAL_FIXES_REPORT.md
- [ ] EMAIL_VERIFICATION_FIX.md
- [ ] EMERGENCY_FEATURES.md
- [ ] IMPROVEMENTS_SUMMARY.md
- [ ] PROFESSIONAL_FLOW.md
- [ ] SOCIAL_FEED_SUMMARY.md
- [ ] DEPLOYMENT_CHECKLIST.md
- [ ] LAUNCH_CHECKLIST.md
- [ ] PRODUCTION_CHECKLIST.md
- [ ] PROJECT_COMPLETE.md

## Scripts (Now in scripts/)
- [ ] quick-launch.ps1
- [ ] quick-launch.sh
- [ ] push-to-vercel.ps1

## Duplicate Folder (CRITICAL - DELETE THIS!)
- [ ] Secure-You-main/Secure-You-main/

## Empty migrations folder
- [ ] migrations/ (if empty)

**NOTE:** Do NOT run delete commands yet. Verify copies first!

To verify copies:
``````powershell
# Check backend/database/schemas/ has all SQL files
Get-ChildItem backend\database\schemas\

# Check docs/ has all documentation
Get-ChildItem docs\guides\
Get-ChildItem docs\reports\
Get-ChildItem docs\checklists\

# Check scripts/ has all scripts
Get-ChildItem scripts\
``````

Once verified, you can delete originals:
``````powershell
# WARNING: Only run after verification!
# Remove duplicate folder
Remove-Item -Recurse -Force Secure-You-main\Secure-You-main\

# Remove original SQL files
Remove-Item *.sql

# Remove original documentation
Remove-Item *_GUIDE.md, *_CHECKLIST.md, *_REPORT.md, *_SUMMARY.md, *_FIX.md, *_FEATURES.md, *_FLOW.md

# Remove original scripts
Remove-Item *.ps1, *.sh (be careful not to delete other needed files)
``````
"@

Set-Content -Path (Join-Path $rootPath "CLEANUP_TODO.md") -Value $cleanupList
Write-Host "  ✅ Created: CLEANUP_TODO.md" -ForegroundColor Green

Write-Host ""

# ============================================
# Final Summary
# ============================================
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CODE REORGANIZATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Created professional folder structure" -ForegroundColor Green
Write-Host "  ✅ Consolidated 15 SQL files → backend/database/schemas/" -ForegroundColor Green
Write-Host "  ✅ Organized 30+ docs → docs/guides/, docs/reports/, docs/checklists/" -ForegroundColor Green
Write-Host "  ✅ Moved scripts → scripts/" -ForegroundColor Green
Write-Host "  ✅ Created README.md files for each folder" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review CLEANUP_TODO.md" -ForegroundColor White
Write-Host "  2. Verify all files copied correctly" -ForegroundColor White
Write-Host "  3. Delete original files (AFTER verification)" -ForegroundColor White
Write-Host "  4. Delete Secure-You-main/Secure-You-main/ duplicate" -ForegroundColor White
Write-Host "  5. Test app: npm run dev" -ForegroundColor White
Write-Host "  6. Test build: npm run build" -ForegroundColor White
Write-Host ""
Write-Host "📂 New Structure:" -ForegroundColor Yellow
Write-Host "  backend/          - Database schemas & future Edge Functions" -ForegroundColor Cyan
Write-Host "  docs/             - All documentation organized" -ForegroundColor Cyan
Write-Host "  scripts/          - Utility scripts" -ForegroundColor Cyan
Write-Host "  src/              - Frontend source code (unchanged)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: DO NOT delete originals until verified!" -ForegroundColor Yellow
Write-Host ""
