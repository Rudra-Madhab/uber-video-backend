const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        minlength: [3, 'Fullname must be at least 3 characters long']
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    socketId: {
        type: String
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },

    vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [3, 'Vehicle color must be at least 3 characters long']
        },
        plate: {
            type: String,
            required: true,
            minlength: [3, 'Vehicle plate must be at least 3 characters long']
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'Capacity must be at least 1']
        },
        type: {
            type: String,
            required: true,
            enum: ['bike', 'car', 'auto']
        }
    },

    location: {
        lat: {
            type: Number,
            required: false,  // optional for registration
        },
        long: {
            type: Number,
            required: false
        }
    }

}, { timestamps: true });

// ---------------------------
// JWT Token generation
// ---------------------------
captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '24h' }
    );
    return token;
};

// ---------------------------
// Compare password
// ---------------------------
captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const captainModel = mongoose.model('Captain', captainSchema);
module.exports = captainModel;
