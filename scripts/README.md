# Scripts - SecureYou

Utility scripts for development, deployment, and automation.

## 📜 Available Scripts

### Development

#### quick-launch.ps1 (Windows)
Quickly launches the development server with all dependencies.

**Usage:**
```powershell
.\scripts\quick-launch.ps1
```

**What it does:**
- Checks Node.js installation
- Installs dependencies if needed
- Starts Vite dev server on http://localhost:8080

#### quick-launch.sh (macOS/Linux)
Same as quick-launch.ps1 but for Unix-based systems.

**Usage:**
```bash
chmod +x scripts/quick-launch.sh
./scripts/quick-launch.sh
```

### Deployment

#### push-to-vercel.ps1
Deploys the application to Vercel production.

**Usage:**
```powershell
.\scripts\push-to-vercel.ps1
```

**Prerequisites:**
- Vercel CLI installed (`npm i -g vercel`)
- Vercel account configured
- Project linked to Vercel

**What it does:**
- Runs production build (`npm run build`)
- Deploys to Vercel
- Shows deployment URL

## 🔧 Running Scripts

### From Project Root

**Windows (PowerShell):**
```powershell
.\scripts\quick-launch.ps1
.\scripts\push-to-vercel.ps1
```

**macOS/Linux (Bash):**
```bash
chmod +x scripts/quick-launch.sh
./scripts/quick-launch.sh
```

### From Scripts Directory

**Windows:**
```powershell
cd scripts
.\quick-launch.ps1
```

**macOS/Linux:**
```bash
cd scripts
./quick-launch.sh
```

## ⚙️ Script Details

### quick-launch.ps1 / quick-launch.sh
- **Purpose:** Fast development server startup
- **Checks:** Node.js version, npm availability
- **Installs:** Dependencies if node_modules missing
- **Starts:** Vite dev server
- **Port:** 8080 (configured in vite.config.ts)

### push-to-vercel.ps1
- **Purpose:** Production deployment to Vercel
- **Prerequisites:** Vercel CLI, authentication
- **Process:** Build → Deploy → Verify
- **Output:** Deployment URL and status

## 🚀 Adding New Scripts

When adding new scripts:

1. **Naming Convention:**
   - Development: `dev-*.ps1` / `dev-*.sh`
   - Testing: `test-*.ps1` / `test-*.sh`
   - Deployment: `deploy-*.ps1` / `deploy-*.sh`
   - Utilities: `util-*.ps1` / `util-*.sh`

2. **Documentation:**
   - Add description to this README
   - Include usage examples
   - List prerequisites
   - Explain what the script does

3. **Error Handling:**
   - Check prerequisites before running
   - Provide clear error messages
   - Exit with appropriate codes

4. **Cross-Platform:**
   - Create both .ps1 (Windows) and .sh (Unix) versions if applicable
   - Test on multiple platforms

## 📝 Examples

### Quick Development Start
```powershell
# Windows - Start dev server
.\scripts\quick-launch.ps1
```

```bash
# macOS/Linux - Start dev server
./scripts/quick-launch.sh
```

### Production Deployment
```powershell
# Deploy to Vercel
.\scripts\push-to-vercel.ps1
```

## 🐛 Troubleshooting

### "Cannot run scripts" error (Windows)
```powershell
# Check execution policy
Get-ExecutionPolicy

# If Restricted, change to RemoteSigned
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Permission denied" error (macOS/Linux)
```bash
# Make script executable
chmod +x scripts/quick-launch.sh
```

### Script not found
```powershell
# Ensure you're in project root
cd C:\Users\user\Downloads\Secure-You-main

# Then run script
.\scripts\quick-launch.ps1
```

## ✅ Best Practices

1. **Always run from project root** for consistent paths
2. **Check prerequisites** before assuming scripts will work
3. **Read script output** for helpful messages and errors
4. **Keep scripts simple** - complex logic belongs in npm scripts
5. **Version control** all scripts - never ignore them in .gitignore
