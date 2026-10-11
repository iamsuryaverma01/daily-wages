const User = require('../models/User');

// @desc    Get workers within radius
// @route   GET /api/contractors/workers
// @access  Private (Contractor)
exports.getNearbyWorkers = async (req, res) => {
    try {
        const { lng, lat, radius = 5 } = req.query; // radius in km, default 5km

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Please provide longitude and latitude' });
        }

        // Convert radius from km to meters (MongoDB uses meters for $maxDistance)
        const parsedLng = parseFloat(lng);
        const parsedLat = parseFloat(lat);
        const maxDistance = parseFloat(radius) * 1000;

        if (isNaN(parsedLng) || isNaN(parsedLat)) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        const query = {
            role: 'worker',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    $maxDistance: maxDistance
                }
            }
        };

        if (req.query.workType) {
            query.workTypes = req.query.workType;
        }

        const workers = await User.find(query).select('name phone location language pincode workTypes averageRating totalRatings');

        res.json(workers);
    } catch (error) {
        console.error('getNearbyWorkers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Track call clicks
// @route   PATCH /api/contractors/workers/:id/call
// @access  Private (Contractor)
exports.trackCall = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.callCount = (worker.callCount || 0) + 1;
        await worker.save();

        res.json({ message: 'Call tracked', callCount: worker.callCount });
    } catch (error) {
        console.error('trackCall error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
