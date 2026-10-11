const Job = require('../models/Job');
const translate = require('translate-google');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Contractor)
exports.createJob = async (req, res) => {
    try {
        const { title, description, pincode, coordinates } = req.body;

        if (!title || !description || !pincode || !coordinates) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Auto-translation for supported languages
        const translations = {
            hi: { title: '', description: '' },
            te: { title: '', description: '' },
            mr: { title: '', description: '' },
            pa: { title: '', description: '' }
        };

        try {
            // Translate to Hindi, Telugu, Marathi, and Punjabi
            const targetLangs = ['hi', 'te', 'mr', 'pa'];

            await Promise.all(targetLangs.map(async (lang) => {
                const [tTitle, tDesc] = await Promise.all([
                    translate(title, { to: lang }),
                    translate(description, { to: lang })
                ]);
                translations[lang] = { title: tTitle, description: tDesc };
            }));
        } catch (transError) {
            console.error('Translation error:', transError);
            // Fallback: keep original if translation fails
        }

        const job = await Job.create({
            title,
            description,
            translations,
            pincode,
            location: {
                type: 'Point',
                coordinates: coordinates // [longitude, latitude]
            },
            contractor: req.user.id
        });

        res.status(201).json({
            message: 'Job posted successfully',
            job
        });
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all jobs posted by the logged-in contractor
// @route   GET /api/jobs/contractor
// @access  Private (Contractor)
exports.getContractorJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ contractor: req.user.id }).sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        console.error(`${req.method} ${req.url} error:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get nearby jobs for workers
// @route   GET /api/jobs/nearby
// @access  Private (Worker)
exports.getNearbyJobs = async (req, res) => {
    try {
        const { lng, lat, radius = 50 } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Longitude and latitude are required' });
        }

        const radiusInMeters = parseFloat(radius) * 1000;
        const workerLang = req.query.lang || req.user?.language || 'en';

        const parsedLng = parseFloat(lng);
        const parsedLat = parseFloat(lat);

        if (isNaN(parsedLng) || isNaN(parsedLat)) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        let jobs = await Job.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    $maxDistance: radiusInMeters
                }
            }
        }).populate('contractor', 'name phone');

        // Map jobs to use translated content if available
        const langJobs = jobs.map(job => {
            const jobObj = job.toObject();
            if (workerLang !== 'en' && jobObj.translations && jobObj.translations[workerLang]) {
                const translation = jobObj.translations[workerLang];
                return {
                    ...jobObj,
                    title: translation.title || jobObj.title,
                    description: translation.description || jobObj.description
                };
            }
            return jobObj;
        });

        res.json(langJobs);
    } catch (error) {
        console.error('getNearbyJobs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
