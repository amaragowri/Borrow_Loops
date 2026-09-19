const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllListingsAdmin,
  toggleListingApproval,
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Report route can be accessed by any authenticated user
router.post('/reports', protect, createReport);

// All other routes require Admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.get('/listings', getAllListingsAdmin);
router.put('/listings/:id/toggle-approval', toggleListingApproval);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);

module.exports = router;
