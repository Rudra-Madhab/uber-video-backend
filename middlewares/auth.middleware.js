const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    try {
        // Get token from cookie OR Authorization header
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token found" });
        }

        const isBlacklisted = await userModel.findOne({ blacklistedTokens: token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized - Token is blacklisted" });
        }



        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user from decoded token
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized - Invalid user" });
        }

        // Attach user to request object
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};
