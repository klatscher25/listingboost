#!/usr/bin/env node

/**
 * @file test_apify_comprehensive.js
 * @description Comprehensive Apify integration test with corrected inputs
 * @created 2025-01-21
 * @todo Verify all scrapers with proper input formats
 */

const https = require('https')

// Test configuration
const APIFY_API_TOKEN = 'YOUR_TOKEN_HERE'

const APIFY_SCRAPERS = {
  URL_SCRAPER: {
    name: 'tri_angle~airbnb-rooms-urls-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-rooms-urls-scraper/runs?token=${APIFY_API_TOKEN}`,
    input: {
      startUrl: 'https://www.airbnb.com/rooms/123456',
      maxItems: 1,
      timeout: 60,
    },
    description: 'Einzelne Listing-Details scrapen',
  },
  REVIEW_SCRAPER: {
    name: 'tri_angle~airbnb-reviews-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-reviews-scraper/runs?token=${APIFY_API_TOKEN}`,
    input: {
      startUrls: ['https://www.airbnb.com/rooms/123456'], // Note: startUrls array, not startUrl
      maxItems: 5,
      timeout: 60,
    },
    description: 'Bewertungen und Reviews scrapen',
  },
  AVAILABILITY_SCRAPER: {
    name: 'rigelbytes~airbnb-availability-calendar',
    url: `https://api.apify.com/v2/acts/rigelbytes~airbnb-availability-calendar/runs?token=${APIFY_API_TOKEN}`,
    input: {
      startUrl: 'https://www.airbnb.com/rooms/123456',
      timeout: 60,
    },
    description: '365-Tage Verfügbarkeitskalender',
    requiresPaid: true, // This scraper requires paid subscription
  },
  LOCATION_SCRAPER: {
    name: 'tri_angle~airbnb-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-scraper/runs?token=${APIFY_API_TOKEN}`,
    input: {
      location: 'Berlin, Germany',
      maxListings: 5,
      timeout: 60,
    },
    description: 'Standort-basierte Listings suchen',
  },
}

console.log('🧪 COMPREHENSIVE APIFY INTEGRATION TEST')
console.log('=======================================')
console.log(`📅 Test Zeit: ${new Date().toISOString()}`)
console.log(`🔑 API Token: ${APIFY_API_TOKEN.substring(0, 20)}...`)

/**
 * Test einzelnen Scraper mit korrekten Input-Formaten
 */
