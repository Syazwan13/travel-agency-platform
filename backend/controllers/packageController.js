const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// ✅ SAFE: Import each model using its actual file name
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');
const AmiTravel = require('../models/amiTravelSchema');
const ProviderContact = require('../models/providerContactModel');

const { getCoordinatesFromAddress, updatePackageLocation } = require('../utils/geocoding');

// ========================
// GET ALL PACKAGES
// ========================
const getAllPackages = asyncHandler(async (req, res) => {
  const { destination } = req.query;
  const query = destination ? { destination: { $regex: destination, $options: 'i' } } : {};

  try {
    const [
      holidayGoGoPackages,
      pulauMalaysiaPackages,
      amiTravelPackages
    ] = await Promise.all([
      HolidayGoGoPackage.find(query).sort('-createdAt'),
      PulauMalaysiaPackage.find(query).sort('-createdAt'),
      AmiTravel.find(query).sort('-createdAt')
    ]);

    const packages = [
      ...holidayGoGoPackages.map(pkg => ({ ...pkg.toObject(), source: 'HolidayGoGo' })),
      ...pulauMalaysiaPackages.map(pkg => ({ ...pkg.toObject(), source: 'PulauMalaysia' })),
      ...amiTravelPackages.map(pkg => ({ ...pkg.toObject(), source: 'AmiTravel' })),
    ];

    res.status(200).json({
      success: true,
      data: { packages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message
    });
  }
});

// ========================
// GET PACKAGE BY ID
// ========================
const getPackageById = asyncHandler(async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving package',
      error: error.message
    });
  }
});

// ========================
// ADD NEW PACKAGE
// ========================
const addPackage = asyncHandler(async (req, res) => {
  try {
    const { title, description, price, image, link, provider, destination, includes, excludes } = req.body;

    const existingPackage = await Package.findOne({ link });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Package with this link already exists',
        existingId: existingPackage._id
      });
    }

    // Find provider by name
    const providerContact = await ProviderContact.findOne({ providerName: provider });
    if (!providerContact) {
      return res.status(400).json({ success: false, message: 'Provider not found' });
    }

    const newPackage = await Package.create({
      title, description, price, image, link, provider: providerContact._id, destination, includes, excludes, lastScraped: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Package added successfully',
      data: newPackage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding package',
      error: error.message
    });
  }
});

// ========================
// UPDATE PACKAGE
// ========================
const updatePackage = asyncHandler(async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const { title, description, price, image, provider, destination, isActive } = req.body;

    if (title) pkg.title = title;
    if (description) pkg.description = description;
    if (price) pkg.price = price;
    if (image) pkg.image = image;
    if (provider) {
      // Accept either ObjectId or provider name
      if (mongoose.Types.ObjectId.isValid(provider)) {
        pkg.provider = provider;
      } else {
        const providerContact = await ProviderContact.findOne({ providerName: provider });
        if (providerContact) pkg.provider = providerContact._id;
      }
    }
    if (destination) pkg.destination = destination;
    if (isActive !== undefined) pkg.isActive = isActive;

    pkg.lastScraped = new Date();

    await pkg.save();

    res.json({ success: true, message: 'Package updated successfully', data: pkg });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating package',
      error: error.message
    });
  }
});

// ========================
// DELETE PACKAGE
// ========================
const deletePackage = asyncHandler(async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    await Package.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting package',
      error: error.message
    });
  }
});

// ========================
// BULK SAVE PACKAGES
// ========================
const bulkSavePackages = asyncHandler(async (req, res) => {
  try {
    const { packages, destination } = req.body;

    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid packages data. Expected an array.'
      });
    }

    const results = { added: 0, updated: 0, failed: 0, unchanged: 0 };

    for (const packageData of packages) {
      try {
        if (!packageData.link) {
          results.failed++;
          continue;
        }

        if (destination && !packageData.destination) {
          packageData.destination = destination;
        }

        // Find provider by name
        let providerContact = null;
        if (packageData.provider) {
          providerContact = await ProviderContact.findOne({ providerName: packageData.provider });
        }
        if (!providerContact) {
          results.failed++;
          continue;
        }
        packageData.provider = providerContact._id;

        const existingPackage = await Package.findOne({ link: packageData.link });

        if (existingPackage) {
          let hasChanged = false;

          ['title', 'description', 'price', 'image', 'provider', 'destination', 'includes', 'excludes'].forEach(key => {
            if (packageData[key] && packageData[key] !== existingPackage[key]) {
              existingPackage[key] = packageData[key];
              hasChanged = true;
            }
          });

          if (hasChanged) {
            existingPackage.lastScraped = new Date();
            await existingPackage.save();
            results.updated++;
          } else {
            results.unchanged++;
          }
        } else {
          await Package.create({ ...packageData, lastScraped: new Date() });
          results.added++;
        }
      } catch (error) {
        console.error('Error processing package:', error);
        results.failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk package processing completed',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing packages',
      error: error.message
    });
  }
});

