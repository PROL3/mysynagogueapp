const express = require("express");
const connectDB = require("./db/connectDB");
const authRoutes = require("./routes/authRoutes");
const donationsRoutes = require("./routes/donationsRoutes");
const cookieParser = require('cookie-parser');

const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // טוען את המשתנים מקובץ ה-.env

const app = express();

// התחברות ל-MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: true, // ודא שזה הכתובת של הפרונטנד שלך
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // מאפשר שליחת עוגיות
  }));
  


app.use(express.json()); // מנתח בקשות JSON
app.use(cookieParser());


// הגדרת הנתיבים
app.use("/api/auth", authRoutes);
app.use("/api/donation", donationsRoutes);

// הפעלת השרת
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
