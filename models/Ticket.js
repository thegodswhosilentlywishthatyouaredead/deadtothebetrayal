const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'emergency'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['electrical', 'plumbing', 'hvac', 'general', 'emergency', 'maintenance'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'open'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    city: String,
    state: String,
    zipCode: String
  },
  customer: {
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
    },
    company: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FieldTeam',
    default: null
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cost: {
    estimated: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: null
    },
    travelCost: {
      type: Number,
      default: 0
    }
  },
  skillsRequired: [{
    type: String,
    enum: ['electrical', 'plumbing', 'hvac', 'general', 'emergency', 'maintenance']
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FieldTeam'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  customerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  customerFeedback: String,
  resolution: {
    summary: String,
    steps: [String],
    partsUsed: [{
      name: String,
      quantity: Number,
      cost: Number
    }]
  },
  assignmentHistory: [{
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FieldTeam'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    status: String
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
ticketSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Index for status and priority queries
ticketSchema.index({ status: 1, priority: 1 });

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Method to calculate urgency score
ticketSchema.methods.calculateUrgencyScore = function() {
  const priorityWeights = {
    'emergency': 10,
    'urgent': 8,
    'high': 6,
    'medium': 4,
    'low': 2
  };
  
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const ageWeight = Math.min(ageInHours / 24, 5); // Max 5 points for age
  
  return priorityWeights[this.priority] + ageWeight;
};

// Method to check if ticket can be assigned
ticketSchema.methods.canBeAssigned = function() {
  return this.status === 'open' || this.status === 'on-hold';
};

// Method to get estimated travel time (placeholder - would integrate with Google Maps API)
ticketSchema.methods.getEstimatedTravelTime = function(teamLocation) {
  // This would typically call Google Maps API for accurate travel time
  // For now, using a simple calculation based on distance
  const distance = this.calculateDistance(teamLocation);
  return Math.round(distance * 1.5); // Rough estimate: 1.5 minutes per km
};

// Method to calculate distance to a location
ticketSchema.methods.calculateDistance = function(targetLocation) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (targetLocation.latitude - this.location.latitude) * Math.PI / 180;
  const dLon = (targetLocation.longitude - this.location.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.latitude * Math.PI / 180) * Math.cos(targetLocation.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

module.exports = mongoose.model('Ticket', ticketSchema);
