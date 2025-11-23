const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// --- Database Models (we will create these) ---
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('./models/User');
const History = require('./models/History');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
const MONGO_URI = "mongodb+srv://mithunmatka:Baghel100@cluster0.mongodb.net/mithunmatka?retryWrites=true&w=majority"; // Replace with your actual connection string

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Middleware ---
// Enable CORS for all routes
const allowedOrigins = [
    'https://sattamatka-online-play.netlify.app', // Your live Netlify site
    'http://localhost:5500',                      // Common local dev server (like VS Code Live Server)
    'http://127.0.0.1:5500'                       // Another common local dev server address
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));
// Parse JSON bodies
app.use(express.json());
// --- API Routes ---

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token (for now, just user data)
 * @access  Public
 */
app.post('/api/users/login', async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ mobile });

    // Check for user
    if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    // On successful login, return user data (excluding password)
    res.json({
        msg: 'Login successful!',
        user: {
            id: user._id, // Use MongoDB's _id
            name: user.name,
            mobile: user.mobile,
            balance: user.balance,
            isAdmin: user.isAdmin
        }
    });
});

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
app.post('/api/users/register', async (req, res) => {
    const { name, mobile, password } = req.body;

    // Validation
    if (!name || !mobile || !password) {
        return res.status(400).json({ msg: 'Please fill in all fields.' });
    }

    // Check if mobile number is already registered
    const userExists = await User.findOne({ mobile });
    if (userExists) {
        return res.status(400).json({ msg: 'This mobile number is already registered.' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object
    const newUser = new User({
        name, mobile, password: hashedPassword,
        balance: 0.00, isAdmin: false, photo: '',
        accountNumber: '', ifscCode: '', branchName: '',
        upiId: '', isActive: true
    });

    const savedUser = await newUser.save();

    res.status(201).json({
        msg: 'Registration successful!',
        user: { id: savedUser._id, name: savedUser.name, mobile: savedUser.mobile }
    });
});

/**
 * @route   POST /api/auth/request-otp
 * @desc    Request a password reset OTP.
 * @access  Public
 */
app.post('/api/auth/request-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(400).json({ msg: 'Mobile number is required.' });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
        return res.status(404).json({ msg: 'No account found with this mobile number.' });
    }

    // Special flow for admin
    if (mobile === '8965812465') {
        return res.json({ isAdmin: true, msg: 'Admin account detected. Please enter the master recovery key.' });
    }

    // For regular users, generate and send a fake OTP for the client to handle
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    res.json({ otp: otp, msg: 'OTP has been sent.' });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset the user's password.
 * @access  Public
 */
app.post('/api/auth/reset-password', async (req, res) => {
    const { mobile, newPassword } = req.body;

    if (!mobile || !newPassword) {
        return res.status(400).json({ msg: 'Mobile number and new password are required.' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ msg: 'Password must be at least 4 characters long.' });
    }

    // Hash the new password before updating
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findOneAndUpdate({ mobile }, { password: hashedPassword });

    if (!updatedUser) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Password has been reset successfully! You can now log in with your new password.' });
});

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private (relies on userId from client)
 */
app.post('/api/users/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    // Validation
    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ msg: 'Please provide all required fields.' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ msg: 'New password must be at least 4 characters long.' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect current password. Please try again.' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully! Please log in again with your new password.' });
});

/**
 * @route   POST /api/bids/submit
 * @desc    Submit user bids for a game
 * @access  Private (we trust the userId from the client for now)
 */
