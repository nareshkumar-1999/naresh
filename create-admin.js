const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs'); // Import bcrypt

// --- Database Connection ---

// यह आपके server.js की कनेक्शन स्ट्रिंग से मेल खाना चाहिए
const MONGO_URI = "mongodb+srv://mithunmatka:Baghel100@cluster0.mongodb.net/mithunmatka?retryWrites=true&w=majority";

const createAdmin = async () => {
    try {
        // 1. डेटाबेस से कनेक्ट करें
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected for admin creation...');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Baghel@100', salt);

        // 2. एडमिन यूजर की डिटेल्स
        const adminDetails = {
            name: 'Admin',
            mobile: '8965812465',
            password: hashedPassword,
            isAdmin: true,
            balance: 9999,
            isActive: true
        };

        // 3. जांचें कि एडमिन यूजर पहले से मौजूद है या नहीं
        const existingAdmin = await User.findOne({ mobile: adminDetails.mobile });

        if (existingAdmin) {
            // If admin exists, just update the password to the hashed one
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('Admin user already exists. Password has been updated to the new hashed version.');

        } else {
            // 4. अगर मौजूद नहीं है, तो नया एडमिन यूजर बनाएं
            const adminUser = new User(adminDetails);
            await adminUser.save();
            console.log('✅ Admin user created successfully!');
            console.log('You can now log in with the admin credentials.');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        // 5. डेटाबेस कनेक्शन बंद करें
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

// स्क्रिप्ट चलाएं
createAdmin();