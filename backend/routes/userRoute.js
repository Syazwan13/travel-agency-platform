const express = require('express');
const { registerUser } = require("../controllers/userCtr");
const { loginUser } = require("../controllers/userCtr");
const { loginStatus } = require("../controllers/userCtr");
const { logoutUser } = require("../controllers/userCtr");
const { getUser } = require("../controllers/userCtr");
const { protect, isAdmin, isTravelAgency, isAdminOrTravelAgency } = require("../middleware/authMiddleWare");
const { getUserBalance } = require("../controllers/userCtr");
const { getAllUser } = require("../controllers/userCtr");
const { estimateIncome } = require("../controllers/userCtr");
const { addToFavorites, removeFromFavorites, getFavorites, addSearchHistory, getSearchHistory } = require("../controllers/userCtr");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/loggedIn", loginStatus);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);
router.get("/sell-amount", protect, getUserBalance);

router.get("/estimate-income", protect, isAdmin, estimateIncome); //can only be accessed by admin
router.get("/users", protect, isAdmin, getAllUser); //can only be accessed by admin

// Favorites routes
router.post("/favorites", protect, addToFavorites);
router.delete("/favorites/:packageId", protect, removeFromFavorites);
router.get("/favorites", protect, getFavorites);

// Search history routes
router.post("/search-history", protect, addSearchHistory);
router.get("/search-history", protect, getSearchHistory);

module.exports = router; 