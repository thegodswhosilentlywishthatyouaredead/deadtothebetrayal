const OpenAI = require('openai');
const FieldTeam = require('../models/FieldTeam');
const Ticket = require('../models/Ticket');
const Assignment = require('../models/Assignment');

class LLMService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.systemPrompt = this.getSystemPrompt();
  }

  /**
   * Get system prompt for the LLM
   */
  getSystemPrompt() {
    return `You are an intelligent assistant for a field service management system. You help field teams with:

1. Ticket details and troubleshooting guidance
2. Performance analytics and insights
3. Productivity recommendations
4. Route optimization suggestions
5. Customer communication assistance

You have access to:
- Field team member profiles and performance data
- Ticket information and history
- Assignment records and analytics
- Geographic and scheduling data

Always provide helpful, accurate, and actionable information. If you don't have specific data, clearly state that and suggest how to obtain it.`;
  }

  /**
   * Process field team query
   * @param {string} query - User's question
   * @param {string} teamMemberId - ID of the field team member asking
   * @param {Object} context - Additional context (current ticket, location, etc.)
   * @returns {Object} - LLM response with relevant data
   */
  async processQuery(query, teamMemberId, context = {}) {
    try {
      // Get relevant data based on query type
      const relevantData = await this.getRelevantData(query, teamMemberId, context);
      
      // Create context-aware prompt
      const userPrompt = this.createUserPrompt(query, relevantData, context);
      
      // Get LLM response
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        answer: response.choices[0].message.content,
        relevantData: relevantData,
        queryType: this.identifyQueryType(query),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing LLM query:', error);
      return {
        answer: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Identify the type of query to fetch relevant data
   */
  identifyQueryType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('performance') || lowerQuery.includes('productivity') || lowerQuery.includes('rating')) {
      return 'performance';
    } else if (lowerQuery.includes('ticket') || lowerQuery.includes('job') || lowerQuery.includes('assignment')) {
      return 'ticket';
    } else if (lowerQuery.includes('route') || lowerQuery.includes('distance') || lowerQuery.includes('travel')) {
      return 'route';
    } else if (lowerQuery.includes('schedule') || lowerQuery.includes('time') || lowerQuery.includes('availability')) {
      return 'schedule';
    } else if (lowerQuery.includes('customer') || lowerQuery.includes('communication')) {
      return 'customer';
    } else {
      return 'general';
    }
  }

  /**
   * Get relevant data based on query type
   */
  async getRelevantData(query, teamMemberId, context) {
    const queryType = this.identifyQueryType(query);
    const data = {};

    try {
      // Get team member data
      const teamMember = await FieldTeam.findById(teamMemberId);
      if (teamMember) {
        data.teamMember = {
          name: teamMember.name,
          skills: teamMember.skills,
          currentLocation: teamMember.currentLocation,
          productivity: teamMember.productivity,
          availability: teamMember.availability
        };
      }

      switch (queryType) {
        case 'performance':
          data.performance = await this.getPerformanceData(teamMemberId);
          break;
        
        case 'ticket':
          data.tickets = await this.getTicketData(teamMemberId, context);
          break;
        
        case 'route':
          data.route = await this.getRouteData(teamMemberId, context);
          break;
        
        case 'schedule':
          data.schedule = await this.getScheduleData(teamMemberId);
          break;
        
        case 'customer':
          data.customer = await this.getCustomerData(teamMemberId, context);
          break;
        
        default:
          data.general = await this.getGeneralData(teamMemberId);
      }

    } catch (error) {
      console.error('Error fetching relevant data:', error);
    }

    return data;
  }

  /**
   * Get performance data for a team member
   */
  async getPerformanceData(teamMemberId) {
    const assignments = await Assignment.find({ fieldTeam: teamMemberId })
      .populate('ticket')
      .sort({ assignedAt: -1 })
      .limit(20);

    const performance = {
      totalTickets: assignments.length,
      completedTickets: assignments.filter(a => a.status === 'completed').length,
      averageRating: 0,
      averageCompletionTime: 0,
      recentPerformance: []
    };

    if (assignments.length > 0) {
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      
      if (completedAssignments.length > 0) {
        performance.averageRating = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.customerRating || 0), 0) / completedAssignments.length;
        
        performance.averageCompletionTime = completedAssignments.reduce((sum, a) => 
          sum + (a.performance.completionTime || 0), 0) / completedAssignments.length;
      }

      performance.recentPerformance = assignments.slice(0, 5).map(a => ({
        ticketNumber: a.ticket.ticketNumber,
        status: a.status,
        rating: a.performance.customerRating,
        completionTime: a.performance.completionTime,
        assignedAt: a.assignedAt
      }));
    }

    return performance;
  }

  /**
   * Get ticket data for a team member
   */
  async getTicketData(teamMemberId, context) {
    const currentTicket = await Ticket.findOne({ 
      assignedTo: teamMemberId, 
      status: { $in: ['assigned', 'in-progress'] } 
    });

    const recentTickets = await Ticket.find({ assignedTo: teamMemberId })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      currentTicket: currentTicket ? {
        ticketNumber: currentTicket.ticketNumber,
        title: currentTicket.title,
        description: currentTicket.description,
        priority: currentTicket.priority,
        category: currentTicket.category,
        location: currentTicket.location,
        customer: currentTicket.customer,
        estimatedDuration: currentTicket.estimatedDuration
      } : null,
      recentTickets: recentTickets.map(t => ({
        ticketNumber: t.ticketNumber,
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.createdAt
      }))
    };
  }

  /**
   * Get route data for a team member
   */
  async getRouteData(teamMemberId, context) {
    const teamMember = await FieldTeam.findById(teamMemberId);
    const currentTicket = await Ticket.findOne({ 
      assignedTo: teamMemberId, 
      status: { $in: ['assigned', 'in-progress'] } 
    });

    if (!teamMember || !currentTicket) {
      return null;
    }

    const distance = teamMember.calculateDistance(currentTicket.location);
    const estimatedTravelTime = Math.round(distance * 1.5); // Rough estimate

    return {
      currentLocation: teamMember.currentLocation,
      destination: currentTicket.location,
      distance: Math.round(distance * 100) / 100,
      estimatedTravelTime,
      route: {
        from: teamMember.currentLocation.address || 'Current Location',
        to: currentTicket.location.address
      }
    };
  }

  /**
   * Get schedule data for a team member
   */
  async getScheduleData(teamMemberId) {
    const teamMember = await FieldTeam.findById(teamMemberId);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayAssignments = await Assignment.find({
      fieldTeam: teamMemberId,
      assignedAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('ticket');

    return {
      workingHours: teamMember.availability.workingHours,
      isAvailable: teamMember.availability.isAvailable,
      todayAssignments: todayAssignments.map(a => ({
        ticketNumber: a.ticket.ticketNumber,
        status: a.status,
        scheduledTime: a.estimatedArrivalTime,
        priority: a.ticket.priority
      }))
    };
  }

  /**
   * Get customer data for a team member
   */
  async getCustomerData(teamMemberId, context) {
    const currentTicket = await Ticket.findOne({ 
      assignedTo: teamMemberId, 
      status: { $in: ['assigned', 'in-progress'] } 
    });

    if (!currentTicket) {
      return null;
    }

    return {
      customer: currentTicket.customer,
      ticketNumber: currentTicket.ticketNumber,
      priority: currentTicket.priority,
      category: currentTicket.category
    };
  }

  /**
   * Get general data for a team member
   */
  async getGeneralData(teamMemberId) {
    const teamMember = await FieldTeam.findById(teamMemberId);
    const recentAssignments = await Assignment.find({ fieldTeam: teamMemberId })
      .populate('ticket')
      .sort({ assignedAt: -1 })
      .limit(5);

    return {
      teamMember: {
        name: teamMember.name,
        skills: teamMember.skills,
        status: teamMember.status
      },
      recentActivity: recentAssignments.map(a => ({
        ticketNumber: a.ticket.ticketNumber,
        status: a.status,
        assignedAt: a.assignedAt
      }))
    };
  }

  /**
   * Create user prompt with relevant data
   */
  createUserPrompt(query, relevantData, context) {
    let prompt = `Field team member query: "${query}"\n\n`;
    
    prompt += "Relevant data:\n";
    prompt += JSON.stringify(relevantData, null, 2);
    
    if (context.currentTicket) {
      prompt += `\nCurrent ticket context: ${JSON.stringify(context.currentTicket, null, 2)}`;
    }
    
    if (context.location) {
      prompt += `\nCurrent location: ${JSON.stringify(context.location, null, 2)}`;
    }
    
    prompt += "\n\nPlease provide a helpful response based on this data. Be specific and actionable.";
    
    return prompt;
  }

  /**
   * Generate performance insights
   */
  async generatePerformanceInsights(teamMemberId) {
    const performanceData = await this.getPerformanceData(teamMemberId);
    
    const prompt = `Based on this performance data, provide insights and recommendations:
    
    ${JSON.stringify(performanceData, null, 2)}
    
    Focus on:
    1. Key strengths and areas for improvement
    2. Productivity trends
    3. Specific actionable recommendations
    4. Goal setting suggestions`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      return {
        insights: response.choices[0].message.content,
        data: performanceData,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating performance insights:', error);
      return {
        insights: "Unable to generate insights at this time.",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate troubleshooting suggestions
   */
  async generateTroubleshootingSuggestions(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const prompt = `Provide troubleshooting suggestions for this ticket:
    
    Category: ${ticket.category}
    Priority: ${ticket.priority}
    Description: ${ticket.description}
    
    Please provide:
    1. Step-by-step troubleshooting approach
    2. Common issues and solutions for this category
    3. Safety considerations
    4. Tools and equipment needed
    5. When to escalate to supervisor`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        suggestions: response.choices[0].message.content,
        ticketInfo: {
          ticketNumber: ticket.ticketNumber,
          category: ticket.category,
          priority: ticket.priority
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating troubleshooting suggestions:', error);
      return {
        suggestions: "Unable to generate suggestions at this time.",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Process admin dashboard query
   * @param {string} query - User's question
   * @param {Object} systemData - Current system data (tickets, teams, assignments)
   * @param {Array} chatHistory - Previous conversation history
   * @returns {Object} - LLM response with insights
   */
  async processAdminQuery(query, systemData, chatHistory = []) {
    try {
      const adminSystemPrompt = `You are an intelligent AI assistant for a field service management system dashboard. You help administrators and managers with:

1. System analytics and performance insights
2. Team productivity analysis and recommendations
3. Ticket assignment optimization strategies
4. Operational efficiency improvements
5. Data interpretation and trend analysis
6. Resource allocation suggestions
7. Cost optimization recommendations

You have access to real-time system data including:
- Ticket metrics (total, completed, open, categories)
- Team status and availability
- Assignment performance and ratings
- Cost and time analytics

Always provide:
- Clear, actionable insights
- Data-driven recommendations
- Specific metrics and trends
- Practical next steps
- Professional, helpful tone

If you don't have specific data, clearly state that and suggest how to obtain it.`;

      // Build conversation context
      const messages = [
        { role: "system", content: adminSystemPrompt }
      ];

      // Add chat history for context
      chatHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });

      // Create the current query with system data
      const userPrompt = this.createAdminUserPrompt(query, systemData);
      messages.push({ role: "user", content: userPrompt });

      // Get LLM response
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1200,
        temperature: 0.7
      });

      return {
        response: response.choices[0].message.content,
        queryType: this.identifyAdminQueryType(query),
        systemData: systemData,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing admin LLM query:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Identify the type of admin query
   */
  identifyAdminQueryType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('performance') || lowerQuery.includes('productivity') || lowerQuery.includes('rating')) {
      return 'performance';
    } else if (lowerQuery.includes('ticket') || lowerQuery.includes('trend') || lowerQuery.includes('category')) {
      return 'tickets';
    } else if (lowerQuery.includes('team') || lowerQuery.includes('staff') || lowerQuery.includes('member')) {
      return 'teams';
    } else if (lowerQuery.includes('cost') || lowerQuery.includes('budget') || lowerQuery.includes('expense')) {
      return 'cost';
    } else if (lowerQuery.includes('optimize') || lowerQuery.includes('improve') || lowerQuery.includes('efficiency')) {
      return 'optimization';
    } else if (lowerQuery.includes('assign') || lowerQuery.includes('schedule') || lowerQuery.includes('route')) {
      return 'assignment';
    } else {
      return 'general';
    }
  }

  /**
   * Create user prompt for admin queries
   */
  createAdminUserPrompt(query, systemData) {
    let prompt = `Admin Dashboard Query: "${query}"\n\n`;
    
    prompt += "Current System Data:\n";
    prompt += `Tickets: ${JSON.stringify(systemData.tickets, null, 2)}\n\n`;
    prompt += `Teams: ${JSON.stringify(systemData.teams, null, 2)}\n\n`;
    prompt += `Assignments: ${JSON.stringify(systemData.assignments, null, 2)}\n\n`;
    
    if (systemData.timestamp) {
      prompt += `Data timestamp: ${systemData.timestamp}\n\n`;
    }
    
    prompt += "Please provide a comprehensive analysis and actionable recommendations based on this data. ";
    prompt += "Focus on insights that can help improve operations, efficiency, and decision-making.";
    
    return prompt;
  }
}

module.exports = new LLMService();
