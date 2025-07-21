/**
 * @file lib/design/modern-tokens.ts
 * @description Modern glassmorphism design system tokens for ListingBoost Pro
 * @created 2025-07-21
 * @todo FRONTEND-001-01: Modern glassmorphism design foundation
 */

/**
 * 🎨 MODERN GLASSMORPHISM DESIGN SYSTEM
 * 
 * Professional B2B glassmorphism with stunning visual effects
 * Optimized for mobile-first responsive design
 * German text expansion compatibility
 */

export const MODERN_DESIGN = {
  // 🌟 Glassmorphism Effects - Core System
  glass: {
    // Primary glassmorphism for hero elements
    primary: {
      base: 'backdrop-blur-xl bg-gradient-to-br from-white/25 to-white/10',
      border: 'border border-white/30 shadow-2xl shadow-blue-500/20',
      hover: 'hover:from-white/35 hover:to-white/20 hover:shadow-blue-500/30',
      focus: 'focus:from-white/40 focus:to-white/25 focus:border-white/50'
    },
    
    // Secondary glassmorphism for content cards
    secondary: {
      base: 'backdrop-blur-md bg-gradient-to-br from-white/15 to-white/5',
      border: 'border border-white/20 shadow-xl shadow-slate-500/10',
      hover: 'hover:from-white/25 hover:to-white/10 hover:shadow-slate-500/20',
      focus: 'focus:from-white/30 focus:to-white/15'
    },
    
    // Input glassmorphism for form elements
    input: {
      base: 'backdrop-blur-sm bg-gradient-to-r from-white/20 to-white/10',
      border: 'border border-white/40 shadow-lg shadow-indigo-500/10',
      hover: 'hover:from-white/30 hover:to-white/20',
      focus: 'focus:from-white/40 focus:to-white/30 focus:border-white/60 focus:shadow-indigo-500/20',
      error: 'border-red-300/60 focus:border-red-400/80 shadow-red-500/20'
    },
    
    // Navigation glassmorphism
    navigation: {
      base: 'backdrop-blur-lg bg-gradient-to-r from-white/20 to-white/10',
      border: 'border-b border-white/30 shadow-lg shadow-slate-500/5'
    },
    
    // Modal/Dialog glassmorphism
    modal: {
      backdrop: 'backdrop-blur-sm bg-gradient-to-br from-slate-900/80 to-slate-800/60',
      content: 'backdrop-blur-2xl bg-gradient-to-br from-white/30 to-white/15',
      border: 'border border-white/40 shadow-3xl shadow-slate-900/50'
    }
  },

  // 🎨 Modern Gradient System
  gradients: {
    // Primary brand gradients
    brand: {
      primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
      secondary: 'bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700',
      accent: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
    },
    
    // Background gradients
    background: {
      primary: 'bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30',
      secondary: 'bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/20',
      dark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900/50',
      hero: 'bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10'
    },
    
    // Status gradients
    status: {
      success: 'bg-gradient-to-r from-emerald-500 to-green-500',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
      error: 'bg-gradient-to-r from-red-500 to-rose-500',
      info: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    
    // Interactive gradients
    interactive: {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      secondary: 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700',
      ghost: 'hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-gray-100/60'
    }
  },

  // ⚡ Animation System
  animations: {
    // Micro-interactions
    gentle: 'transition-all duration-300 ease-out',
    smooth: 'transition-all duration-500 ease-in-out',
    bounceTransition: 'transition-all duration-200 ease-bounce',
    spring: 'transition-all duration-400 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
    
    // Loading animations
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    
    // Entry animations
    fadeIn: 'animate-[fadeIn_0.5s_ease-out]',
    slideUp: 'animate-[slideUp_0.4s_ease-out]',
    slideIn: 'animate-[slideIn_0.3s_ease-out]',
    scaleIn: 'animate-[scaleIn_0.3s_ease-out]',
    
    // Hover effects
    hoverScale: 'hover:scale-105 active:scale-95',
    hoverLift: 'hover:-translate-y-1 hover:shadow-xl',
    hoverGlow: 'hover:shadow-2xl hover:shadow-blue-500/25'
  },

  // 📝 Typography System (German-optimized)
  typography: {
    // Display typography
    display: {
      xl: 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight',
      lg: 'text-4xl md:text-5xl font-bold tracking-tight',
      md: 'text-3xl md:text-4xl font-bold tracking-tight',
      sm: 'text-2xl md:text-3xl font-bold tracking-tight'
    },
    
    // Heading typography
    heading: {
      xl: 'text-3xl md:text-4xl font-bold',
      lg: 'text-2xl md:text-3xl font-bold', 
      md: 'text-xl md:text-2xl font-bold',
      sm: 'text-lg md:text-xl font-semibold'
    },
    
    // Body typography
    body: {
      xl: 'text-xl leading-relaxed',
      lg: 'text-lg leading-relaxed',
      md: 'text-base leading-relaxed',
      sm: 'text-sm leading-relaxed'
    },
    
    // UI typography
    ui: {
      label: 'text-sm font-medium text-gray-700',
      button: 'text-sm font-medium',
      caption: 'text-xs font-medium text-gray-500',
      code: 'font-mono text-sm'
    }
  },

  // 📐 Spacing System
  spacing: {
    // Section spacing
    section: 'space-y-8 md:space-y-12 lg:space-y-16',
    content: 'space-y-6 md:space-y-8',
    form: 'space-y-6',
    card: 'space-y-4',
    
    // Padding system
    padding: {
      xs: 'p-2 md:p-3',
      sm: 'p-4 md:p-5',
      md: 'p-6 md:p-8',
      lg: 'p-8 md:p-12',
      xl: 'p-12 md:p-16'
    },
    
    // Margin system
    margin: {
      xs: 'm-2 md:m-3',
      sm: 'm-4 md:m-5', 
      md: 'm-6 md:m-8',
      lg: 'm-8 md:m-12',
      xl: 'm-12 md:m-16'
    }
  },

  // 📱 Responsive System (Mobile-First)
  responsive: {
    // Container sizes
    container: {
      mobile: 'max-w-sm mx-auto px-4',
      tablet: 'max-w-2xl mx-auto px-6 md:px-8',
      desktop: 'max-w-4xl mx-auto px-6 md:px-8 lg:px-12',
      wide: 'max-w-6xl mx-auto px-6 md:px-8 lg:px-16',
      full: 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8'
    },
    
    // Grid systems
    grid: {
      mobile: 'grid grid-cols-1 gap-4',
      tablet: 'grid grid-cols-1 md:grid-cols-2 gap-6',
      desktop: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
      auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
    },
    
    // Flex layouts
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      start: 'flex items-center justify-start',
      end: 'flex items-center justify-end',
      col: 'flex flex-col',
      responsive: 'flex flex-col md:flex-row md:items-center'
    }
  },

  // 🎯 Interactive States
  states: {
    // Button states
    button: {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-95',
      secondary: 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30',
      ghost: 'text-gray-700 hover:bg-white/20 hover:backdrop-blur-sm',
      danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
    },
    
    // Input states
    input: {
      default: 'backdrop-blur-sm bg-white/20 border border-white/40 focus:bg-white/30 focus:border-white/60',
      error: 'border-red-300/60 focus:border-red-400/80 bg-red-50/20',
      success: 'border-emerald-300/60 focus:border-emerald-400/80 bg-emerald-50/20'
    },
    
    // Loading states
    loading: {
      overlay: 'backdrop-blur-sm bg-white/30',
      spinner: 'animate-spin rounded-full border-2 border-blue-600/30 border-t-blue-600',
      skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'
    }
  }
} as const

