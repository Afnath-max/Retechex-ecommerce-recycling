import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { adminAPI } from '../../services/api';
import { Plus, Trash2, Search, Users, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/download';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    assignedBranch: 'Colombo Fort'
  });

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createStaff(staffData);
      toast.success('Staff member created successfully');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) return;
    
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const resetForm = () => {
    setStaffData({
      name: '',
      email: '',
      password: '',
      phone: '',
      assignedBranch: 'Colombo Fort'
    });
  };

  const getRoleBadge = (role) => {
    const variants = {
      'admin': 'danger',
      'staff': 'info',
      'customer': 'success'
    };
    return variants[role] || 'default';
  };

  const handleDownloadUsersReport = () => {
    try {
      toast.loading('Generating report...');
      const csvContent = generateUsersCSV(users);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `users-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  const generateUsersCSV = (users) => {
    const headers = ['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined Date'];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.role,
      u.phone || 'N/A',
      u.isActive ? 'Active' : 'Inactive',
      new Date(u.createdAt).toLocaleDateString()
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users and create staff accounts</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadUsersReport()}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Staff Account</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                className="input-field pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'customer').length}
            </p>
          </div>
          <div className="card bg-purple-50">
            <p className="text-sm text-gray-600">Total Staff</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'staff').length}
            </p>
          </div>
          <div className="card bg-red-50">
            <p className="text-sm text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-2 text-gray-400" />
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.assignedBranch || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.role !== 'admin' && (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                          </select>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Staff Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Staff Account"
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={staffData.name}
              onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={staffData.email}
              onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
              className="input-field"
              placeholder="john@retechex.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={staffData.phone}
              onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
              className="input-field"
              placeholder="0771234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={staffData.password}
              onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
              className="input-field"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Branch *</label>
            <select
              required
              value={staffData.assignedBranch}
              onChange={(e) => setStaffData({ ...staffData, assignedBranch: e.target.value })}
              className="input-field"
            >
              <option value="Colombo Fort">Colombo Fort</option>
              <option value="Kandy City">Kandy City</option>
              <option value="Galle Main">Galle Main</option>
              <option value="Negombo">Negombo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Staff Account
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;