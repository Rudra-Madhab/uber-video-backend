const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

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

        // Hash password using static method in userModel
        const hashPassword = await userModel.hashPassword(password);

        // Create user in database
        const user = await userModel.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email,
            password: hashPassword
        });

        // Generate JWT token
        const token = user.generateAuthToken();

        // Optionally, set token as cookie
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

        // Optionally, set token as cookie
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

        // Get token from cookie or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        // Add token to blacklist
        if (token) {
            await blacklistTokenModel.create({ token });
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
