const express = require("express");
const router = express.Router();
const UserModel = require("../schemas/user");
const admin = require("firebase-admin");

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

router.post('/register-token', async (req, res) => {
    const { userId, token } = req.body;

    // בדוק אם הטוקן או ה-userId קיימים
    if (!token || !userId) {
        return res.status(400).send('Token and user ID are required');
    }

    try {
        // שמור את הטוקן למסד הנתונים
        const user = await UserModel.findOneAndUpdate(
            { _id: userId }, // חיפוש לפי userId
            { deviceToken: token }, // עדכון הטוקן
            { new: true, upsert: true } // עדכון המסמך הקיים או יצירה אם לא קיים
        );

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(`Token registered for user: ${userId}`);
    } catch (error) {
        console.error('Error registering token:', error);
        res.status(500).send('Internal server error');
    }
});


// API לשליחת הודעות Push
router.post('/sendtoallusers', authenticateJWT, async (req, res) => {
    try {
        const { message, userRole } = req.body;

        // אימות שהתפקיד של המשתמש הוא 'admin' או 'gabai'
        if (userRole !== 'admin' && userRole !== 'gabai') {
            return res.status(403).json({ message: 'אין לך הרשאות לשלוח הודעות' });
        }

        // קבלת כל המשתמשים
        const users = await UserModel.find();

        // קבלת כל הטוקנים
        const tokens = users.map(user => user.deviceToken).filter(Boolean); // Get valid tokens

        const payload = {
            notification: {
                title: "הודעה חדשה מהבית כנסת שלי",
                body: message,
            },
        };

        // שליחת הודעות לכל משתמש
        if (tokens.length > 0) {
            const messages = tokens.map(token => ({
                token: token,
                notification: payload.notification,
                // You can add data here if needed
            }));

            // Send messages using sendEachForMulticast
            const response = await admin.messaging().sendEachForMulticast(messages);

            console.log("Successfully sent message:", response);
            return res.status(200).json({ message: 'ההודעות נשלחו בהצלחה', response });
        } else {
            return res.status(404).json({ message: 'לא נמצאו טוקנים לשליחה' });
        }
    } catch (error) {
        console.error("Error sending message to all users:", error);
        return res.status(500).send('Internal server error');
    }
});


module.exports = router;