const mongoose = require('mongoose');

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT)  // no extra options
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => console.error('DB connection error:', err));
}

module.exports = connectToDb;
