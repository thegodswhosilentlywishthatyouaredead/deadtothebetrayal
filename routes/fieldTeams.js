const express = require('express');
const router = express.Router();
const FieldTeam = require('../models/FieldTeam');
const Ticket = require('../models/Ticket');
const Assignment = require('../models/Assignment');
const geolocationService = require('../services/geolocationService');
const llmService = require('../services/llmService');

// Get all field team members
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      skills,
      available,
      search
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (available === 'true') filter['availability.isAvailable'] = true;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const fieldTeams = await FieldTeam.find(filter)
      .populate('currentAssignment', 'ticketNumber title priority status')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FieldTeam.countDocuments(filter);

    res.json({
      fieldTeams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching field teams:', error);
    res.status(500).json({ error: 'Failed to fetch field teams' });
  }
});

// Get field team member by ID
router.get('/:id', async (req, res) => {
  try {
    const fieldTeam = await FieldTeam.findById(req.params.id)
      .populate('currentAssignment', 'ticketNumber title priority status location')
      .populate('assignedTickets.ticket', 'ticketNumber title status priority');

    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    res.json(fieldTeam);
  } catch (error) {
    console.error('Error fetching field team member:', error);
    res.status(500).json({ error: 'Failed to fetch field team member' });
  }
});

// Create new field team member
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      currentLocation,
      hourlyRate,
      workingHours,
      timezone
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !skills || !currentLocation || !hourlyRate) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, phone, skills, currentLocation, hourlyRate' 
      });
    }

    // Validate coordinates
    if (!geolocationService.isValidCoordinates(currentLocation.latitude, currentLocation.longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const fieldTeam = new FieldTeam({
      name,
      email,
      phone,
      skills,
      currentLocation,
      cost: {
        hourlyRate,
        travelCostPerKm: 0.5
      },
      availability: {
        workingHours: workingHours || { start: '08:00', end: '17:00' },
        timezone: timezone || 'UTC'
      }
    });

    await fieldTeam.save();

    res.status(201).json(fieldTeam);

  } catch (error) {
    console.error('Error creating field team member:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create field team member' });
    }
  }
});

// Update field team member
router.put('/:id', async (req, res) => {
  try {
    const fieldTeam = await FieldTeam.findById(req.params.id);
    
    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    const updates = req.body;
    
    // Prevent updating certain fields directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Validate coordinates if location is being updated
    if (updates.currentLocation) {
      if (!geolocationService.isValidCoordinates(
        updates.currentLocation.latitude, 
        updates.currentLocation.longitude
      )) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }
      updates.currentLocation.lastUpdated = new Date();
    }

    Object.assign(fieldTeam, updates);
    await fieldTeam.save();

    res.json(fieldTeam);
  } catch (error) {
    console.error('Error updating field team member:', error);
    res.status(500).json({ error: 'Failed to update field team member' });
  }
});

// Update field team member location
router.patch('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    if (!geolocationService.isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const fieldTeam = await FieldTeam.findById(req.params.id);
    
    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    fieldTeam.currentLocation = {
      latitude,
      longitude,
      address: address || fieldTeam.currentLocation.address,
      lastUpdated: new Date()
    };

    await fieldTeam.save();

    res.json({
      message: 'Location updated successfully',
      location: fieldTeam.currentLocation
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Update field team member availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { isAvailable, workingHours, timezone } = req.body;
    
    const fieldTeam = await FieldTeam.findById(req.params.id);
    
    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    if (isAvailable !== undefined) {
      fieldTeam.availability.isAvailable = isAvailable;
    }
    
    if (workingHours) {
      fieldTeam.availability.workingHours = workingHours;
    }
    
    if (timezone) {
      fieldTeam.availability.timezone = timezone;
    }

    await fieldTeam.save();

    res.json({
      message: 'Availability updated successfully',
      availability: fieldTeam.availability
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get field team member performance
router.get('/:id/performance', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const assignments = await Assignment.find({
      fieldTeam: req.params.id,
      assignedAt: { $gte: startDate }
    }).populate('ticket');

    const performance = {
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      averageRating: 0,
      averageCompletionTime: 0,
      totalHours: 0,
      efficiency: 0,
      recentActivity: [],
      categoryBreakdown: {},
      monthlyTrend: []
    };

    if (assignments.length > 0) {
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      
      if (completedAssignments.length > 0) {
        performance.averageRating = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.customerRating || 0), 0) / completedAssignments.length;
        
        performance.averageCompletionTime = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.completionTime || 0), 0) / completedAssignments.length;
        
        performance.totalHours = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.completionTime || 0), 0) / 60;
        
        performance.efficiency = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.efficiency || 1), 0) / completedAssignments.length;
      }

      // Category breakdown
      assignments.forEach(assignment => {
        const category = assignment.ticket.category;
        if (!performance.categoryBreakdown[category]) {
          performance.categoryBreakdown[category] = 0;
        }
        performance.categoryBreakdown[category]++;
      });

      // Recent activity
      performance.recentActivity = assignments.slice(0, 10).map(a => ({
        ticketNumber: a.ticket.ticketNumber,
        status: a.status,
        assignedAt: a.assignedAt,
        completedAt: a.completedAt,
        rating: a.performance.customerRating
      }));
    }

    res.json(performance);

  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get nearby field team members
