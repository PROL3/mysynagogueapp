const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const UserModel = require("../schemas/user");
const { console } = require("inspector");
const router = express.Router();

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Received token:", token); // לוג לבדיקת הטוקן

    if (!token) {
      throw new Error("No token provided");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        throw new Error("Invalid token");
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error.message); // הוסף לוג כדי לראות מה קורה בשגיאות
    if (error.message === "No token provided") {
      return res.status(401).json({ message: "Unauthorized: No token" });
    } else if (error.message === "Invalid token") {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};


// הוספת תרומה למשתמש
router.post("/addonations", authenticateJWT, async (req, res) => {
  try {
    const { userId, amount, status, month } = req.body;
    console.log('Received data:', { userId, amount, status, month });
    
    // Validate the amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Validate month
    const validMonths = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    if (!validMonths.includes(month)) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse amount to Decimal128
    const decimalAmount = mongoose.Types.Decimal128.fromString(parsedAmount.toString());

    // Ensure donations array exists
    if (!Array.isArray(user.donations)) {
      user.donations = [];
    }

    // Add the donation to the user's donations array
    if (status === 'שולם') {
      user.donations.push({
        amount: decimalAmount, // השתמש ב-Decimal128
        status,
        date: new Date(),
      });
    }

    // Update totalDonated
    if (!user.totalDonated) {
      user.totalDonated = decimalAmount;
    } else if (status === "שולם") {
      user.totalDonated = addDecimal128(user.totalDonated, decimalAmount);
    }
    
    // Update totalOwed if status is "לא שולם"
    if (status === "לא שולם") {
      if (!user.totalOwed) {
        user.totalOwed = decimalAmount;
      } else {
        user.totalOwed = addDecimal128(user.totalOwed, decimalAmount);
      }
    }

    // Update the monthlyDonations for the specified month
    if (!user.monthlyDonations[month]) {
      user.monthlyDonations[month] = {
        amount: decimalAmount,
        status: status === "שולם" ? "שולם" : "לא שולם",
      };
    } else {
      user.monthlyDonations[month].amount = addDecimal128(user.monthlyDonations[month].amount, decimalAmount);
      user.monthlyDonations[month].status = status;
    }

    // Save the user with the updated data
    await user.save();

    // Respond with a success message and updated user data
    res.status(201).json({ message: "Donation added successfully", user });
  } catch (error) {
    console.error("Error adding donation:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});




router.get("/getdonations", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId; // זה מתבצע דרך פונקציית authenticateJWT
    console.log(userId);
    const user = await UserModel.findById(userId).select("donations totalDonated totalOwed monthlyDonations");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      donations: user.donations,
      totalDonated: user.totalDonated,
      totalOwed: user.totalOwed,
      monthlyDonations: user.monthlyDonations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error); // הדפס את השגיאה
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
