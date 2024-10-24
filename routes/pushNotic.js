const express = require("express");
const router = express.Router();
const UserModel = require("../schemas/user");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

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
            const { message, userRole } = req.body;

        // אימות שהתפקיד של המשתמש הוא 'admin' או 'gabai'
        if (userRole !== 'admin' && userRole !== 'gabai') {
            return res.status(403).json({ message: 'אין לך הרשאות לשלוח הודעות' });
        }


        // קבלת כל הטוקנים
        // Fetch only the device tokens from the users collection
        const users = await UserModel.find({}, { deviceToken: 1, _id: 0 });

        // Extract device tokens into an array
        const tokens = users.map(user => user.deviceToken).filter(token => token !== null);
        
        const messages = {
            notification: {
                title: "MySynagogue",
                body: message, // Use the message from the request or default
            },
            token: 'eA401tObEZ41Ux1Ybf2e-a:APA91bF4HEMxQ4dCh8vRogljvso1Zzx3OTY8zD0uF-ZVu1J8b3hZgKKEB6KxJXRntHTE-KxFE9Dnj1WDuSVAcz_O8ky2scGHW0pcvvnlU_QorGOytL9U7FIsepFsuo4ltNS1cCVWbtti'
        };

     try {
            await sendPushNotification(messages);
            
            res.status(200).json({ message: "הו��עות ��שלחו בהצלחה" });
            
     }catch (error) {
        console.error("Error sending notifications:", error);
    }

});
const sendPushNotification = async (messages) => {
    try {
        const response = await admin.messaging().send(messages);
        console.log("Push notifications sent successfully:", response);
    } catch (error) {
        console.error("Error sending push notifications:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });

    }
};


module.exports = router;