router.get('/nearby/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, limit = 10 } = req.query;
    
    if (!geolocationService.isValidCoordinates(parseFloat(latitude), parseFloat(longitude))) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    
    const fieldTeams = await FieldTeam.find({
      status: 'active',
      'availability.isAvailable': true
    });

    const nearbyTeams = geolocationService.getNearbyTeams(
      location, 
      fieldTeams, 
      parseFloat(radius)
    ).slice(0, parseInt(limit));

    res.json({
      location,
      radius: parseFloat(radius),
      nearbyTeams: nearbyTeams.map(team => ({
        _id: team._id,
        name: team.name,
        skills: team.skills,
        distance: team.distance,
        currentLocation: team.currentLocation,
        availability: team.availability,
        productivity: team.productivity
      }))
    });

  } catch (error) {
    console.error('Error fetching nearby teams:', error);
    res.status(500).json({ error: 'Failed to fetch nearby teams' });
  }
});

// Get field team member's current journey
router.get('/:id/journey', async (req, res) => {
  try {
    const fieldTeam = await FieldTeam.findById(req.params.id);
    
    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    // Get current and upcoming assignments
    const assignments = await Assignment.find({
      fieldTeam: req.params.id,
      status: { $in: ['assigned', 'accepted', 'in-progress'] }
    }).populate('ticket').sort({ assignedAt: 1 });

    if (assignments.length === 0) {
      return res.json({
        message: 'No current assignments',
        currentLocation: fieldTeam.currentLocation,
        journey: null
      });
    }

    const tickets = assignments.map(a => a.ticket);
    const journey = await geolocationService.calculateTotalJourney(
      fieldTeam.currentLocation,
      tickets
    );

    res.json({
      currentLocation: fieldTeam.currentLocation,
      journey,
      assignments: assignments.map(a => ({
        ticketNumber: a.ticket.ticketNumber,
        title: a.ticket.title,
        priority: a.ticket.priority,
        status: a.status,
        estimatedArrivalTime: a.estimatedArrivalTime
      }))
    });

  } catch (error) {
    console.error('Error fetching journey:', error);
    res.status(500).json({ error: 'Failed to fetch journey' });
  }
});

// Get LLM assistance for field team member
router.post('/:id/assistance', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const context = {
      location: req.body.location
    };

    const response = await llmService.processQuery(query, req.params.id, context);

    res.json(response);

  } catch (error) {
    console.error('Error getting LLM assistance:', error);
    res.status(500).json({ error: 'Failed to get assistance' });
  }
});

// Get performance insights
router.get('/:id/insights', async (req, res) => {
  try {
    const insights = await llmService.generatePerformanceInsights(req.params.id);
    res.json(insights);
  } catch (error) {
    console.error('Error getting performance insights:', error);
    res.status(500).json({ error: 'Failed to get performance insights' });
  }
});

// Update field team member status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['active', 'inactive', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const fieldTeam = await FieldTeam.findById(req.params.id);
    
    if (!fieldTeam) {
      return res.status(404).json({ error: 'Field team member not found' });
    }

    fieldTeam.status = status;
    await fieldTeam.save();

    res.json({
      message: 'Status updated successfully',
      status: fieldTeam.status
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
