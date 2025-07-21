# ListingBoost Pro - Component Specification

## 📋 Document Overview

**Document Type**: Frontend Component Architecture Specification  
**Version**: 1.0  
**Created**: 2025-01-20  
**Last Updated**: 2025-01-20  
**Status**: Design Phase  
**Target Framework**: Next.js 15 + React 19 + TypeScript  

---

## 🏗️ Component Architecture

### Design Principles
- **Server-First**: Default to React Server Components
- **Progressive Enhancement**: Client components only when needed
- **Composition Pattern**: Flexible, reusable component composition
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance Optimized**: Minimal bundle size and runtime overhead
- **Accessibility First**: WCAG 2.1 AA compliance by default

### Component Categories

```
📦 Components/
├── 🎨 UI/ (shadcn/ui base components)
├── 🏢 Layout/ (Page structure and navigation)
├── 🔧 Features/ (Business logic components)
├── 📊 Charts/ (Data visualization)
├── 📝 Forms/ (Input and validation)
└── 🧩 Shared/ (Cross-cutting utilities)
```

---

## 🎨 UI Component Library (shadcn/ui)

### Base Components
Built on Radix UI primitives with Tailwind CSS styling.

#### Button Component
```typescript
// components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### Card Component Family
```typescript
// components/ui/card.tsx
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  )
)

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
```

#### Data Table Component
```typescript
// components/ui/data-table.tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  }
  filtering?: {
    globalFilter: string
    onGlobalFilterChange: (filter: string) => void
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  sorting,
  filtering,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {filtering && (
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search..."
            value={filtering.globalFilter}
            onChange={(e) => filtering.onGlobalFilterChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <DataTablePagination table={table} pagination={pagination} />
      )}
    </div>
  )
}
```

---

## 🏢 Layout Components

### Root Layout (Server Component)
```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ToastProvider } from '@/components/providers/toast-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ListingBoost Pro - Airbnb Optimization Platform',
  description: 'AI-powered Airbnb listing optimization with 1000-point scoring system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Dashboard Layout
```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
```

### Sidebar Navigation
```typescript
// components/layout/sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Building, 
  BarChart3, 
  Settings, 
  CreditCard,
  Users,
  FileText 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Listings', href: '/listings', icon: Building },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users, badge: 'Pro' },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">ListingBoost Pro</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

### Header Component
```typescript
// components/layout/header.tsx
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="w-[300px] pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            3
          </Badge>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

---

## 🔧 Feature Components

### Listing Management Components

#### Listing Card Component
```typescript
// components/features/listings/listing-card.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MoreHorizontal, ExternalLink, BarChart3, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    airbnb_url: string
    location: string
    status: 'pending' | 'analyzing' | 'completed' | 'failed'
    score?: {
      overall: number
      tier: 'elite_performer' | 'high_performer' | 'good_performer' | 'average_performer' | 'below_average'
    }
    metrics?: {
      reviews_count: number
      overall_rating: number
      price_per_night: number
    }
    thumbnail_url?: string
    created_at: string
  }
  onAnalyze?: (listingId: string) => void
  onExport?: (listingId: string) => void
  onDelete?: (listingId: string) => void
}

const tierColors = {
  elite_performer: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  high_performer: 'bg-gradient-to-r from-green-400 to-blue-500',
  good_performer: 'bg-gradient-to-r from-blue-400 to-purple-500',
  average_performer: 'bg-gradient-to-r from-gray-400 to-gray-600',
  below_average: 'bg-gradient-to-r from-red-400 to-red-600'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  analyzing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

export function ListingCard({ listing, onAnalyze, onExport, onDelete }: ListingCardProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 text-base leading-tight">
              {listing.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{listing.location}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(listing.airbnb_url, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Airbnb
              </DropdownMenuItem>
              {listing.status === 'completed' && onExport && (
                <DropdownMenuItem onClick={() => onExport(listing.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Report
                </DropdownMenuItem>
              )}
              {listing.status === 'completed' && onAnalyze && (
                <DropdownMenuItem onClick={() => onAnalyze(listing.id)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Re-analyze
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(listing.id)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={statusColors[listing.status]}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </Badge>
          
          {listing.score && (
            <div className="text-right">
              <div className="text-2xl font-bold">{listing.score.overall}</div>
              <div className="text-xs text-muted-foreground">/ 1000</div>
            </div>
          )}
        </div>

        {listing.score && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Performance Score</span>
              <span>{Math.round((listing.score.overall / 1000) * 100)}%</span>
            </div>
            <Progress 
              value={(listing.score.overall / 1000) * 100} 
              className="h-2"
            />
            <div 
              className={`h-1 rounded-full ${tierColors[listing.score.tier]}`}
            />
          </div>
        )}

        {listing.metrics && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Rating</div>
              <div className="font-medium">
                ⭐ {listing.metrics.overall_rating} ({listing.metrics.reviews_count})
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Price/Night</div>
              <div className="font-medium">
                {formatPrice(listing.metrics.price_per_night)}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {listing.status === 'analyzing' && (
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">
              Analysis in progress...
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
```

