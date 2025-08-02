require('dotenv').config();
const mongoose = require('mongoose');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');
const AmiTravel = require('../models/amiTravelSchema');
const { getCoordinatesFromAddress } = require('../utils/geocoding');

async function updateCoordinates() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_CLOUD);
        console.log('Connected to MongoDB');

        // Get all packages from each source
        const [holidayGoGoPackages, pulauMalaysiaPackages, amiTravelPackages] = await Promise.all([
            HolidayGoGoPackage.find(),
            PulauMalaysiaPackage.find(),
            AmiTravel.find()
        ]);

        console.log(`Found packages:\n    HolidayGoGo: ${holidayGoGoPackages.length}\n    PulauMalaysia: ${pulauMalaysiaPackages.length}\n    AmiTravel: ${amiTravelPackages.length}`);

        // Process packages from each source
        const updatePackages = async (packages, Model, source) => {
            let updatedCount = 0;
            for (const pkg of packages) {
                try {
                    // Extract resort name and island from package data
                    let resortName, island;
                    if (source === 'AmiTravel') {
                        resortName = pkg.resort || pkg.title || pkg.location_name;
                        island = pkg.destination || pkg.island;
                    } else {
                        // For HolidayGoGo and PulauMalaysia
                        const titleParts = (pkg.title || '').split(',');
                        resortName = (titleParts[0] || '').trim() || pkg.resort || pkg.location_name;
                        island = pkg.destination || pkg.island;
                    }

                    if (!resortName || !island) {
                        console.log(`❌ Missing resort name or island for package: ${pkg._id}`);
                        console.log(`   resortName: ${resortName}, island: ${island}, title: ${pkg.title}, destination: ${pkg.destination}, resort: ${pkg.resort}`);
                        continue;
                    }

                    // Get coordinates
                    const coordinates = await getCoordinatesFromAddress(resortName, island);
                    if (!coordinates) {
                        console.log(`❌ Could not get coordinates for: ${resortName}, ${island}`);
                        continue;
                    }

                    // Check for [0, 0] or invalid coordinates
                    let coordsArr = Array.isArray(coordinates) ? coordinates : (coordinates.coordinates || []);
                    if (!Array.isArray(coordsArr) || coordsArr.length !== 2 || (coordsArr[0] === 0 && coordsArr[1] === 0)) {
                        console.log(`⚠️ Skipping invalid coordinates for: ${resortName}, ${island} - Got:`, coordsArr);
                        continue;
                    }

                    // Save coordinates to database in proper GeoJSON format
                    const updateResult = await Model.updateOne(
                        { _id: pkg._id },
                        { 
                            $set: { 
                                location: { 
                                    type: "Point",
                                    coordinates: coordsArr 
                                },
                                address: coordinates.formattedAddress || coordinates.address
                            } 
                        }
                    );
                    updatedCount++;

                    // Add a delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    console.error(`Error processing package ${pkg._id}:`, error);
                }
            }
            return updatedCount;
        };

        // Update all packages
        const [
            holidayGoGoUpdated,
            pulauMalaysiaUpdated,
            amiTravelUpdated
        ] = await Promise.all([
            updatePackages(holidayGoGoPackages, HolidayGoGoPackage, 'HolidayGoGo'),
            updatePackages(pulauMalaysiaPackages, PulauMalaysiaPackage, 'PulauMalaysia'),
            updatePackages(amiTravelPackages, AmiTravel, 'AmiTravel')
        ]);

        console.log(`\nUpdated packages:\n    HolidayGoGo: ${holidayGoGoUpdated}\n    PulauMalaysia: ${pulauMalaysiaUpdated}\n    AmiTravel: ${amiTravelUpdated}\nTotal: ${holidayGoGoUpdated + pulauMalaysiaUpdated + amiTravelUpdated}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
}

updateCoordinates(); 