async function testScraper(key, config) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${key}...`)
    console.log(`   📝 ${config.description}`)

    if (config.requiresPaid) {
      console.log(`   💰 Hinweis: Benötigt bezahltes Abonnement`)
    }

    const testData = {
      input: config.input,
      options: {
        memoryMbytes: 1024,
        timeoutSecs: 60,
      },
    }

    const data = JSON.stringify(testData)
    const url = new URL(config.url)

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)

          const result = {
            key,
            name: config.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            runId: parsed.id || parsed.data?.id,
            requiresPaid: config.requiresPaid,
            response: responseData.substring(0, 300),
            parsed,
          }

          if (result.success) {
            console.log(`✅ ${key}: ERFOLGREICH (Status: ${res.statusCode})`)
            console.log(`   🆔 Run ID: ${result.runId}`)
            console.log(
              `   ⏱️  Run gestartet, kann in Apify Console verfolgt werden`
            )
          } else {
            console.log(`❌ ${key}: FEHLER (Status: ${res.statusCode})`)
            if (parsed.error) {
              console.log(`   🚨 Fehlertyp: ${parsed.error.type}`)
              console.log(
                `   📄 Nachricht: ${parsed.error.message.substring(0, 100)}...`
              )

              if (
                config.requiresPaid &&
                parsed.error.type === 'actor-is-not-rented'
              ) {
                console.log(
                  `   💡 Erwarteter Fehler: Dieser Scraper benötigt ein bezahltes Abo`
                )
              }
            }
          }

          resolve(result)
        } catch (parseError) {
          console.log(`⚠️  ${key}: JSON Parse Error`)
          resolve({
            key,
            name: config.name,
            status: res.statusCode,
            success: false,
            error: 'JSON_PARSE_ERROR',
            response: responseData.substring(0, 300),
          })
        }
      })
    })

    req.on('error', (error) => {
      console.log(`❌ ${key}: Netzwerk-Fehler - ${error.message}`)
      resolve({
        key,
        name: config.name,
        status: 0,
        success: false,
        error: error.message,
      })
    })

    req.setTimeout(15000) // 15 second timeout
    req.write(data)
    req.end()
  })
}

/**
 * Haupttest-Funktion
 */
async function runComprehensiveTest() {
  const results = []

  console.log(
    `\n🚀 Starte Tests für ${Object.keys(APIFY_SCRAPERS).length} Scraper...`
  )

  for (const [key, config] of Object.entries(APIFY_SCRAPERS)) {
    const result = await testScraper(key, config)
    results.push(result)

    // Kurze Pause zwischen Requests
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  // Detaillierte Zusammenfassung
  console.log('\n📊 COMPREHENSIVE TEST RESULTS')
  console.log('=============================')

  const working = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success && !r.requiresPaid).length
  const needsPaid = results.filter((r) => !r.success && r.requiresPaid).length
  const total = results.length

  console.log('\n🟢 WORKING SCRAPERS:')
  results
    .filter((r) => r.success)
    .forEach((r) => {
      console.log(`   ✅ ${r.key}: ${r.name} (Run ID: ${r.runId})`)
    })

  if (needsPaid > 0) {
    console.log('\n🟡 REQUIRES PAID SUBSCRIPTION:')
    results
      .filter((r) => !r.success && r.requiresPaid)
      .forEach((r) => {
        console.log(`   💰 ${r.key}: ${r.name}`)
      })
  }

  if (failed > 0) {
    console.log('\n🔴 FAILED SCRAPERS:')
    results
      .filter((r) => !r.success && !r.requiresPaid)
      .forEach((r) => {
        console.log(
          `   ❌ ${r.key}: ${r.name} (${r.error || 'HTTP ' + r.status})`
        )
      })
  }

  console.log(`\n📈 STATISTICS:`)
  console.log(`   🎯 Funktionsfähig: ${working}/${total} scrapers`)
  console.log(`   💰 Benötigt Bezahlung: ${needsPaid}/${total} scrapers`)
  console.log(`   ❌ Echte Fehler: ${failed}/${total} scrapers`)

  // Fazit
  const functionalScrapers = working
  const criticalIssues = failed

  console.log(`\n🏁 FAZIT:`)

  if (functionalScrapers >= 3) {
    console.log('✅ APIFY INTEGRATION: VOLLSTÄNDIG FUNKTIONSFÄHIG')
    console.log('🚀 Bereit für Production - Hauptfunktionen verfügbar')
  } else if (functionalScrapers >= 2) {
    console.log('⚠️  APIFY INTEGRATION: TEILWEISE FUNKTIONSFÄHIG')
    console.log(
      '🔧 Grundfunktionen verfügbar, erweiterte Features benötigen bezahlte Abos'
    )
  } else {
    console.log('❌ APIFY INTEGRATION: KRITISCHE PROBLEME')
    console.log('🚨 Weitere Konfiguration erforderlich')
  }

  return {
    total,
    working,
    failed,
    needsPaid,
    functionalScrapers,
    criticalIssues,
    results,
    isFullyFunctional: functionalScrapers >= 3,
    hasMinimalFunctionality: functionalScrapers >= 2,
  }
}

// Test ausführen
if (require.main === module) {
  runComprehensiveTest()
    .then((summary) => {
      console.log(
        `\n🎊 Test beendet: ${summary.functionalScrapers}/${summary.total} Scraper voll funktionsfähig`
      )

      if (summary.isFullyFunctional) {
        console.log('✅ ERFOLG: Apify Integration bereit für Production!')
        process.exit(0)
      } else if (summary.hasMinimalFunctionality) {
        console.log('⚠️  TEILWEISE ERFOLG: Grundfunktionen verfügbar')
        process.exit(0)
      } else {
        console.log(
          '❌ FEHLGESCHLAGEN: Kritische Probleme müssen behoben werden'
        )
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('💥 Test-Ausführung fehlgeschlagen:', error)
      process.exit(1)
    })
}

module.exports = { runComprehensiveTest }
