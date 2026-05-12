import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelAppointment,
  updateAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  downloadAppointmentsReportPDF,
  deleteAppointment // ⬅️ ADDED
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('customer'), createAppointment);
router.get('/my', authenticateToken, authorize('customer'), getMyAppointments);
router.get('/all/list', authenticateToken, authorize('admin', 'staff'), getAllAppointments);
router.get('/report/pdf', authenticateToken, authorize('admin', 'staff'), downloadAppointmentsReportPDF);
router.get('/:id', authenticateToken, getAppointment);
router.patch('/:id', authenticateToken, authorize('customer'), updateAppointment);
router.patch('/:id/cancel', authenticateToken, authorize('customer'), cancelAppointment);
router.patch('/:id/status', authenticateToken, authorize('admin', 'staff'), updateAppointmentStatus);


router.delete('/:id', authenticateToken, authorize('admin', 'staff'), deleteAppointment);

export default router;