#### Listing Analysis Form
```typescript
// components/features/listings/analysis-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

const analysisSchema = z.object({
  airbnb_url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.includes('airbnb.com/rooms/'),
      'Please enter a valid Airbnb listing URL'
    ),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  notify_when_complete: z.boolean().default(true),
  include_competitors: z.boolean().default(true),
})

type AnalysisFormData = z.infer<typeof analysisSchema>

interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function AnalysisForm({ onSubmit, isLoading, error }: AnalysisFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      priority: 'normal',
      notify_when_complete: true,
      include_competitors: true,
    }
  })

  const handleSubmit = async (data: AnalysisFormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      // Error handled by parent component
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze New Listing</CardTitle>
        <CardDescription>
          Enter an Airbnb listing URL to get a comprehensive 1000-point analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="airbnb_url">Airbnb Listing URL</Label>
            <Input
              id="airbnb_url"
              placeholder="https://www.airbnb.com/rooms/12345..."
              {...form.register('airbnb_url')}
              className={form.formState.errors.airbnb_url ? 'border-destructive' : ''}
            />
            {form.formState.errors.airbnb_url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.airbnb_url.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="space-y-3">
                <Label>Analysis Priority</Label>
                <RadioGroup
                  value={form.watch('priority')}
                  onValueChange={(value) => form.setValue('priority', value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="priority-low" />
                    <Label htmlFor="priority-low">Low (24-48h)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="priority-normal" />
                    <Label htmlFor="priority-normal">Normal (2-6h)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="priority-high" />
                    <Label htmlFor="priority-high">High (15-30min)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify_when_complete"
                    checked={form.watch('notify_when_complete')}
                    onCheckedChange={(checked) => 
                      form.setValue('notify_when_complete', !!checked)
                    }
                  />
                  <Label htmlFor="notify_when_complete">
                    Notify me when analysis is complete
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_competitors"
                    checked={form.watch('include_competitors')}
                    onCheckedChange={(checked) => 
                      form.setValue('include_competitors', !!checked)
                    }
                  />
                  <Label htmlFor="include_competitors">
                    Include competitor analysis
                  </Label>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

#### Score Display Component
```typescript
// components/features/listings/score-display.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface ScoreDisplayProps {
  score: {
    overall: number
    tier: 'elite_performer' | 'high_performer' | 'good_performer' | 'average_performer' | 'below_average'
    categories: {
      host_performance: number
      guest_satisfaction: number
      content_optimization: number
      visual_presentation: number
      amenities: number
      pricing: number
      availability: number
      location: number
      business_performance: number
      trust_safety: number
    }
    analyzed_at: string
  }
}

const categoryLabels = {
  host_performance: 'Host Performance',
  guest_satisfaction: 'Guest Satisfaction',
  content_optimization: 'Content Optimization',
  visual_presentation: 'Visual Presentation',
  amenities: 'Property Features',
  pricing: 'Pricing Strategy',
  availability: 'Availability',
  location: 'Location',
  business_performance: 'Business Performance',
  trust_safety: 'Trust & Safety'
}

const categoryMaxScores = {
  host_performance: 180,
  guest_satisfaction: 200,
  content_optimization: 180,
  visual_presentation: 120,
  amenities: 140,
  pricing: 100,
  availability: 80,
  location: 60,
  business_performance: 40,
  trust_safety: 40
}

const tierLabels = {
  elite_performer: 'Elite Performer',
  high_performer: 'High Performer',
  good_performer: 'Good Performer',
  average_performer: 'Average Performer',
  below_average: 'Below Average'
}

const tierColors = {
  elite_performer: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  high_performer: 'bg-gradient-to-r from-green-400 to-blue-500',
  good_performer: 'bg-gradient-to-r from-blue-400 to-purple-500',
  average_performer: 'bg-gradient-to-r from-gray-400 to-gray-600',
  below_average: 'bg-gradient-to-r from-red-400 to-red-600'
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const overallPercentage = Math.round((score.overall / 1000) * 100)

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * overallPercentage) / 100}
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{score.overall}</div>
                  <div className="text-sm text-muted-foreground">/ 1000</div>
                </div>
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl">{tierLabels[score.tier]}</CardTitle>
          <CardDescription>
            Top {Math.round(100 - overallPercentage)}% of all listings
          </CardDescription>
          
          <div className={`mx-auto h-2 w-24 rounded-full ${tierColors[score.tier]}`} />
        </CardHeader>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>
            Performance across all 10 scoring categories
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {Object.entries(score.categories).map(([category, categoryScore]) => {
            const maxScore = categoryMaxScores[category as keyof typeof categoryMaxScores]
            const percentage = Math.round((categoryScore / maxScore) * 100)
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Maximum possible score: {maxScore} points</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {categoryScore} / {maxScore}
                    </span>
                    <Badge variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
                
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            Analysis completed on {new Date(score.analyzed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📊 Chart Components

### Performance Chart Component
```typescript
// components/charts/performance-chart.tsx
'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceChartProps {
  data: Array<{
    date: string
    score: number
    listings_count: number
  }>
  title?: string
  description?: string
}

export function PerformanceChart({ 
  data, 
  title = "Performance Trend",
  description = "Average score over time"
}: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <YAxis
              domain={['dataMin - 50', 'dataMax + 50']}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              formatter={(value, name) => [
                name === 'score' ? `${value} points` : `${value} listings`,
                name === 'score' ? 'Average Score' : 'Listings'
              ]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Score Distribution Chart
```typescript
// components/charts/score-distribution.tsx
'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreDistributionProps {
  data: {
    elite_performer: number
    high_performer: number
    good_performer: number
    average_performer: number
    below_average: number
  }
}

export function ScoreDistribution({ data }: ScoreDistributionProps) {
  const chartData = [
    { tier: 'Elite', count: data.elite_performer, range: '900-1000' },
    { tier: 'High', count: data.high_performer, range: '800-899' },
    { tier: 'Good', count: data.good_performer, range: '700-799' },
    { tier: 'Average', count: data.average_performer, range: '600-699' },
    { tier: 'Below Avg', count: data.below_average, range: '0-599' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Number of listings by performance tier</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="tier" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => [
                `${value} listings`,
                `${props.payload.range} points`
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 📝 Form Components

### Auth Forms
```typescript
// components/forms/login-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  onSignUp: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onSubmit, onSignUp, onForgotPassword }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your ListingBoost Pro account
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...form.register('email')}
            className={form.formState.errors.email ? 'border-destructive' : ''}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...form.register('password')}
            className={form.formState.errors.password ? 'border-destructive' : ''}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <Button variant="link" onClick={onForgotPassword}>
          Forgot your password?
        </Button>
        
        <div className="text-sm">
          Don't have an account?{' '}
          <Button variant="link" onClick={onSignUp} className="p-0">
            Sign up
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🧩 Shared Components

### Loading States
```typescript
// components/shared/loading-states.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function ListingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function CenteredLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
```

### Error Boundaries
```typescript
// components/shared/error-boundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 🎯 Component Usage Examples

### Dashboard Page Implementation
```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import { MetricsOverview } from '@/components/features/dashboard/metrics-overview'
import { RecentListings } from '@/components/features/dashboard/recent-listings'
import { PerformanceChart } from '@/components/charts/performance-chart'
import { ScoreDistribution } from '@/components/charts/score-distribution'
import { DashboardSkeleton } from '@/components/shared/loading-states'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your listing performance and analytics
        </p>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsOverview />
            <ScoreDistribution />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart />
            </div>
            <RecentListings />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

### Listings Page with State Management
```typescript
// app/(dashboard)/listings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { ListingCard } from '@/components/features/listings/listing-card'
import { AnalysisForm } from '@/components/features/listings/analysis-form'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useListings } from '@/hooks/use-listings'
import { ListingCardSkeleton } from '@/components/shared/loading-states'

export default function ListingsPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const { 
    listings, 
    isLoading, 
    error, 
    createListing, 
    deleteListing,
    exportListing 
  } = useListings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
          <p className="text-muted-foreground">
            Manage and analyze your Airbnb listings
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            onClick={() => setView('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            Table View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AnalysisForm onSubmit={createListing} />
        </div>
        
        <div className="lg:col-span-2">
          <Tabs value={view} onValueChange={(value) => setView(value as any)}>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))
                ) : (
                  listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onExport={exportListing}
                      onDelete={deleteListing}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="table">
              <DataTable
                columns={listingColumns}
                data={listings}
                pagination={{
                  page: 1,
                  pageSize: 20,
                  total: listings.length,
                  onPageChange: () => {}
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 Component Development Checklist

### ✅ Component Quality Standards
- [ ] TypeScript interfaces defined with strict typing
- [ ] Props validation with runtime checks where needed
- [ ] Accessibility attributes (ARIA labels, keyboard navigation)
- [ ] Error boundaries implemented for critical components
- [ ] Loading states defined for async operations
- [ ] Mobile-responsive design implemented
- [ ] Unit tests written with React Testing Library
- [ ] Storybook stories created for design system
- [ ] Performance optimized (React.memo where appropriate)
- [ ] SEO considerations (semantic HTML, meta tags)

### 🎨 Design System Compliance
- [ ] Uses design tokens from Tailwind config
- [ ] Follows spacing and typography scale
- [ ] Implements consistent interaction patterns
- [ ] Supports dark/light theme switching
- [ ] Uses shadcn/ui base components
- [ ] Maintains visual hierarchy standards
- [ ] Follows accessibility color contrast ratios
- [ ] Implements consistent animation patterns

### 📱 Responsive Design Requirements
- [ ] Mobile-first approach implemented
- [ ] Breakpoint strategy defined (sm, md, lg, xl)
- [ ] Touch targets minimum 44px
- [ ] Content reflows appropriately
- [ ] Images and media responsive
- [ ] Navigation adapted for mobile
- [ ] Performance optimized for mobile networks
- [ ] Cross-browser compatibility tested

---

**Document Status**: ✅ Complete  
**Implementation Priority**: Phase 1 (Foundation)  
**Dependencies**: UI component library setup  
**Review Schedule**: After each component milestone  
**Maintenance**: Update with component additions and design system changes