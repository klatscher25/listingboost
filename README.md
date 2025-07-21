# 🚀 ListingBoost Pro

AI-powered Airbnb listing optimization for the DACH market (Germany, Austria, Switzerland).

## ✨ Features

- **🤖 AI-Powered Analysis**: 1000-point scoring system using Google Gemini AI
- **🔍 Comprehensive Scraping**: Automated data collection with 4 specialized scrapers
- **📊 Performance Insights**: Detailed competitor analysis and market positioning
- **🇩🇪 DACH Market Focus**: Optimized for German-speaking markets
- **💼 Multi-Tenant SaaS**: Organization support with role-based access
- **⚡ Real-Time Updates**: Live notifications and progress tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui v2
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth + OAuth (Google)
- **AI Integration**: Google Gemini API
- **Web Scraping**: Apify Platform (4 specialized scrapers)
- **Payments**: Stripe
- **Email**: Brevo
- **Media Storage**: Cloudinary

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0+ (LTS recommended)
- **npm**: 9.0+ or **yarn**: 1.22+
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ListingBoost.git
   cd ListingBoost
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your actual credentials:
   - Supabase URL and Keys
   - Apify API Token
   - Google Gemini API Key
   - Stripe Keys (for payments)

4. **Run development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

### Required Services

1. **Supabase** (Database & Auth):
   - Create project at [supabase.com](https://supabase.com)
   - Run database migrations (see `DATABASE_SETUP_INSTRUCTIONS.md`)
   
2. **Apify** (Web Scraping):
   - Sign up at [apify.com](https://apify.com)
   - Get API token from console
   
3. **Google Gemini** (AI Analysis):
   - Get API key from [Google AI Studio](https://aistudio.google.com)
   
4. **Stripe** (Payments - Optional for development):
   - Create account at [stripe.com](https://stripe.com)
   - Use test keys for development

### Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Code quality
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix ESLint issues
npm run type-check  # TypeScript validation
npm run check-sizes # Monitor file sizes (<400 lines)

# Database
npm run db:migrate  # Run Supabase migrations
npm run db:reset    # Reset database (development only)
```

## 🇩🇪 German Localization

This application is specifically designed for the DACH market:

- **Primary Language**: German
- **Currency**: EUR (€)
- **Date Format**: DD.MM.YYYY
- **Number Format**: German locale (1.234,56)
- **Time Zone**: CET/CEST
- **Market Focus**: Germany, Austria, Switzerland

All user-facing content is in German, including:
- UI components and navigation
- Error messages and notifications
- Email templates
- Documentation for end users

## 🏗️ Project Structure

```
listingboost-pro/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Protected dashboard
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable UI components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility functions
│   ├── auth/                # Authentication utilities
│   ├── config.ts            # Environment configuration
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript type definitions
├── hooks/                   # Custom React hooks
├── supabase/               # Database migrations
│   └── migrations/          # SQL migration files
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 📊 Scoring System

ListingBoost Pro uses a sophisticated 1000-point scoring algorithm:

- **Content Quality** (300 points): Title, description, amenities
- **Visual Appeal** (250 points): Photo quality and quantity
- **Pricing Strategy** (200 points): Competitive pricing analysis
- **Guest Experience** (150 points): Reviews and response rates
- **Market Position** (100 points): Location and competition

For detailed information, see `ScoringSystem.md`.

## 🔒 Security

- **Row Level Security (RLS)**: Complete data isolation between users
- **Environment Variables**: All secrets stored in `.env.local`
- **Authentication**: Supabase Auth with OAuth support
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Zod schemas for all inputs
- **Error Boundaries**: Graceful error handling

## 🧪 Testing

```bash
# Unit tests (Jest + React Testing Library)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployment on git push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Feature Flags

Control features via environment variables:

```bash
FEATURE_AI_ANALYSIS=true
FEATURE_COMPETITOR_TRACKING=true
FEATURE_API_ACCESS=true
FEATURE_TEAM_FEATURES=false
```

### Rate Limits

```bash
RATE_LIMIT_FREE_TIER=10      # requests per hour
RATE_LIMIT_STARTER=100       # requests per hour
RATE_LIMIT_GROWTH=1000       # requests per hour
RATE_LIMIT_PRO=10000         # requests per hour
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Standard configuration
- **Prettier**: Code formatting
- **File Size**: Maximum 400 lines per file
- **Function Size**: Maximum 100 lines per function

## 📚 Documentation

- **Setup Guide**: `ENVIRONMENT_SETUP.md`
- **Authentication**: `AUTHENTICATION_GUIDE.md`
- **Database Schema**: `DatabaseSchema.md`
- **Scoring System**: `ScoringSystem.md`
- **Apify Integration**: `ApifyScraper.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Create an issue on GitHub
- **Email**: support@listingboost.pro
- **Discord**: [Join our community](https://discord.gg/listingboost)

## 🙏 Acknowledgments

- **Next.js Team**: Amazing React framework
- **Supabase**: Backend-as-a-Service platform
- **Apify**: Web scraping infrastructure
- **Google**: Gemini AI technology
- **Vercel**: Hosting and deployment platform

---

**Built with ❤️ for the DACH market** | **© 2025 ListingBoost Pro**