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
  console.log("הבקשה התקבלה בשרת");

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

    // Initialize the monthly donation if it doesn't exist
    user.monthlyDonations[month] = user.monthlyDonations[month] || { owed: 0, amount: 0, status: "לא שולם" };

    // Process the donation
    if (status === "שולם") {
      user.donations.push({
        amount: parsedAmount,
        status: status,
        date: new Date(),
      });
      user.totalDonated = (user.totalDonated || 0) + parsedAmount; // Update total donated with the paid amount

      if (parsedAmount >= user.totalOwed) {
        user.totalOwed = 0; // Clear total owed if donation is greater than or equal to the total owed
      } else {
        user.totalOwed -= parsedAmount; // Subtract the donation from the total owed
      }

      let remainingAmount = parsedAmount;

      // Handle the current month's debt first
      if (parsedAmount >= user.monthlyDonations[month].owed && user.monthlyDonations[month].owed !== 0) {
        remainingAmount -= user.monthlyDonations[month].owed;
        user.monthlyDonations[month].amount += user.monthlyDonations[month].owed;
        user.monthlyDonations[month].owed = 0;
        user.monthlyDonations[month].status = "שולם";
      } else if (remainingAmount < user.monthlyDonations[month].owed) {
        user.monthlyDonations[month].amount += remainingAmount;
        user.monthlyDonations[month].owed -= remainingAmount;
        remainingAmount = 0;
      }else{
        user.monthlyDonations[month].amount +=parsedAmount;
        user.monthlyDonations[month].owed = 0;
        user.monthlyDonations[month].status = "שולם"
      }
      await user.save();


      // If there's remaining amount, process the debts for the upcoming months
      if (remainingAmount > 0) {
        const monthsOrder = validMonths;
        const currentMonthIndex = monthsOrder.indexOf(month); // Current month index

        // Start looking for debts from the next month
        for (let i = currentMonthIndex + 1; i < monthsOrder.length; i++) {
          const currentMonth = monthsOrder[i];
          
          // Ensure there's debt for the current month
          const monthlyDonation = user.monthlyDonations[currentMonth] || { owed: 0, amount: 0, status: "לא שולם" };

          if (monthlyDonation.owed > 0) {
            if (remainingAmount >= monthlyDonation.owed) {
              remainingAmount -= monthlyDonation.owed;
              //monthlyDonation.amount += monthlyDonation.owed;
              monthlyDonation.owed = 0;
              monthlyDonation.status = "שולם";
            } else {
              monthlyDonation.amount += remainingAmount;
              monthlyDonation.owed -= remainingAmount;
              monthlyDonation.status = "לא שולם";
              remainingAmount = 0;
              break; // Stop as we've allocated the remaining amount
            }
          }

          // Stop the loop if there's no remaining amount
          if (remainingAmount <= 0) {
            break;
          }
        }
      }

    } else if (status === "לא שולם") {
      // If the donation status is "לא שולם," update the owed amount for the specific month
      user.totalOwed += parsedAmount;
      user.monthlyDonations[month].owed += parsedAmount;
      user.monthlyDonations[month].status = "לא שולם";
    }

    // Save the user with the updated data
    await user.save();

    // Respond with the updated user data including debt and monthly donations
    res.status(201).json({
        donations: user.donations,
        totalDonated: user.totalDonated,
        totalOwed: user.totalOwed,
        monthlyDonations: user.monthlyDonations,
      
    });
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
