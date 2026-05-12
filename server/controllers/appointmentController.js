import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendAppointmentConfirmationEmail } from '../utils/emailService.js';
import { generateAppointmentsReportPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private/Customer
export const createAppointment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { date, timeSlot, branch, items, notes } = req.body;

  // Validate required fields
  if (!date || !timeSlot || !branch || !items || items.length === 0) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Get user info for customer details
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const customerInfo = {
    name: user.name,
    email: user.email,
    phone: user.phone || 'Not provided'
  };

  // Parse date correctly - set to noon to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const appointmentDate = new Date(year, month - 1, day, 12, 0, 0, 0);

  console.log('📅 Date received:', date);
  console.log('📅 Date parsed:', appointmentDate);

  // Check if slot is already booked
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  
  const existingAppointment = await Appointment.findOne({
    branch,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    appointmentTime: timeSlot,
    status: { $ne: 'Cancelled' }
  });

  if (existingAppointment) {
    res.status(409);
    throw new Error('This time slot is already booked');
  }

  // Generate appointment number
  const today = new Date();
  const yearStr = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yearStr}${monthStr}${dayStr}`;
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const count = await Appointment.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  const appointmentNumber = `APT-${dateStr}-${sequence}`;

  // Create appointment
  const appointment = await Appointment.create({
    appointmentNumber,
    user: userId,
    customerInfo,
    branch,
    appointmentDate,
    appointmentTime: timeSlot,
    items,
    notes
  });

  // Populate user info
  await appointment.populate('user', 'name email phone');

  // DON'T send email here - only send when admin approves
  // Email will be sent in updateAppointmentStatus when status changes to 'Approved'

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully. Awaiting approval.',
    appointment
  });
});

// @desc    Get customer's appointments
// @route   GET /api/appointments/my
// @access  Private/Customer
export const getMyAppointments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, branch, page = 1, limit = 10 } = req.query;

  let query = { user: userId };
  if (status) query.status = status;
  if (branch) query.branch = branch;

  const skip = (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find(query)
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    count: appointments.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    appointments
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('user', 'name email phone');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check ownership (unless admin/staff)
  if (req.user.role === 'customer' && appointment.user._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({
    success: true,
    appointment
  });
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private/Customer
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (appointment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (appointment.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending appointments can be cancelled');
  }

  appointment.status = 'Cancelled';
  await appointment.save();

  res.json({
    success: true,
    message: 'Appointment cancelled',
    appointment
  });
});

// @desc    Update appointment (Customer)
// @route   PATCH /api/appointments/:id
// @access  Private/Customer
export const updateAppointment = asyncHandler(async (req, res) => {
  const { date, timeSlot, branch, items, notes } = req.body;
  
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (appointment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Only pending appointments can be updated
  if (appointment.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending appointments can be updated');
  }

  // Update fields if provided
  if (date) {
    const [year, month, day] = date.split('-').map(Number);
    appointment.appointmentDate = new Date(year, month - 1, day, 12, 0, 0, 0);
  }
  
  if (timeSlot) appointment.appointmentTime = timeSlot;
  if (branch) appointment.branch = branch;
  if (items) appointment.items = items;
  if (notes !== undefined) appointment.notes = notes;

  await appointment.save();

  res.json({
    success: true,
    message: 'Appointment updated successfully. Awaiting approval.',
    appointment
  });
});

// @desc    Get all appointments (Staff/Admin)
// @route   GET /api/appointments/all/list
// @access  Private/Staff/Admin
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, branch, date, search, page = 1, limit = 20 } = req.query;

  let query = {};
  
  if (status) query.status = status;
  if (branch) query.branch = branch;
  
  if (date) {
    const searchDate = new Date(date);
    query.appointmentDate = {
      $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
      $lt: new Date(searchDate.setHours(23, 59, 59, 999))
    };
  }

  if (search) {
    query.$or = [
      { 'customerInfo.name': { $regex: search, $options: 'i' } },
      { 'customerInfo.email': { $regex: search, $options: 'i' } },
      { 'customerInfo.phone': { $regex: search, $options: 'i' } },
      { 'items.itemName': { $regex: search, $options: 'i' } },
      { branch: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find(query)
    .populate('user', 'name email')
    .sort({ appointmentDate: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    count: appointments.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    appointments
  });
});

// @desc    Update appointment status (Staff/Admin)
// @route   PATCH /api/appointments/:id/status
// @access  Private/Staff/Admin
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const appointment = await Appointment.findById(req.params.id).populate('user', 'name email');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  
  appointment.statusHistory.push({
    status,
    updatedBy: req.user.id,
    note
  });

  await appointment.save();

  // Send email ONLY when status changes to 'Approved'
  if (status === 'Approved' && oldStatus !== 'Approved') {
    try {
      await sendAppointmentConfirmationEmail(
        appointment.customerInfo.email,
        appointment.customerInfo.name,
        appointment
      );
      console.log('✅ Appointment approval email sent to:', appointment.customerInfo.email);
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);
      // Don't fail the status update if email fails
    }
  }

  res.json({
    success: true,
    message: 'Appointment status updated',
    appointment
  });
});

// @desc    Download appointments report PDF
// @route   GET /api/appointments/report/pdf
// @access  Private/Staff/Admin
export const downloadAppointmentsReportPDF = asyncHandler(async (req, res) => {
  const { status, branch, date, search } = req.query;

  let query = {};
  if (status) query.status = status;
  if (branch) query.branch = branch;
  if (date) {
    const searchDate = new Date(date);
    query.appointmentDate = {
      $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
      $lt: new Date(searchDate.setHours(23, 59, 59, 999))
    };
  }
  if (search) {
    query.$or = [
      { 'customerInfo.name': { $regex: search, $options: 'i' } },
      { 'customerInfo.email': { $regex: search, $options: 'i' } },
      { 'customerInfo.phone': { $regex: search, $options: 'i' } },
      { 'items.itemName': { $regex: search, $options: 'i' } },
      { branch: { $regex: search, $options: 'i' } }
    ];
  }

  const appointments = await Appointment.find(query)
    .sort({ appointmentDate: -1 })
    .populate('user', 'name email');

  try {
    const pdfPath = await generateAppointmentsReportPDF(appointments, req.query);
    
    res.download(pdfPath, `appointments-report-${Date.now()}.pdf`, (err) => {
      fs.unlinkSync(pdfPath);
      
      if (err) {
        console.error('PDF download error:', err);
        res.status(500);
        throw new Error('Failed to download PDF');
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500);
    throw new Error('Failed to generate PDF report');
  }
});

// @desc    Delete appointment (hard delete)
// @route   DELETE /api/appointments/:id
// @access  Private (Customer owns it or Admin/Staff)
export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isOwner = appointment.user.toString() === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized to delete this appointment');
  }

  await appointment.deleteOne();

  res.json({
    success: true,
    message: 'Appointment permanently deleted'
  });
});