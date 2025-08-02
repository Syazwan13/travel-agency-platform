// Travel Agency Frontend Functionality Test Script
// This script tests all travel agency features systematically

const API_URL = "http://localhost:5001";

// Test data for new travel agency registration
const testTravelAgency = {
    name: "Test Travel Solutions",
    email: "test@travelsolutions.com",
    password: "password123",
    confirmPassword: "password123",
    phoneNumber: "+601234567890",
    companyName: "Test Travel Solutions Sdn Bhd",
    businessRegistrationNumber: "SSM12345678",
    address: {
        street: "123 Test Street",
        city: "Kuala Lumpur",
        state: "Kuala Lumpur",
        country: "Malaysia",
        postalCode: "50100"
    },
    website: "https://www.testtravelsolutions.com",
    description: "We specialize in budget-friendly travel packages for young professionals and families.",
    specializations: ["Budget Travel", "Family Packages", "Domestic Tours"],
    contactPerson: "Ahmad Test",
    whatsappNumber: "+601234567890"
};

// Test existing travel agency login
const existingTravelAgency = {
    email: "info@amitravel.com",
    password: "password123"
};

// Admin login credentials
const adminCredentials = {
    email: "wanted@gmail.com", 
    password: "password123"
};

console.log("=== TRAVEL AGENCY FRONTEND TESTING PLAN ===");
console.log("1. Test new travel agency registration");
console.log("2. Test existing travel agency login (pending status)");
console.log("3. Test pending approval page");
console.log("4. Test admin approval process");
console.log("5. Test approved travel agency access");
console.log("6. Test travel agency dashboard");
console.log("7. Test package management");
console.log("8. Test profile updates");
console.log("\nTo execute tests, open the browser and navigate through each scenario.");
console.log("Backend API URL:", API_URL);
console.log("Frontend URL: http://localhost:5173");

module.exports = {
    testTravelAgency,
    existingTravelAgency,
    adminCredentials,
    API_URL
};
