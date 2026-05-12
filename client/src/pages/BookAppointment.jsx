import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '9:00 AM - 11:00 AM',
    branch: 'Colombo Fort',
    notes: ''
  });

  const [items, setItems] = useState([
    { itemName: '', quantity: 1, description: '' }
  ]);

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];

  const branches = ['Colombo Fort', 'Kandy City', 'Galle Main', 'Negombo'];

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate items
    if (items.some(item => !item.itemName.trim())) {
      toast.error('Please fill in all item names');
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData = {
        ...formData,
        items: items.map(item => ({
          itemName: item.itemName,
          quantity: parseInt(item.quantity),
          description: item.description
        }))
      };

      await appointmentsAPI.create(appointmentData);
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book E-Waste Drop-off</h1>
        <p className="text-gray-600 mt-2">Schedule a convenient time to drop off your e-waste</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 text-primary-600" size={24} />
            Date & Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot *
              </label>
              <select
                required
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="input-field"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Branch */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Branch</h2>
          <select
            required
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            className="input-field"
          >
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Items to Drop-off</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.itemName}
                      onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Old Laptop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="input-field"
                    rows={2}
                    placeholder="Additional details about the item..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input-field"
            rows={4}
            placeholder="Any special instructions or information we should know..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-appointments')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;