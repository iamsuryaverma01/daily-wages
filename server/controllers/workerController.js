const User = require('../models/User');

// @desc    Update worker profile & location
// @route   PUT /api/workers/me
// @access  Private (Worker)
exports.updateWorkerProfile = async (req, res) => {
    try {
        const { name, phone, coordinates, language, pincode, workTypes } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (language) user.language = language;
        if (pincode) user.pincode = pincode;
        if (workTypes && Array.isArray(workTypes)) user.workTypes = workTypes;

        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            user.location = {
                type: 'Point',
                coordinates: coordinates // [longitude, latitude]
            };
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get worker own profile
// @route   GET /api/workers/me
// @access  Private (Worker)
exports.getWorkerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
