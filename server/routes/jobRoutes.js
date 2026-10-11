const express = require('express');
const router = express.Router();
const { createJob, getContractorJobs, getNearbyJobs } = require('../controllers/jobController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/jobs
// @desc    Create a new job (Contractor Only)
router.post('/', auth, authorize('contractor'), createJob);

// @route   GET /api/jobs/contractor
// @desc    Get all jobs posted by the logged-in contractor
router.get('/contractor', auth, authorize('contractor'), getContractorJobs);

// @route   GET /api/jobs/nearby
// @desc    Get nearby jobs for workers
router.get('/nearby', auth, authorize('worker'), getNearbyJobs);

module.exports = router;
