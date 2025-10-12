const FieldTeam = require('../models/FieldTeam');
const Ticket = require('../models/Ticket');
const Assignment = require('../models/Assignment');
const geolocationService = require('./geolocationService');

class AssignmentService {
  constructor() {
    this.weights = {
      productivity: 0.3,    // 30% - based on past performance
      availability: 0.2,    // 20% - current availability and working hours
      cost: 0.2,           // 20% - cost efficiency
      distance: 0.2,       // 20% - travel distance and time
      skills: 0.1          // 10% - skill match
    };
  }

  /**
   * Main method to find the best field team member for a ticket
   * @param {Object} ticket - The ticket to assign
   * @param {Object} options - Assignment options
   * @returns {Object} - Best assignment with score and reasoning
   */
  async findBestAssignment(ticket, options = {}) {
    try {
      // Get all available field team members
      const availableTeams = await this.getAvailableTeams(ticket);
      
      if (availableTeams.length === 0) {
        throw new Error('No available field team members found');
      }

      // Calculate scores for each team member
      const scoredAssignments = await Promise.all(
        availableTeams.map(team => this.calculateAssignmentScore(ticket, team))
      );

      // Sort by score (highest first)
      scoredAssignments.sort((a, b) => b.totalScore - a.totalScore);

      const bestAssignment = scoredAssignments[0];
      
      // Create assignment record
      const assignment = new Assignment({
        ticket: ticket._id,
        fieldTeam: bestAssignment.team._id,
        assignmentType: options.type || 'automatic',
        distance: bestAssignment.distance,
        cost: {
          estimated: bestAssignment.estimatedCost
        },
        assignmentScore: bestAssignment.totalScore,
        factors: bestAssignment.factors,
        estimatedArrivalTime: bestAssignment.estimatedArrivalTime
      });

      await assignment.save();

      return {
        assignment,
        score: bestAssignment.totalScore,
        reasoning: bestAssignment.reasoning,
        alternatives: scoredAssignments.slice(1, 4) // Top 3 alternatives
      };

    } catch (error) {
      console.error('Error in findBestAssignment:', error);
      throw error;
    }
  }

  /**
   * Get available field team members for a ticket
   */
  async getAvailableTeams(ticket) {
    const query = {
      status: 'active',
      'availability.isAvailable': true,
      skills: { $in: ticket.skillsRequired || [ticket.category] }
    };

    const teams = await FieldTeam.find(query);
    
    // Filter by working hours and availability
    return teams.filter(team => {
      return team.isAvailable() && 
             !team.currentAssignment && 
             this.isWithinWorkingHours(team);
    });
  }

  /**
   * Calculate comprehensive assignment score for a team member
   */
  async calculateAssignmentScore(ticket, team) {
    const factors = {};
    let reasoning = [];

    // 1. Productivity Score (0-100)
    factors.productivity = this.calculateProductivityScore(team);
    reasoning.push(`Productivity: ${factors.productivity.toFixed(1)} (${team.productivity.totalTicketsCompleted} tickets completed, ${team.productivity.customerRating.toFixed(1)} avg rating)`);

    // 2. Availability Score (0-100)
    factors.availability = this.calculateAvailabilityScore(team);
    reasoning.push(`Availability: ${factors.availability.toFixed(1)} (${team.availability.isAvailable ? 'Available' : 'Unavailable'})`);

    // 3. Cost Score (0-100, higher is better - lower cost)
    const costData = this.calculateCostScore(ticket, team);
    factors.cost = costData.score;
    reasoning.push(`Cost: ${factors.cost.toFixed(1)} ($${costData.estimatedCost.toFixed(2)} estimated)`);

    // 4. Distance Score (0-100, higher is better - closer distance)
    const distanceData = this.calculateDistanceScore(ticket, team);
    factors.distance = distanceData.score;
    reasoning.push(`Distance: ${factors.distance.toFixed(1)} (${distanceData.distance.toFixed(1)}km, ${distanceData.travelTime}min travel)`);

    // 5. Skills Score (0-100)
    factors.skills = this.calculateSkillsScore(ticket, team);
    reasoning.push(`Skills: ${factors.skills.toFixed(1)} (${this.getSkillMatchPercentage(ticket, team)}% match)`);

    // Calculate weighted total score
    const totalScore = Object.keys(factors).reduce((total, factor) => {
      return total + (factors[factor] * this.weights[factor]);
    }, 0);

    return {
      team,
      totalScore,
      factors,
      reasoning,
      distance: distanceData.distance,
      travelTime: distanceData.travelTime,
      estimatedCost: costData.estimatedCost,
      estimatedArrivalTime: this.calculateEstimatedArrivalTime(distanceData.travelTime)
    };
  }

  /**
   * Calculate productivity score based on past performance
   */
  calculateProductivityScore(team) {
    const { totalTicketsCompleted, customerRating, efficiencyScore } = team.productivity;
    
    // Base score from customer rating (0-50 points)
    const ratingScore = (customerRating / 5) * 50;
    
    // Experience bonus (0-30 points)
    const experienceScore = Math.min(totalTicketsCompleted / 10, 30);
    
    // Efficiency bonus (0-20 points)
    const efficiencyBonus = Math.min(efficiencyScore * 20, 20);
    
    return Math.min(ratingScore + experienceScore + efficiencyBonus, 100);
  }

  /**
   * Calculate availability score
   */
  calculateAvailabilityScore(team) {
    if (!team.availability.isAvailable) return 0;
    
    let score = 50; // Base availability score
    
    // Check if within working hours
    if (this.isWithinWorkingHours(team)) {
      score += 30;
    }
    
    // Check if not currently assigned
    if (!team.currentAssignment) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Calculate cost efficiency score
   */
  calculateCostScore(ticket, team) {
    const distance = team.calculateDistance(ticket.location);
    const travelCost = distance * team.cost.travelCostPerKm;
    const workCost = (ticket.estimatedDuration / 60) * team.cost.hourlyRate;
    const totalCost = travelCost + workCost;
    
    // Normalize cost score (lower cost = higher score)
    // Assuming average cost is $100, score decreases as cost increases
    const normalizedCost = Math.max(0, 100 - (totalCost / 100) * 50);
    
    return {
      score: Math.min(normalizedCost, 100),
      estimatedCost: totalCost,
      travelCost,
      workCost
    };
  }

  /**
   * Calculate distance and travel time score
   */
  calculateDistanceScore(ticket, team) {
    const distance = team.calculateDistance(ticket.location);
    
    // Estimate travel time (rough calculation - would use Google Maps API in production)
    const travelTime = Math.round(distance * 1.5); // 1.5 minutes per km average
    
    // Distance score (closer = higher score)
    // Assuming 50km is the maximum reasonable distance
    const distanceScore = Math.max(0, 100 - (distance / 50) * 100);
    
    return {
      score: Math.min(distanceScore, 100),
      distance,
      travelTime
    };
  }

  /**
   * Calculate skills match score
   */
  calculateSkillsScore(ticket, team) {
    const requiredSkills = ticket.skillsRequired || [ticket.category];
    const teamSkills = team.skills;
    
    const matchingSkills = requiredSkills.filter(skill => 
      teamSkills.includes(skill)
    );
    
    const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    return Math.min(matchPercentage, 100);
  }

  /**
   * Get skill match percentage
   */
  getSkillMatchPercentage(ticket, team) {
    const requiredSkills = ticket.skillsRequired || [ticket.category];
    const teamSkills = team.skills;
    
    const matchingSkills = requiredSkills.filter(skill => 
      teamSkills.includes(skill)
    );
    
    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  }

  /**
   * Check if team member is within working hours
   */
  isWithinWorkingHours(team) {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(team.availability.workingHours.start.split(':')[0]);
    const endHour = parseInt(team.availability.workingHours.end.split(':')[0]);
    
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Calculate estimated arrival time
   */
  calculateEstimatedArrivalTime(travelTimeMinutes) {
    const now = new Date();
    return new Date(now.getTime() + (travelTimeMinutes * 60 * 1000));
  }

  /**
   * Assign ticket to field team member
   */
  async assignTicket(ticketId, teamId, assignmentType = 'manual') {
    try {
      const ticket = await Ticket.findById(ticketId);
      const team = await FieldTeam.findById(teamId);
      
      if (!ticket || !team) {
        throw new Error('Ticket or team member not found');
      }
      
      if (!ticket.canBeAssigned()) {
        throw new Error('Ticket cannot be assigned in current status');
      }
      
      if (!team.isAvailable()) {
        throw new Error('Team member is not available');
      }

      // Update ticket
      ticket.assignedTo = teamId;
      ticket.status = 'assigned';
      ticket.scheduledTime = new Date();
      
      // Update team member
      team.currentAssignment = ticketId;
      team.status = 'busy';
      
      // Create assignment record
      const assignment = new Assignment({
        ticket: ticketId,
        fieldTeam: teamId,
        assignmentType,
        status: 'assigned',
        distance: team.calculateDistance(ticket.location),
        estimatedArrivalTime: this.calculateEstimatedArrivalTime(
          ticket.getEstimatedTravelTime(team.currentLocation)
        )
      });
      
      await Promise.all([
        ticket.save(),
        team.save(),
        assignment.save()
      ]);
      
      return assignment;
      
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  /**
   * Get assignment analytics
   */
  async getAssignmentAnalytics(timeframe = '7d') {
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const assignments = await Assignment.find({
      assignedAt: { $gte: startDate }
    }).populate('ticket fieldTeam');
    
    const analytics = {
      totalAssignments: assignments.length,
      averageScore: 0,
      completionRate: 0,
      averageTravelTime: 0,
      averageCost: 0,
      topPerformers: [],
      categoryBreakdown: {}
    };
    
    if (assignments.length > 0) {
      analytics.averageScore = assignments.reduce((sum, a) => sum + a.assignmentScore, 0) / assignments.length;
      analytics.completionRate = assignments.filter(a => a.status === 'completed').length / assignments.length * 100;
      analytics.averageTravelTime = assignments.reduce((sum, a) => sum + (a.travelTime.actual || a.travelTime.estimated || 0), 0) / assignments.length;
      analytics.averageCost = assignments.reduce((sum, a) => sum + (a.cost.actual || a.cost.estimated || 0), 0) / assignments.length;
    }
    
    return analytics;
  }
}

module.exports = new AssignmentService();
