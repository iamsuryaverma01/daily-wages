const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getJobApplications,
    acceptApplication,
    rejectApplication,
    completeJob,
    getWorkerApplications,
    getWorkerReviews
} = require('../controllers/applicationController');
const { auth, authorize } = require('../middleware/auth');

router.post('/apply/:jobId', auth, authorize('worker'), applyForJob);
router.get('/job/:jobId', auth, authorize('contractor'), getJobApplications);
router.patch('/:appId/accept', auth, authorize('contractor'), acceptApplication);
router.patch('/:appId/reject', auth, authorize('contractor'), rejectApplication);
router.patch('/:appId/complete', auth, authorize('contractor'), completeJob);
router.get('/worker/me', auth, authorize('worker'), getWorkerApplications);
router.get('/reviews/:workerId', auth, getWorkerReviews);

module.exports = router;
