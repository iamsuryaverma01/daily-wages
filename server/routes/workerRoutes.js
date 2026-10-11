const express = require('express');
const router = express.Router();
const { updateWorkerProfile, getWorkerProfile } = require('../controllers/workerController');
const { auth, authorize } = require('../middleware/auth');

router.get('/me', auth, authorize('worker'), getWorkerProfile);
router.put('/me', auth, authorize('worker'), updateWorkerProfile);

module.exports = router;
