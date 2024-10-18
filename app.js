const express = require("express");
const connectDB = require("./db/connectDB");
const authRoutes = require("./routes/authRoutes");
const donationsRoutes = require("./routes/donationsRoutes");
const events = require("./routes/events");
const pushNotic= require("./routes/pushNotic");
const cookieParser = require('cookie-parser');

const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // טוען את המשתנים מקובץ ה-.env

const app = express();
app.use(express.json()); // מנתח בקשות JSON
app.use(cookieParser());
// התחברות ל-MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173', 
  'https://mysynagogueapp.onrender.com',
  'http://localhost:10000', // תיקון כתובת עם הפורט הנכון
  'capacitor://localhost'
];

app.use(cors({
    origin: function (origin, callback) {
        // Handle requests without origin (e.g., Postman or server-side requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('Blocked by CORS:', origin); // Add log for blocked origin
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow sending cookies and credentials
}));




// הגדרת הנתיבים
app.use("/api/auth", authRoutes);
app.use("/api/donation", donationsRoutes);
app.use("/api/events", events);
app.use("/api/send-push-notifications", pushNotic);

// הפעלת השרת
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {

  console.log(`Server is running on  http://localhost:${PORT}`);
});
