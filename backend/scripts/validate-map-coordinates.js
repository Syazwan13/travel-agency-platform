require('dotenv').config();
const mongoose = require('mongoose');
const ResortLocation = require('../models/resortLocation');
const fs = require('fs').promises;
const path = require('path');

async function validateMapCoordinates() {
    try {
        await mongoose.connect(process.env.DATABASE_CLOUD);
        console.log('Connected to MongoDB\n');

        // Get all resorts (excluding aliases)
        const resorts = await ResortLocation.find({ isAlias: { $ne: true } }).sort({ name: 1 });
        console.log(`Found ${resorts.length} resorts to validate\n`);

        // Group resorts by island
        const resortsByIsland = {
            Redang: [],
            Perhentian: [],
            Tioman: []
        };

        resorts.forEach(resort => {
            if (resortsByIsland[resort.island]) {
                resortsByIsland[resort.island].push(resort);
            }
        });

        // Island center points and bounds for reference
        const islandReferences = {
            Tioman: {
                center: { lat: 2.7914, lng: 104.1710 },
                bounds: { north: 2.8914, south: 2.6914, east: 104.2710, west: 104.0710 }
            },
            Redang: {
                center: { lat: 5.7833, lng: 103.0167 },
                bounds: { north: 5.8833, south: 5.6833, east: 103.1167, west: 102.9167 }
            },
            Perhentian: {
                center: { lat: 5.9000, lng: 102.7333 },
                bounds: { north: 6.0000, south: 5.8000, east: 102.8333, west: 102.6333 }
            }
        };

        // Validate each island's resorts
        for (const [island, resorts] of Object.entries(resortsByIsland)) {
            const islandRef = islandReferences[island];
            console.log(`\n=== ${island} Island Resorts (${resorts.length}) ===`);
            
            resorts.forEach(resort => {
                const [lng, lat] = resort.location.coordinates;
                const isWithinBounds = 
                    lat <= islandRef.bounds.north &&
                    lat >= islandRef.bounds.south &&
                    lng <= islandRef.bounds.east &&
                    lng >= islandRef.bounds.west;

                const distanceFromCenter = calculateDistance(
                    lat, lng,
                    islandRef.center.lat,
                    islandRef.center.lng
                );

                console.log(`\n🏨 ${resort.name}`);
                console.log(`   Coordinates: [${lng}, ${lat}]`);
                console.log(`   Within island bounds: ${isWithinBounds ? '✅' : '❌'}`);
                console.log(`   Distance from island center: ${distanceFromCenter.toFixed(2)}km`);
                
                if (!isWithinBounds) {
                    console.log('   ⚠️ WARNING: Resort coordinates may be incorrect!');
                    console.log(`   Expected bounds: N: ${islandRef.bounds.north}, S: ${islandRef.bounds.south}, E: ${islandRef.bounds.east}, W: ${islandRef.bounds.west}`);
                }
            });

            // Generate centered map URL for visual verification
            const mapUrl = generateMapUrl(resorts, islandRef.center);
            console.log(`\n🗺️ Visual verification map for ${island}:`);
            console.log(mapUrl);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Calculate distance between two points in km using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(deg) {
    return deg * Math.PI / 180;
}

// Generate Google Maps URL for visual verification
function generateMapUrl(resorts, center) {
    const markers = resorts
        .map(r => {
            const [lng, lat] = r.location.coordinates;
            return `&markers=color:red%7Clabel:${r.name.charAt(0)}%7C${lat},${lng}`;
        })
        .join('');
    
    return `https://www.google.com/maps/preview/@${center.lat},${center.lng},12z${markers}`;
}

validateMapCoordinates();
