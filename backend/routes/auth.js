const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;