const bcrypt = require('bcrypt');
const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken.model'); // ✅ matches filename


module.exports.registerCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });
    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const captain = await captainService.createCaptain({
        fullname,
        email,
        password: hashedPassword,
        vehicle: {
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            type: vehicle.type
        }
    });

    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain }); // ✅ return token in JSON
};

module.exports.loginCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');
    if (!captain) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token, { httpOnly: true }); // ✅ correct
    res.status(200).json({ token, captain }); // ✅ return token for PowerShell
};

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
        await blackListTokenModel.create({ token });
    }

    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
