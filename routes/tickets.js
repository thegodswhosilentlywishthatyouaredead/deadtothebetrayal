const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const FieldTeam = require('../models/FieldTeam');
const Assignment = require('../models/Assignment');
const assignmentService = require('../services/assignmentService');
const geolocationService = require('../services/geolocationService');
const llmService = require('../services/llmService');

// Get all tickets with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assignedTo,
      search
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    if (search) {
      filter.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'name email phone skills')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'name email phone skills currentLocation')
      .populate('assignmentHistory.assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      category,
      location,
      customer,
      estimatedDuration = 60,
      skillsRequired
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !customer) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category, location, customer' 
      });
    }

    // Validate coordinates
    if (!geolocationService.isValidCoordinates(location.latitude, location.longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const ticket = new Ticket({
      title,
      description,
      priority,
      category,
      location,
      customer,
      estimatedDuration,
      skillsRequired: skillsRequired || [category]
    });

    await ticket.save();

    // Auto-assign if possible
    try {
      const assignment = await assignmentService.findBestAssignment(ticket);
      res.status(201).json({
        ticket,
        assignment: assignment.assignment,
        message: 'Ticket created and auto-assigned'
      });
    } catch (assignmentError) {
      console.log('Auto-assignment failed:', assignmentError.message);
      res.status(201).json({
        ticket,
        message: 'Ticket created but could not be auto-assigned'
      });
    }

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates = req.body;
    
    // Prevent updating certain fields directly
    delete updates.ticketNumber;
    delete updates.createdAt;
    delete updates.updatedAt;

    Object.assign(ticket, updates);
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Assign ticket to field team member
router.post('/:id/assign', async (req, res) => {
  try {
    const { teamMemberId, assignmentType = 'manual' } = req.body;
    
    if (!teamMemberId) {
      return res.status(400).json({ error: 'Team member ID is required' });
    }

    const assignment = await assignmentService.assignTicket(
      req.params.id, 
      teamMemberId, 
      assignmentType
    );

    res.json({
      message: 'Ticket assigned successfully',
      assignment
    });

  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-assign ticket using intelligent algorithm
router.post('/:id/auto-assign', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!ticket.canBeAssigned()) {
      return res.status(400).json({ error: 'Ticket cannot be assigned in current status' });
    }

    const result = await assignmentService.findBestAssignment(ticket, {
      type: 'automatic'
    });

    res.json({
      message: 'Ticket auto-assigned successfully',
      assignment: result.assignment,
      score: result.score,
      reasoning: result.reasoning,
      alternatives: result.alternatives
    });

  } catch (error) {
    console.error('Error auto-assigning ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ticket status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes, actualDuration, customerRating, customerFeedback } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    // Update timestamps based on status
    if (status === 'in-progress' && !ticket.startedAt) {
      ticket.startedAt = new Date();
    } else if (status === 'completed' && !ticket.completedAt) {
      ticket.completedAt = new Date();
      ticket.actualDuration = actualDuration || ticket.actualDuration;
      ticket.customerRating = customerRating || ticket.customerRating;
      ticket.customerFeedback = customerFeedback || ticket.customerFeedback;
    }

    // Add notes if provided
    if (notes) {
      ticket.notes.push({
        text: notes,
        addedBy: req.user?.id || null,
        addedAt: new Date()
      });
    }

    await ticket.save();

    // Update assignment record
    const assignment = await Assignment.findOne({ 
      ticket: ticket._id, 
      fieldTeam: ticket.assignedTo 
    });
    
    if (assignment) {
      assignment.status = status;
      if (status === 'completed') {
        assignment.completedAt = new Date();
        assignment.performance = {
          customerRating: customerRating,
          completionTime: actualDuration,
          efficiency: assignment.calculateEfficiency()
        };
      }
      await assignment.save();
    }

    // Update field team member status
    if (ticket.assignedTo) {
      const teamMember = await FieldTeam.findById(ticket.assignedTo);
      if (teamMember) {
        if (status === 'completed') {
          teamMember.currentAssignment = null;
          teamMember.status = 'active';
          
          // Update productivity metrics
          teamMember.productivity.totalTicketsCompleted += 1;
          if (customerRating) {
            const currentRating = teamMember.productivity.customerRating;
            const totalTickets = teamMember.productivity.totalTicketsCompleted;
            teamMember.productivity.customerRating = 
              ((currentRating * (totalTickets - 1)) + customerRating) / totalTickets;
          }
        } else if (status === 'in-progress') {
          teamMember.status = 'busy';
        }
        await teamMember.save();
      }
    }

    res.json({
      message: 'Ticket status updated successfully',
      ticket,
      statusChange: { from: oldStatus, to: status }
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Get ticket analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets,
      avgCompletionTime,
      priorityBreakdown,
      categoryBreakdown
    ] = await Promise.all([
      Ticket.countDocuments({ createdAt: { $gte: startDate } }),
      Ticket.countDocuments({ status: 'open', createdAt: { $gte: startDate } }),
      Ticket.countDocuments({ status: 'in-progress', createdAt: { $gte: startDate } }),
      Ticket.countDocuments({ status: 'completed', createdAt: { $gte: startDate } }),
      Ticket.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, avgTime: { $avg: '$actualDuration' } } }
      ]),
      Ticket.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets,
      completionRate: totalTickets > 0 ? (completedTickets / totalTickets * 100).toFixed(1) : 0,
      avgCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      priorityBreakdown,
      categoryBreakdown
    });

  } catch (error) {
    console.error('Error fetching ticket analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get LLM assistance for ticket
router.post('/:id/assistance', async (req, res) => {
  try {
    const { query, teamMemberId } = req.body;
    
    if (!query || !teamMemberId) {
      return res.status(400).json({ error: 'Query and team member ID are required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const context = {
      currentTicket: {
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority
      }
    };

    const response = await llmService.processQuery(query, teamMemberId, context);

    res.json(response);

  } catch (error) {
    console.error('Error getting LLM assistance:', error);
    res.status(500).json({ error: 'Failed to get assistance' });
  }
});

// Get troubleshooting suggestions
router.get('/:id/troubleshooting', async (req, res) => {
  try {
    const suggestions = await llmService.generateTroubleshootingSuggestions(req.params.id);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting troubleshooting suggestions:', error);
    res.status(500).json({ error: 'Failed to get troubleshooting suggestions' });
  }
});

module.exports = router;
