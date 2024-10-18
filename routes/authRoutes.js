const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const UserModel = require("../schemas/user");
const { console } = require("inspector");
const router = express.Router();

// רישום משתמש חדש
router.post("/register", async (req, res) => {
  const { 
    username, 
    email, 
    phoneNumber = "", // Default value for phoneNumber
    password, 
    donations = [], // Default value for donations
    totalDonated = 0.0, // Default value for totalDonated
    totalOwed = 0.0, // Default value for totalOwed
    monthlyDonations = {} // Default value for monthlyDonations
  } = req.body;

  console.log("Received data:", req.body);

  try {
    if (!username || !email || !password) {
      return res.status(400).send("Missing required fields");
    }

    // בדוק אם המשתמש קיים כבר
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // אם קיים מספר טלפון, בדוק אם הוא ייחודי
    if (phoneNumber) {
      const existingPhone = await UserModel.findOne({ phoneNumber });
      if (existingPhone) {
        return res.status(400).send("Phone number already in use");
      }
    }

    // האש את הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // צור משתמש חדש
    const newUser = new UserModel({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      donations,
      totalDonated,
      totalOwed,
      monthlyDonations
    });

    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Server error");
  }
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
      httpOnly: true,
      // מונע גישה לעוגיה דרך JavaScript
      secure: true, // חובה אם אתה משתמש ב-HTTPS
      sameSite: 'None', // נדרש כדי לשלוח קוקיז בבקשות Cross-Site
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ימים במילישניות

    });
    // שלח הודעת הצלחה
    res.status(200).json({ username: user.username, role: user.role, message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/login/google", async (req, res) => {
  const { tokenId } = req.body;

  try {
    // אמת את הטוקן של Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload(); // מקבל את הנתונים של המשתמש מ-Google
    const { email, sub: googleId, name } = payload;

    // בדוק אם המשתמש קיים כבר במערכת
    let user = await UserModel.findOne({ email });

    if (!user) {
      // אם המשתמש לא קיים, צור משתמש חדש עם הפרטים של Google
      user = new UserModel({ email, googleId, username: name });
      await user.save();
    }

    // צור JWT עם פרטי המשתמש
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    // שלח את הטוקן כעוגיה מאובטחת
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // שלח הודעת הצלחה עם פרטי המשתמש
    res.status(200).json({ username: user.username, role: user.role, message: 'Logged in successfully with Google' });
  } catch (error) {
    console.error("Error with Google login:", error);
    res.status(500).send("Google login failed");
  }
});


// קבלת משתמש לפי ID
router.get("/getusers", async (req, res) => {
  try {
    const users = await UserModel.find(); // Fetch all users
    console.log(users); // Correct log to see the fetched users
   

    if (!users || users.length === 0) {
      return res.status(404).send("No users found");
    }

    res.json(users); // Return users as JSON
  } catch (error) {
    console.error("Error fetching users:", error); // Log error if any
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
