import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import Badge from '../components/Badge';
import { Calendar, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateFormat';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await appointmentsAPI.getMy(params);
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentsAPI.cancel(appointmentId);
      toast.success('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const openUpdateModal = (appointment) => {
    setEditingAppointment(appointment);
    setShowUpdateModal(true);
  };

  const handleUpdateAppointment = async (updatedData) => {
    try {
      await appointmentsAPI.update(editingAppointment._id, updatedData);
      toast.success('Appointment updated successfully. Awaiting approval.');
      setShowUpdateModal(false);
      setEditingAppointment(null);
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
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

  // Format date safely - handles timezone issues
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Use UTC to avoid timezone shift
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return `${months[month]} ${day}, ${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <Link to="/book-appointment" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Book New Appointment</span>
        </Link>
      </div>

      <div className="card mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Appointments</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No appointments found</h2>
          <p className="text-gray-600 mb-6">Book your first e-waste drop-off appointment</p>
          <Link to="/book-appointment" className="btn-primary inline-block">
            Book Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-lg font-bold text-gray-900">
                      {appointment.appointmentNumber || 'N/A'}
                    </p>
                    <Badge variant={getStatusBadge(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Appointment Date</p>
                  <p className="text-lg font-bold text-primary-600">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{appointment.appointmentTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium">{appointment.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items to Drop-off</p>
                  <p className="font-medium">{appointment.items?.length || 0} items</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Items:</p>
                <div className="space-y-2">
                  {appointment.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{item.itemName}</span>
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {appointment.notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Notes:</p>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {appointment.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => openUpdateModal(appointment)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Update
                    </button>
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="btn-danger"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Appointment Modal */}
      {showUpdateModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Appointment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateAppointment({
                date: formData.get('date'),
                timeSlot: formData.get('timeSlot'),
                notes: formData.get('notes')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingAppointment.appointmentDate?.split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Slot</label>
                  <select
                    name="timeSlot"
                    defaultValue={editingAppointment.appointmentTime}
                    className="input-field"
                    required
                  >
                    <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
                    <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</option>
                    <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    name="notes"
                    defaultValue={editingAppointment.notes}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setEditingAppointment(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;