const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    translations: {
        hi: {
            title: String,
            description: String
        },
        te: {
            title: String,
            description: String
        },
        mr: {
            title: String,
            description: String
        },
        pa: {
            title: String,
            description: String
        }
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
jobSchema.index({ location: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
