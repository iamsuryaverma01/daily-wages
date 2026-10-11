const express = require('express');
const router = express.Router();
const { getNearbyWorkers, trackCall } = require('../controllers/contractorController');
const { auth, authorize } = require('../middleware/auth');

router.get('/workers', auth, authorize('contractor'), getNearbyWorkers);
router.patch('/workers/:id/call', auth, authorize('contractor'), trackCall);

module.exports = router;
