// src/pages/staff/StaffAppointments.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { appointmentsAPI } from '../../services/api';
import { Calendar, Check, X, Eye, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateFormat';

const StaffAppointments = () => {
  // Fetch-once source data (no refetch on sort/filter)
  const [sourceAppointments, setSourceAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // UI filters (client-side only)
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Client-side sorting
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', dir: 'desc' });

  // ---------- FETCH ONCE ----------
  useEffect(() => {
    const fetchOnce = async () => {
      try {
        setLoading(true);
        const res = await appointmentsAPI.getAll({}); // fetch everything once
        setSourceAppointments(res.data.appointments || []);
      } catch (e) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchOnce();
  }, []);

  // ---------- HELPERS ----------
  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'warning',
      Approved: 'info',
      Completed: 'success',
      Cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const branches = ['Colombo Fort', 'Kandy City', 'Galle Main', 'Negombo'];

  const parseTimeToMinutes = (s) => {
    if (!s) return 0;
    // Supports "9:00 AM - 11:00 AM" or "9:00 AM"
    const start = s.split('-')[0]?.trim() || s.trim();
    const m = start.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10) % 12;
    const minutes = m[2] ? parseInt(m[2], 10) : 0;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + minutes;
  };

  const valueForKey = (apt, key) => {
    switch (key) {
      case 'customer':
        return (apt.user?.name || '').toLowerCase();
      case 'datetime': {
        const base = new Date(apt.appointmentDate || 0).getTime();
        const add = parseTimeToMinutes(apt.appointmentTime || apt.timeSlot || '');
        return base + add * 60 * 1000;
      }
      case 'branch':
        return (apt.branch || '').toLowerCase();
      case 'items':
        return apt.items?.length || 0;
      case 'status':
        return (apt.status || '').toLowerCase();
      default:
        return '';
    }
  };

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const SortHead = ({ label, k }) => {
    const active = sortConfig.key === k;
    const Icon = active ? (sortConfig.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // protect from any parent <form>
          e.stopPropagation();
          toggleSort(k);
        }}
        onMouseDown={(e) => e.preventDefault()} // prevent focus-triggered submits in some wrappers
        className="inline-flex items-center gap-1 select-none"
        title={`Sort by ${label}`}
      >
        <span>{label}</span>
        <Icon size={14} className="opacity-70" />
      </button>
    );
  };

  // ---------- PURE CLIENT FILTER + SORT PIPELINE ----------
  const filteredAppointments = useMemo(() => {
    return sourceAppointments.filter((a) => {
      const okStatus = !statusFilter || a.status === statusFilter;
      const okBranch = !branchFilter || a.branch === branchFilter;
      return okStatus && okBranch;
    });
  }, [sourceAppointments, statusFilter, branchFilter]);

  const sortedAppointments = useMemo(() => {
    const arr = [...filteredAppointments];
    const { key, dir } = sortConfig;
    arr.sort((a, b) => {
      const va = valueForKey(a, key);
      const vb = valueForKey(b, key);
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }
      return dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [filteredAppointments, sortConfig]);

  // ---------- MUTATIONS (update local state only) ----------
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      setSourceAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: newStatus } : a))
      ); // no refetch, no reload
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    try {
      await appointmentsAPI.delete(appointmentId);
      toast.success('Appointment deleted');
      setSourceAppointments((prev) => prev.filter((a) => a._id !== appointmentId)); // no refetch
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

  // ---------- RENDER ----------
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="spinner" />
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Appointments:</span>
            {/* CHANGED: count uses visible rows (sorted/filtered) */}
            <span className="text-xl font-bold text-primary-600">{sortedAppointments.length}</span>
          </div>
        </div>

        {/* Filters (client-side; no fetch) */}
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
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortHead label="Customer" k="customer" /></TableHead>
                <TableHead><SortHead label="Date & Time" k="datetime" /></TableHead>
                <TableHead><SortHead label="Branch" k="branch" /></TableHead>
                <TableHead className="text-center"><SortHead label="Items" k="items" /></TableHead>
                <TableHead><SortHead label="Status" k="status" /></TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAppointments.map((appointment) => (
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
                        <p className="text-sm text-gray-600">
                          {appointment.appointmentTime || appointment.timeSlot}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.branch}</TableCell>
                    <TableCell className="text-center">
                      <span className="badge badge-info">{appointment.items?.length || 0} items</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); viewDetails(appointment._id); }}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleDeleteAppointment(appointment._id); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Appointment"
                        >
                          <Trash2 size={18} />
                        </button>

                        {appointment.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); updateStatus(appointment._id, 'Approved'); }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); updateStatus(appointment._id, 'Cancelled'); }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}

                        {appointment.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); updateStatus(appointment._id, 'Completed'); }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            title="Mark Complete"
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

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedAppointment(null); }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Name:</span> {selectedAppointment.user?.name}</p>
                <p><span className="font-medium">Email:</span> {selectedAppointment.user?.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedAppointment.user?.phone}</p>
              </div>
            </div>

            {/* Appointment */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Date:</span> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time Slot:</span> {selectedAppointment.appointmentTime || selectedAppointment.timeSlot}</p>
                <p><span className="font-medium">Branch:</span> {selectedAppointment.branch}</p>
                <p>
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadge(selectedAppointment.status)} className="ml-2">
                    {selectedAppointment.status}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Items for Drop-off</h3>
              <div className="space-y-2">
                {selectedAppointment.items?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
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

export default StaffAppointments;
