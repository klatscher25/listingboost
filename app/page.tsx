export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          ListingBoost Pro
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Airbnb Listing Optimization with AI-powered analysis and
          recommendations
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Start Free Analysis
          </button>
          <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}
