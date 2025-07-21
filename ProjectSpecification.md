# ListingBoost Pro - Technische Spezifikation

## 🎯 Projekt Overview
**SaaS für Airbnb-Listing Optimierung mit KI-gestützter Analyse**

### Core Value Proposition
- Automatisierte Listing-Analyse (0-1000 Punkte Score)
- KI-generierte Optimierungsempfehlungen
- Performance Monitoring & Competitor-Tracking
- Gestaffeltes Subscription-Modell

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

bashScraping: Apify Platform (details see ApifyScraper.md)
AI: Google Gemini 2.5 Flash
Payments: Stripe (subscriptions + one-time)
Images: Cloudinary (optimization + AI features)
Email: Brevo (transactional emails)

Infrastructure

bashHosting: Vercel (serverless functions)
CDN: Vercel Edge Network
Storage: Cloudinary (images/PDFs)
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
- Free tier: 1 analysis
- Starter: €29 one-time
- Growth: €19/month
- Professional: €49/month



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

### Onboarding
1. Landing page visit
2. Free analysis signup
3. Airbnb URL input
4. Email + basic score
5. Upsell to paid plans

### Paid User Flow
1. Dashboard overview
2. Add listings
3. View analysis reports
4. Implement recommendations
5. Track improvements

---

## 🎨 UI/UX Guidelines

### Design System

- **Typography**: Inter font family
- **Components**: shadcn/ui library
- **Icons**: Lucide React

### Key Pages
1. **Landing Page**: Conversion-optimized
2. **Dashboard**: Data-heavy, clean layout
3. **Analysis Report**: Detailed, actionable
4. **Settings**: Subscription management

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