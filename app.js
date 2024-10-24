const express = require("express");
const connectDB = require("./db/connectDB");
const authRoutes = require("./routes/authRoutes");
const donationsRoutes = require("./routes/donationsRoutes");
const events = require("./routes/events");
const pushNotic = require("./routes/pushNotic");
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./notification/serviceAccountKey.json'); // Update the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  messagingSenderId: '334784125467',
});
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // טוען את המשתנים מקובץ ה-.env
const app = express();

const allowedOrigins = [
  'http://localhost:5174',
  'https://mysynagogueapp.onrender.com',
  'http://localhost:10000', // תיקון כתובת עם הפורט הנכון
  'capacitor://localhost',
  'https://localhost',
  'http://localhost:8080'
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
app.use(express.json()); // מנתח בקשות JSON

app.use(cookieParser());
// התחברות ל-MongoDB
connectDB();

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