// ========================
// GET PACKAGES WITH COORDINATES
// ========================
const getPackages = asyncHandler(async (req, res) => {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'Destination parameter is required'
    });
  }

  try {
    const [holidayGo, pulauMalaysia, amiTravel] = await Promise.all([
      HolidayGoGoPackage.find({
        destination: { $regex: destination, $options: 'i' },
        'location.coordinates': { $exists: true, $ne: null }
      }),
      PulauMalaysiaPackage.find({
        destination: { $regex: destination, $options: 'i' },
        'location.coordinates': { $exists: true, $ne: null }
      }),
      AmiTravel.find({
        destination: { $regex: destination, $options: 'i' },
        'location.coordinates': { $exists: true, $ne: null }
      }),
    ]);

    const allPackages = [
      ...holidayGo.map(pkg => ({ ...pkg.toObject(), source: 'HolidayGoGoGo' })),
      ...pulauMalaysia.map(pkg => ({ ...pkg.toObject(), source: 'PulauMalaysia' })),
      ...amiTravel.map(pkg => ({ ...pkg.toObject(), source: 'AmiTravel' }))
    ];

    res.status(200).json({
      success: true,
      data: {
        packages: allPackages.map(pkg => ({
          _id: pkg._id,
          title: pkg.title || pkg.resort,
          description: pkg.description,
          price: pkg.price,
          image: pkg.image,
          link: pkg.link,
          provider: pkg.provider,
          destination: pkg.destination,
          location: pkg.location,
          source: pkg.source,
          features: pkg.features || [],
          duration: pkg.duration,
          address: pkg.address,
          inclusions: pkg.inclusions || [],
          exclusions: pkg.exclusions || [],
          includes: pkg.includes || [],
          excludes: pkg.excludes || []
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message
    });
  }
});

// ========================
// UPDATE COORDINATES FOR PACKAGES
// ========================
const updatePackageLocations = asyncHandler(async (req, res) => {
  try {
    const packagesWithoutCoordinates = await Package.find({
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null }
      ]
    });

    console.log(`Found ${packagesWithoutCoordinates.length} packages without coordinates`);

    const results = await Promise.all(packagesWithoutCoordinates.map(async pkg => {
      const updated = await updatePackageLocation(pkg);
      if (updated.location?.coordinates) {
        await updated.save();
        return {
          id: updated._id,
          title: updated.title,
          coordinates: updated.location.coordinates
        };
      }
      return null;
    }));

    res.json({
      success: true,
      message: `Updated coordinates for ${results.filter(r => r).length} packages`,
      updatedPackages: results.filter(r => r)
    });
  } catch (error) {
    console.error('Error updating package locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating package locations',
      error: error.message
    });
  }
});

// ========================
// UPDATE ALL SOURCES' COORDINATES
// ========================
const updateAllPackageLocations = asyncHandler(async (req, res) => {
  try {
    const [holidayGo, pulauMalaysia, amiTravel] = await Promise.all([
      HolidayGoGoPackage.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': null },
          { 'location.coordinates': [0, 0] }
        ]
      }),
      PulauMalaysiaPackage.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': null },
          { 'location.coordinates': [0, 0] }
        ]
      }),
      AmiTravel.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': null },
          { 'location.coordinates': [0, 0] }
        ]
      }),
    ]);

    console.log(`Updating all: HolidayGoGoGo=${holidayGo.length}, PulauMalaysia=${pulauMalaysia.length}, AmiTravel=${amiTravel.length}`);

    const updatePackages = async (packages, source) => {
      const updates = packages.map(async pkg => {
        let resortName = pkg.resort || pkg.title.split(',')[0].trim();
        const island = pkg.destination;

        if (!resortName || !island) return null;

        const coordinates = await getCoordinatesFromAddress(resortName, island);
        if (!coordinates) return null;

        pkg.location = coordinates.location;
        pkg.address = coordinates.formattedAddress;
        await pkg.save();

        return {
          id: pkg._id,
          title: pkg.title || pkg.resort,
          coordinates: coordinates.location.coordinates,
          source
        };
      });

      return (await Promise.all(updates)).filter(r => r !== null);
    };

    const [holidayResults, pulauResults, amiResults] = await Promise.all([
      updatePackages(holidayGo, 'HolidayGoGoGo'),
      updatePackages(pulauMalaysia, 'PulauMalaysia'),
      updatePackages(amiTravel, 'AmiTravel')
    ]);

    res.json({
      success: true,
      message: 'Updated coordinates for all sources',
      results: {
        HolidayGoGoGo: holidayResults.length,
        PulauMalaysia: pulauResults.length,
        AmiTravel: amiResults.length
      },
      updatedPackages: { HolidayGoGoGo: holidayResults, PulauMalaysia: pulauResults, AmiTravel: amiResults }
    });
  } catch (error) {
    console.error('Error updating all package locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating all package locations',
      error: error.message
    });
  }
});

