import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { appointmentsAPI } from '../../services/api';
import { Calendar, Search, Check, X, Eye, Download, Trash2 } from 'lucide-react'; // ⬅️ Import Trash2
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/download';
import { formatDate } from '../../utils/dateFormat';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, branchFilter]);

  const loadAppointments = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (branchFilter) params.branch = branchFilter;
      
      const response = await appointmentsAPI.getAll(params);
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };
  
  // ⬅️ ADDED DELETE FUNCTIONALITY
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) {
      return;
    }
    try {
      await appointmentsAPI.delete(appointmentId); // Assuming appointmentsAPI has a delete method
      toast.success('Appointment deleted successfully');
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const viewDetails = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.getById(appointmentId);
      setSelectedAppointment(response.data.appointment);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load appointment details');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Approved': 'info',
      'Completed': 'success',
      'Cancelled': 'danger'
    };
    return variants[status] || 'default';
  };

  const branches = ['Colombo Fort', 'Kandy City', 'Galle Main', 'Negombo'];

  const handleDownloadAppointmentsReport = async () => {
    try {
      toast.loading('Generating report...');
      const csvContent = generateAppointmentsCSV(appointments);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `appointments-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  const generateAppointmentsCSV = (appointments) => {
    const headers = ['Appointment Number', 'Customer', 'Date', 'Time', 'Branch', 'Items', 'Status'];
    const rows = appointments.map(apt => [
      apt.appointmentNumber,
      apt.customerInfo?.name || 'N/A',
      new Date(apt.appointmentDate).toLocaleDateString(),
      apt.appointmentTime,
      apt.branch,
      apt.items?.length || 0,
      apt.status
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600 mt-1">Manage e-waste drop-off appointments</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleDownloadAppointmentsReport()}
              className="btn-secondary flex items-center gap-2"
            >
              <Calendar size={18} />
              Download Report
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total Appointments:</span>
              <span className="text-xl font-bold text-primary-600">{appointments.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.user?.name}</p>
                        <p className="text-xs text-gray-500">{appointment.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                        <p className="text-sm text-gray-600">{appointment.appointmentTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.branch}</TableCell>
                    <TableCell>
                      <span className="badge badge-info">{appointment.items?.length || 0} items</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewDetails(appointment._id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {/* ⬅️ ADDED DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                        {appointment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(appointment._id, 'Approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => updateStatus(appointment._id, 'Cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {appointment.status === 'Approved' && (
                          <button
                            onClick={() => updateStatus(appointment._id, 'Completed')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Name:</span> {selectedAppointment.user?.name}</p>
                <p><span className="font-medium">Email:</span> {selectedAppointment.user?.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedAppointment.user?.phone}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Date:</span> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time Slot:</span> {selectedAppointment.timeSlot}</p>
                <p><span className="font-medium">Branch:</span> {selectedAppointment.branch}</p>
                <p><span className="font-medium">Status:</span> 
                  <Badge variant={getStatusBadge(selectedAppointment.status)} className="ml-2">
                    {selectedAppointment.status}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Items to Drop Off */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Items for Drop-off</h3>
              <div className="space-y-2">
                {selectedAppointment.items?.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminAppointments;