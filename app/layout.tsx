import './globals.css'
import { AuthProvider } from '../lib/auth/context'

export const metadata = {
  title: 'ListingBoost Pro',
  description: 'Airbnb Listing Optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
