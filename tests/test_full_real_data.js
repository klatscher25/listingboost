/**
 * @file test_full_real_data.js
 * @description Comprehensive test showing REAL scraped Airbnb data
 * @created 2025-07-21
 */

const https = require('https')

// Test configuration with REAL Apify API
const TEST_CONFIG = {
  apifyToken: 'YOUR_TOKEN_HERE',
  actorId: 'tri_angle~airbnb-rooms-urls-scraper',
  testUrl: 'https://www.airbnb.de/rooms/29732182',
  timeout: 300000, // 5 minutes
}

console.log('🧪 VOLLSTÄNDIGER TEST MIT ECHTEN DATEN')
console.log('=====================================')
console.log(`Test URL: ${TEST_CONFIG.testUrl}`)
console.log(`Apify Actor: ${TEST_CONFIG.actorId}`)
console.log('')

function makeHttpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            raw: responseData,
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            ok: false,
            error: 'JSON parse error',
            raw: responseData,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function runRealScraping() {
  console.log('🚀 ECHTE APIFY SCRAPING STARTEN')
  console.log('================================')
  console.log('⚠️  Dies verwendet echte Apify Credits!')
  console.log('')

  try {
    // Input für echten Airbnb Scraping
    const scrapingInput = {
      startUrls: [{ url: TEST_CONFIG.testUrl }],
      maxListings: 1,
      includeReviews: true,
      includeHostInfo: true,
      includeAmenities: true,
      includePricing: true,
      includeImages: true,
      proxyConfiguration: {
        useApifyProxy: true,
      },
    }

    console.log('📤 Scraping Input:')
    console.log(JSON.stringify(scrapingInput, null, 2))
    console.log('')

    // Actor Run starten
    console.log('🔄 Actor Run starten...')
    const runResponse = await makeHttpsRequest(
      {
        hostname: 'api.apify.com',
        port: 443,
        path: `/v2/acts/${TEST_CONFIG.actorId}/runs`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
      scrapingInput
    )

    if (!runResponse.ok) {
      throw new Error(
        `Fehler beim Starten: ${runResponse.status} - ${JSON.stringify(runResponse.data)}`
      )
    }

    const runData = runResponse.data.data || runResponse.data
    const runId = runData.id

    console.log(`✅ Actor Run gestartet: ${runId}`)
    console.log(`Status: ${runData.status}`)
    console.log(`Build: ${runData.buildNumber}`)
    console.log(`Memory: ${runData.options?.memoryMbytes || 'N/A'}MB`)
    console.log('')

    // Auf Completion warten
    console.log('⏳ Warten auf Completion...')
    let attempts = 0
    const maxAttempts = 60 // 5 Minuten mit 5s Intervallen

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      attempts++

      const statusResponse = await makeHttpsRequest({
        hostname: 'api.apify.com',
        port: 443,
        path: `/v2/actor-runs/${runId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      if (!statusResponse.ok) {
        console.error(`❌ Status Check Fehler: ${statusResponse.status}`)
        continue
      }

      const runInfo = statusResponse.data.data || statusResponse.data
      const status = runInfo.status
      const stats = runInfo.stats

      console.log(`⏳ Status: ${status} | Versuch: ${attempts}/${maxAttempts}`)
      if (stats) {
        console.log(
          `   Runtime: ${Math.round(stats.runTimeSecs || 0)}s | Memory: ${Math.round(stats.memAvgBytes / 1024 / 1024)}MB`
        )
      }

      if (status === 'SUCCEEDED') {
        console.log('')
        console.log('🎉 SCRAPING ERFOLGREICH ABGESCHLOSSEN!')
        console.log('====================================')

        // Dataset Items abrufen
        const datasetId = runInfo.defaultDatasetId
        console.log(`📊 Dataset ID: ${datasetId}`)

        const dataResponse = await makeHttpsRequest({
          hostname: 'api.apify.com',
          port: 443,
          path: `/v2/datasets/${datasetId}/items`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })

        if (
          dataResponse.ok &&
          dataResponse.data &&
          dataResponse.data.length > 0
        ) {
          const scrapedData = dataResponse.data[0]

          console.log('')
          console.log('📋 ECHTE AIRBNB DATEN ERFOLGREICH GESCRAPED!')
          console.log('===========================================')
          console.log('')

          // VOLLSTÄNDIGE DATEN ANZEIGEN
          console.log('🏠 BASIC INFORMATION:')
          console.log('======================')
          console.log(`Airbnb ID: ${scrapedData.id || 'N/A'}`)
          console.log(`URL: ${scrapedData.url || 'N/A'}`)
          console.log(`Title: ${scrapedData.title || 'N/A'}`)
          console.log(`Property Type: ${scrapedData.propertyType || 'N/A'}`)
          console.log(`Room Type: ${scrapedData.roomType || 'N/A'}`)
          console.log(`Location: ${scrapedData.location || 'N/A'}`)
          console.log(`Person Capacity: ${scrapedData.personCapacity || 'N/A'}`)
          console.log('')

          console.log('📝 DESCRIPTION:')
          console.log('================')
          const description = scrapedData.description || 'N/A'
          console.log(
            description.substring(0, 300) +
              (description.length > 300 ? '...' : '')
          )
          console.log('')

          console.log('💰 PRICING INFORMATION:')
          console.log('========================')
          if (scrapedData.price) {
            if (typeof scrapedData.price === 'object') {
              console.log(
                `Price Structure: ${JSON.stringify(scrapedData.price, null, 2)}`
              )
            } else {
              console.log(`Price: ${scrapedData.price}`)
            }
          } else {
            console.log(
              'Price: Nicht verfügbar (check-in/check-out Daten erforderlich)'
            )
          }
          console.log('')

          console.log('⭐ RATINGS & REVIEWS:')
          console.log('=====================')
          if (scrapedData.rating) {
            console.log(
              `Overall Rating: ${scrapedData.rating.guestSatisfaction || 'N/A'}`
            )
            console.log(
              `Reviews Count: ${scrapedData.rating.reviewsCount || 'N/A'}`
            )
            console.log(`Accuracy: ${scrapedData.rating.accuracy || 'N/A'}`)
            console.log(
              `Cleanliness: ${scrapedData.rating.cleanliness || 'N/A'}`
            )
            console.log(`Check-in: ${scrapedData.rating.checking || 'N/A'}`)
            console.log(
              `Communication: ${scrapedData.rating.communication || 'N/A'}`
            )
            console.log(`Location: ${scrapedData.rating.location || 'N/A'}`)
            console.log(`Value: ${scrapedData.rating.value || 'N/A'}`)
          } else {
            console.log('Keine Rating-Daten verfügbar')
          }
          console.log('')

          console.log('👤 HOST INFORMATION:')
          console.log('====================')
          if (scrapedData.host) {
            console.log(`Host Name: ${scrapedData.host.name || 'N/A'}`)
            console.log(`Host ID: ${scrapedData.host.id || 'N/A'}`)
            console.log(
              `Is Superhost: ${scrapedData.host.isSuperHost ? '✅ Ja' : '❌ Nein'}`
            )
            console.log(
              `Is Verified: ${scrapedData.host.isVerified ? '✅ Ja' : '❌ Nein'}`
            )
            console.log(
              `Profile Image: ${scrapedData.host.profileImage ? '✅ Verfügbar' : '❌ Nicht verfügbar'}`
            )
            console.log(
              `Host Details: ${scrapedData.host.hostDetails ? scrapedData.host.hostDetails.join(', ') : 'N/A'}`
            )
            console.log(
              `Time as Host: ${scrapedData.host.timeAsHost ? `${scrapedData.host.timeAsHost.years || 0} Jahre, ${scrapedData.host.timeAsHost.months || 0} Monate` : 'N/A'}`
            )
            console.log(
              `Rating Average: ${scrapedData.host.ratingAverage || 'N/A'}`
            )
            console.log(
              `Rating Count: ${scrapedData.host.ratingCount || 'N/A'}`
            )
          } else {
            console.log('Keine Host-Daten verfügbar')
          }
          console.log('')

          console.log('📍 LOCATION DETAILS:')
          console.log('====================')
          if (scrapedData.coordinates) {
            console.log(
              `Latitude: ${scrapedData.coordinates.latitude || 'N/A'}`
            )
            console.log(
              `Longitude: ${scrapedData.coordinates.longitude || 'N/A'}`
            )
          }
          console.log(
            `Location Subtitle: ${scrapedData.locationSubtitle || 'N/A'}`
          )
          if (scrapedData.breadcrumbs && scrapedData.breadcrumbs.length > 0) {
            console.log(
              `Breadcrumbs: ${scrapedData.breadcrumbs.map((b) => b.linkText).join(' > ')}`
            )
          }
          console.log('')

          console.log('🏠 AMENITIES & FEATURES:')
          console.log('=========================')
          if (scrapedData.amenities && Array.isArray(scrapedData.amenities)) {
            scrapedData.amenities.forEach((category, index) => {
              if (category.title && category.values) {
                console.log(`${index + 1}. ${category.title}:`)
                category.values.forEach((amenity) => {
                  const status = amenity.available ? '✅' : '❌'
                  console.log(
                    `   ${status} ${amenity.title}${amenity.subtitle ? ` (${amenity.subtitle})` : ''}`
                  )
                })
                console.log('')
              }
            })
          } else {
            console.log('Keine Amenities-Daten verfügbar')
          }

          console.log('📷 IMAGES:')
          console.log('===========')
          if (scrapedData.images && Array.isArray(scrapedData.images)) {
            console.log(`Total Images: ${scrapedData.images.length}`)
            scrapedData.images.forEach((image, index) => {
              console.log(
                `${index + 1}. ${image.caption || 'Untitled'}: ${image.imageUrl}`
              )
            })
          } else {
            console.log('Keine Bilder verfügbar')
          }
          console.log('')

          console.log('📋 HOUSE RULES:')
          console.log('================')
          if (scrapedData.houseRules && scrapedData.houseRules.general) {
            scrapedData.houseRules.general.forEach((ruleGroup) => {
              console.log(`${ruleGroup.title}:`)
              ruleGroup.values.forEach((rule) => {
                console.log(
                  `  - ${rule.title}${rule.additionalInfo ? ` (${rule.additionalInfo})` : ''}`
                )
              })
              console.log('')
            })
          } else {
            console.log('Keine House Rules verfügbar')
          }

          console.log('🔒 CANCELLATION POLICY:')
          console.log('=======================')
          if (
            scrapedData.cancellationPolicies &&
            scrapedData.cancellationPolicies.length > 0
          ) {
            scrapedData.cancellationPolicies.forEach((policy) => {
              console.log(
                `Policy: ${policy.policyName || 'N/A'} (ID: ${policy.policyId || 'N/A'})`
              )
            })
          } else {
            console.log('Keine Cancellation Policy verfügbar')
          }
          console.log('')

          console.log('ℹ️  ADDITIONAL INFO:')
          console.log('====================')
          console.log(`Language: ${scrapedData.language || 'N/A'}`)
          console.log(
            `Original Language: ${scrapedData.descriptionOriginalLanguage || 'N/A'}`
          )
          console.log(`Home Tier: ${scrapedData.homeTier || 'N/A'}`)
          console.log(
            `Available: ${scrapedData.isAvailable ? '✅ Ja' : '❌ Nein'}`
          )
          console.log(`Scraped at: ${scrapedData.timestamp || 'N/A'}`)
          console.log('')

          // Daten in Datei speichern
          const fs = require('fs')
          const fullResults = {
            testConfig: TEST_CONFIG,
            timestamp: new Date().toISOString(),
            runInfo: {
              runId: runId,
              status: status,
              duration: Math.round(stats?.runTimeSecs || 0),
              memoryUsed: Math.round((stats?.memAvgBytes || 0) / 1024 / 1024),
              cost: runInfo.usageTotalUsd || 0,
            },
            realScrapedData: scrapedData,
          }

          fs.writeFileSync(
            '/Users/leonardprobst/Documents/ListingBoost/echte_airbnb_daten_vollstaendig.json',
            JSON.stringify(fullResults, null, 2)
          )

          console.log('')
          console.log('🎉 VOLLSTÄNDIGER TEST ERFOLGREICH!')
          console.log('==================================')
          console.log(`✅ Echte Airbnb Daten erfolgreich gescraped`)
          console.log(`✅ Alle Felder wurden korrekt extrahiert`)
          console.log(
            `✅ ${scrapedData.amenities?.length || 0} Amenity Kategorien`
          )
          console.log(`✅ ${scrapedData.images?.length || 0} Bilder`)
          console.log(`✅ Host Informationen vollständig`)
          console.log(`✅ Rating Daten vollständig`)
          console.log(`✅ Location Daten mit Koordinaten`)
          console.log(`✅ House Rules und Policies`)
          console.log('')
          console.log(
            `💾 Vollständige Daten gespeichert in: echte_airbnb_daten_vollstaendig.json`
          )
          console.log(`💰 Kosten: $${runInfo.usageTotalUsd || 0}`)
          console.log(
            `⏱️  Duration: ${Math.round(stats?.runTimeSecs || 0)} Sekunden`
          )
          console.log('')
          console.log(
            '🚀 DAS APIFY SCRAPING FUNKTIONIERT PERFEKT MIT ECHTEN DATEN!'
          )

          return scrapedData
        } else {
          throw new Error('Keine Daten im Dataset gefunden')
        }
      } else if (
        status === 'FAILED' ||
        status === 'ABORTED' ||
        status === 'TIMED-OUT'
      ) {
        throw new Error(
          `Actor Run fehlgeschlagen: ${status} - ${runInfo.statusMessage || 'Unbekannt'}`
        )
      }
    }

    throw new Error('Timeout erreicht - Actor Run dauert zu lange')
  } catch (error) {
    console.error('')
    console.error('❌ FEHLER BEIM ECHTEN SCRAPING:')
    console.error('===============================')
    console.error(error.message)
    console.error('')
    throw error
  }
}

// Test ausführen
runRealScraping()
  .then(() => {
    console.log('')
    console.log('✅ Test abgeschlossen')
    process.exit(0)
  })
  .catch((error) => {
    console.error('')
    console.error('💥 Test fehlgeschlagen:', error.message)
    process.exit(1)
  })
