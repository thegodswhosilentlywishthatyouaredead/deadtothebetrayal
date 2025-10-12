const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Ticket = require('../models/Ticket');
const FieldTeam = require('../models/FieldTeam');
const assignmentService = require('../services/assignmentService');

// Get all assignments with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      fieldTeam,
      ticket,
      dateFrom,
      dateTo
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (fieldTeam) filter.fieldTeam = fieldTeam;
    if (ticket) filter.ticket = ticket;
    
    if (dateFrom || dateTo) {
      filter.assignedAt = {};
      if (dateFrom) filter.assignedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.assignedAt.$lte = new Date(dateTo);
    }

    const assignments = await Assignment.find(filter)
      .populate('ticket', 'ticketNumber title priority category status location customer')
      .populate('fieldTeam', 'name email phone skills currentLocation')
      .sort({ assignedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(filter);

    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('ticket')
      .populate('fieldTeam')
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Update assignment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes, actualArrivalTime, actualDuration, customerRating } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const oldStatus = assignment.status;
    assignment.status = status;

    // Update timestamps based on status
    if (status === 'accepted' && !assignment.acceptedAt) {
      assignment.acceptedAt = new Date();
    } else if (status === 'in-progress' && !assignment.startedAt) {
      assignment.startedAt = new Date();
    } else if (status === 'completed' && !assignment.completedAt) {
      assignment.completedAt = new Date();
    }

    // Update performance data
    if (actualArrivalTime) {
      assignment.actualArrivalTime = new Date(actualArrivalTime);
      assignment.travelTime.actual = Math.round(
        (new Date(actualArrivalTime) - assignment.assignedAt) / (1000 * 60)
      );
    }

    if (actualDuration) {
      assignment.performance.completionTime = actualDuration;
      assignment.performance.efficiency = assignment.calculateEfficiency();
    }

    if (customerRating) {
      assignment.performance.customerRating = customerRating;
    }

    // Add notes if provided
    if (notes) {
      assignment.notes.push({
        text: notes,
        addedBy: req.user?.id || null,
        addedAt: new Date()
      });
    }

    await assignment.save();

    // Update related ticket and field team
    await this.updateRelatedRecords(assignment, status);

    res.json({
      message: 'Assignment status updated successfully',
      assignment,
      statusChange: { from: oldStatus, to: status }
    });

  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Helper method to update related records
async function updateRelatedRecords(assignment, status) {
  try {
    // Update ticket status
    const ticket = await Ticket.findById(assignment.ticket);
    if (ticket) {
      if (status === 'accepted') {
        ticket.status = 'assigned';
      } else if (status === 'in-progress') {
        ticket.status = 'in-progress';
        ticket.startedAt = new Date();
      } else if (status === 'completed') {
        ticket.status = 'completed';
        ticket.completedAt = new Date();
        ticket.actualDuration = assignment.performance.completionTime;
        ticket.customerRating = assignment.performance.customerRating;
      }
      await ticket.save();
    }

    // Update field team member
    const fieldTeam = await FieldTeam.findById(assignment.fieldTeam);
    if (fieldTeam) {
      if (status === 'completed') {
        fieldTeam.currentAssignment = null;
        fieldTeam.status = 'active';
        
        // Update productivity metrics
        fieldTeam.productivity.totalTicketsCompleted += 1;
        if (assignment.performance.customerRating) {
          const currentRating = fieldTeam.productivity.customerRating;
          const totalTickets = fieldTeam.productivity.totalTicketsCompleted;
          fieldTeam.productivity.customerRating = 
            ((currentRating * (totalTickets - 1)) + assignment.performance.customerRating) / totalTickets;
        }
      } else if (status === 'in-progress') {
        fieldTeam.status = 'busy';
      }
      await fieldTeam.save();
    }
  } catch (error) {
    console.error('Error updating related records:', error);
  }
}

// Get assignment analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const analytics = await assignmentService.getAssignmentAnalytics(timeframe);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching assignment analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get assignment performance by field team
router.get('/analytics/performance', async (req, res) => {
  try {
    const { timeframe = '30d', fieldTeamId } = req.query;
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const filter = {
      assignedAt: { $gte: startDate }
    };
    
    if (fieldTeamId) {
      filter.fieldTeam = fieldTeamId;
    }

    const assignments = await Assignment.find(filter)
      .populate('fieldTeam', 'name email')
      .populate('ticket', 'category priority');

    const performance = {
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      averageScore: 0,
      averageRating: 0,
      averageCompletionTime: 0,
      categoryPerformance: {},
      priorityPerformance: {},
      topPerformers: []
    };

    if (assignments.length > 0) {
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      
      performance.averageScore = assignments.reduce((sum, a) => sum + a.assignmentScore, 0) / assignments.length;
      
      if (completedAssignments.length > 0) {
        performance.averageRating = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.customerRating || 0), 0) / completedAssignments.length;
        
        performance.averageCompletionTime = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.completionTime || 0), 0) / completedAssignments.length;
      }

      // Category performance
      assignments.forEach(assignment => {
        const category = assignment.ticket.category;
        if (!performance.categoryPerformance[category]) {
          performance.categoryPerformance[category] = {
            total: 0,
            completed: 0,
            averageRating: 0,
            averageTime: 0
          };
        }
        performance.categoryPerformance[category].total++;
        if (assignment.status === 'completed') {
          performance.categoryPerformance[category].completed++;
        }
      });

      // Priority performance
      assignments.forEach(assignment => {
        const priority = assignment.ticket.priority;
        if (!performance.priorityPerformance[priority]) {
          performance.priorityPerformance[priority] = {
            total: 0,
            completed: 0,
            averageRating: 0,
            averageTime: 0
          };
        }
        performance.priorityPerformance[priority].total++;
        if (assignment.status === 'completed') {
          performance.priorityPerformance[priority].completed++;
        }
      });

      // Top performers
      const teamPerformance = {};
      assignments.forEach(assignment => {
        const teamId = assignment.fieldTeam._id.toString();
        if (!teamPerformance[teamId]) {
          teamPerformance[teamId] = {
            name: assignment.fieldTeam.name,
            total: 0,
            completed: 0,
            averageRating: 0,
            totalRating: 0
          };
        }
        teamPerformance[teamId].total++;
        if (assignment.status === 'completed') {
          teamPerformance[teamId].completed++;
          if (assignment.performance.customerRating) {
            teamPerformance[teamId].totalRating += assignment.performance.customerRating;
          }
        }
      });

      performance.topPerformers = Object.values(teamPerformance)
        .map(team => ({
          ...team,
          completionRate: team.total > 0 ? (team.completed / team.total * 100).toFixed(1) : 0,
          averageRating: team.completed > 0 ? (team.totalRating / team.completed).toFixed(1) : 0
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10);
    }

    res.json(performance);

  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

// Reject assignment
router.post('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'assigned') {
      return res.status(400).json({ error: 'Assignment cannot be rejected in current status' });
    }

    assignment.status = 'rejected';
    assignment.rejectionReason = reason;
    await assignment.save();

    // Update ticket status back to open
    const ticket = await Ticket.findById(assignment.ticket);
    if (ticket) {
      ticket.status = 'open';
      ticket.assignedTo = null;
      await ticket.save();
    }

    // Update field team member
    const fieldTeam = await FieldTeam.findById(assignment.fieldTeam);
    if (fieldTeam) {
      fieldTeam.currentAssignment = null;
      fieldTeam.status = 'active';
      await fieldTeam.save();
    }

    res.json({
      message: 'Assignment rejected successfully',
      assignment
    });

  } catch (error) {
    console.error('Error rejecting assignment:', error);
    res.status(500).json({ error: 'Failed to reject assignment' });
  }
});

module.exports = router;
