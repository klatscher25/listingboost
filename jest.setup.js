import '@testing-library/jest-dom'

// Suppress JSDOM navigation warnings
const originalError = console.error
console.error = (...args) => {
  if (args[0]?.message?.includes?.('Not implemented: navigation')) {
    return
  }
  originalError.apply(console, args)
}

// Mock web APIs that aren't available in jsdom
global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
  }

  async json() {
    return JSON.parse(this.body || '{}')
  }

  async text() {
    return this.body || ''
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return JSON.parse(this.body || '{}')
  }

  async text() {
    return this.body || ''
  }
}

global.Headers = class Headers {
  constructor(init) {
    this.map = new Map()
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.set(key, value))
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value))
      } else {
        Object.entries(init).forEach(([key, value]) => this.set(key, value))
      }
    }
  }

  set(key, value) {
    this.map.set(key.toLowerCase(), value)
  }

  get(key) {
    return this.map.get(key.toLowerCase())
  }

  has(key) {
    return this.map.has(key.toLowerCase())
  }

  forEach(callback) {
    this.map.forEach(callback)
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.location without triggering JSDOM navigation
delete window.location
window.location = {
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  href: 'http://localhost/',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock environment variables for tests - Use development mode to avoid strict validation
process.env.NODE_ENV = 'development'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_NAME = 'ListingBoost Pro Test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  'test-key-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  'test-service-role-key-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdef'
process.env.SUPABASE_ANON_KEY =
  'test-key-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop'
process.env.APIFY_API_TOKEN =
  'apify_api_test_token_1234567890abcdefghijklmnopqrstuvwxyz'
process.env.GOOGLE_GEMINI_API_KEY =
  'test-gemini-key-1234567890abcdefghijklmnopqrstuvwxyz'
process.env.GOOGLE_GEMINI_MODEL = 'gemini-1.5-flash'
process.env.NEXTAUTH_SECRET =
  'test-nextauth-secret-1234567890abcdefghijklmnopqrstuvwxyz'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Stripe configuration
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  'pk_test_1234567890abcdefghijklmnopqrstuvwxyz'
process.env.STRIPE_SECRET_KEY =
  'sk_test_1234567890abcdefghijklmnopqrstuvwxyz1234567890ab'
process.env.STRIPE_WEBHOOK_SECRET =
  'whsec_test_1234567890abcdefghijklmnopqrstuvwxyz'

// Cloudinary configuration
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-cloudinary-key'
process.env.CLOUDINARY_API_SECRET = 'test-cloudinary-secret'

// Email service configuration
process.env.BREVO_API_KEY =
  'test-brevo-key-1234567890abcdefghijklmnopqrstuvwxyz'

// Analytics (optional)
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123456'

// Mock Actor IDs that are validated in config
process.env.APIFY_ACTOR_URL_SCRAPER = 'tri_angle~airbnb-rooms-urls-scraper'
process.env.APIFY_ACTOR_REVIEW_SCRAPER = 'tri_angle~airbnb-reviews-scraper'
process.env.APIFY_ACTOR_AVAILABILITY_SCRAPER =
  'rigelbytes~airbnb-availability-calendar'
process.env.APIFY_ACTOR_LOCATION_SCRAPER = 'tri_angle~airbnb-scraper'
