// Field Team Portal JavaScript
// Global variables
let currentUser = null;
let myTickets = [];
let routeMap = null;
let routeMarkers = [];
let charts = {};

// API Base URL
const API_BASE = 'http://localhost:5002/api';

// Initialize the field portal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Field Team Portal Initializing...');
    
    // Get current user (in real app, this would come from authentication)
    currentUser = {
        id: '1',
        name: 'Ali',
        role: 'Field Technician',
        email: 'ali@company.com',
        phone: '555-0101',
        skills: ['electrical', 'general'],
        hourlyRate: 45.00
    };
    
    // Update user info in header
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role;
    
    // Initialize portal
    loadFieldPortalData();
    initializeRouteMap();
    initializeCharts();
    
    console.log('✅ Field Team Portal initialization complete!');
});

// Load all field portal data
async function loadFieldPortalData() {
    try {
        await Promise.all([
            loadMyTickets(),
            loadQuickStats(),
            loadRouteData(),
            loadPerformanceData(),
            loadExpenseData()
        ]);
    } catch (error) {
        console.error('Error loading field portal data:', error);
        showSampleData();
    }
}

// Load my assigned tickets
async function loadMyTickets() {
    console.log('🎫 Loading field portal tickets from', API_BASE);
    
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();
        
        console.log('✅ Received tickets:', data.tickets ? data.tickets.length : 0);
        
        // Get a mix of tickets with different statuses for demo
        const allTickets = data.tickets || [];
        const openTickets = allTickets.filter(t => t.status === 'open' || t.status === 'assigned').slice(0, 4);
        const inProgressTickets = allTickets.filter(t => t.status === 'in_progress').slice(0, 4);
        const resolvedTickets = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed' || t.status === 'completed').slice(0, 3);
        
        myTickets = [...openTickets, ...inProgressTickets, ...resolvedTickets];
        
        console.log('🎫 Field portal displaying:', myTickets.length, 'tickets', {
            open: openTickets.length,
            inProgress: inProgressTickets.length,
            resolved: resolvedTickets.length,
            allStatuses: [...new Set(myTickets.map(t => t.status))]
        });
        
        if (myTickets.length === 0) {
            // Show sample data
            myTickets = [
                {
                    _id: '1',
                    ticketNumber: 'TK-001',
                    title: 'Network Breakdown - NTT Class 1 (Major)',
                    description: 'Complete network infrastructure failure - NTT Class 1 major breakdown affecting all customer services and network connectivity',
                    priority: 'emergency',
                    status: 'assigned',
                    category: 'network',
                    customer: {
                        name: 'Ali',
                        email: 'ali@company.com',
                        phone: '555-0123'
                    },
                    location: {
                        address: 'Jalan Ampang, Kuala Lumpur City Centre, 50450 KL',
                        latitude: 3.1390,
                        longitude: 101.6869
                    },
                    estimatedDuration: 240,
                    createdAt: new Date().toISOString(),
                    assignedAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    ticketNumber: 'TK-002',
                    title: 'Network Breakdown - NTT Class 2 (Intermediate)',
                    description: 'Intermediate network infrastructure issues - NTT Class 2 breakdown affecting multiple customer services and network segments',
                    priority: 'high',
                    status: 'in-progress',
                    category: 'network',
                    customer: {
                        name: 'Muthu',
                        email: 'muthu@company.com',
                        phone: '555-0124'
                    },
                    location: {
                        address: 'Jalan Bukit Bintang, Bukit Bintang, 55100 KL',
                        latitude: 3.1490,
                        longitude: 101.7000
                    },
                    estimatedDuration: 120,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    assignedAt: new Date(Date.now() - 1800000).toISOString()
                },
                {
                    _id: '3',
                    ticketNumber: 'TK-003',
                    title: 'Customer - Drop Fiber',
                    description: 'Customer drop fiber connection failure - fiber optic cable damage or termination issues requiring immediate field repair',
                    priority: 'high',
                    status: 'completed',
                    category: 'customer',
                    customer: {
                        name: 'Ah-Hock',
                        email: 'ah-hock@company.com',
                        phone: '555-0125'
                    },
                    location: {
                        address: 'Jalan Sultan Ismail, Chow Kit, 50350 KL',
                        latitude: 3.1650,
                        longitude: 101.7000
                    },
                    estimatedDuration: 90,
                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                    assignedAt: new Date(Date.now() - 5400000).toISOString(),
                    completedAt: new Date(Date.now() - 1800000).toISOString()
                },
                {
                    _id: '4',
                    ticketNumber: 'TK-004',
                    title: 'Customer - CPE',
                    description: 'Customer Premises Equipment (CPE) troubleshooting - router, modem, or network equipment configuration and connectivity issues',
                    priority: 'medium',
                    status: 'assigned',
                    category: 'customer',
                    customer: {
                        name: 'Nurul',
                        email: 'nurul@company.com',
                        phone: '555-0126'
                    },
                    location: {
                        address: 'Jalan Tun Razak, Mont Kiara, 50480 KL',
                        latitude: 3.1700,
                        longitude: 101.6500
                    },
                    estimatedDuration: 60,
                    createdAt: new Date(Date.now() - 10800000).toISOString(),
                    assignedAt: new Date(Date.now() - 9000000).toISOString()
                },
                {
                    _id: '5',
                    ticketNumber: 'TK-005',
                    title: 'Customer - FDP Breakdown',
                    description: 'Fiber Distribution Point (FDP) equipment failure - distribution cabinet or fiber optic splitter issues affecting multiple customer connections',
                    priority: 'high',
                    status: 'open',
                    category: 'customer',
                    customer: {
                        name: 'Ali',
                        email: 'ali@company.com',
                        phone: '555-0127'
                    },
                    location: {
                        address: 'Jalan Pudu, Pudu, 55100 KL',
                        latitude: 3.1400,
                        longitude: 101.7100
                    },
                    estimatedDuration: 150,
                    createdAt: new Date(Date.now() - 1800000).toISOString()
                }
            ];
        }
        
        displayMyTickets();
    } catch (error) {
        console.error('Error loading my tickets:', error);
        showSampleData();
    }
}

// Display my tickets
let currentTicketFilter = 'all';

function displayMyTickets(filter = 'all') {
    const container = document.getElementById('my-tickets-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filter tickets based on status
    let filteredTickets = myTickets;
    if (filter !== 'all') {
        filteredTickets = myTickets.filter(ticket => {
            const status = ticket.status.replace('_', '-');
            
            // Handle 'resolved' filter to include both resolved and closed
            if (filter === 'resolved') {
                return status === 'resolved' || status === 'closed' || status === 'completed';
            }
            
            return status === filter;
        });
    }
    
    console.log(`📋 Displaying ${filteredTickets.length} tickets (filter: ${filter})`, {
        total: myTickets.length,
        filtered: filteredTickets.length,
        statuses: myTickets.map(t => t.status)
    });
    
    if (filteredTickets.length === 0) {
        const filterLabel = filter === 'resolved' ? 'completed' : filter;
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No ${filterLabel === 'all' ? '' : filterLabel} tickets</h5>
                <p class="text-muted">You don't have any ${filterLabel === 'all' ? 'tickets assigned' : filterLabel + ' tickets'} at the moment.</p>
            </div>
        `;
        return;
    }
    
    filteredTickets.forEach(ticket => {
        const ticketElement = createTicketCard(ticket);
        container.appendChild(ticketElement);
    });
}

function filterTickets(status) {
    console.log('🔍 Filtering tickets by:', status);
    currentTicketFilter = status;
    
    // Update filter button states
    document.querySelectorAll('.btn-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`filter-${status}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    displayMyTickets(status);
}

// Create ticket card
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    // Handle different data structures from backend
    const ticketNumber = ticket.ticketNumber || ticket._id.substring(0, 8);
    const customerName = ticket.customer?.name || ticket.customerInfo?.name || 'N/A';
    const locationAddress = ticket.location?.address || 'N/A';
    const estimatedDuration = ticket.estimatedDuration || 90;
    
    const priorityClass = `priority-${ticket.priority}`;
    const statusClass = `status-${ticket.status.replace('_', '-')}`;
    
    // Determine traffic light color
    const trafficLight = getTrafficLightColor(ticket.status);
    
    card.innerHTML = `
        <div class="ticket-header">
            <div>
                <div class="ticket-title">${ticket.title}</div>
                <div class="ticket-number">${ticketNumber}</div>
            </div>
            <div class="ticket-priority ${priorityClass}">${ticket.priority}</div>
        </div>
        
        <div class="ticket-details">
            <div class="ticket-detail">
                <i class="fas fa-user"></i>
                <span>${customerName}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${locationAddress}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-clock"></i>
                <span>${estimatedDuration} min</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-tag"></i>
                <span>${ticket.category}</span>
            </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="status-indicator ${statusClass}">
                <span class="traffic-light ${trafficLight}"></span>
                <span>${formatStatus(ticket.status)}</span>
            </div>
            <div class="ticket-actions">
                ${getTicketActionButtons(ticket)}
            </div>
        </div>
    `;
    
    return card;
}

// Get traffic light color based on status
function getTrafficLightColor(status) {
    const normalizedStatus = status.replace('_', '-');
    
    switch (normalizedStatus) {
        case 'open':
        case 'assigned':
            return 'yellow'; // Yellow = Pending/Assigned
        case 'in-progress':
            return 'green'; // Green = In Progress/Active
        case 'completed':
        case 'resolved':
            return 'green'; // Green = Completed
        case 'closed':
            return 'gray'; // Gray = Closed
        default:
            return 'red'; // Red = Problem/Unknown
    }
}

// Format status for display
function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get ticket action buttons based on status
function getTicketActionButtons(ticket) {
    const status = ticket.status.replace('_', '-');
    const ticketId = ticket._id;
    
    switch (status) {
        case 'open':
        case 'assigned':
            return `
                <button class="ticket-action-btn start" onclick="startTicketWork('${ticketId}')">
                    <i class="fas fa-play"></i>
                    Start Work
                </button>
                <button class="ticket-action-btn view" onclick="viewTicketDetails('${ticketId}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
            `;
        case 'in-progress':
            return `
                <button class="ticket-action-btn complete" onclick="completeTicketWork('${ticketId}')">
                    <i class="fas fa-check"></i>
                    Complete
                </button>
                <button class="ticket-action-btn view" onclick="viewTicketDetails('${ticketId}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
            `;
        case 'completed':
        case 'resolved':
            return `
                <button class="ticket-action-btn view" onclick="viewTicketDetails('${ticketId}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            `;
        case 'closed':
            return `
                <button class="ticket-action-btn view" onclick="viewTicketDetails('${ticketId}')">
                    <i class="fas fa-file-alt"></i>
                    View Report
                </button>
            `;
        default:
            return `
                <button class="ticket-action-btn view" onclick="viewTicketDetails('${ticketId}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
            `;
    }
}

// Get ticket actions based on status
// Start ticket work
function startTicketWork(ticketId) {
    console.log('▶️ Starting work on ticket:', ticketId);
    
    const ticket = myTickets.find(t => t._id === ticketId);
    if (!ticket) {
        console.error('Ticket not found:', ticketId);
        return;
    }
    
    const ticketNum = ticket.ticketNumber || ticketId.substring(0, 8);
    
    // Confirm start
    if (confirm(`Start work on ${ticketNum}?\n\n${ticket.title}\n${ticket.location?.address || ''}`)) {
        // Update ticket status
        ticket.status = 'in_progress';
        ticket.startedAt = new Date().toISOString();
        
        // Show notification
        showNotification(`✅ Started work on ${ticketNum}`, 'success');
        
        // Refresh display
        displayMyTickets(currentTicketFilter);
        
        // Reload quick stats
        loadQuickStats();
        
        console.log('✅ Ticket status updated to in_progress');
    }
}

// Complete ticket work
function completeTicketWork(ticketId) {
    console.log('✅ Completing ticket:', ticketId);
    
    const ticket = myTickets.find(t => t._id === ticketId);
    if (!ticket) {
        console.error('Ticket not found:', ticketId);
        return;
    }
    
    const ticketNum = ticket.ticketNumber || ticketId.substring(0, 8);
    
    // Confirm completion
    if (confirm(`Mark ${ticketNum} as complete?\n\n${ticket.title}\n\nThis will update the ticket status to resolved.`)) {
        // Update ticket status
        ticket.status = 'resolved';
        ticket.completedAt = new Date().toISOString();
        
        // Show success notification
        showNotification(`🎉 Completed ${ticketNum}! Great work!`, 'success');
        
        // Refresh display
        displayMyTickets(currentTicketFilter);
        
        // Reload quick stats
        loadQuickStats();
        
        console.log('✅ Ticket marked as resolved');
    }
}

// Load quick stats
async function loadQuickStats() {
    console.log('📊 Loading quick stats...');
    
    try {
        // Get tickets data
        const ticketsResponse = await fetch(`${API_BASE}/tickets`);
        const ticketsData = await ticketsResponse.json();
        const allTickets = ticketsData.tickets || [];
        
        // Get teams data for ratings
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        const allTeams = teamsData.teams || [];
        
        console.log('📊 Stats data:', { tickets: allTickets.length, teams: allTeams.length });
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayTickets = allTickets.filter(ticket => {
            try {
                return new Date(ticket.createdAt).toDateString() === today;
            } catch {
                return false;
            }
        });
        
        const completedTickets = allTickets.filter(ticket => 
            ticket.status === 'completed' || ticket.status === 'resolved' || ticket.status === 'closed'
        );
        
        // Calculate average rating from all teams
        const avgRating = allTeams.length > 0 
            ? allTeams.reduce((sum, team) => sum + (team.productivity?.customerRating || 4.5), 0) / allTeams.length
            : 4.50;
        
        // Calculate earnings (using first team's rate as reference)
        const hourlyRate = allTeams[0]?.hourlyRate || 45.00;
        const earningsToday = completedTickets.length * hourlyRate * 0.5;
        
        // Update UI
        if (document.getElementById('today-tickets')) {
            document.getElementById('today-tickets').textContent = todayTickets.length || myTickets.length;
        }
        if (document.getElementById('completed-tickets')) {
            document.getElementById('completed-tickets').textContent = completedTickets.length;
        }
        if (document.getElementById('avg-rating')) {
            document.getElementById('avg-rating').textContent = avgRating.toFixed(2);
        }
        if (document.getElementById('earnings-today')) {
            document.getElementById('earnings-today').textContent = `RM ${earningsToday.toFixed(2)}`;
        }
        
        console.log('✅ Quick stats updated:', {
            todayTickets: todayTickets.length,
            completed: completedTickets.length,
            rating: avgRating.toFixed(2),
            earnings: earningsToday.toFixed(2)
        });
        
    } catch (error) {
        console.error('❌ Error loading quick stats:', error);
        // Set fallback values
        if (document.getElementById('today-tickets')) document.getElementById('today-tickets').textContent = myTickets.length;
        if (document.getElementById('completed-tickets')) document.getElementById('completed-tickets').textContent = '0';
        if (document.getElementById('avg-rating')) document.getElementById('avg-rating').textContent = '4.50';
        if (document.getElementById('earnings-today')) document.getElementById('earnings-today').textContent = 'RM 0.00';
    }
}

// Initialize route map
function initializeRouteMap() {
    // Center on Kuala Lumpur, Malaysia
    routeMap = L.map('route-map').setView([3.1390, 101.6869], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
    
    loadRouteData();
}

// Load route data
async function loadRouteData() {
    console.log('🗺️ Loading route data...');
    
    try {
        // Fetch all tickets for route planning
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();
        const allTickets = data.tickets || [];
        
        console.log('🗺️ Fetched', allTickets.length, 'total tickets');
        
        // Clear existing markers
        routeMarkers.forEach(marker => routeMap.removeLayer(marker));
        routeMarkers = [];
        
        // Filter for tickets that need routing (open, assigned, in-progress)
        const assignedTickets = allTickets.filter(ticket => 
            ticket.status === 'assigned' || ticket.status === 'in_progress' || ticket.status === 'open'
        );
        
        console.log('🗺️ Displaying', assignedTickets.length, 'active tickets on map');
        
        assignedTickets.forEach((ticket, index) => {
            // Handle backend data structure
            const lat = ticket.location?.coordinates?.lat || ticket.location?.latitude || 3.1390;
            const lng = ticket.location?.coordinates?.lng || ticket.location?.longitude || 101.6869;
            const duration = ticket.estimatedDuration || 90;
            
            const marker = L.marker([lat, lng])
                .addTo(routeMap)
                .bindPopup(`
                    <div>
                        <h6>${ticket.title}</h6>
                        <p><strong>Priority:</strong> ${ticket.priority}</p>
                        <p><strong>Duration:</strong> ${duration} min</p>
                        <p><strong>Address:</strong> ${ticket.location?.address || 'N/A'}</p>
                    </div>
                `);
            
            routeMarkers.push(marker);
        });
        
        // Update route list
        updateRouteList(assignedTickets);
        
        // Fit map to show all markers
        if (routeMarkers.length > 0) {
            const group = new L.featureGroup(routeMarkers);
            routeMap.fitBounds(group.getBounds().pad(0.1));
        }
        
        console.log('✅ Route data loaded');
        
    } catch (error) {
        console.error('❌ Error loading route data:', error);
    }
}

// Update route list
function updateRouteList(tickets) {
    const container = document.getElementById('route-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-route fa-2x text-muted mb-2"></i>
                <p class="text-muted">No active tickets for routing</p>
            </div>
        `;
        return;
    }
    
    tickets.forEach((ticket, index) => {
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item';
        routeItem.style.cursor = 'pointer';
        const duration = ticket.estimatedDuration || 90;
        const ticketNum = ticket.ticketNumber || ticket._id.substring(0, 8);
        
        routeItem.innerHTML = `
            <div class="route-number">${index + 1}</div>
            <div class="route-info">
                <h6>${ticketNum} - ${ticket.title}</h6>
                <small><i class="fas fa-map-marker-alt"></i> ${ticket.location?.address || 'N/A'}</small>
            </div>
            <div class="route-time">
                <i class="fas fa-clock"></i> ${duration}m
            </div>
        `;
        
        // Add click handler to show route to this ticket
        routeItem.addEventListener('click', () => {
            showRouteToTicket(ticket, index);
        });
        
        container.appendChild(routeItem);
    });
    
    // Update totals
    const totalDistance = calculateTotalDistance(tickets);
    const totalTime = tickets.reduce((sum, ticket) => sum + (ticket.estimatedDuration || 90), 0);
    
    if (document.getElementById('total-distance')) {
        document.getElementById('total-distance').textContent = `${totalDistance.toFixed(2)} km`;
    }
    if (document.getElementById('total-time')) {
        document.getElementById('total-time').textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;
    }
}

// Calculate total distance between tickets
function calculateTotalDistance(tickets) {
    if (tickets.length === 0) return 0;
    
    let totalDistance = 0;
    
    // Start from current location (Kuala Lumpur as default)
    let prevLat = 3.1390;
    let prevLng = 101.6869;
    
    tickets.forEach(ticket => {
        const lat = ticket.location?.coordinates?.lat || ticket.location?.latitude || 3.1390;
        const lng = ticket.location?.coordinates?.lng || ticket.location?.longitude || 101.6869;
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(prevLat, prevLng, lat, lng);
        totalDistance += distance;
        
        prevLat = lat;
        prevLng = lng;
    });
    
    return totalDistance;
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Show route to specific ticket
let currentRouteLayer = null;

function showRouteToTicket(ticket, index) {
    console.log('🗺️ Showing route to ticket:', ticket.ticketNumber || ticket._id);
    
    // Get coordinates
    const lat = ticket.location?.coordinates?.lat || ticket.location?.latitude || 3.1390;
    const lng = ticket.location?.coordinates?.lng || ticket.location?.longitude || 101.6869;
    
    // Remove previous route layer if exists
    if (currentRouteLayer) {
        routeMap.removeLayer(currentRouteLayer);
    }
    
    // Current location (start point - Kuala Lumpur as default)
    const startLat = 3.1390;
    const startLng = 101.6869;
    
    // Create route line
    const routeLine = L.polyline([
        [startLat, startLng],
        [lat, lng]
    ], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(routeMap);
    
    currentRouteLayer = routeLine;
    
    // Add start marker
    const startMarker = L.marker([startLat, startLng], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">START</div>',
            iconSize: [30, 30]
        })
    }).addTo(routeMap);
    
    // Add to route layer for cleanup
    currentRouteLayer = L.layerGroup([routeLine, startMarker]).addTo(routeMap);
    
    // Calculate distance and time
    const distance = calculateDistance(startLat, startLng, lat, lng);
    const travelTime = Math.round(distance / 40 * 60); // Assuming 40 km/h average speed
    const duration = ticket.estimatedDuration || 90;
    const ticketNum = ticket.ticketNumber || ticket._id.substring(0, 8);
    
    // Fit map to show route
    routeMap.fitBounds([
        [startLat, startLng],
        [lat, lng]
    ], { padding: [50, 50] });
    
    // Highlight the selected marker and show detailed popup
    routeMarkers.forEach((marker, i) => {
        if (i === index) {
            marker.openPopup();
            marker.setIcon(L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #ef4444; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">${index + 1}</div>`,
                iconSize: [40, 40]
            }));
        }
    });
    
    // Show route details in a notification/alert
    showRouteDetails({
        ticketNumber: ticketNum,
        title: ticket.title,
        address: ticket.location?.address || 'N/A',
        distance: distance.toFixed(2),
        travelTime: travelTime,
        workDuration: duration,
        totalTime: travelTime + duration
    });
}

