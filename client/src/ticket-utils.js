/**
 * Shared Ticket Utilities
 * Standardized ticket name generation and formatting across all pages
 */

// Get ticket name in CTT_Num format (standardized across all pages)
function getTicketName(ticket) {
    // Use consistent ticket naming format (CTT_Num)
    if (ticket.ticket_number) {
        return ticket.ticket_number;
    }
    if (ticket.ticketNumber) {
        return ticket.ticketNumber;
    }
    if (ticket.id) {
        // Generate CTT_Num format based on ticket ID
        const ticketId = typeof ticket.id === 'string' ? parseInt(ticket.id) : ticket.id;
        return `CTT_${String(ticketId).padStart(3, '0')}`;
    }
    // Fallback with random number
    return `CTT_${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
}

// Get ticket status class for styling
function getTicketStatusClass(status) {
    const statusMap = {
        'open': 'status-open',
        'OPEN': 'status-open',
        'assigned': 'status-assigned',
        'in_progress': 'status-in-progress',
        'IN_PROGRESS': 'status-in-progress',
        'completed': 'status-completed',
        'COMPLETED': 'status-completed',
        'resolved': 'status-resolved',
        'closed': 'status-closed',
        'cancelled': 'status-cancelled',
        'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || 'status-unknown';
}

// Get ticket status color for styling
function getTicketStatusColor(status) {
    const colorMap = {
        'open': '#f59e0b',
        'OPEN': '#f59e0b',
        'assigned': '#3b82f6',
        'in_progress': '#10b981',
        'IN_PROGRESS': '#10b981',
        'completed': '#10b981',
        'COMPLETED': '#10b981',
        'resolved': '#10b981',
        'closed': '#6b7280',
        'cancelled': '#ef4444',
        'CANCELLED': '#ef4444'
    };
    return colorMap[status] || '#6b7280';
}

// Get priority class for styling
function getPriorityClass(priority) {
    const priorityMap = {
        'low': 'priority-low',
        'LOW': 'priority-low',
        'medium': 'priority-medium',
        'MEDIUM': 'priority-medium',
        'high': 'priority-high',
        'HIGH': 'priority-high',
        'urgent': 'priority-urgent',
        'URGENT': 'priority-urgent',
        'emergency': 'priority-emergency',
        'EMERGENCY': 'priority-emergency'
    };
    return priorityMap[priority] || 'priority-medium';
}

// Get priority color for styling
function getPriorityColor(priority) {
    const colorMap = {
        'low': '#10b981',
        'LOW': '#10b981',
        'medium': '#3b82f6',
        'MEDIUM': '#3b82f6',
        'high': '#f59e0b',
        'HIGH': '#f59e0b',
        'urgent': '#ef4444',
        'URGENT': '#ef4444',
        'emergency': '#dc2626',
        'EMERGENCY': '#dc2626'
    };
    return colorMap[priority] || '#3b82f6';
}

// Format ticket display with consistent styling
function formatTicketDisplay(ticket) {
    return {
        id: getTicketName(ticket),
        title: ticket.title || 'No Title',
        status: ticket.status || 'unknown',
        priority: ticket.priority || 'medium',
        statusClass: getTicketStatusClass(ticket.status),
        statusColor: getTicketStatusColor(ticket.status),
        priorityClass: getPriorityClass(ticket.priority),
        priorityColor: getPriorityColor(ticket.priority),
        zone: ticket.zone || 'Unknown',
        assignedTo: ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam || 'Unassigned',
        location: ticket.location?.address || 'No Location',
        duration: ticket.estimatedDuration || ticket.duration || 90,
        category: ticket.category || 'general'
    };
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getTicketName,
        getTicketStatusClass,
        getTicketStatusColor,
        getPriorityClass,
        getPriorityColor,
        formatTicketDisplay
    };
}
