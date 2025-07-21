# 🔧 Environment Setup Guide

Detailed setup instructions for ListingBoost Pro development environment.

## 📋 System Requirements

### Required Software

| Software | Minimum Version | Recommended | Download Link |
|----------|----------------|-------------|---------------|
| **Node.js** | 18.0.0 | 20.x LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0.0 | Latest | Included with Node.js |
| **Git** | 2.30.0 | Latest | [git-scm.com](https://git-scm.com) |

### Operating System Support

- ✅ **macOS**: 10.15+ (Catalina or newer)
- ✅ **Windows**: 10+ or Windows 11
- ✅ **Linux**: Ubuntu 18.04+, Debian 10+, or equivalent

### Hardware Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space for project and dependencies
- **CPU**: Any modern 64-bit processor

## 🚀 Step-by-Step Installation

### 1. Install Node.js and npm

#### Option A: Official Installer (Recommended)
```bash
# Download from https://nodejs.org
# Choose the LTS version

# Verify installation
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

#### Option B: Using Node Version Manager (Advanced)
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js LTS
nvm install --lts
nvm use --lts
```

### 2. Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/ListingBoost.git
cd ListingBoost

# Verify you're in the correct directory
ls -la  # Should show package.json and other project files
```

### 3. Install Project Dependencies

```bash
# Install all dependencies (this may take 3-5 minutes)
npm install

# Alternative: Use Yarn if you prefer
# yarn install

# Verify installation
npm list --depth=0  # Shows top-level dependencies
```

### 4. Environment Variables Configuration

#### Create Local Environment File
```bash
# Copy the template
cp .env.local.example .env.local

# Edit the file (use your preferred editor)
nano .env.local
# or
code .env.local  # If using VS Code
```

#### Required Environment Variables

**🗄️ Database Configuration (Supabase)**
```bash
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**🔐 Authentication**
```bash
# Generate a secure secret (32+ characters)
NEXTAUTH_SECRET=your_secure_32_character_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

**🤖 External Services**
```bash
# Apify (Web Scraping)
APIFY_API_TOKEN=your_apify_api_token_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. **Visit**: [supabase.com](https://supabase.com)
2. **Sign up** or **Log in**
3. **Create new project**:
   - Project name: `ListingBoost Pro`
   - Database password: Generate strong password
   - Region: Choose closest to your location

### 2. Get Database Credentials

```bash
# In Supabase Dashboard:
# 1. Go to Settings → API
# 2. Copy the following values:

# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anon (public) key  
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...

# Service role (secret) key - KEEP SECRET!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
```

### 3. Run Database Migrations

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Verify setup
supabase status
```

### 4. Verify Database Connection

```bash
# Test the connection
npm run dev

# Check browser console for connection success
# Should see: "✅ Using development configuration"
```

## 🤖 External Service Setup

### Apify Platform (Web Scraping)

1. **Create Account**: [apify.com](https://apify.com)
2. **Get API Token**:
   - Go to Console → Settings → Integrations
   - Copy API token
3. **Add to `.env.local`**:
   ```bash
   APIFY_API_TOKEN=apify_api_YOUR_TOKEN_HERE
   ```

### Google Gemini AI

1. **Get API Key**: [Google AI Studio](https://aistudio.google.com)
2. **Create API Key**:
   - Click "Get API Key"
   - Create new key or use existing
3. **Add to `.env.local`**:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Stripe (Payments - Optional for Development)

1. **Create Account**: [stripe.com](https://stripe.com)
2. **Get Test Keys**:
   - Dashboard → Developers → API keys
   - Use **test keys** for development
3. **Add to `.env.local`**:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

## 🔧 Development Tools Configuration

### VS Code Setup (Recommended)

#### Required Extensions:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Settings Configuration:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Git Configuration

```bash
# Set up global Git configuration (if not done already)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify pre-commit hooks are working
git add . 
git commit -m "test: verify pre-commit hooks"
# Should run ESLint and Prettier automatically
```

## 🚀 Verify Installation

### 1. Run Development Server

```bash
# Start the development server
npm run dev

# Should see:
# ✓ Ready in 2.3s  
# ○ Local:        http://localhost:3000
# ○ Network:      http://192.168.1.xxx:3000
```

### 2. Check Application Health

Visit: [http://localhost:3000](http://localhost:3000)

Expected behavior:
- ✅ **Home page loads** without errors
- ✅ **Authentication pages** accessible (`/auth/login`)
- ✅ **Database connection** successful (check browser console)
- ✅ **No TypeScript errors** in terminal

### 3. Run Build Test

```bash
# Test production build
npm run build

# Should complete without errors
# ✓ Compiled successfully
```

### 4. Run Code Quality Checks

```bash
# TypeScript validation
npm run type-check
# Should show: "No errors found"

# Linting
npm run lint
# Should show: "✔ No ESLint warnings or errors"

# File size check
npm run check-sizes  
# Should show: "✅ All files under 400 lines"
```

## 🇩🇪 German Localization Setup

### Locale Configuration

The application is configured for the DACH market:

```typescript
// Automatic configuration in lib/utils.ts
const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
});

const dateFormatter = new Intl.DateTimeFormat('de-DE');
```

### Timezone Setup

```bash
# Set system timezone (optional)
# macOS/Linux:
sudo timedatectl set-timezone Europe/Berlin

# Or set in your shell profile
export TZ='Europe/Berlin'
```

## 🚨 Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Error: "Unsupported Node.js version"
# Solution: Update Node.js to 18+
node --version  # Check current version
# Download latest LTS from nodejs.org
```

#### Port Already in Use
```bash
# Error: "Port 3000 is already in use"
# Solution: Use different port
npm run dev -- --port 3001
# Or kill the process using port 3000
```

#### Database Connection Failed
```bash
# Error: "Cannot connect to Supabase"
# Check environment variables:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verify credentials in Supabase dashboard
# Make sure .env.local has correct values
```

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules if needed
rm -rf node_modules package-lock.json
npm install
```

#### Pre-commit Hook Failures
```bash
# Update Husky hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# Fix file permissions (macOS/Linux)
chmod +x .husky/pre-commit
```

### Performance Issues

#### Slow Installation
```bash
# Use npm cache for faster installs
npm ci --prefer-offline

# Or try yarn for better performance
yarn install
```

#### Memory Issues During Build
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Getting Help

1. **Check logs**: Look at terminal output for specific errors
2. **Browser DevTools**: Check console for JavaScript errors
3. **Network tab**: Verify API calls are working
4. **Supabase logs**: Check database logs in Supabase dashboard

## 📚 Next Steps

After successful setup:

1. **Read**: `AUTHENTICATION_GUIDE.md` for auth system details
2. **Review**: `DatabaseSchema.md` for database structure
3. **Explore**: `ScoringSystem.md` for business logic
4. **Study**: Project structure in `/app` directory

## 🆘 Still Need Help?

- **GitHub Issues**: Create detailed issue with error logs
- **Documentation**: Check other `.md` files in project root
- **Community**: Join our Discord for real-time help
- **Email**: development@listingboost.pro

---

**🎉 Congratulations!** Your development environment is ready for ListingBoost Pro development.