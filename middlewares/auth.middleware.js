const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const blacklistedTokenModel = require('../models/blacklistToken.model');
const bcrypt = require('bcrypt');



// =======================
// USER AUTH
// =======================
module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token found" });
        }

        const isBlacklisted = await blacklistedTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized - Token blacklisted" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};

// =======================
// CAPTAIN AUTH
// =======================
module.exports.authCaptain = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        console.log(token);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token found" });
        }

        const isBlacklisted = await blacklistedTokenModel.findOne({ token });
        console.log(isBlacklisted);




        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized - Token blacklisted" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if (!captain) {
            return res.status(401).json({ message: "Unauthorized - Captain not found" });
        }

        req.captain = captain;

        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};
