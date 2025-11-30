const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: { type: String, required: true, minlength: 3 },
        lastname: { type: String, minlength: 3 }
    },
    email: { type: String, required: true, unique: true, minlength: 5 },
    password: { type: String, required: true, select: false },
    socketId: { type: String }
});

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
}

// Static method to hash password
userSchema.statics.hashPassword = async function(password) {
    return bcrypt.hash(password, 10);
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