/**
 * 🎨 GLASSMORPHISM UTILITY FUNCTIONS
 */

// Combine glassmorphism classes safely
export function glass(variant: keyof typeof MODERN_DESIGN.glass = 'primary'): string {
  const glassConfig = MODERN_DESIGN.glass[variant]
  
  // Handle specific variants with type checking
  if (variant === 'primary' || variant === 'secondary' || variant === 'input' || variant === 'navigation') {
    const config = glassConfig as { base: string; border: string }
    return `${config.base} ${config.border}`
  }
  
  // Handle modal variant that has different structure
  if (variant === 'modal') {
    const config = glassConfig as { content: string; border: string }
    return `${config.content} ${config.border}`
  }
  
  return ''
}

// Create interactive glassmorphism
export function interactiveGlass(variant: keyof typeof MODERN_DESIGN.glass = 'primary'): string {
  const glassConfig = MODERN_DESIGN.glass[variant]
  
  // Only primary, secondary, and input variants have hover/focus states
  if (variant === 'primary' || variant === 'secondary' || variant === 'input') {
    const config = glassConfig as { hover: string; focus: string }
    return `${glass(variant)} ${config.hover} ${config.focus} ${MODERN_DESIGN.animations.gentle}`
  }
  
  return glass(variant)
}

// Responsive container with glassmorphism
export function glassContainer(size: keyof typeof MODERN_DESIGN.responsive.container = 'desktop'): string {
  return `${MODERN_DESIGN.responsive.container[size]} ${glass('secondary')} rounded-xl`
}

/**
 * 📱 RESPONSIVE UTILITIES  
 */

// Mobile-first breakpoint utilities
export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px', 
  desktop: '1024px',
  wide: '1280px',
  ultra: '1536px'
} as const

/**
 * 🎯 TYPE DEFINITIONS
 */

export type GlassVariant = keyof typeof MODERN_DESIGN.glass
export type GradientType = keyof typeof MODERN_DESIGN.gradients
export type AnimationType = keyof typeof MODERN_DESIGN.animations
export type TypographyScale = keyof typeof MODERN_DESIGN.typography
export type ResponsiveSize = keyof typeof MODERN_DESIGN.responsive.container

// Export design system for component usage
export default MODERN_DESIGN