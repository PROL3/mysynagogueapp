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
const allowedOrigins = ['http://localhost:5173', 'https://mysynagogueapp.onrender.com','capacitor://localhost'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
