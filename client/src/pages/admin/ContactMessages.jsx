import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Search, Eye, Mail, Phone, Download } from 'lucide-react';
// Make sure you expose this in your services: contactAPI.getAll({ page, limit, q })
import { contactAPI } from '../../services/api';
import { downloadBlob } from '../../utils/download';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 20))),
    [total, limit]
  );

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = { page, limit, q: searchTerm || '' };
      const res = await contactAPI.getAll(params);
      // Expecting payload: { success, page, limit, total, totalPages, items }
      setMessages(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadMessages();
  };

  const handleDownloadAll = async () => {
    try {
      toast.loading('Generating CSV…');
      const csv = generateCSV(messages);
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `contact-messages-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  const generateCSV = (rows) => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Topic',
      'Branch',
      'Message',
      'Agree',
      'Created At',
    ];
    const data = rows.map((m) => [
      safeCSV(m.name),
      safeCSV(m.email),
      safeCSV(m.phone),
      safeCSV(m.topic),
      safeCSV(m.branch),
      safeCSV(m.message),
      m.agree ? 'Yes' : 'No',
      new Date(m.createdAt).toISOString(),
    ]);
    return [headers.join(','), ...data.map((r) => r.join(','))].join('\n');
  };

  const safeCSV = (v) => {
    if (v == null) return '';
    const s = String(v);
    // Escape quotes and wrap fields containing commas/newlines
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const viewDetails = (msg) => {
    setSelectedMessage(msg);
    setShowDetailsModal(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-600 mt-1">View and manage user inquiries and feedback</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadAll} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              Download CSV
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total Messages:</span>
              <span className="text-xl font-bold text-primary-600">{total}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or message…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium text-gray-900">{m.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{m.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{m.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{m.topic || '—'}</Badge>
                    </TableCell>
                    <TableCell>{m.branch || '—'}</TableCell>
                    <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewDetails(m)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm">
          <span>
            Page {page} of {totalPages} — {total} total
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMessage(null);
        }}
        title={selectedMessage ? `Message from ${selectedMessage.name}` : 'Message Details'}
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{selectedMessage.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="font-medium">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Topic</p>
                <Badge variant="info">{selectedMessage.topic || '—'}</Badge>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Branch</p>
                <p className="font-medium">{selectedMessage.branch || '—'}</p>
              </div>
            </div>

            {/* Message */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Message</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            {/* Consent */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Consent to be contacted</p>
                <Badge variant={selectedMessage.agree ? 'success' : 'warning'}>
                  {selectedMessage.agree ? 'Agreed' : 'Not Agreed'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminContactMessages;