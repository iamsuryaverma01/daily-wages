const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        trim: true
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
});

// A worker can only apply for a specific job once
jobApplicationSchema.index({ job: 1, worker: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
