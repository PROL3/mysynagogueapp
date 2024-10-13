
const express = require("express");
const Event = require("../schemas/event");
const router = express.Router();


router.get('/getevents', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({ events });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// מסלול להוספת אירוע
router.post('/addevent', async (req, res) => {
    const { name } = req.body;
    try {
        const newEvent = new Event({ name });
        await newEvent.save();
        res.status(201).json({ event: newEvent });
    } catch (err) {
        res.status(500).json({ message: 'Error creating event' });
    }
});

// מסלול למחיקת אירוע
router.delete('/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;