// Show route details
function showRouteDetails(routeInfo) {
    // Create or update route details panel
    let detailsPanel = document.getElementById('route-details-panel');
    
    if (!detailsPanel) {
        detailsPanel = document.createElement('div');
        detailsPanel.id = 'route-details-panel';
        detailsPanel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
        `;
        document.getElementById('route-map').appendChild(detailsPanel);
    }
    
    detailsPanel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h6 style="margin: 0; color: #1e293b;">
                <i class="fas fa-route"></i> Route Details
            </h6>
            <button onclick="closeRouteDetails()" style="border: none; background: none; cursor: pointer; font-size: 18px; color: #64748b;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <hr style="margin: 10px 0;">
        <div style="margin-bottom: 8px;">
            <strong style="color: #3b82f6;">${routeInfo.ticketNumber}</strong>
        </div>
        <div style="margin-bottom: 8px; font-size: 14px;">
            <strong>${routeInfo.title}</strong>
        </div>
        <div style="margin-bottom: 12px; font-size: 13px; color: #64748b;">
            <i class="fas fa-map-marker-alt"></i> ${routeInfo.address}
        </div>
        <hr style="margin: 10px 0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
            <div>
                <div style="color: #64748b;">Distance</div>
                <strong style="color: #1e293b;">${routeInfo.distance} km</strong>
            </div>
            <div>
                <div style="color: #64748b;">Travel Time</div>
                <strong style="color: #1e293b;">${routeInfo.travelTime} min</strong>
            </div>
            <div>
                <div style="color: #64748b;">Work Duration</div>
                <strong style="color: #1e293b;">${routeInfo.workDuration} min</strong>
            </div>
            <div>
                <div style="color: #64748b;">Total Time</div>
                <strong style="color: #10b981;">${routeInfo.totalTime} min</strong>
            </div>
        </div>
        <button onclick="startNavigation('${routeInfo.ticketNumber}')" style="
            width: 100%;
            margin-top: 12px;
            padding: 8px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        ">
            <i class="fas fa-navigation"></i> Start Navigation
        </button>
    `;
}

// Close route details panel
function closeRouteDetails() {
    const detailsPanel = document.getElementById('route-details-panel');
    if (detailsPanel) {
        detailsPanel.remove();
    }
    
    // Remove route layer
    if (currentRouteLayer) {
        routeMap.removeLayer(currentRouteLayer);
        currentRouteLayer = null;
    }
    
    // Reset all markers to normal
    routeMarkers.forEach((marker, i) => {
        marker.setIcon(L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
            iconSize: [30, 30]
        }));
    });
}

