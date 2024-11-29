const express = require('express');
const Event = require('../models/Event');
const authenticate = require('../config/auth');
const router = express.Router();

// Middleware for role-based access
const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
    }
    next();
};

// Create an event (Faculty only)
router.post('/create', authenticate, authorize(['faculty']), async (req, res) => {
    const { title, start, end } = req.body;

    try {
        const event = new Event({
            title,
            start,
            end,
            createdBy: req.user.id,
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Fetch all events
router.get('/', authenticate, async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an event (Faculty only)
router.put('/update/:id', authenticate, authorize(['faculty']), async (req, res) => {
    const { id } = req.params;
    const { title, start, end } = req.body;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check ownership
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        event.title = title || event.title;
        event.start = start || event.start;
        event.end = end || event.end;

        await event.save();
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an event (Faculty only)
router.delete('/delete/:id', authenticate, authorize(['faculty']), async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check ownership
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await event.remove();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register for an event (Student only)
router.post('/register/:id', authenticate, authorize(['student']), async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Prevent duplicate registrations
        if (event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        event.registeredUsers.push(req.user.id);
        await event.save();

        res.status(200).json({ message: 'Successfully registered for the event', event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unregister from an event (Student only)
router.post('/unregister/:id', authenticate, authorize(['student']), async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if user is already registered
        const index = event.registeredUsers.indexOf(req.user.id);
        if (index === -1) {
            return res.status(400).json({ message: 'Not registered for this event' });
        }

        event.registeredUsers.splice(index, 1);
        await event.save();

        res.status(200).json({ message: 'Successfully unregistered from the event', event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get event details (All roles)
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id).populate('registeredUsers', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;