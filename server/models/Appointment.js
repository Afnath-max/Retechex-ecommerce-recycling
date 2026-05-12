import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  branch: {
    type: String,
    required: true
    // Removed enum - now accepts any branch name
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Generate appointment number before saving
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentNumber) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const count = await mongoose.model('Appointment').countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const sequence = String(count + 1).padStart(5, '0');
      this.appointmentNumber = `APT-${dateStr}-${sequence}`;
      
      console.log('Generated appointment number:', this.appointmentNumber);
    } catch (error) {
      console.error('Error generating appointment number:', error);
      this.appointmentNumber = `APT-${Date.now()}`;
    }
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;