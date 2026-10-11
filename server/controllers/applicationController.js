const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Worker)
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await JobApplication.findOne({
            job: req.params.jobId,
            worker: req.user.id
        });

        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        const application = await JobApplication.create({
            job: req.params.jobId,
            worker: req.user.id,
            contractor: job.contractor,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Successfully applied for the job',
            application
        });
    } catch (error) {
        console.error('applyForJob error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Contractor)
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.contractor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await JobApplication.find({ job: req.params.jobId })
            .populate('worker', 'name phone workTypes averageRating totalRatings')
            .sort('-appliedAt');

        res.json(applications);
    } catch (error) {
        console.error('getJobApplications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Accept a worker's application
// @route   PATCH /api/applications/:appId/accept
// @access  Private (Contractor)
exports.acceptApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.appId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.contractor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.status = 'accepted';
        application.acceptedAt = Date.now();
        await application.save();

        // Optionally reject all other pending applications for this job
        await JobApplication.updateMany(
            { job: application.job, _id: { $ne: application._id }, status: 'pending' },
            { status: 'rejected' }
        );

        res.json({
            message: 'Application accepted successfully',
            application
        });
    } catch (error) {
        console.error('acceptApplication error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject a worker's application
// @route   PATCH /api/applications/:appId/reject
// @access  Private (Contractor)
exports.rejectApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.appId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.contractor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.status = 'rejected';
        await application.save();

        res.json({
            message: 'Application rejected',
            application
        });
    } catch (error) {
        console.error('rejectApplication error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark job as completed and rate/feedback the worker
// @route   PATCH /api/applications/:appId/complete
// @access  Private (Contractor)
exports.completeJob = async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
        }

        const application = await JobApplication.findById(req.params.appId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.contractor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.status = 'completed';
        application.rating = rating;
        application.feedback = feedback;
        application.completedAt = Date.now();
        await application.save();

        // Recalculate worker rating
        const workerId = application.worker;
        const allCompleted = await JobApplication.find({
            worker: workerId,
            status: 'completed',
            rating: { $exists: true }
        });

        const totalRatings = allCompleted.length;
        const sumRatings = allCompleted.reduce((sum, app) => sum + app.rating, 0);
        const averageRating = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;

        await User.findByIdAndUpdate(workerId, {
            averageRating,
            totalRatings
        });

        res.json({
            message: 'Job completed and rated successfully',
            application
        });
    } catch (error) {
        console.error('completeJob error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get applications submitted by the logged-in worker
// @route   GET /api/applications/worker/me
// @access  Private (Worker)
exports.getWorkerApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({ worker: req.user.id })
            .populate({
                path: 'job',
                select: 'title description pincode'
            })
            .populate('contractor', 'name phone')
            .sort('-appliedAt');

        res.json(applications);
    } catch (error) {
        console.error('getWorkerApplications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all reviews of a specific worker
// @route   GET /api/applications/reviews/:workerId
// @access  Private
exports.getWorkerReviews = async (req, res) => {
    try {
        const reviews = await JobApplication.find({
            worker: req.params.workerId,
            status: 'completed',
            rating: { $exists: true }
        })
        .populate('contractor', 'name')
        .populate({
            path: 'job',
            select: 'title'
        })
        .select('rating feedback completedAt contractor job')
        .sort('-completedAt');

        res.json(reviews);
    } catch (error) {
        console.error('getWorkerReviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
