const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const blacklistedTokenModel = require('../models/blacklistToken.model');

const { validationResult } = require('express-validator');

// ------------------------
// Register User
// ------------------------
module.exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password } = req.body;

        const isUserExist = await userModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const hashPassword = await userModel.hashPassword(password);

        // Create user
        const user = await userModel.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname || ''
            },
            email,
            password: hashPassword
        });

        // Generate token
        const token = user.generateAuthToken();

        // Set token as cookie
        res.cookie('token', token, { httpOnly: true });

        return res.status(201).json({ token, user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ------------------------
// Login User
// ------------------------
module.exports.loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();
        res.cookie('token', token, { httpOnly: true });

        return res.status(200).json({ token, user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ------------------------
// Get User Profile
// ------------------------
module.exports.getUserprofile = async (req, res) => {
    try {
        return res.status(200).json({
            message: "User fetched successfully",
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ------------------------
// Logout User
// ------------------------
module.exports.logoutUser = async (req, res) => {
    try {
        // Clear cookie
        res.clearCookie('token');

        // Get token
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        // Blacklist token
        if (token) {
            await blacklistTokenModel.create({ token });
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
