const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({

    fullname: {
        type: String,
        required: true,
        minlength: [3, 'Fullname must be at least 3 characters long']
    },

    lastname: {
        type: String,
        minlength: [3, 'Lastname must be at least 3 characters long']
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
            required: true
        },
        long: {
            type: Number,
            required: true
        }
    }

}, { timestamps: true });


// --------------------------------------------
// JWT Token generation
// --------------------------------------------
captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;

};

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const captainModel = mongoose.model('captain', captainSchema)





module.exports =  captainModel;


