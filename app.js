const express = require("express");
const connectDB = require("./db/connectDB");
const authRoutes = require("./routes/authRoutes");
const donationsRoutes = require("./routes/donationsRoutes");
const events = require("./routes/events");

const cookieParser = require('cookie-parser');

const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // טוען את המשתנים מקובץ ה-.env

const app = express();

// התחברות ל-MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // ודא שזה הכתובת של הפרונטנד שלך
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // מאפשר שליחת עוגיות
  }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://localhost'); // עדכן את המקור המתאים
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  
  


app.use(express.json()); // מנתח בקשות JSON
app.use(cookieParser());


// הגדרת הנתיבים
app.use("/api/auth", authRoutes);
app.use("/api/donation", donationsRoutes);
app.use("/api/events", events);

// הפעלת השרת
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
