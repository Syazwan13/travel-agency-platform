const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
    },
    photo: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: String,
        default: "",
    },
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" },
        postalCode: { type: String, default: "" }
    },
    preferences: {
        preferredDestinations: [{ type: String }],
        travelStyles: [{ type: String }],
        priceRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 }
        },
        notifications: {
            email: { type: Boolean, default: true },
            priceAlerts: { type: Boolean, default: false }
        }
    },
    role: {
        type: String,
        enum: ["admin", "user", "travel_agency"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "pending", "suspended", "inactive"],
        default: function() {
            return this.role === "travel_agency" ? "pending" : "active";
        }
    },
    commisionBalance: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0,
    },
    bookingHistory: [{
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
        bookedAt: { type: Date, default: Date.now }
    }],
    favorites: [{
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }
    }],
    // Travel Agency specific fields
    companyName: {
        type: String,
        default: "",
    },
    businessRegistrationNumber: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    specializations: [{
        type: String
    }],
    contactPerson: {
        type: String,
        default: "",
    },
    whatsappNumber: {
        type: String,
        default: "",
    },
    telegramChatId: { type: String },
    providerContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderContact',
      required: function() { return this.role === 'travel_agency'; }
    }
},
{
    timestamps: true
});

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);