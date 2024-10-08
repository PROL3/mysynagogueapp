const express = require("express");
const jwt = require("jsonwebtoken");
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
    const { userId, amount, status } = req.body;
  
    try {
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }
  
      // חפש את המשתמש לפי ה-ID שנשלח מהבקשה
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // הוסף את התרומה למשתמש
      user.donations.push({
        amount,
        status,
        date: new Date(),
      });
  
      // עדכן את סך התרומות
      user.totalDonated += amount;
      if (status === "טרם שולם") {
        user.totalOwed += amount;
      }
  
      await user.save();
      res.status(201).json({ message: "Donation added successfully", user });
    } catch (error) {
      console.error("Error adding donation:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
  router.get("/getdonations", authenticateJWT, async (req, res) => {
    try {
      const userId = req.user.userId; // זה מתבצע דרך פונקציית authenticateJWT
      console.log(userId);
      const user = await UserModel.findById(userId).select("donations totalDonated totalOwed");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        donations: user.donations,
        totalDonated: user.totalDonated,
        totalOwed: user.totalOwed,
      });
    } catch (error) {
      console.error("Error fetching donations:", error); // הדפס את השגיאה
      res.status(500).json({ message: "Internal Server Error" });
    }
  });










module.exports = router;
