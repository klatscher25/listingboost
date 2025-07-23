# 🚀 ListingBoost Pro

AI-powered Airbnb listing optimization SaaS for the DACH market (Germany, Austria, Switzerland) with freemium lead-generation system.

## ✨ Core Features

- **🎯 Freemium Lead-Generation**: Kostenlose Analyse mit echten Daten als strategischer Einstiegspunkt
- **🤖 AI-Powered Analysis**: 1000-point scoring system v3.0 using Google Gemini 2.5 Flash
- **🔍 Real Data Integration**: Apify web scraping with graceful fallbacks to enhanced fake data
- **📊 Production-Ready Dashboard**: Glassmorphic UI with real listing images and strategic upsells
- **🇩🇪 DACH Market Focus**: Complete German localization for Germany, Austria, Switzerland
- **⚡ Performance Optimized**: 18-second analysis, DB-powered dashboard loading, 1-hour caching
- **💰 Strategic Conversion**: Multi-tier subscription model with locked premium features

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui v2 (zero-config)
- **Database**: Supabase (PostgreSQL + Row Level Security + Real-time subscriptions)
- **Authentication**: Supabase Auth + OAuth (Google)
- **AI Integration**: Google Gemini 2.5 Flash (optimized prompts)
- **Web Scraping**: Apify Platform (4 specialized actors, production-ready)
- **Payments**: Stripe (subscriptions + one-time payments)
- **Email**: Brevo (transactional emails)
- **Media Storage**: Cloudinary + Picsum Photos (fallback)
- **Deployment**: Vercel (Edge Network + Serverless Functions)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 22.0+ (LTS recommended, required for Next.js 15)
- **pnpm**: 9.0+ (preferred package manager)
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ListingBoost.git
   cd ListingBoost
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your actual credentials:
   - Supabase URL and Keys (required)
   - Apify API Token (required for real data scraping)
   - Google Gemini API Key (required for AI analysis)
   - Stripe Keys (optional for development)
   - Brevo API Key (optional for emails)
   - Cloudinary credentials (optional for images)

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)
   - **Freemium Flow**: `/freemium` for lead-generation system
   - **Dashboard**: `/dashboard` for full paid features (requires auth)

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
pnpm dev

# Production build
pnpm build
pnpm start

# Code quality (CLAUDE.md compliance)
pnpm lint           # ESLint check
pnpm lint:fix       # Auto-fix ESLint issues
pnpm type-check     # TypeScript validation
pnpm check-sizes    # Monitor file sizes (<400 lines)

# Database
pnpm db:migrate     # Run Supabase migrations
pnpm db:reset       # Reset database (development only)
pnpm db:seed        # Seed development data

