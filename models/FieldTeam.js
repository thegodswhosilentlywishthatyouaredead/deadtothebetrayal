const mongoose = require('mongoose');

const fieldTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    enum: ['electrical', 'plumbing', 'hvac', 'general', 'emergency', 'maintenance']
  }],
  currentLocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    workingHours: {
      start: {
        type: String,
        default: '08:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  productivity: {
    totalTicketsCompleted: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0 // in minutes
    },
    customerRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    efficiencyScore: {
      type: Number,
      default: 1.0
    }
  },
  cost: {
    hourlyRate: {
      type: Number,
      required: true
    },
    travelCostPerKm: {
      type: Number,
      default: 0.5
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'busy', 'offline'],
    default: 'active'
  },
  currentAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null
  },
  assignedTickets: [{
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'assigned'
    }
  }],
  performanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    ticketsCompleted: Number,
    averageRating: Number,
    totalHours: Number
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
fieldTeamSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

// Virtual for calculating total cost for a job
fieldTeamSchema.virtual('calculateJobCost').get(function() {
  return function(ticketLocation, estimatedDuration) {
    const distance = this.calculateDistance(ticketLocation);
    const travelCost = distance * this.cost.travelCostPerKm;
    const workCost = (estimatedDuration / 60) * this.cost.hourlyRate;
    return travelCost + workCost;
  };
});

// Method to calculate distance to a location
fieldTeamSchema.methods.calculateDistance = function(targetLocation) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (targetLocation.latitude - this.currentLocation.latitude) * Math.PI / 180;
  const dLon = (targetLocation.longitude - this.currentLocation.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.currentLocation.latitude * Math.PI / 180) * Math.cos(targetLocation.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to check if team member is available
fieldTeamSchema.methods.isAvailable = function() {
  if (!this.availability.isAvailable || this.status !== 'active') {
    return false;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const startHour = parseInt(this.availability.workingHours.start.split(':')[0]);
  const endHour = parseInt(this.availability.workingHours.end.split(':')[0]);
  
  return currentHour >= startHour && currentHour < endHour;
};

module.exports = mongoose.model('FieldTeam', fieldTeamSchema);
