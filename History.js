const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    game: { type: String },
    transactionId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., 'Deposit', 'Withdrawal', 'Bid'
    number: { type: String }, // For bids
    amount: { type: Number, required: true },
    result: { type: String }, // 'Pending', 'Win', 'Loss'
    status: { type: String }, // 'Pending', 'Approved', 'Rejected'
    winAmount: { type: Number },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const History = mongoose.model('History', historySchema);

module.exports = History;