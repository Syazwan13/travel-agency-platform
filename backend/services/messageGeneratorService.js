const ProviderContact = require('../models/providerContactModel');

// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format room type for display
const formatRoomType = (roomType) => {
  const roomTypes = {
    'single': 'Single Room',
    'double': 'Double Room',
    'twin': 'Twin Room',
    'family': 'Family Room',
    'suite': 'Suite',
    'any': 'Any Room Type'
  };
  return roomTypes[roomType] || roomType;
};

// Format bed preference for display
const formatBedPreference = (bedType) => {
  const bedTypes = {
    'king': 'King Bed',
    'queen': 'Queen Bed',
    'twin': 'Twin Beds',
    'any': 'Any Bed Type'
  };
  return bedTypes[bedType] || bedType;
};

// Format view preference for display
const formatViewPreference = (viewType) => {
  const viewTypes = {
    'sea': 'Sea View',
    'garden': 'Garden View',
    'city': 'City View',
    'any': 'Any View'
  };
  return viewTypes[viewType] || viewType;
};

// Generate WhatsApp message
const generateWhatsAppMessage = async (inquiryData) => {
  try {
    const { packageInfo, travelDetails, specialRequirements, userId } = inquiryData;

    // Check if this is a bulk inquiry
    const isBulkInquiry = packageInfo.selectedPackages && packageInfo.selectedPackages.length > 0;
    
    // Get provider template
    const providerContact = await ProviderContact.getByProvider(packageInfo.packageSource);
    
    // Use default templates if provider not found
    const greeting = providerContact?.messageTemplates?.greeting || 'Hello! I\'m interested in your travel package.';
    const signature = providerContact?.messageTemplates?.signature || 'Thank you for your time!';

    // Build group info string
    let groupString = `${travelDetails.groupInfo.adults} Adult${travelDetails.groupInfo.adults > 1 ? 's' : ''}`;
    if (travelDetails.groupInfo.children > 0) {
      groupString += `, ${travelDetails.groupInfo.children} Child${travelDetails.groupInfo.children > 1 ? 'ren' : ''}`;
    }
    if (travelDetails.groupInfo.infants > 0) {
      groupString += `, ${travelDetails.groupInfo.infants} Infant${travelDetails.groupInfo.infants > 1 ? 's' : ''}`;
    }

    // Build flexibility string
    const flexibilityString = travelDetails.preferredDates.isFlexible 
      ? `(Flexible ±${travelDetails.preferredDates.flexibilityDays} days)`
      : '(Fixed dates)';

    // Build dietary restrictions string
    const dietaryString = specialRequirements.dietaryRestrictions && specialRequirements.dietaryRestrictions.length > 0
      ? specialRequirements.dietaryRestrictions.join(', ')
      : 'None';

    // Build budget string
    let budgetString = '';
    if (specialRequirements.budgetRange && specialRequirements.budgetRange.min) {
      budgetString = `💰 *Budget Range:* ${specialRequirements.budgetRange.currency || 'MYR'} ${specialRequirements.budgetRange.min}`;
      if (specialRequirements.budgetRange.max) {
        budgetString += ` - ${specialRequirements.budgetRange.max}`;
      }
      budgetString += '\n\n';
    }

    // Build celebration string
    const celebrationString = specialRequirements.celebrationOccasion 
      ? `🎉 *Special Occasion:* ${specialRequirements.celebrationOccasion}\n\n`
      : '';

    // Build custom requests string
    const customRequestsString = specialRequirements.customRequests 
      ? `📝 *Special Requests:*\n${specialRequirements.customRequests}\n\n`
      : '';

    // Build the complete message
    let message;

    if (isBulkInquiry) {
      // Generate bulk inquiry message
      const packageList = packageInfo.selectedPackages.map((pkg, index) =>
        `${index + 1}. ${pkg.title} - ${pkg.price || 'Please quote'}`
      ).join('\n');

      const providers = [...new Set(packageInfo.selectedPackages.map(pkg => pkg.source || pkg.provider))];
      const destinations = [...new Set(packageInfo.selectedPackages.map(pkg => pkg.destination))].filter(Boolean);

      message = `
${greeting}

🏖️ *BULK TRAVEL INQUIRY*
━━━━━━━━━━━━━━━━━━━━

👤 *Customer Details:*
Name: ${userId.name}
Email: ${userId.email}
Phone: ${userId.phoneNumber || 'Not provided'}

📦 *Packages of Interest (${packageInfo.selectedPackages.length} packages):*
${packageList}

🌍 *Destinations:* ${destinations.length > 0 ? destinations.join(', ') : 'Multiple'}
🏢 *Providers:* ${providers.join(', ')}`;
    } else {
      // Generate single package inquiry message
      message = `
${greeting}

🏖️ *TRAVEL INQUIRY*
━━━━━━━━━━━━━━━━━━━━

👤 *Customer Details:*
Name: ${userId?.name || 'Anonymous Customer'}
Email: ${userId?.email || 'Not provided'}
Phone: ${userId?.phoneNumber || 'Not provided'}

🏖️ *Package Interest:*
${packageInfo.packageTitle}
Destination: ${packageInfo.packageDestination || 'As specified'}
Duration: ${packageInfo.packageDuration || 'As specified'}
Listed Price: ${packageInfo.packagePrice || 'Please quote'}`;
    }

    // Add common travel details and requirements
    message += `

📅 *Travel Details:*
Preferred Dates: ${formatDate(travelDetails.preferredDates.startDate)} - ${formatDate(travelDetails.preferredDates.endDate)}
${flexibilityString}
Group Size: ${groupString}

🏨 *Accommodation Preferences:*
Room Type: ${formatRoomType(travelDetails.accommodationPreferences.roomType)}
Rooms Needed: ${travelDetails.accommodationPreferences.roomCount}
Bed Preference: ${formatBedPreference(travelDetails.accommodationPreferences.bedPreference)}
View Preference: ${formatViewPreference(travelDetails.accommodationPreferences.viewPreference)}

🍽️ *Dietary Requirements:* ${dietaryString}

${celebrationString}${budgetString}${customRequestsString}━━━━━━━━━━━━━━━━━━━━
🔍 *Please provide:*
${isBulkInquiry ? '✓ Individual package quotes & availability' : '✓ Available room options & rates'}
✓ Exact accommodation details
✓ Complete pricing breakdown
✓ What's included/excluded
✓ Booking terms & conditions
${isBulkInquiry ? '✓ Group booking discounts (if applicable)' : ''}

${signature}

━━━━━━━━━━━━━━━━━━━━
Generated via TravelWith4Pulau`;

    return message.trim();
  } catch (error) {
    console.error('Error generating WhatsApp message:', error);
    throw new Error('Failed to generate WhatsApp message');
  }
};

// Generate simple message for testing
const generateSimpleMessage = (packageTitle, customerName) => {
  return `Hello! I'm ${customerName} and I'm interested in your "${packageTitle}" package. Could you please provide more details and pricing? Thank you!`;
};

module.exports = {
  generateWhatsAppMessage,
  generateSimpleMessage,
  formatDate,
  formatRoomType,
  formatBedPreference,
  formatViewPreference
};
