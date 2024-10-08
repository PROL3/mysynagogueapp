const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');

const UserModel = require("../schemas/user");
const { console } = require("inspector");
const router = express.Router();

// רישום משתמש חדש
router.post("/register", async (req, res) => {
  const { username, email, phoneNumber, password } = req.body;
  console.log("Received data:", req.body); // הוספת שורה זו לבדוק את הנתונים המתקבלים

  try {
    if (!username || !email || !password) {
      return res.status(400).send("Missing required fields");
    }
    // בדוק אם המשתמש קיים כבר
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // האש את הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // צור משתמש חדש
    const newUser = new UserModel({
      username,
      email,
      phoneNumber: phoneNumber || "", 
      password: hashedPassword });

    await newUser.save();
    
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during registration:", error); 
    res.status(500).send("Server error");  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // חפש את המשתמש לפי אימייל
    const user = await UserModel.findOne({ email });
    console.log("User found:", user); // הוסף כאן
    if (!user) {
      return res.status(401).send("Invalid credentials"); // משתמש לא נמצא
    }

    // בדוק אם הסיסמה תואמת
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials"); // סיסמה לא נכונה
    }

    // צור JWT עם פרטי המשתמש
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "30d", // הטוקן יפוג תוך 30 ימים
    });

    // שלח את הטוקן כעוגיה מאובטחת
    res.cookie("token", token, {
      httpOnly: true,  // מונע גישה לעוגיה דרך JavaScript
    });
    // שלח הודעת הצלחה
    res.status(200).json({ username: user.username, role: user.role, message: 'Logged in successfully' }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});



  
  // קבלת משתמש לפי ID
  router.get("/:id", async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.json(user);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });
  


// פונקציה להגן על מסלול
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};



module.exports = router;
