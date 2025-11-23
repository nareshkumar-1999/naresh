const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    photo: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    branchName: { type: String, default: '' },
    upiId: { type: String, default: '' }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});


const User = mongoose.model('User', userSchema);

module.exports = User;