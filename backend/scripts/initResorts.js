require('dotenv').config();
const mongoose = require('mongoose');
const ResortLocation = require('../models/resortLocation');
const ProviderContact = require('../models/providerContactModel');

const resortData = [
    // === REDANG ISLAND RESORTS ===
    {
        name: "The Taaras Beach & Spa Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0143661, 5.7846899]
        }
    },
    {
        name: "Laguna Redang Island Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0324755, 5.7706768]
        }
    },
    {
        name: "Redang Beach Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0330102, 5.7722646]
        }
    },
    {
        name: "Coral Redang Island Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0327967, 5.7759144]
        }
    },
    {
        name: "Redang Bay Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0333031, 5.7737296]
        }
    },
    {
        name: "Redang Holiday Beach Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0338177, 5.7778407]
        }
    },
    {
        name: "Redang Reef Resort",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0337291, 5.7695547]
        }
    },
    {
        name: "Sari Pacifica Resort & Spa Redang Island",
        island: "Redang",
        location: {
            type: "Point",
            coordinates: [103.0327148, 5.7763400]
        }
    },

    // === PERHENTIAN ISLAND RESORTS ===
    {
        name: "MIMPI Perhentian Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7230018, 5.9214587]
        }
    },
    {
        name: "Perhentian Island Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7432174, 5.9025828]
        }
    },
    {
        name: "The Barat Perhentian",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7392473, 5.9007076]
        }
    },
    {
        name: "Coral View Island Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7396239, 5.9021280]
        }
    },
    {
        name: "Senja Bay Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7169061, 5.9122767]
        }
    },
    {
        name: "Ombak Dive Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7169863, 5.9150505]
        }
    },
    {
        name: "Shari-la Island Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7162544, 5.9152695]
        }
    },
    {
        name: "Cocohut Long Beach Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7205338, 5.9189479]
        }
    },
    {
        name: "Alunan Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7227115, 5.8951106]
        }
    },
    {
        name: "Arwana Perhentian Resort",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7508136, 5.8949915]
        }
    },
    {
        name: "Flora Bay Chalet",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7460122, 5.8907596]
        }
    },
    {
        name: "Samudra Beach Chalet",
        island: "Perhentian",
        location: {
            type: "Point",
            coordinates: [102.7497951, 5.8939709]
        }
    },

    // === TIOMAN ISLAND RESORTS ===
    {
        name: "Aman Tioman Beach Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1197587, 2.7847842]
        }
    },
    {
        name: "Berjaya Tioman Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.14241, 2.808208]
        }
    },
    {
        name: "Paya Beach Spa & Dive Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1207885, 2.7868075]
        }
    },
    {
        name: "Tunamaya Beach & Spa Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1526641, 2.7202007]
        }
    },
    {
        name: "Sun Beach Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1227795, 2.7621352]
        }
    },
    {
        name: "Dumba Bay Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1221032, 2.7654098]
        }
    },
    {
        name: "Salang Indah Tioman",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1548794, 2.8765691]
        }
    },
    {
        name: "Juara Mutiara Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.2033431, 2.7951857]
        }
    },
    {
        name: "Salang Pusaka Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1543731, 2.8751854]
        }
    },
    {
        name: "Panuba Inn Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1556893, 2.8498934]
        }
    },
    {
        name: "Damai Tioman Resort",
        island: "Tioman",
        location: {
            type: "Point",
            coordinates: [104.1223327, 2.7639704]
        }
    }
];

// Resort name aliases - maps variant names to official names
const resortAliases = [
    // Redang Resorts
    { original: "The Taaras Beach & Spa Resort", alias: "Taaras Beach Resort" },
    { original: "Laguna Redang Island Resort", alias: "Laguna Redang Resort" },
    { original: "Coral Redang Island Resort", alias: "Coral Resort" },
    { original: "Redang Holiday Beach Resort", alias: "Redang Holiday Beach Villa" },
    { original: "Sari Pacifica Resort & Spa Redang Island", alias: "Sari Pacifica Beach Resort & Spa" },
    
    // Perhentian Resorts
    { original: "MIMPI Perhentian Resort", alias: "Mimpi Perhentian Resort" },
    { original: "The Barat Perhentian", alias: "Barat Beach Resort" },
    { original: "The Barat Perhentian", alias: "The Barat Beach Resort" },
    { original: "Cocohut Long Beach Resort", alias: "The Cocohut Resort" },
    { original: "Flora Bay Chalet", alias: "Flora Bay Resort" },
    { original: "Alunan Resort", alias: "Alunan Resort , Kecil" },
    { original: "Arwana Perhentian Resort", alias: "Arwana Resort" },
    
    // Tioman Resorts
    { original: "Sun Beach Resort", alias: "Sun Beach Resort , Kampung Genting" },
    { original: "Sun Beach Resort", alias: "Sun Beach Resort Kampung Genting" },
    { original: "Paya Beach Spa & Dive Resort", alias: "Paya Beach Resort" },
    { original: "Tunamaya Beach & Spa Resort", alias: "Tunamaya Beach Resort" },
    { original: "The Barat Perhentian", alias: "Barat Tioman Resort" },
    { original: "Salang Indah Tioman", alias: "Salang Indah" }
];

async function initResorts() {
    try {
        await mongoose.connect(process.env.DATABASE_CLOUD, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');

        // Ensure default providers exist
        await ProviderContact.ensureDefaultProviders();
        console.log('Default providers ensured');

        // Clear existing resorts
        await ResortLocation.deleteMany({});
        console.log('Cleared existing resorts');

        // Insert main resorts
        const result = await ResortLocation.insertMany(resortData);
        console.log(`Inserted ${result.length} main resorts`);

        // Process aliases
        console.log('\nProcessing resort aliases...');
        for (const { original, alias } of resortAliases) {
            const resort = await ResortLocation.findOne({ name: original });
            if (resort) {
                const aliasResort = {
                    name: alias,
                    island: resort.island,
                    location: resort.location,
                    isAlias: true,
                    originalResort: resort._id
                };
                
                try {
                    await ResortLocation.create(aliasResort);
                    console.log(`✅ Added alias: "${alias}" → "${original}"`);
                } catch (error) {
                    if (error.code === 11000) {
                        console.log(`⚠️ Alias already exists: ${alias}`);
                    } else {
                        console.error(`❌ Error adding alias ${alias}:`, error.message);
                    }
                }
            } else {
                console.error(`❌ Original resort not found: ${original}`);
            }
        }

        // Verify the data
        const resorts = await ResortLocation.find({}).sort({ name: 1 });
        console.log('\nAll resorts in database:');
        for (const resort of resorts) {
            const coords = resort.location.coordinates;
            const aliasInfo = resort.isAlias ? ' (alias)' : '';
            console.log(`- ${resort.name}${aliasInfo} (${coords[0]}, ${coords[1]})`);
        }

        console.log('\nResort initialization completed');
    } catch (error) {
        console.error('Error initializing resorts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

(async () => {
  await initResorts();
})();