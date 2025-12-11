const captainModel = require('../models/captain.model');

module.exports.createCaptain = async (data) => {
    const {
        fullname,
        email,
        password,
        vehicle
    } = data;

    // Validate required fields
    if (!fullname || !email || !password || !vehicle?.color || !vehicle?.plate || !vehicle?.capacity || !vehicle?.type) {
        throw new Error('All fields are required');
    }

    // Create and save captain
    const captain = new captainModel({
        fullname,
        email,
        password,
        vehicle
    });

    return await captain.save();  // return the Mongoose document
};