// ========================
// TRACK PACKAGE CLICK
// ========================
const trackPackageClick = asyncHandler(async (req, res) => {
  try {
    const { packageId, source, destination } = req.body;

    // Here you could store click analytics in a separate collection
    // For now, we'll just log it and return success
    console.log('Package click tracked:', {
      packageId,
      source,
      destination,
      userId: req.user?._id,
      timestamp: new Date()
    });

    // In a real implementation, you might save to an analytics collection:
    // await ClickAnalytics.create({
    //   packageId,
    //   source,
    //   destination,
    //   userId: req.user?._id,
    //   timestamp: new Date()
    // });

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click',
      error: error.message
    });
  }
});

// ========================
// SEARCH PACKAGES
// ========================
const searchPackages = asyncHandler(async (req, res) => {
  try {
    const {
      query,
      destination,
      provider,
      minPrice,
      maxPrice,
      sortBy = 'title',
      page = 1,
      limit = 20
    } = req.query;

    // Build search criteria
    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { destination: { $regex: query, $options: 'i' } },
        { resort: { $regex: query, $options: 'i' } }
      ];
    }

    if (destination) {
      searchCriteria.destination = { $regex: destination, $options: 'i' };
    }

    // Search across all package collections
    const [packages, amiTravelPackages, holidayGoGoPackages, pulauMalaysiaPackages] = await Promise.all([
      Package.find(searchCriteria),
      AmiTravel.find(searchCriteria),
      HolidayGoGoPackage.find(searchCriteria),
      PulauMalaysiaPackage.find(searchCriteria)
    ]);

    // Combine results and add source information
    let allPackages = [
      ...packages.map(pkg => ({ ...pkg.toObject(), source: 'Package' })),
      ...amiTravelPackages.map(pkg => ({ ...pkg.toObject(), source: 'AMI Travel' })),
      ...holidayGoGoPackages.map(pkg => ({ ...pkg.toObject(), source: 'HolidayGoGo' })),
      ...pulauMalaysiaPackages.map(pkg => ({ ...pkg.toObject(), source: 'PulauMalaysia' }))
    ];

    // Filter by provider if specified
    if (provider) {
      allPackages = allPackages.filter(pkg => pkg.source === provider);
    }

    // Filter by price range if specified
    if (minPrice || maxPrice) {
      allPackages = allPackages.filter(pkg => {
        const priceString = pkg.price || '0';
        const matches = priceString.match(/\d+/g);
        const price = matches ? parseInt(matches[0]) : 0;

        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        return true;
      });
    }

    // Sort packages
    allPackages.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = extractPriceFromString(a.price);
          const priceB = extractPriceFromString(b.price);
          return priceA - priceB;
        case 'price-high':
          const priceA2 = extractPriceFromString(a.price);
          const priceB2 = extractPriceFromString(b.price);
          return priceB2 - priceA2;
        case 'destination':
          return (a.destination || '').localeCompare(b.destination || '');
        case 'title':
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPackages = allPackages.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        packages: paginatedPackages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allPackages.length / limit),
          totalResults: allPackages.length,
          hasNext: endIndex < allPackages.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    console.error('Error searching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching packages',
      error: error.message
    });
  }
});

// ========================
// GET PACKAGES FOR LOGGED-IN PROVIDER
// ========================
const getMyPackages = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency' || !req.user.providerContactId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  try {
    console.log('getMyPackages: providerContactId', req.user.providerContactId);
    const myPackages = await Package.find({ provider: req.user.providerContactId });
    console.log('getMyPackages: found packages', myPackages.length);
    res.status(200).json({ success: true, data: { packages: myPackages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your packages', error: error.message });
  }
});

// Helper function to extract price from string
function extractPriceFromString(priceString) {
  if (!priceString) return 0;
  const matches = priceString.match(/\d+/g);
  return matches ? parseInt(matches[0]) : 0;
}

// ========================
// EXPORT CONTROLLER METHODS
// ========================
module.exports = {
  getAllPackages,
  getPackageById,
  addPackage,
  updatePackage,
  deletePackage,
  bulkSavePackages,
  getPackages,
  updatePackageLocations,
  updateAllPackageLocations,
  trackPackageClick,
  searchPackages,
  getMyPackages
};