# Testing
pnpm test           # Unit tests (Jest)
pnpm test:e2e       # End-to-end tests
pnpm test:coverage  # Test coverage report
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
├── app/                     # Next.js 15 App Router
│   ├── api/                 # API routes
│   │   ├── analyze/         # Main analysis endpoint
│   │   └── freemium/        # Freemium lead-generation API
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Protected dashboard (paid users)
│   ├── freemium/            # Freemium lead-generation flow
│   │   ├── analyze/         # 18-second analysis simulation
│   │   ├── email/           # Email collection
│   │   └── dashboard/       # Free results with upsells
│   ├── globals.css          # Tailwind CSS v4 styles
│   ├── layout.tsx           # Root layout with German locale
│   └── page.tsx             # Landing page with freemium CTA
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui v2 components
│   ├── dashboard/           # Dashboard-specific components
│   └── freemium/            # Freemium flow components
├── lib/                     # Core utilities and services
│   ├── services/            # Business logic services
│   │   ├── apify/           # Apify integration (4 scrapers)
│   │   └── scoring/         # 1000-point scoring system
│   ├── auth/                # Supabase Auth utilities
│   ├── config.ts            # Environment configuration
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript type definitions
├── hooks/                   # Custom React hooks
├── supabase/               # Database setup
│   └── migrations/          # SQL migration files
├── public/                 # Static assets
├── docs/                   # Technical documentation
├── CLAUDE.md               # AI assistant instructions
├── TODO.md                 # Project status and tasks
└── package.json            # pnpm package management
```

## 📊 Scoring System v3.0

ListingBoost Pro uses a comprehensive 1000-point scoring algorithm across 10 categories:

1. **Host Performance & Trust** (180 points): Superhost status, response rates, verification
2. **Guest Satisfaction & Reviews** (200 points): Ratings, sentiment analysis, review velocity
3. **Listing Content & Optimization** (180 points): Title, description, highlights, SEO
4. **Visual Presentation** (120 points): Photo quantity, quality, captions, orientation
5. **Property Features & Amenities** (140 points): Essential, comfort, work, premium features
6. **Pricing Strategy** (100 points): Competitive analysis, dynamic pricing, discounts
7. **Availability & Booking** (80 points): Occupancy balance, instant book, flexibility
8. **Location & Market Position** (60 points): Location rating, transit, competition
9. **Business Performance** (40 points): Booking momentum, review velocity
10. **Trust & Safety** (40 points): Safety features, verification requirements

**Data Sources**: 4 Apify scrapers, Google Gemini AI, Google Maps API, user input fallbacks

For complete specifications, see `ScoringSystem.md`.

## 🔒 Security

- **Row Level Security (RLS)**: Complete data isolation between users
- **Environment Variables**: All secrets stored in `.env.local`
- **Authentication**: Supabase Auth with OAuth support
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Zod schemas for all inputs
- **Error Boundaries**: Graceful error handling

## 🚀 Freemium Lead-Generation System

**PRIMARY CUSTOMER ACQUISITION STRATEGY**

### User Journey
1. **Landing Page** (`/`): "Kostenlose Analyse starten" CTA → `/freemium`
2. **URL Input** (`/freemium`): Airbnb URL validation and collection
3. **Analysis Simulation** (`/freemium/analyze`): 18-second realistic progress (5 steps)
   - Background: Real Apify scraping attempt during step 3 (60s timeout)
   - Fallback: Enhanced fake data if scraping fails/times out
4. **Email Collection** (`/freemium/email`): Lead capture with test bypass
5. **Free Dashboard** (`/freemium/dashboard/[token]`): Token-based results access
   - Real listing images and data when available
   - Strategic upgrade CTAs with locked premium features
   - Live/demo mode indicator for transparency

### Technical Architecture
- **Database Integration**: All scraped data saved to `listings` table
- **Performance**: Dashboard loads from DB (instant) → Cache → API call
- **Caching**: 1-hour session caching for repeat visits
- **Token System**: `freemium_` prefixed tokens stored in `raw_scraped_data`
- **German Localization**: Complete DACH market focus

## 📦 Deployment

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployment on git push

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔧 Configuration & Environment Variables

For complete environment setup and configuration details, see:

- **📁 `.env.local.example`** - Complete environment template with all variables
- **📖 `ENVIRONMENT_SETUP.md`** - Detailed setup guide with examples

### Quick Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your actual API keys
nano .env.local
```

> **Note**: All required and optional environment variables are documented in `.env.local.example` with proper placeholder values. See `ENVIRONMENT_SETUP.md` for detailed configuration instructions.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards (CLAUDE.md Compliance)

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Standard configuration with Next.js rules
- **Prettier**: Automatic code formatting
- **File Size**: Maximum 400 lines per file (enforced)
- **Function Size**: Maximum 100 lines per function
- **Naming**: PascalCase components, camelCase functions, kebab-case files
- **Security**: No secrets in code, input validation with Zod schemas

## 📚 Documentation

- **Technical Specs**: `ProjectSpecification.md`
- **Database Schema**: `DatabaseSchema.md` (complete table definitions)
- **Scoring System**: `ScoringSystem.md` (1000-point system v3.0)
- **Apify Integration**: `ApifyScraper.md` (production-ready scrapers)
- **AI Instructions**: `CLAUDE.md` (development workflow rules)
- **Project Status**: `TODO.md` (current tasks and progress)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Production Status

**READY FOR LAUNCH** ✅

### Completed Features
- ✅ **Freemium System**: Real Apify integration with fallbacks
- ✅ **1000-Point Scoring**: Complete v3.0 implementation
- ✅ **German Localization**: Full DACH market compliance
- ✅ **Database Schema**: All tables with RLS policies
- ✅ **Performance Optimized**: 18s analysis, DB-powered dashboard
- ✅ **Production Deployment**: Vercel-ready with environment config

### Current Focus
- 🔄 **Lead Generation**: Freemium to paid conversion optimization
- 🔄 **Analytics**: User behavior tracking and conversion metrics
- 🔄 **Content Marketing**: German SEO content for organic growth

## 🆘 Support & Development

- **Technical Documentation**: Complete project documentation available
- **Development Workflow**: Follows CLAUDE.md standards
- **Automated Workflows**: Git hooks and validation pipelines
- **German Market**: Specialized for DACH (Germany, Austria, Switzerland)

## 🙏 Technology Stack Credits

- **Next.js 15**: React App Router framework
- **Supabase**: PostgreSQL database with real-time features
- **Apify Platform**: Production web scraping infrastructure
- **Google Gemini**: AI-powered analysis and insights
- **Tailwind CSS v4**: Zero-config styling system
- **Vercel**: Edge network deployment platform

---

**🚀 ListingBoost Pro - AI-Powered Airbnb Optimization für den DACH-Markt**
**Built with ❤️ for German, Austrian & Swiss hosts** | **© 2025 ListingBoost Pro**