const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../schemas/user");
const { console } = require("inspector");
const router = express.Router();

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("No token provided"); // נזרוק שגיאה אם אין טוקן
    }

    // אימות הטוקן
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        throw new Error("Invalid token"); // נזרוק שגיאה אם יש שגיאה באימות
      }
      req.user = user;
      next(); // ממשיך לבקשה הבאה אם האימות מצליח
    });
  } catch (error) {
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
    const { amount, status } = req.body;
  
    try {
      // חפש את המשתמש לפי ה-ID מהטוקן
      const userId = req.user.userId; // זה מתבצע דרך פונקציית authenticateJWT
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      // הוסף את התרומה למערך התרומות של המשתמש
      user.donations.push({
        amount,
        status,
        date: new Date() // תאריך התרומה
      });
  
      // עדכן את סך התרומות של המשתמש
      user.totalDonated += amount;
      if (status === "טרם שולם") {
        user.totalOwed += amount;
      }
  
      await user.save(); // שמור את השינויים במסד הנתונים
      res.status(201).json({ message: "Donation added successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
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