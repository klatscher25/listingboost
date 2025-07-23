# ListingBoost Pro - Technische Spezifikation

## 🎯 Projekt Overview
**SaaS für Airbnb-Listing Optimierung mit KI-gestützter Analyse**

### Core Value Proposition
- **Freemium Lead-Generation**: Kostenlose Analyse mit echten Daten als Einstiegspunkt
- Automatisierte Listing-Analyse (0-1000 Punkte Score)
- KI-generierte Optimierungsempfehlungen
- Performance Monitoring & Competitor-Tracking
- Gestaffeltes Subscription-Modell mit strategischen Upgrade-CTAs

---

🏗️ Tech Stack

Core Framework

bashFramework: Next.js 15 (App Router)
Language: TypeScript
Runtime: Node.js 22 
Package Manager: pnpm

Frontend

bashStyling: Tailwind CSS v4 (zero config)
Components: shadcn/ui v2 (React 19 compatible)
Icons: Lucide React (flexibel änderbar)
Fonts: Inter via next/font (flexibel änderbar)
State: React useState + Server State
Validation: Zod schemas

Backend & Database

bashDatabase: Supabase (PostgreSQL + Auth + RLS) (for Database Schema, see DatabaseSchema.md)
ORM: Native Supabase client
Auth: Supabase Auth (OAuth + Email)
API: Next.js API Routes (app/api)

External Services

bashScraping: Apify Platform (URL Scraper for freemium + full suite)
AI: Google Gemini 2.5 Flash
Payments: Stripe (subscriptions + one-time)
Images: Cloudinary (optimization + AI features) + Picsum Photos (fallback)
Email: Brevo (transactional emails)
Fallbacks: Enhanced fake data generation for reliability

Infrastructure

bashHosting: Vercel (serverless functions)
CDN: Vercel Edge Network
Storage: Cloudinary (images)
Environment: .env.localChat-Steuerung Sonnet 4Smart, efficient model for everyday use 


## 🔧 Core Features Implementation

### 1. Listing Analyzer Service
**Endpoint**: `POST /api/analyze`
- Input: Airbnb URL
- Process: Scrape listing data
- AI Analysis: Score calculation 
- Output: Detailed report + recommendations

### 2. Dashboard
**Routes**: `/dashboard`
- Listing overview with scores
- Performance charts
- Recommendation cards
- Competitor comparisons

### 3. AI Text Generator
**Service**: Google Gemini 2.5 Flash
- Smart title generation
- Description optimization
- Review response templates

### 4. Subscription Management
**Integration**: Stripe Billing
- **Freemium**: Unlimited fake analyses + email collection (lead generation)
- **Starter**: €29 one-time (real analysis, limited features)
- **Growth**: €19/month (full analysis + recommendations)
- **Professional**: €49/month (advanced features + competitor tracking)

### 5. Enhanced Freemium Lead-Generation System with Real Data
**Routes**: `/freemium/*` + `/api/freemium/analyze`
- Landing page with URL input and validation
- **ENHANCED**: Shortened analysis simulation (5 steps, 18 seconds for better UX)
- **NEW**: Real Apify URL scraper integration with 25s timeout
- **NEW**: Graceful fallback to enhanced fake data on scraping failure
- **NEW**: 1-hour caching layer for performance optimization
- Email collection with token-based dashboard access
- **ENHANCED**: Modern glassmorphic dashboard with real listing images
- **NEW**: Live data indicator (real vs demo mode)
- **NEW**: Strategic upgrade CTAs with locked premium features
- Development test bypass for streamlined testing



## 🔒 Security Requirements

### Data Protection
- GDPR compliance (EU users)
- Encrypted data storage
- Secure API endpoints
- Rate limiting

### User Security
- Password requirements
- 2FA optional
- Session management
- Audit logging

---

## 📱 User Journey

### Enhanced Freemium Lead-Generation Flow with Real Data (PRIMARY)
1. **Landing Page**: User clicks "Kostenlose Analyse starten" → `/freemium`
2. **URL Collection**: User enters Airbnb URL with validation → `/freemium/analyze`
3. **Fast Analysis**: Realistic 5-step simulation (18 seconds, 47% faster) → `/freemium/email`
4. **Email Collection**: Email capture with test bypass for development → `/freemium/dashboard/[token]`
5. **Real Data Dashboard**: 
   - Real Apify scraping attempt with 25s timeout
   - Graceful fallback to enhanced fake data if scraping fails
   - Display real listing images, ratings, host info, pricing
   - Live/demo mode indicator for transparency
   - Strategic conversion optimization with locked premium features
   - 1-hour caching for performance → conversion to paid plans

### Paid User Flow (AFTER CONVERSION)
1. **Registration**: From freemium upsell → `/auth/register`
2. **Dashboard Access**: Full analysis features → `/dashboard`
3. **Premium Analytics**: Complete reports and recommendations
4. **Performance Tracking**: Monitor improvements over time
5. **Advanced Features**: Competitor analysis, price optimization

---

## 🎨 UI/UX Guidelines

### Design System

- **Typography**: Inter font family
- **Components**: shadcn/ui library
- **Icons**: Lucide React

### Key Pages
1. **Landing Page**: Conversion-optimized with freemium CTA
2. **Freemium Flow**: Multi-step lead generation system
   - URL input page (`/freemium`)
   - Fake analysis simulation (`/freemium/analyze`)
   - Email collection (`/freemium/email`)
   - Free dashboard with upsells (`/freemium/dashboard/[token]`)
3. **Dashboard**: Data-heavy, clean layout for paid users
4. **Analysis Report**: Detailed, actionable recommendations
5. **Settings**: Subscription management and user preferences

---

## 🔧 Development Workflow

### Git Strategy
- `main`: Production branch
- `develop`: Integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Quick fixes

### Deployment
- **Staging**: Auto-deploy from `develop`
- **Production**: Manual deploy from `main`
- **Database**: Migration scripts
- **Monitoring**: Error tracking + analytics

---

## 📊 Success Metrics

### Technical KPIs
- Page load time < 2s
- API response time < 500ms
- Uptime > 99.9%
- Test coverage > 80%

### Business KPIs
- User conversion rate
- Monthly recurring revenue
- Churn rate
- Customer acquisition cost

n