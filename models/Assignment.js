const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  fieldTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FieldTeam',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin or system user
    default: null
  },
  assignmentType: {
    type: String,
    enum: ['automatic', 'manual', 'override'],
    default: 'automatic'
  },
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
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
  estimatedArrivalTime: {
    type: Date,
    default: null
  },
  actualArrivalTime: {
    type: Date,
    default: null
  },
  travelTime: {
    estimated: {
      type: Number, // in minutes
      default: null
    },
    actual: {
      type: Number, // in minutes
      default: null
    }
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  cost: {
    estimated: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: null
    }
  },
  assignmentScore: {
    type: Number,
    default: 0 // Score based on algorithm factors
  },
  factors: {
    productivity: {
      type: Number,
      default: 0
    },
    availability: {
      type: Number,
      default: 0
    },
    cost: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number,
      default: 0
    },
    skills: {
      type: Number,
      default: 0
    }
  },
  rejectionReason: {
    type: String,
    default: null
  },
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
  performance: {
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    completionTime: {
      type: Number, // in minutes
      default: null
    },
    efficiency: {
      type: Number,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ ticket: 1, fieldTeam: 1 });
assignmentSchema.index({ status: 1, assignedAt: -1 });
assignmentSchema.index({ fieldTeam: 1, assignedAt: -1 });

// Method to calculate assignment score
assignmentSchema.methods.calculateScore = function() {
  const weights = {
    productivity: 0.3,
    availability: 0.2,
    cost: 0.2,
    distance: 0.2,
    skills: 0.1
  };
  
  let score = 0;
  Object.keys(weights).forEach(factor => {
    score += (this.factors[factor] || 0) * weights[factor];
  });
  
  this.assignmentScore = score;
  return score;
};

// Method to check if assignment is active
assignmentSchema.methods.isActive = function() {
  return ['assigned', 'accepted', 'in-progress'].includes(this.status);
};

// Method to calculate efficiency
assignmentSchema.methods.calculateEfficiency = function() {
  if (!this.performance.completionTime || !this.ticket.estimatedDuration) {
    return null;
  }
  
  const estimatedTime = this.ticket.estimatedDuration;
  const actualTime = this.performance.completionTime;
  
  // Efficiency = estimated time / actual time
  // Values > 1 mean completed faster than estimated
  return estimatedTime / actualTime;
};

module.exports = mongoose.model('Assignment', assignmentSchema);
