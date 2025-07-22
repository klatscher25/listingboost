'use client'

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: "📊",
      title: "KI-gestützte Analyse",
      description: "Umfassende Performance-Analyse deines Listings mit modernster Künstlicher Intelligenz",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "⚡",
      title: "Sofortige Ergebnisse", 
      description: "Erhalte binnen Minuten detaillierte Optimierungsempfehlungen für bessere Buchungsraten",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "💰",
      title: "Umsatz steigern",
      description: "Nachweislich 25-40% höhere Einnahmen durch datengetriebene Optimierung",
      gradient: "from-emerald-500 to-teal-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Glassmorphic Navigation */}
      <nav className="relative z-50 border-b border-white/20 backdrop-blur-xl bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LB</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ListingBoost Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Features</a>
              <a href="#preise" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Preise</a>
              <a href="#support" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Support</a>
              <Link href="/auth/login">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Anmelden
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          
          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">🚀 Über 2,500+ erfolgreiche Airbnb-Optimierungen</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Maximiere deine
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Airbnb-Einnahmen
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 px-4">
              Nutze die Kraft modernster KI-Technologie für eine umfassende Listing-Analyse. 
              <span className="text-blue-600 font-semibold"> Erhalte sofortige, datengetriebene Empfehlungen</span> und 
              steigere deine Buchungsrate um durchschnittlich 35%.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => router.push('/freemium')}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg min-w-[280px]"
              >
                <span className="relative z-10">🚀 Kostenlose Analyse starten</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button 
                onClick={() => router.push('/auth/login')}
                className="group bg-white/90 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-xl font-semibold border border-slate-200 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 text-lg min-w-[200px]"
              >
                <span className="group-hover:text-blue-600 transition-colors duration-200">👤 Anmelden</span>
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                  hoveredCard === index ? 'ring-2 ring-blue-200' : ''
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-12 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Bewiesene Resultate</h2>
              <p className="text-slate-600">Echte Zahlen von unseren Kunden</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { value: "35%", label: "Ø Umsatzsteigerung" },
                { value: "2.4x", label: "Mehr Buchungen" },
                { value: "15min", label: "Setup-Zeit" },
                { value: "2,500+", label: "Optimierte Listings" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Section */}
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-6">Vertrauen von Airbnb-Hosts weltweit</p>
            <div className="flex justify-center items-center space-x-8 opacity-70">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
              <div className="text-sm font-semibold text-slate-700">4.9/5 bei 1,200+ Bewertungen</div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
