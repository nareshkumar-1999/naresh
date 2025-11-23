const router = require('express').Router();
let User = require('./user.model.js'); // Corrected path for same directory
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Authentication Middleware ---
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user payload from token to request
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid.' });
    }
};


// --- 1. Register a new user ---
// URL: /users/register
router.post('/register', async (req, res) => {
    try {
        const { name, mobile, password } = req.body;

        // Simple validation
        if (!name || !mobile || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ mobile: mobile });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this mobile number already exists.' });
        }

        // The password will be hashed automatically by the pre-save hook in user.model.js
        const newUser = new User({ name, mobile, password });

        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Login a user ---
// URL: /users/login
router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Simple validation
        if (!mobile || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        // Check for existing user
        const user = await User.findOne({ mobile: mobile });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials. Password incorrect.' });
        }

        // --- Create and sign a JWT token ---
        const payload = {
            id: user._id,
            isAdmin: user.isAdmin
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        res.json({
            token,
            user: { id: user._id, name: user.name, mobile: user.mobile, balance: user.balance, isAdmin: user.isAdmin }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. Get all users (for Admin) ---
// URL: /users/
router.get('/', auth, async (req, res) => { // Protected route
    try {
        const searchTerm = req.query.search;
        let query = {};

        // If a search term is provided, create a query to search by name or mobile
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            query = {
                $or: [
                    { name: { $regex: regex } },
                    { mobile: { $regex: regex } }
                ]
            };
        }

        // Find users based on the query. If no search term, it finds all users.
        const users = await User.find(query);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. Update user balance (for Admin) ---
// URL: /users/update-balance/:id
router.patch('/update-balance/:id', auth, async (req, res) => { // Protected route
    try {
        const { balance } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { balance: balance }, { new: true });
        if (!updatedUser) return res.status(404).json({ msg: 'User not found.' });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. Delete a user (for Admin) ---
// URL: /users/:id
router.delete('/:id', auth, async (req, res) => { // Protected route
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ msg: 'User not found.' });
        res.json({ msg: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. Update user profile ---
// URL: /users/profile/:id
router.patch('/profile/:id', auth, async (req, res) => { // Protected route
    try {
        const { name, password } = req.body;
        const userId = req.params.id;

        // Security check: Ensure the logged-in user can only update their own profile
        if (req.user.id !== userId) {
            return res.status(403).json({ msg: 'Forbidden: You can only update your own profile.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Update fields if they are provided
        if (name) user.name = name;
        if (password) user.password = password; // The pre-save hook will hash it

        const updatedUser = await user.save();

        // Send back updated user data, excluding the password
        res.json({ id: updatedUser._id, name: updatedUser.name, mobile: updatedUser.mobile, balance: updatedUser.balance, isAdmin: updatedUser.isAdmin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. Add funds to user's wallet ---
// URL: /users/add-fund
router.patch('/add-fund', auth, async (req, res) => { // Protected route
    try {
        const { amount } = req.body;
        const userId = req.user.id; // Get user ID from the authenticated token

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ msg: 'Please provide a valid positive amount.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        user.balance += amount;
        const updatedUser = await user.save();

        res.json({ id: updatedUser._id, name: updatedUser.name, mobile: updatedUser.mobile, balance: updatedUser.balance, isAdmin: updatedUser.isAdmin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;