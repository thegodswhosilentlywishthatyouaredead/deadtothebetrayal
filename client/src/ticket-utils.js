/**
 * Standardized Ticket Utilities
 * Shared functions for ticket handling across all pages
 */

// Standardized ticket name function
function getTicketName(ticket) {
    // Use consistent ticket naming format (CTT_Num_Zone)
    if (ticket.ticket_number) {
        return ticket.ticket_number;
    }
    if (ticket.ticketNumber) {
        return ticket.ticketNumber;
    }
    if (ticket.id) {
        // Generate CTT_Num_Zone format based on ticket ID and zone
        const ticketId = typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id;
        const zone = ticket.zone || 'GEN';
        const zoneSuffix = zone.replace(' ', '_').replace(',', '').toUpperCase();
        return `CTT_${String(ticketId).padStart(2, '0')}_${zoneSuffix}`;
    }
    // Fallback with random number and zone
    const zone = ticket.zone || 'GEN';
    const zoneSuffix = zone.replace(' ', '_').replace(',', '').toUpperCase();
    return `CTT_${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}_${zoneSuffix}`;
}

// Standardized ticket data extraction
function extractTicketData(ticket) {
    return {
        id: ticket.id || ticket._id,
        ticketNumber: getTicketName(ticket),
        title: ticket.title || 'Untitled Ticket',
        description: ticket.description || ticket.title || 'No description available',
        status: ticket.status || 'unknown',
        priority: ticket.priority || 'medium',
        category: ticket.category || 'General',
        customerName: ticket.customer_name || ticket.customer?.name || ticket.customerInfo?.name || 'N/A',
        location: ticket.location || ticket.location?.address || 'N/A',
        zone: ticket.zone || 'Unknown',
        assignedTeam: ticket.assigned_team || ticket.assignedTeam || ticket.assigned_user || 'Unassigned',
        assignedUserId: ticket.assigned_user_id,
        assignedTeamId: ticket.assigned_team_id,
        estimatedDuration: ticket.estimatedDuration || ticket.estimated_duration || 90,
        createdAt: ticket.created_at || ticket.createdAt || new Date().toISOString(),
        updatedAt: ticket.updated_at || ticket.updatedAt,
        completedAt: ticket.completed_at || ticket.completedAt
    };
}

// Standardized ticket filtering
function filterTicketsByUser(tickets, currentUser, currentUserId) {
    return tickets.filter(ticket => {
        // Check multiple assignment fields (standardized)
        const assignedUserId = ticket.assigned_user_id;
        const assignedTeamId = ticket.assigned_team_id;
        const assignedTo = ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam;
        const assignedUser = ticket.assigned_user;
        
        // Match by user ID, team ID, or name (standardized)
        const matchesUser = assignedUserId === currentUserId;
        const matchesTeam = assignedTeamId === currentUserId;
        const matchesName = assignedTo === currentUser || assignedUser === currentUser;
        
        return matchesUser || matchesTeam || matchesName;
    });
}

// Standardized status filtering
function filterTicketsByStatus(tickets, status) {
    switch (status) {
        case 'open':
            return tickets.filter(t => t.status === 'open' || t.status === 'OPEN' || t.status === 'assigned');
        case 'in_progress':
            return tickets.filter(t => t.status === 'in_progress' || t.status === 'IN_PROGRESS');
        case 'completed':
            return tickets.filter(t => t.status === 'completed' || t.status === 'COMPLETED' || t.status === 'resolved' || t.status === 'closed');
        case 'resolved':
            return tickets.filter(t => t.status === 'resolved' || t.status === 'RESOLVED' || t.status === 'completed' || t.status === 'COMPLETED' || t.status === 'closed');
        default:
            return tickets;
    }
}

// Standardized API call for tickets
async function fetchTickets(apiBase, limit = 1000) {
    try {
        const response = await fetch(`${apiBase}/tickets?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.tickets || [];
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
    }
}

// Standardized ticket display creation
function createStandardizedTicketCard(ticket, options = {}) {
    const {
        showActions = true,
        showDetails = true,
        compact = false
    } = options;
    
    const ticketData = extractTicketData(ticket);
    const priorityClass = `priority-${ticketData.priority}`;
    const statusClass = `status-${ticketData.status.replace('_', '-')}`;
    const trafficLight = getTrafficLightColor(ticketData.status);
    
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    if (compact) {
        card.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-title">${ticketData.title}</div>
                <div class="ticket-number">${ticketData.ticketNumber}</div>
                <div class="ticket-priority ${priorityClass}">${ticketData.priority}</div>
            </div>
            <div class="ticket-status">
                <div class="status-indicator ${statusClass}">
                    <span class="traffic-light ${trafficLight}"></span>
                    <span>${formatStatus(ticketData.status)}</span>
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="ticket-header">
                <div>
                    <div class="ticket-title">${ticketData.title}</div>
                    <div class="ticket-number">${ticketData.ticketNumber}</div>
                </div>
                <div class="ticket-priority ${priorityClass}">${ticketData.priority}</div>
            </div>
            
            ${showDetails ? `
            <div class="ticket-details">
                <div class="ticket-detail">
                    <i class="fas fa-user"></i>
                    <span><strong>Customer:</strong> ${ticketData.customerName}</span>
                </div>
                <div class="ticket-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span><strong>Location:</strong> ${ticketData.location}</span>
                </div>
                <div class="ticket-detail">
                    <i class="fas fa-clock"></i>
                    <span><strong>Duration:</strong> ${ticketData.estimatedDuration} min</span>
                </div>
                <div class="ticket-detail">
                    <i class="fas fa-tag"></i>
                    <span><strong>Category:</strong> ${ticketData.category}</span>
                </div>
                <div class="ticket-detail">
                    <i class="fas fa-users"></i>
                    <span><strong>Assigned Team:</strong> ${ticketData.assignedTeam}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="ticket-status">
                <div class="status-indicator ${statusClass}">
                    <span class="traffic-light ${trafficLight}"></span>
                    <span>${formatStatus(ticketData.status)}</span>
                </div>
                ${showActions ? `
                <div class="ticket-actions">
                    ${getTicketActionButtons(ticket)}
                </div>
                ` : ''}
            </div>
        `;
    }
    
    return card;
}

// Helper function for traffic light color
function getTrafficLightColor(status) {
    switch (status) {
        case 'open':
        case 'assigned':
            return 'red';
        case 'in_progress':
            return 'yellow';
        case 'resolved':
        case 'closed':
        case 'completed':
            return 'green';
        default:
            return 'gray';
    }
}

// Helper function for status formatting
function formatStatus(status) {
    return (status || 'unknown').replace('_', ' ').toUpperCase();
}

// Helper function for ticket action buttons (to be implemented by each page)
function getTicketActionButtons(ticket) {
    // This should be implemented by each page based on their specific needs
    return '';
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getTicketName,
        extractTicketData,
        filterTicketsByUser,
        filterTicketsByStatus,
        fetchTickets,
        createStandardizedTicketCard,
        getTrafficLightColor,
        formatStatus
    };
}