app.post('/api/bids/submit', async (req, res) => {
    const { userId, bids, gameName } = req.body;

    if (!userId || !bids || !Array.isArray(bids) || bids.length === 0 || !gameName) {
        return res.status(400).json({ msg: 'Invalid request. Please provide userId, gameName, and bids.' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    const totalAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);

    if (user.balance < totalAmount) {
        return res.status(400).json({
            msg: `Insufficient balance. Your balance is ₹${user.balance.toFixed(2)}, but you need ₹${totalAmount.toFixed(2)}.`,
            insufficientBalance: true
        });
    }

    user.balance -= totalAmount;

    const newHistoryEntries = bids.map(bid => ({
        userId: userId,
        game: gameName,
        transactionId: bid.transactionId,
        type: bid.type,
        number: bid.value,
        amount: bid.amount,
        date: new Date().toISOString(),
        result: 'Pending'
    }));

    await History.insertMany(newHistoryEntries);
    await user.save();

    res.json({ msg: 'Bids submitted successfully!', newBalance: user.balance });
});

/**
 * @route   POST /api/transactions/deposit
 * @desc    Create a new deposit request for a user
 * @access  Private (relies on userId from client)
 */
app.post('/api/transactions/deposit', async (req, res) => {
    const { userId, amount, transactionId } = req.body;

    if (!userId || !amount || !transactionId) {
        return res.status(400).json({ msg: 'User ID, amount, and transaction ID are required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    const depositRequest = new History({
        userId: userId,
        userName: user.name, // Store name for easy display in admin panel
        type: 'DepositRequest', // A temporary type for admin to see
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        status: 'Pending', // Admin needs to approve this
        transactionId: transactionId
    });

    await depositRequest.save();

    res.status(201).json({
        msg: 'Your deposit request has been submitted. It will be reviewed by the admin shortly.'
    });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user data by ID
 * @access  Private (for now, we trust the client)
 */
app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword.toObject()); // Convert Mongoose doc to plain object
});

/**
 * @route   PATCH /api/users/profile/:id
 * @desc    Update user profile
 * @access  Private (for now, we trust the client)
 */
app.patch('/api/users/profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, photo, accountNumber, ifscCode, branchName, upiId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name ?? user.name;
    user.photo = photo ?? user.photo;
    user.accountNumber = accountNumber ?? user.accountNumber;
    user.ifscCode = ifscCode ?? user.ifscCode;
    user.branchName = branchName ?? user.branchName;
    user.upiId = upiId ?? user.upiId;

    const updatedUser = await user.save();
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    res.json({ msg: 'Profile updated successfully!', user: userWithoutPassword });
});

/**
 * @route   GET /api/transactions/deposits
 * @desc    Get all pending deposit requests for admin
 * @access  Admin
 */
app.get('/api/transactions/deposits', async (req, res) => {
    const depositRequests = await History.find({ type: 'DepositRequest' }).sort({ date: -1 });
    res.json(depositRequests);
});

/**
 * @route   PATCH /api/transactions/deposits/:id
 * @desc    Approve or reject a deposit request
 * @access  Admin
 */
app.patch('/api/transactions/deposits/:id', async (req, res) => {
    const transactionId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'

    if (!action || (action !== 'approve' && action !== 'reject')) {
        return res.status(400).json({ msg: 'Invalid action specified.' });
    }

    const requestEntry = await History.findOne({ transactionId: transactionId, type: 'DepositRequest' });

    if (!requestEntry) {
        return res.status(404).json({ msg: 'Deposit request not found or already processed.' });
    }

    if (action === 'approve') {
        const user = await User.findById(requestEntry.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User associated with this request not found.' });
        }

        // Add balance to user
        user.balance += requestEntry.amount;
        await user.save();

        // Update history entry
        requestEntry.status = 'Approved';
        requestEntry.type = 'Deposit'; // Finalize the type
        await requestEntry.save();

        res.json({ msg: `Request approved. ₹${requestEntry.amount.toFixed(2)} added to user's balance.` });

    } else { // action === 'reject'
        requestEntry.status = 'Rejected';
        requestEntry.type = 'Deposit'; // Finalize the type
        await requestEntry.save();
        res.json({ msg: 'Request has been rejected.' });
    }
});

/**
 * @route   POST /api/transactions/withdraw
 * @desc    Create a new withdrawal request for a user
 * @access  Private (relies on userId from client)
 */
app.post('/api/transactions/withdraw', async (req, res) => {
    const { userId, amount } = req.body;
    const withdrawalAmount = parseFloat(amount);

    if (!userId || !withdrawalAmount) {
        return res.status(400).json({ msg: 'User ID and amount are required.' });
    }

    if (withdrawalAmount < 1000) {
        return res.status(400).json({ msg: 'Minimum withdrawal amount is ₹1,000.' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    if (user.balance < withdrawalAmount) {
        return res.status(400).json({ msg: 'Withdrawal amount cannot be more than your current balance.' });
    }

    const withdrawalRequest = new History({
        transactionId: `WDR${Date.now().toString().slice(-7)}`,
        userId: userId,
        userName: user.name,
        type: 'WithdrawalRequest',
        amount: withdrawalAmount,
        date: new Date().toISOString(),
        status: 'Pending'
    });

    await withdrawalRequest.save();

    res.status(201).json({ msg: 'Your withdrawal request has been submitted successfully. It will be processed shortly.' });
});

// --- Serve Static Files (Must be AFTER API routes) ---
// Serve static files (HTML, CSS, client-side JS) from the current directory
app.use(express.static(path.join(__dirname)));

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});