// Start navigation to ticket
function startNavigation(ticketNumber) {
    console.log('🧭 Starting navigation to:', ticketNumber);
    alert(`Navigation started to ${ticketNumber}!\n\nIn a production system, this would:\n- Open GPS navigation app\n- Provide turn-by-turn directions\n- Track real-time progress\n- Update ticket status to "En Route"`);
}

// Initialize charts
function initializeCharts() {
    // Weekly Performance Chart
    const weeklyCtx = document.getElementById('weekly-chart').getContext('2d');
    charts.weekly = new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tickets Completed',
                data: [3, 5, 4, 6, 7, 2, 1],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Category Chart
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    charts.category = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Electrical', 'HVAC', 'Plumbing', 'Maintenance'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Response Time Chart
    const responseCtx = document.getElementById('response-chart').getContext('2d');
    charts.response = new Chart(responseCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Avg Response Time (min)',
                data: [45, 38, 42, 35],
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Rating Chart
    const ratingCtx = document.getElementById('rating-chart').getContext('2d');
    charts.rating = new Chart(ratingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Customer Rating',
                data: [4.5, 4.6, 4.7, 4.8, 4.7, 4.8],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: 4.0,
                    max: 5.0
                }
            }
        }
    });
    
    // Expense Chart
    const expenseCtx = document.getElementById('expense-chart').getContext('2d');
    charts.expense = new Chart(expenseCtx, {
        type: 'bar',
        data: {
            labels: ['Fuel', 'Materials', 'Tools', 'Meals', 'Parking'],
            datasets: [{
                label: 'Expenses ($)',
                data: [120, 85, 45, 60, 25],
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load performance data
async function loadPerformanceData() {
    console.log('📈 Loading performance data...');
    
    try {
        // Get teams data for performance metrics
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        const allTeams = teamsData.teams || [];
        
        if (allTeams.length > 0) {
            // Calculate average performance metrics
            const avgEfficiency = allTeams.reduce((sum, team) => 
                sum + (team.productivity?.efficiencyScore || 85), 0) / allTeams.length;
            const avgRating = allTeams.reduce((sum, team) => 
                sum + (team.productivity?.customerRating || 4.5), 0) / allTeams.length;
            const totalTickets = allTeams.reduce((sum, team) => 
                sum + (team.productivity?.totalTicketsCompleted || 0), 0);
            
            console.log('📈 Performance metrics:', {
                efficiency: avgEfficiency.toFixed(2),
                rating: avgRating.toFixed(2),
                totalTickets
            });
        }
        
        console.log('✅ Performance data loaded');
    } catch (error) {
        console.error('❌ Error loading performance data:', error);
    }
}

// Load expense data
async function loadExpenseData() {
    console.log('💰 Loading expense data...');
    
    try {
        // Get teams data for hourly rates
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        const allTeams = teamsData.teams || [];
        
        // Calculate expenses based on completed tickets
        const completedCount = myTickets.filter(t => 
            t.status === 'completed' || t.status === 'resolved' || t.status === 'closed'
        ).length;
        
        const hourlyRate = allTeams[0]?.hourlyRate || 45.00;
        const monthlyExpenses = completedCount * hourlyRate * 2; // Estimate
        const lastMonthExpenses = monthlyExpenses * 0.9;
        const dailyAvg = monthlyExpenses / 30;
        const reimbursed = monthlyExpenses * 0.95;
        
        // Load expense summary
        const expenseSummary = document.getElementById('expense-summary');
        if (expenseSummary) {
            expenseSummary.innerHTML = `
                <div class="d-flex justify-content-between mb-2">
                    <span>This Month:</span>
                    <strong>RM ${monthlyExpenses.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Last Month:</span>
                    <strong>RM ${lastMonthExpenses.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Average/Day:</span>
                    <strong>RM ${dailyAvg.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Reimbursed:</span>
                    <strong class="text-success">RM ${reimbursed.toFixed(2)}</strong>
                </div>
            `;
        }
        
        // Load recent expenses with Malaysian context
        const recentExpenses = document.getElementById('recent-expenses');
        if (recentExpenses) {
            recentExpenses.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Fuel - Petrol Station</h6>
                            <small class="text-muted">Today, 2:30 PM</small>
                        </div>
                        <span class="badge bg-danger">RM 65.00</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Materials - Fiber Supplies</h6>
                            <small class="text-muted">Yesterday, 4:15 PM</small>
                        </div>
                        <span class="badge bg-primary">RM 128.50</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Meals - Lunch</h6>
                            <small class="text-muted">Yesterday, 12:30 PM</small>
                        </div>
                        <span class="badge bg-warning">RM 25.00</span>
                    </div>
                </div>
            `;
        }
        
        console.log('✅ Expense data loaded:', {
            monthly: monthlyExpenses.toFixed(2),
            daily: dailyAvg.toFixed(2)
        });
        
    } catch (error) {
        console.error('❌ Error loading expense data:', error);
    }
}

// Tab navigation
function showFieldTab(tabName) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.field-tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Remove active class from all tab panes
    document.querySelectorAll('.field-tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
    
    // Show corresponding tab pane
    const targetPane = document.getElementById(`${tabName}-tab`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    // Load tab-specific data
    switch(tabName) {
        case 'my-tickets':
            loadMyTickets();
            break;
        case 'route-planning':
            // Invalidate map size when tab becomes visible
            setTimeout(() => {
                if (routeMap) {
                    routeMap.invalidateSize();
                }
                loadRouteData();
            }, 100);
            break;
        case 'performance':
            loadPerformanceData();
            break;
        case 'expenses':
            loadExpenseData();
            break;
    }
}

// Ticket actions
function startTicket(ticketId) {
    const ticket = myTickets.find(t => t._id === ticketId);
    if (ticket) {
        ticket.status = 'in-progress';
        displayMyTickets();
        showNotification('Ticket started successfully!', 'success');
    }
}

function completeTicket(ticketId) {
    const ticket = myTickets.find(t => t._id === ticketId);
    if (ticket) {
        ticket.status = 'completed';
        ticket.completedAt = new Date().toISOString();
        displayMyTickets();
        loadQuickStats();
        showNotification('Ticket completed successfully!', 'success');
    }
}

function pauseTicket(ticketId) {
    const ticket = myTickets.find(t => t._id === ticketId);
    if (ticket) {
        ticket.status = 'assigned';
        displayMyTickets();
        showNotification('Ticket paused', 'info');
    }
}

function viewTicketDetails(ticketId) {
    const ticket = myTickets.find(t => t._id === ticketId);
    if (ticket) {
        alert(`Ticket Details:\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nCustomer: ${ticket.customer.name}\nPhone: ${ticket.customer.phone}\nAddress: ${ticket.location.address}`);
    }
}

function addExpenseForTicket(ticketId) {
    showAddExpenseModal();
}

// Route planning
function optimizeRoute() {
    showNotification('Route optimization in progress...', 'info');
    // Route optimization logic would go here
    setTimeout(() => {
        showNotification('Route optimized successfully!', 'success');
        loadRouteData();
    }, 2000);
}

function refreshRoute() {
    loadRouteData();
    showNotification('Route data refreshed', 'info');
}

// Expense management
function showAddExpenseModal() {
    const modal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
    modal.show();
}

function submitExpense() {
    const type = document.getElementById('expense-type').value;
    const amount = document.getElementById('expense-amount').value;
    const description = document.getElementById('expense-description').value;
    
    if (!type || !amount) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Submit expense (would send to API)
    showNotification('Expense added successfully!', 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addExpenseModal'));
    modal.hide();
    document.getElementById('expense-form').reset();
    
    // Refresh expense data
    loadExpenseData();
}

// Filter tickets
function filterTickets(status) {
    const container = document.getElementById('my-tickets-list');
    container.innerHTML = '';
    
    let filteredTickets = myTickets;
    if (status !== 'all') {
        filteredTickets = myTickets.filter(ticket => ticket.status === status);
    }
    
    if (filteredTickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No tickets found</h5>
                <p class="text-muted">No tickets match the selected filter.</p>
            </div>
        `;
        return;
    }
    
    filteredTickets.forEach(ticket => {
        const ticketElement = createTicketCard(ticket);
        container.appendChild(ticketElement);
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function showSampleData() {
    // Show sample data when API is not available
    console.log('Showing sample data for field portal');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In real app, this would clear authentication and redirect
        window.location.href = 'index.html';
    }
}

// AI Assistant Functions
let fieldAIChatHistory = [];
let isFieldAIVisible = true;

function toggleFieldAIWidget() {
    const widget = document.getElementById('field-ai-widget');
    const toggleBtn = document.getElementById('field-ai-toggle-btn');
    
    isFieldAIVisible = !isFieldAIVisible;
    
    if (isFieldAIVisible) {
        // Show widget, hide button
        widget.classList.remove('minimized');
        toggleBtn.classList.add('hidden');
        console.log('🤖 AI Assistant opened');
    } else {
        // Hide widget, show button
        widget.classList.add('minimized');
        toggleBtn.classList.remove('hidden');
        console.log('🤖 AI Assistant minimized');
    }
}

function toggleFieldAI() {
    // For mobile - expand/collapse widget
    if (window.innerWidth <= 768) {
        const widget = document.getElementById('field-ai-widget');
        widget.classList.toggle('expanded');
    }
}

function sendFieldQuickQuery(query) {
    console.log('🤖 Quick query:', query);
    sendFieldAIMessage(query);
}

async function sendFieldAIMessage(customQuery = null) {
    const input = document.getElementById('field-ai-input');
    const sendBtn = document.getElementById('field-ai-send-btn');
    const chatContainer = document.getElementById('field-ai-chat');
    
    const query = customQuery || input.value.trim();
    
    if (!query) return;
    
    console.log('🤖 Sending field AI query:', query);
    
    // Clear input
    if (!customQuery) {
        input.value = '';
    }
    
    // Disable send button
    sendBtn.disabled = true;
    
    // Add user message
    addFieldAIMessage(query, 'user');
    
    // Show typing indicator
    showFieldAITyping();
    
    try {
        // Get context data
        const context = await getFieldTeamContext();
        
        // Send to AI API
        const response = await fetch(`${API_BASE}/ai/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                context: {
                    userType: 'field_team',
                    userName: currentUser.name,
                    teamData: context
                }
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeFieldAITyping();
        
        // Add AI response
        addFieldAIMessage(data.response, 'assistant');
        
        // Store in history
        fieldAIChatHistory.push({
            query: query,
            response: data.response,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ AI response received');
        
    } catch (error) {
        console.error('❌ Error querying AI:', error);
        removeFieldAITyping();
        addFieldAIMessage(
            'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
            'assistant'
        );
    } finally {
        sendBtn.disabled = false;
    }
}

async function getFieldTeamContext() {
    // Get current context for AI
    try {
        const ticketsResponse = await fetch(`${API_BASE}/tickets`);
        const ticketsData = await ticketsResponse.json();
        
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        
        const myActiveTickets = myTickets.filter(t => 
            t.status === 'open' || t.status === 'in_progress' || t.status === 'assigned'
        );
        
        return {
            ticketCount: myTickets.length,
            activeTickets: myActiveTickets.length,
            todayTickets: myTickets,
            performance: {
                rating: 4.8,
                efficiency: 92,
                completedToday: myTickets.filter(t => t.status === 'completed' || t.status === 'resolved').length
            },
            totalSystemTickets: ticketsData.total || 0,
            totalSystemTeams: teamsData.total || 0
        };
    } catch (error) {
        console.error('Error getting context:', error);
        return {
            ticketCount: myTickets.length,
            activeTickets: myTickets.length
        };
    }
}

function addFieldAIMessage(message, type) {
    const chatContainer = document.getElementById('field-ai-chat');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `field-ai-message ${type}`;
    
    const avatar = type === 'assistant' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="field-ai-avatar">
            ${avatar}
        </div>
        <div class="field-ai-bubble">
            ${message.replace(/\n/g, '<br>')}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showFieldAITyping() {
    const chatContainer = document.getElementById('field-ai-chat');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'field-ai-message assistant';
    typingDiv.id = 'field-ai-typing';
    
    typingDiv.innerHTML = `
        <div class="field-ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="field-ai-bubble">
            <div class="field-ai-typing">
                <div class="field-ai-typing-dot"></div>
                <div class="field-ai-typing-dot"></div>
                <div class="field-ai-typing-dot"></div>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeFieldAITyping() {
    const typingDiv = document.getElementById('field-ai-typing');
    if (typingDiv) {
        typingDiv.remove();
    }
}
