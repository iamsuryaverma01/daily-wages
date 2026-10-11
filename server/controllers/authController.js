const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, phone, password, role, location, language, pincode, workTypes } = req.body;

        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        user = new User({
            name,
            phone,
            password: phone, // Always use phone as password
            role: role || 'worker',
            location: location || { type: 'Point', coordinates: [0, 0] },
            language: language || 'en',
            pincode,
            workTypes: role === 'worker' ? (workTypes || []) : []
        });

        await user.save();

        res.status(201).json({
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                location: user.location,
                language: user.language,
                pincode: user.pincode,
                workTypes: user.workTypes,
                averageRating: user.averageRating,
                totalRatings: user.totalRatings
            }
        });
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user (Contractor/Worker)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phone, password, language } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        // Use phone as password since we are removing password field from UI
        const loginPassword = password || phone;

        const isMatch = await user.comparePassword(loginPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        // Update language preference if provided during login
        const supportedLangs = ['en', 'hi', 'bn', 'te', 'mr', 'pa'];
        if (language && supportedLangs.includes(language)) {
            user.language = language;
            await user.save();
        }

        res.json({
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                location: user.location,
                language: user.language,
                pincode: user.pincode,
                workTypes: user.workTypes,
                averageRating: user.averageRating,
                totalRatings: user.totalRatings
            }
        });
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile (e.g. phone number)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { phone, name, pincode, coordinates, workTypes } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (pincode) user.pincode = pincode;
        if (workTypes && Array.isArray(workTypes)) user.workTypes = workTypes;
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            user.location = { type: 'Point', coordinates };
        }

        if (phone) {
            // Check if another user already has this phone
            const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
            user.phone = phone;
            user.password = phone; // Maintain phone as password logic
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                location: user.location,
                language: user.language,
                pincode: user.pincode,
                workTypes: user.workTypes,
                averageRating: user.averageRating,
                totalRatings: user.totalRatings
            }
        });
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
