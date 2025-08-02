require('dotenv').config();
const mongoose = require('mongoose');
const { Client } = require('@googlemaps/google-maps-services-js');
const ResortLocation = require('../models/resortLocation');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');

// Initialize Google Maps client
const googleMapsClient = new Client({});

// Helper function to get Google Maps place details
async function searchPlace(query) {
    try {
        const response = await googleMapsClient.findPlaceFromText({
            params: {
                input: query + ' malaysia',
                inputtype: 'textquery',
                fields: ['name', 'formatted_address', 'geometry', 'place_id'],
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        if (response.data.candidates && response.data.candidates.length > 0) {
            const place = response.data.candidates[0];
            
            // Get more details using place_id
            const detailsResponse = await googleMapsClient.placeDetails({
                params: {
                    place_id: place.place_id,
                    fields: ['name', 'formatted_address', 'geometry', 'rating', 'website'],
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });

            return {
                found: true,
                name: place.name,
                formattedAddress: place.formatted_address,
                location: place.geometry?.location,
                details: detailsResponse.data.result
            };
        }

        return { found: false };
    } catch (error) {
        console.error(`Error searching place: ${query}`, error.message);
        return { found: false, error: error.message };
    }
}

// Resort name normalization
const normalizeResortName = (name) => {
    if (!name) return '';
    
    // Remove common prefixes/suffixes
    let normalized = name
        .replace(/^(package|tour|trip|holiday)\s*:?\s*/i, '')
        .replace(/\s*(package|tour|trip|holiday)\s*$/i, '')
        .replace(/\b\d+[dD]\d*[nN]?\b/g, '')
        .replace(/\b\d+\s*(day|night)s?\b/gi, '')
        .replace(/\bRM\s*\d+[\d,]*(\.\d+)?\b/gi, '')
        .replace(/\$\s*\d+[\d,]*(\.\d+)?\b/gi, '')
        .replace(/\b(special|promo|deal|offer|discount|cheap|budget|luxury|premium)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Normalize common variations
    normalized = normalized
        .replace(/(?:^|\s)(?:the\s+)?barat\s+(?:beach\s+)?resort(?:\s|$)/i, ' Barat Beach Resort ')
        .replace(/(?:^|\s)paya\s+beach(?:\s+(?:spa\s*[&]\s*dive|resort))?(?:\s|$)/i, ' Paya Beach Spa & Dive Resort ')
        .replace(/(?:^|\s)bubu(?:\s+(?:long\s+beach|resort))?(?:\s|$)/i, ' BuBu Resort ')
        .replace(/(?:^|\s)coral\s+view(?:\s+island\s+resort)?(?:\s|$)/i, ' Coral View Island Resort ')
        .trim();

    return normalized;
};

// Main function to analyze resort names
async function analyzeResortNames() {
    try {
        await mongoose.connect(process.env.DATABASE_CLOUD);
        console.log('Connected to MongoDB\n');

        // Get all packages
        const [amiPackages, holidayPackages] = await Promise.all([
            AmiTravel.find({}, 'resort title destination').lean(),
            HolidayGoGoPackage.find({}, 'resort title destination').lean()
        ]);

        // Collect all unique resort names
        const resortMap = new Map();
        
        // Process AmiTravel packages
        amiPackages.forEach(pkg => {
            if (pkg.resort) {
                const normalized = normalizeResortName(pkg.resort);
                if (!resortMap.has(normalized)) {
                    resortMap.set(normalized, {
                        variations: new Set(),
                        destinations: new Set(),
                        count: 0
                    });
                }
                const data = resortMap.get(normalized);
                data.variations.add(pkg.resort);
                data.destinations.add(pkg.destination);
                data.count++;
            }
        });

        // Process HolidayGoGo packages
        holidayPackages.forEach(pkg => {
            if (pkg.resort) {
                const normalized = normalizeResortName(pkg.resort);
                if (!resortMap.has(normalized)) {
                    resortMap.set(normalized, {
                        variations: new Set(),
                        destinations: new Set(),
                        count: 0
                    });
                }
                const data = resortMap.get(normalized);
                data.variations.add(pkg.resort);
                data.destinations.add(pkg.destination);
                data.count++;
            }
        });

        // Sort resorts by package count
        const sortedResorts = Array.from(resortMap.entries())
            .sort((a, b) => b[1].count - a[1].count);

        console.log('=== Resort Name Analysis ===\n');
        
        for (const [normalized, data] of sortedResorts) {
            if (data.count >= 2) { // Only show resorts that appear in multiple packages
                console.log(`\n🏨 ${normalized}`);
                console.log('Islands:', Array.from(data.destinations).join(', '));
                console.log('Package count:', data.count);
                console.log('Name variations:');
                Array.from(data.variations).forEach(v => console.log(`  - "${v}"`));

                // Search on Google Maps
                const searchQuery = `${normalized} ${Array.from(data.destinations)[0]}`;
                console.log('\nSearching Google Maps:', searchQuery);
                const placeResult = await searchPlace(searchQuery);
                
                if (placeResult.found) {
                    console.log('✅ Found on Google Maps:');
                    console.log(`   Official name: ${placeResult.name}`);
                    console.log(`   Address: ${placeResult.formattedAddress}`);
                    if (placeResult.location) {
                        console.log(`   Coordinates: [${placeResult.location.lng}, ${placeResult.location.lat}]`);
                    }
                    if (placeResult.details?.rating) {
                        console.log(`   Rating: ${placeResult.details.rating}`);
                    }
                    if (placeResult.details?.website) {
                        console.log(`   Website: ${placeResult.details.website}`);
                    }
                } else {
                    console.log('❌ Not found on Google Maps');
                }

                // Add a delay to respect Google Maps API rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

analyzeResortNames();
