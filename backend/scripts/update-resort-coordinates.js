const mongoose = require('mongoose');
require('dotenv').config();
const ResortLocation = require('../models/resortLocation');

const resortCoordinates = {
    // Redang Island Resorts
    "Coral Redang Island Resort": [103.0327967, 5.7759144],
    "Laguna Redang Island Resort": [103.0324755, 5.7706768],
    "Redang Bay Resort": [103.0333031, 5.7737296],
    "Redang Beach Resort": [103.0330102, 5.7722646],
    "Redang Holiday Beach Resort": [103.0338177, 5.7778407],
    "Redang Reef Resort": [103.0337291, 5.7695547],
    "Sari Pacifica Resort & Spa Redang Island": [103.0327148, 5.77634],
    "The Taaras Beach & Spa Resort": [103.0143661, 5.7846899],
    "Taaras Beach & Spa Resort": [103.0143661, 5.7846899], // Alternative name

    // Perhentian Island Resorts
    "Alunan Resort": [102.7227115, 5.8951106],
    "Arwana Perhentian Resort": [102.7508136, 5.8949915],
    "Cocohut Long Beach Resort": [102.7205338, 5.9189479],
    "Coral View Island Resort": [102.7396239, 5.902128],
    "Flora Bay Chalet": [102.7460122, 5.8907596],
    "MIMPI Perhentian Resort": [102.7230018, 5.9214587],
    "Ombak Dive Resort": [102.7169863, 5.9150505],
    "Perhentian Island Resort": [102.7432174, 5.9025828],
    "Samudra Beach Chalet": [102.7497951, 5.8939709],
    "Senja Bay Resort": [102.7169061, 5.9122767],
    "Shari-la Island Resort": [102.7162544, 5.9152695],
    "The Barat Perhentian": [102.7392473, 5.9007076],

    // Tioman Island Resorts
    "Aman Tioman Beach Resort": [104.1197587, 2.7847842],
    "Berjaya Tioman Resort": [104.14241, 2.808208],
    "Damai Tioman Resort": [104.1223327, 2.7639704],
    "Dumba Bay Resort": [104.1221032, 2.7654098],
    "Juara Mutiara Resort": [104.2033431, 2.7951857],
    "Panuba Inn Resort": [104.1556893, 2.8498934],
    "Paya Beach Spa & Dive Resort": [104.1207885, 2.7868075],
    "Salang Indah Tioman": [104.1548794, 2.8765691],
    "Salang Pusaka Resort": [104.1543731, 2.8751854],
    "Sun Beach Resort": [104.1227795, 2.7621352],
    "Tunamaya Beach & Spa Resort": [104.1526641, 2.7202007]
};

async function updateResortCoordinates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // First, let's see what resort names we actually have in the database
        const allResorts = await ResortLocation.find({}, 'name');
        console.log('Existing resorts in database:');
        allResorts.forEach(resort => console.log(resort.name));
        console.log('\nStarting updates...\n');

        for (const [resortName, coordinates] of Object.entries(resortCoordinates)) {
            const [longitude, latitude] = coordinates;
            
            // Create a regex pattern that's more flexible in matching
            const namePattern = new RegExp(resortName.replace(/[&]/g, '.?').replace(/\s+/g, '.?'), 'i');
            
            // Update the resort location
            const result = await ResortLocation.updateOne(
                { name: namePattern },
                { 
                    $set: {
                        location: {
                            type: 'Point',
                            coordinates: coordinates
                        }
                    }
                }
            );

            console.log(`Updated ${resortName}: ${result.modifiedCount} document(s) modified`);

        console.log('All resort coordinates updated successfully');
    } catch (error) {
        console.error('Error updating coordinates:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateResortCoordinates();
