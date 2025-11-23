const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    isAdmin: { type: Boolean, default: false } // To identify admin users
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;