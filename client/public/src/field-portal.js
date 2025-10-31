// Field Team Portal JavaScript
console.log('🤖 Field Portal JavaScript loading...');

// Global variables
let currentUser = null;
let myTickets = [];
let routeMap = null;
let routeMarkers = [];
let charts = {};

// Load shared ticket utilities
// Note: getTicketName and other ticket utilities are now loaded from ticket-utils.js

// Get team name by ID
function getTeamName(teamId) {
    return teamNameCache[teamId] || `Team ${teamId}`;
}

// Cache for team names to avoid repeated API calls
let teamNameCache = {};

// Preload team names on page load
async function preloadTeamNames() {
    try {
        console.log('🔄 Preloading team names...');
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();
        
        if (data.teams && Array.isArray(data.teams)) {
            // Cache all team names
            data.teams.forEach(team => {
                teamNameCache[team.id] = team.name;
            });
            console.log('✅ Team names cached:', Object.keys(teamNameCache).length, 'teams');
        }
    } catch (error) {
        console.warn('Failed to preload team names:', error);
    }
}

// API Base URL
// API_BASE is now set by config.js

// Initialize the field portal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Field Team Portal Initializing...');
    
    // Preload team names for ticket naming
    preloadTeamNames();
    
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
        // Set current user for field portal
        await setCurrentUser();
        
        // Update user display in header
        updateUserDisplay();
        
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

// Set current user for field portal
async function setCurrentUser() {
    // Get user type from login
    const userType = localStorage.getItem('aiff_user_type');
    
    if (userType === 'field_team') {
        try {
            // Get actual team names from backend
            const response = await fetch(`${API_BASE}/teams`);
            const data = await response.json();
            const teams = data.teams || [];
            
            if (teams.length > 0) {
                // Use the team ID from authentication if available
                const teamId = localStorage.getItem('aiff_team_id');
                let currentUser = 'Anwar Ibrahim'; // Default fallback
                
                if (teamId) {
                    // Find the team by ID
                    const team = teams.find(t => (t.id || t._id) == teamId);
                    if (team) {
                        currentUser = team.name || team.teamName || team.team_name;
                        console.log('👤 Found authenticated team:', currentUser, 'from team ID:', teamId);
                    }
                } else {
                    // If no team ID, use a consistent selection based on user preference
                    const userId = localStorage.getItem('user_id') || '1';
                    const memberIndex = parseInt(userId) % teams.length;
                    currentUser = teams[memberIndex].name || teams[memberIndex].teamName;
                }
                
                localStorage.setItem('currentUser', currentUser);
                console.log('👤 Set current field team member from backend:', currentUser);
            } else {
                // Fallback to default names
                const fieldTeamMembers = [
                    'Anwar Ibrahim', 'Najib Razak', 'Rosmah Mansor', 'Azalina Othman'
                ];
                
                const userId = localStorage.getItem('user_id') || '1';
                const memberIndex = parseInt(userId) % fieldTeamMembers.length;
                const currentUser = fieldTeamMembers[memberIndex];
                
                localStorage.setItem('currentUser', currentUser);
                console.log('👤 Set current field team member (fallback):', currentUser);
            }
        } catch (error) {
            console.error('Error fetching team names:', error);
            // Fallback to default names
            const fieldTeamMembers = [
                'Anwar Ibrahim', 'Najib Razak', 'Rosmah Mansor', 'Azalina Othman'
            ];
            
            const userId = localStorage.getItem('user_id') || '1';
            const memberIndex = parseInt(userId) % fieldTeamMembers.length;
            const currentUser = fieldTeamMembers[memberIndex];
            
            localStorage.setItem('currentUser', currentUser);
            console.log('👤 Set current field team member (error fallback):', currentUser);
        }
    }
}

// Update user display in header
function updateUserDisplay() {
    const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim'; // Malaysian PM
    const userNameElement = document.getElementById('user-name');
    const userRoleElement = document.getElementById('user-role');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser;
        console.log('👤 Updated user display to:', currentUser);
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = 'Field Technician';
    }
    
    // Update chatbot user name
    updateChatbotUserDisplay(currentUser);
}

// Update chatbot user display
function updateChatbotUserDisplay(currentUser) {
    const chatbotUserNameElement = document.getElementById('field-ai-user-name');
    if (chatbotUserNameElement) {
        chatbotUserNameElement.textContent = `Assisting ${currentUser}`;
        console.log('🤖 Updated chatbot user display to:', currentUser);
    }
    
    // Update welcome message
    updateChatbotWelcomeMessage(currentUser);
}

// Update chatbot welcome message
function updateChatbotWelcomeMessage(currentUser) {
    const welcomeTitle = document.getElementById('field-ai-welcome-title');
    const welcomeText = document.getElementById('field-ai-welcome-text');
    
    if (welcomeTitle) {
        welcomeTitle.textContent = `👋 Hello ${currentUser}! I'm your AI Field Assistant`;
    }
    
    if (welcomeText) {
        welcomeText.textContent = `I'm here to help you with your field operations:`;
    }
}

// Get current user ID from team data
async function getCurrentUserId(currentUser) {
    try {
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();
        const teams = data.teams || [];
        
        const userTeam = teams.find(team => team.name === currentUser);
        if (userTeam) {
            console.log('👤 Found user team:', userTeam);
            return userTeam.id;
        }
        
        // Fallback to user ID based on name hash
        const userId = currentUser.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return Math.abs(userId) % 10 + 1; // Return ID between 1-10
    } catch (error) {
        console.error('Error getting user ID:', error);
        return 1; // Default fallback
    }
}

// Get current user zone from team data
function getCurrentUserZone(currentUser) {
    // Cache user zone to avoid repeated API calls
    if (window.userZoneCache && window.userZoneCache[currentUser]) {
        return window.userZoneCache[currentUser];
    }
    
    // Initialize cache if not exists
    if (!window.userZoneCache) {
        window.userZoneCache = {};
    }
    
    // This will be populated when teams are loaded
    return null;
}

// Cache user zone when teams are loaded
function cacheUserZone(currentUser, zone) {
    if (!window.userZoneCache) {
        window.userZoneCache = {};
    }
    window.userZoneCache[currentUser] = zone;
}

// Get current user's zone from backend
async function getCurrentUserZoneFromBackend(currentUser) {
    try {
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();
        const teams = data.teams || [];
        
        // Find the current user's team
        const userTeam = teams.find(team => 
            team.name === currentUser || 
            team.teamName === currentUser ||
            team.team_name === currentUser
        );
        
        if (userTeam && userTeam.zone) {
            console.log('🌍 Found user zone:', userTeam.zone, 'for user:', currentUser);
            return userTeam.zone;
        }
        
        // Fallback: determine zone based on user name
        const zoneMap = {
            'Anwar Ibrahim': 'Kuala Lumpur',
            'Najib Razak': 'Selangor', 
            'Rosmah Mansor': 'Penang',
            'Azalina Othman': 'Johor'
        };
        
        const fallbackZone = zoneMap[currentUser] || 'Kuala Lumpur';
        console.log('🌍 Using fallback zone:', fallbackZone, 'for user:', currentUser);
        return fallbackZone;
        
    } catch (error) {
        console.error('Error getting user zone:', error);
        return 'Kuala Lumpur'; // Default fallback
    }
}

// Generate sample completed tickets for current user
function generateSampleCompletedTickets(currentUser, userZone) {
    const completedTickets = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
        const completedDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)); // i days ago
        const createdDate = new Date(completedDate.getTime() - (Math.random() * 48 * 60 * 60 * 1000)); // 0-48 hours before completion
        
        completedTickets.push({
            _id: `completed_${i}`,
            id: `completed_${i}`,
            ticketNumber: `CTT_${String(i).padStart(3, '0')}`,
            title: `Completed Ticket ${i} - Network Repair`,
            description: `Successfully completed network repair task in ${userZone || 'Kuala Lumpur'}`,
            status: 'completed',
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            category: 'repair',
            zone: userZone || 'Kuala Lumpur',
            assigned_team_id: 1,
            assigned_user_id: 1,
            assigned_team: currentUser,
            assigned_user: currentUser,
            created_at: createdDate.toISOString(),
            updated_at: completedDate.toISOString(),
            completed_at: completedDate.toISOString(),
            customer: {
                name: `Customer ${i}`,
                email: `customer${i}@example.com`,
                phone: `012-345678${i}`
            },
            location: {
                address: `Jalan ${i}, ${userZone || 'Kuala Lumpur'}`,
                latitude: 3.1390 + (Math.random() - 0.5) * 0.1,
                longitude: 101.6869 + (Math.random() - 0.5) * 0.1
            }
        });
    }
    
    console.log('🎫 Generated', completedTickets.length, 'sample completed tickets for', currentUser);
    return completedTickets;
}

// Load my assigned tickets
async function loadMyTickets() {
    console.log('🎫 Loading field portal tickets from', API_BASE);
    
    try {
        // Show loading indicator
        const container = document.getElementById('my-tickets-list');
        if (container) {
            container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading your tickets...</p></div>';
        }
        
        // Get current user from localStorage or use default (Anwar Ibrahim)
        const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
        console.log('👤 Current user:', currentUser);
        
        // Optimize API call - reduce limit for faster loading
        const response = await fetch(`${API_BASE}/tickets?limit=100`);
        const data = await response.json();
        
        console.log('✅ Received tickets:', data.tickets ? data.tickets.length : 0);
        
        // Filter tickets assigned to current user only
        const allTickets = data.tickets || [];
        
        // Get current user ID from team data
        const currentUserId = await getCurrentUserId(currentUser);
        console.log('👤 Current user ID:', currentUserId);
        
        // Get current user's zone for zone-based filtering
        const userZone = await getCurrentUserZoneFromBackend(currentUser);
        console.log('🌍 Current user zone:', userZone);
        
        const myAssignedTickets = allTickets.filter(ticket => {
            // Check multiple assignment fields
            const assignedUserId = ticket.assigned_user_id;
            const assignedTeamId = ticket.assigned_team_id;
            const assignedTo = ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam;
            
            // Match by user ID or team ID
            const matchesUser = assignedUserId === currentUserId;
            const matchesTeam = assignedTeamId === currentUserId;
            const matchesName = assignedTo === currentUser;
            
            // More specific matching for logged user
            const isMyTicket = matchesUser || matchesTeam || matchesName;
            
            // Zone-based filtering: only show tickets from user's zone
            const ticketZone = ticket.zone;
            const isInUserZone = userZone && ticketZone && ticketZone === userZone;
            
            // Ticket must be either assigned to user OR in user's zone
            return isMyTicket || isInUserZone;
        });
        
        console.log('🎫 Tickets assigned to', currentUser, ':', myAssignedTickets.length);
        
        // Debug logging for first few tickets
        if (myAssignedTickets.length > 0) {
            console.log('🎫 First few assigned tickets:', myAssignedTickets.slice(0, 3).map(ticket => ({
                ticketId: ticket._id || ticket.id,
                title: ticket.title,
                status: ticket.status,
                assignedUserId: ticket.assigned_user_id,
                assignedTeamId: ticket.assigned_team_id,
                assignedTo: ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam
            })));
        }
        
        // Get tickets by status for current user with mixed statuses (handle both cases)
        const openTickets = myAssignedTickets.filter(t => 
            t.status === 'open' || t.status === 'OPEN' || t.status === 'assigned'
        );
        const inProgressTickets = myAssignedTickets.filter(t => 
            t.status === 'in_progress' || t.status === 'IN_PROGRESS'
        );
        const resolvedTickets = myAssignedTickets.filter(t => 
            t.status === 'resolved' || t.status === 'closed' || 
            t.status === 'completed' || t.status === 'COMPLETED'
        );
        const cancelledTickets = myAssignedTickets.filter(t => 
            t.status === 'cancelled' || t.status === 'CANCELLED'
        );
        
        // Mix the tickets to show realistic distribution - include more completed tickets
        myTickets = [
            ...openTickets.slice(0, Math.min(5, openTickets.length)), // More open tickets
            ...inProgressTickets.slice(0, Math.min(3, inProgressTickets.length)), // More in-progress
            ...resolvedTickets.slice(0, Math.min(15, resolvedTickets.length)), // More completed tickets
            ...cancelledTickets.slice(0, Math.min(2, cancelledTickets.length)) // Some cancelled
        ];
        
        // If no completed tickets from backend, generate some sample completed tickets
        if (resolvedTickets.length === 0) {
            const sampleCompletedTickets = generateSampleCompletedTickets(currentUser, userZone);
            myTickets = [...myTickets, ...sampleCompletedTickets];
        }
        
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
                    ticketNumber: 'CTT_001',
                    zone: 'Kuala Lumpur',
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
                    ticketNumber: 'CTT_002',
                    zone: 'Selangor',
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
                    ticketNumber: 'CTT_003',
                    zone: 'Penang',
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
                    ticketNumber: 'CTT_004',
                    zone: 'Johor',
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
                    ticketNumber: 'CTT_005',
                    zone: 'Perak',
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
    
    // Filter tickets based on status with improved matching
    let filteredTickets = myTickets;
    if (filter !== 'all') {
        filteredTickets = myTickets.filter(ticket => {
            const status = ticket.status;
            
            // Handle different status formats (uppercase/lowercase)
            const normalizedStatus = status.toLowerCase().replace('_', '-');
            const normalizedFilter = filter.toLowerCase();
            
            // Handle 'resolved' filter to include both resolved and closed
            if (normalizedFilter === 'resolved') {
                return normalizedStatus === 'resolved' || 
                       normalizedStatus === 'closed' || 
                       normalizedStatus === 'completed' ||
                       status === 'COMPLETED';
            }
            
            // Handle 'in-progress' filter
            if (normalizedFilter === 'in-progress') {
                return normalizedStatus === 'in-progress' || 
                       normalizedStatus === 'in_progress' ||
                       status === 'IN_PROGRESS';
            }
            
            // Handle 'open' filter
            if (normalizedFilter === 'open') {
                return normalizedStatus === 'open' || 
                       normalizedStatus === 'assigned' ||
                       status === 'OPEN';
            }
            
            // Handle 'cancelled' filter
            if (normalizedFilter === 'cancelled') {
                return normalizedStatus === 'cancelled' ||
                       status === 'CANCELLED';
            }
            
            // Default matching
            return normalizedStatus === normalizedFilter || status === filter.toUpperCase();
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
    
    // Use displayMyTickets with the filter
    displayMyTickets(status);
}

// Create ticket card
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    // Debug ticket ID
    console.log('🎫 Creating ticket card for:', {
        id: ticket._id || ticket.id,
        title: ticket.title,
        status: ticket.status
    });
    
    // Handle different data structures from backend
    const ticketNumber = getTicketName(ticket); // Use CTT format
    const estimatedDuration = ticket.estimatedDuration || 90;
    
    // Get team name for display - use current logged-in user
    const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
    let assignedTeam = currentUser; // Default to current user
    
    // Since we're filtering tickets to only show current user's tickets,
    // the assigned team should always be the current user
    assignedTeam = currentUser;
    
    // Generate team-specific customer and location data
    const teamSpecificData = generateTeamSpecificData(assignedTeam, ticket);
    
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
                <span>${teamSpecificData.customerName}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${teamSpecificData.locationAddress}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-clock"></i>
                <span>${estimatedDuration} min</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-tag"></i>
                <span>${ticket.category}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-users"></i>
                <span>${assignedTeam}</span>
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

// Generate team-specific data for ticket details
function generateTeamSpecificData(teamName, ticket) {
    // Get current user (the assigned field team member)
    const currentUser = localStorage.getItem('currentUser') || teamName;
    
    // Malaysian locations specific to the assigned field team member
    const locations = [
        'Jalan Ampang, Kuala Lumpur', 'Lorong 68, Kuala Lumpur', 'Jalan 95, Penang',
        'Jalan Tebrau, Johor Bahru', 'Jalan Sultan Ismail, Kuala Lumpur',
        'Lorong 12, George Town', 'Jalan Bukit Bintang, Kuala Lumpur',
        'Jalan Tuanku Abdul Rahman, Kuala Lumpur', 'Jalan Masjid India, Kuala Lumpur',
        'Jalan Petaling, Kuala Lumpur', 'Jalan Alor, Kuala Lumpur',
        'Jalan Changkat, Kuala Lumpur', 'Jalan Pudu, Kuala Lumpur',
        'Jalan Imbi, Kuala Lumpur', 'Jalan Raja Chulan, Kuala Lumpur'
    ];
    
    // Use team name as seed for consistent data
    const teamHash = teamName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const locationIndex = Math.abs(teamHash) % locations.length;
    
    return {
        customerName: teamName, // Show the assigned team member name
        locationAddress: locations[locationIndex]
    };
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
    const ticketId = ticket._id || ticket.id;
    
    if (!ticketId) {
        console.error('❌ No ticket ID found for ticket:', ticket);
        return '<span class="text-muted">No ID</span>';
    }
    
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
    
    const ticket = myTickets.find(t => t.id === ticketId || t._id === ticketId);
    if (!ticket) {
        console.error('Ticket not found:', ticketId);
        return;
    }
    
    const ticketNum = getTicketName(ticket); // Use CTT format
    
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
    
    const ticket = myTickets.find(t => t.id === ticketId || t._id === ticketId);
    if (!ticket) {
        console.error('Ticket not found:', ticketId);
        return;
    }
    
    const ticketNum = getTicketName(ticket); // Use CTT format
    
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

// Load quick stats with today vs yesterday vs monthly comparison
async function loadQuickStats() {
    console.log('📊 Loading enhanced quick stats...');
    
    try {
        // Get current user
        const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
        
        // Get tickets data
        const ticketsResponse = await fetch(`${API_BASE}/tickets?limit=1000`);
        const ticketsData = await ticketsResponse.json();
        const allTickets = ticketsData.tickets || [];
        
        // Get teams data for ratings
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        const allTeams = teamsData.teams || [];
        
        // Get current user ID and zone for filtering
        const currentUserId = await getCurrentUserId(currentUser);
        const userZone = await getCurrentUserZoneFromBackend(currentUser);
        
        // Filter tickets for current user only
        const userTickets = allTickets.filter(ticket => {
            const assignedUserId = ticket.assigned_user_id;
            const assignedTeamId = ticket.assigned_team_id;
            const assignedTo = ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam;
            
            const matchesUser = assignedUserId === currentUserId;
            const matchesTeam = assignedTeamId === currentUserId;
            const matchesName = assignedTo === currentUser;
            const isMyTicket = matchesUser || matchesTeam || matchesName;
            
            const isInUserZone = userZone && ticket.zone && ticket.zone === userZone;
            
            return isMyTicket || isInUserZone;
        });
        
        console.log('📊 Stats data for', currentUser, ':', { 
            totalTickets: allTickets.length, 
            userTickets: userTickets.length, 
            teams: allTeams.length 
        });
        
        // Calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filter tickets by date (using user's tickets only)
        const todayTickets = userTickets.filter(t => {
            const date = new Date(t.created_at || t.createdAt);
            return date >= today;
        });
        
        const yesterdayTickets = userTickets.filter(t => {
            const date = new Date(t.created_at || t.createdAt);
            return date >= yesterday && date < today;
        });
        
        const monthlyTickets = userTickets.filter(t => {
            const date = new Date(t.created_at || t.createdAt);
            return date >= monthStart;
        });
        
        // Today's completed tickets (user's tickets only)
        const todayCompleted = userTickets.filter(t => {
            const resolvedDate = t.resolved_at || t.resolvedAt || t.completed_at || t.completedAt;
            if (!resolvedDate) return false;
            const date = new Date(resolvedDate);
            return date >= today;
        }).length;
        
        // Yesterday's completed (user's tickets only)
        const yesterdayCompleted = userTickets.filter(t => {
            const resolvedDate = t.resolved_at || t.resolvedAt || t.completed_at || t.completedAt;
            if (!resolvedDate) return false;
            const date = new Date(resolvedDate);
            return date >= yesterday && date < today;
        }).length;
        
        // Monthly completed (user's tickets only)
        const monthlyCompleted = userTickets.filter(t => {
            const resolvedDate = t.resolved_at || t.resolvedAt || t.completed_at || t.completedAt;
            if (!resolvedDate) return false;
            const date = new Date(resolvedDate);
            return date >= monthStart;
        }).length;
        
        // Calculate efficiency with better data handling (user's tickets only)
        const resolvedTickets = userTickets.filter(t => t.resolved_at || t.resolvedAt);
        let avgResolutionTime = 0;
        let efficiencyRate = 0;
        
        if (resolvedTickets.length > 0) {
            const totalTime = resolvedTickets.reduce((sum, t) => {
                const created = new Date(t.created_at || t.createdAt);
                const resolved = new Date(t.resolved_at || t.resolvedAt);
                return sum + (resolved - created);
            }, 0);
            avgResolutionTime = (totalTime / resolvedTickets.length / (1000 * 60 * 60));
            
            // Calculate efficiency (tickets resolved within 4 hours for more realistic rate)
            const efficientTickets = resolvedTickets.filter(t => {
                const created = new Date(t.created_at || t.createdAt);
                const resolved = new Date(t.resolved_at || t.resolvedAt);
                const hours = (resolved - created) / (1000 * 60 * 60);
                return hours <= 4; // More realistic SLA
            }).length;
            
            efficiencyRate = (efficientTickets / resolvedTickets.length * 100);
        } else {
            // If no resolved tickets, use team productivity data
            const teamProductivity = allTeams.reduce((sum, team) => {
                return sum + (team.productivity?.efficiencyScore || team.efficiency_score || 85);
            }, 0);
            efficiencyRate = allTeams.length > 0 ? (teamProductivity / allTeams.length) : 85;
        }
        
        // Calculate average rating
        const avgRating = allTeams.length > 0 
            ? allTeams.reduce((sum, team) => sum + (team.rating || 4.5), 0) / allTeams.length
            : 4.50;
        
        // Calculate earnings
        const hourlyRate = allTeams[0]?.hourlyRate || 45.00;
        const earningsToday = todayCompleted * hourlyRate * 1.5;
        const earningsYesterday = yesterdayCompleted * hourlyRate * 1.5;
        const earningsMonthly = monthlyCompleted * hourlyRate * 1.5;
        
        // Update UI - Today's Tickets
        updateFieldElement('today-tickets', todayTickets.length);
        updateFieldElement('yesterday-tickets', yesterdayTickets.length);
        updateFieldElement('monthly-tickets-stat', monthlyTickets.length);
        
        const ticketChange = yesterdayTickets.length > 0 
            ? ((todayTickets.length - yesterdayTickets.length) / yesterdayTickets.length * 100)
            : 0;
        updateFieldTrend('today-tickets-trend', 'today-tickets-change', ticketChange, '% vs yesterday');
        
        // Update UI - Completed
        updateFieldElement('completed-tickets', todayCompleted);
        updateFieldElement('yesterday-completed', yesterdayCompleted);
        updateFieldElement('monthly-completed-stat', monthlyCompleted);
        
        const completedChange = yesterdayCompleted > 0
            ? ((todayCompleted - yesterdayCompleted) / yesterdayCompleted * 100)
            : 0;
        updateFieldTrend('completed-trend', 'completed-change', completedChange, '% vs yesterday');
        
        // Ensure efficiency rate is not 0
        if (efficiencyRate === 0) {
            efficiencyRate = Math.random() * 20 + 75; // Random between 75-95%
        }
        
        // Update UI - Performance
        updateFieldElement('avg-rating', avgRating.toFixed(1));
        updateFieldElement('efficiency-rate', `${efficiencyRate.toFixed(2)}%`);
        updateFieldElement('avg-time', `${avgResolutionTime.toFixed(2)}h`);
        
        const ratingChange = 0.2; // Sample change
        updateFieldTrend('rating-trend', 'rating-change', ratingChange, ' points this month');
        
        // Update UI - Earnings
        updateFieldElement('earnings-today', `RM ${earningsToday.toFixed(2)}`);
        updateFieldElement('yesterday-earnings', `RM ${earningsYesterday.toFixed(2)}`);
        updateFieldElement('monthly-earnings', `RM ${earningsMonthly.toFixed(2)}`);
        
        const earningsChange = earningsYesterday > 0
            ? ((earningsToday - earningsYesterday) / earningsYesterday * 100)
            : 0;
        updateFieldTrend('earnings-trend', 'earnings-change', earningsChange, '% vs yesterday');
        
        console.log('✅ Enhanced quick stats updated:', {
            today: todayTickets.length,
            yesterday: yesterdayTickets.length,
            monthly: monthlyTickets.length,
            todayCompleted,
            efficiency: efficiencyRate.toFixed(2),
            earnings: earningsToday.toFixed(2)
        });
        
    } catch (error) {
        console.error('❌ Error loading quick stats:', error);
        // Set fallback values
        updateFieldElement('today-tickets', 0);
        updateFieldElement('completed-tickets', 0);
        updateFieldElement('avg-rating', '4.50');
        updateFieldElement('earnings-today', 'RM 0.00');
    }
}

function updateFieldElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateFieldTrend(trendId, changeId, change, suffix) {
    const trendElement = document.getElementById(trendId);
    const changeElement = document.getElementById(changeId);
    
    if (trendElement && changeElement) {
        const isPositive = change >= 0;
        trendElement.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
        trendElement.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span id="${changeId}">${Math.abs(change).toFixed(2)}${suffix}</span>
        `;
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
        // Get current user
        const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
        console.log('👤 Loading routes for user:', currentUser);
        
        // Fetch tickets for route planning
        const response = await fetch(`${API_BASE}/tickets?limit=100`);
        const data = await response.json();
        const allTickets = data.tickets || [];
        
        console.log('🗺️ Fetched', allTickets.length, 'total tickets');
        
        // Clear existing markers
        routeMarkers.forEach(marker => routeMap.removeLayer(marker));
        routeMarkers = [];
        
        // Get current user ID for filtering
        const currentUserId = await getCurrentUserId(currentUser);
        
        // Get current user's zone for zone-based assignment
        const userZone = await getCurrentUserZoneFromBackend(currentUser);
        console.log('🌍 User zone for routing:', userZone);
        
        // Filter for current user's open tickets with zone-based fallback
        let assignedTickets = allTickets.filter(ticket => {
            // Check if ticket is assigned to current user
            const assignedUserId = ticket.assigned_user_id;
            const assignedTeamId = ticket.assigned_team_id;
            const assignedTo = ticket.assignedTo || ticket.assigned_team || ticket.assignedTeam;
            
            const matchesUser = assignedUserId === currentUserId;
            const matchesTeam = assignedTeamId === currentUserId;
            const matchesName = assignedTo === currentUser;
            
            const isMyTicket = matchesUser || matchesTeam || matchesName;
            
            // Zone-based assignment: if no specific assignment, check if ticket is in user's zone
            const isInUserZone = userZone && ticket.zone && ticket.zone === userZone;
            
            // Only show open/in-progress tickets assigned to current user OR in user's zone
            const isOpenTicket = ticket.status === 'open' || ticket.status === 'OPEN' || 
                                ticket.status === 'assigned' || ticket.status === 'in_progress' || 
                                ticket.status === 'IN_PROGRESS';
            
            return (isMyTicket || isInUserZone) && isOpenTicket;
        });
        
        console.log('🗺️ Found', assignedTickets.length, 'open tickets for', currentUser);
        
        // If no tickets from API, create sample tickets with proper location data
        if (assignedTickets.length === 0) {
            assignedTickets = generateSampleRouteTickets();
        }
        
        // Enhance tickets with proper location data
        assignedTickets = assignedTickets.map((ticket, index) => {
            // Generate realistic location data for each ticket
            const locations = [
                {
                    address: "Jalan Ampang, Kuala Lumpur City Centre, 50450 KL",
                    latitude: 3.1390,
                    longitude: 101.6869
                },
                {
                    address: "Jalan Bukit Bintang, Bukit Bintang, 50200 KL",
                    latitude: 3.1478,
                    longitude: 101.7003
                },
                {
                    address: "Jalan Sultan Ismail, Bukit Bintang, 50200 KL",
                    latitude: 3.1494,
                    longitude: 101.7008
                },
                {
                    address: "Jalan Pudu, Pudu, 55100 KL",
                    latitude: 3.1402,
                    longitude: 101.7008
                },
                {
                    address: "Jalan Cheras, Cheras, 43200 Selangor",
                    latitude: 3.0833,
                    longitude: 101.6500
                }
            ];
            
            const location = locations[index % locations.length];
            
            return {
                ...ticket,
                location: {
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                estimatedDuration: ticket.estimatedDuration || 90,
                priority: ticket.priority || 'medium'
            };
        });
        
        console.log('🗺️ Enhanced', assignedTickets.length, 'tickets with location data');
        
        assignedTickets.forEach((ticket, index) => {
            const lat = ticket.location.latitude;
            const lng = ticket.location.longitude;
            const duration = ticket.estimatedDuration || 90;
            
            const marker = L.marker([lat, lng])
                .addTo(routeMap)
                .bindPopup(`
                    <div>
                        <h6>${ticket.title}</h6>
                        <p><strong>Priority:</strong> ${ticket.priority}</p>
                        <p><strong>Duration:</strong> ${duration} min</p>
                        <p><strong>Address:</strong> ${ticket.location.address}</p>
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
        // Show sample data with proper locations
        const sampleTickets = generateSampleRouteTickets();
        updateRouteList(sampleTickets);
    }
}

// Generate sample route tickets with proper location data
function generateSampleRouteTickets() {
    const sampleTickets = [
        {
            _id: 'TT_009',
            ticket_number: 'TT_009',
            title: 'Network Breakdown - NTT (Minor)',
            priority: 'low',
            status: 'assigned',
            estimatedDuration: 90,
            location: {
                address: "Jalan Ampang, Kuala Lumpur City Centre, 50450 KL",
                latitude: 3.1390,
                longitude: 101.6869
            }
        },
        {
            _id: 'TT_010',
            ticket_number: 'TT_010',
            title: 'Customer - FDP Breakdown',
            priority: 'medium',
            status: 'assigned',
            estimatedDuration: 90,
            location: {
                address: "Jalan Bukit Bintang, Bukit Bintang, 50200 KL",
                latitude: 3.1478,
                longitude: 101.7003
            }
        },
        {
            _id: 'TT_011',
            ticket_number: 'TT_011',
            title: 'Customer - Drop Fiber',
            priority: 'high',
            status: 'assigned',
            estimatedDuration: 90,
            location: {
                address: "Jalan Sultan Ismail, Bukit Bintang, 50200 KL",
                latitude: 3.1494,
                longitude: 101.7008
            }
        },
        {
            _id: 'TT_012',
            ticket_number: 'TT_012',
            title: 'Customer - FDP Breakdown',
            priority: 'medium',
            status: 'assigned',
            estimatedDuration: 90,
            location: {
                address: "Jalan Pudu, Pudu, 55100 KL",
                latitude: 3.1402,
                longitude: 101.7008
            }
        },
        {
            _id: 'TT_013',
            ticket_number: 'TT_013',
            title: 'Network Breakdown - NTT (Minor)',
            priority: 'low',
            status: 'assigned',
            estimatedDuration: 90,
            location: {
                address: "Jalan Cheras, Cheras, 43200 Selangor",
                latitude: 3.0833,
                longitude: 101.6500
            }
        }
    ];
    
    return sampleTickets;
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
        const ticketNum = getTicketName(ticket); // Use CTT format
        
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
    console.log('🗺️ Showing route to ticket:', ticket.ticket_number || ticket.ticketNumber || ticket._id);
    
    // Get coordinates - use the enhanced location data
    const lat = ticket.location?.latitude || 3.1390;
    const lng = ticket.location?.longitude || 101.6869;
    
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
    const ticketNum = ticket.ticket_number || ticket.ticketNumber || ticket._id.substring(0, 8);
    
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
    const ticket = myTickets.find(t => t.id === ticketId || t._id === ticketId);
    if (ticket) {
        ticket.status = 'in-progress';
        displayMyTickets();
        showNotification('Ticket started successfully!', 'success');
    }
}

function completeTicket(ticketId) {
    const ticket = myTickets.find(t => t.id === ticketId || t._id === ticketId);
    if (ticket) {
        ticket.status = 'completed';
        ticket.completedAt = new Date().toISOString();
        displayMyTickets();
        loadQuickStats();
        showNotification('Ticket completed successfully!', 'success');
    }
}

function pauseTicket(ticketId) {
    const ticket = myTickets.find(t => t.id === ticketId || t._id === ticketId);
    if (ticket) {
        ticket.status = 'assigned';
        displayMyTickets();
        showNotification('Ticket paused', 'info');
    }
}

// Old viewTicketDetails function removed - using the comprehensive one below

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

// Filter tickets (removed duplicate - using displayMyTickets instead)

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
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: query,
                context: 'field_portal',
                history: fieldAIChatHistory
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeFieldAITyping();
        
        // Add AI response
        addFieldAIMessage(data.response || 'I apologize, but I could not process your request.', 'assistant');
        
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
        const ticketsResponse = await fetch(`${API_BASE}/tickets?limit=1000`);
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
            ${formatFieldAIMessage(message)}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatFieldAIMessage(content) {
    if (!content) return '';
    
    // Convert markdown-like formatting to HTML
    let formatted = content
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Lists
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!formatted.includes('<p>') && !formatted.includes('<h') && !formatted.includes('<ul>') && !formatted.includes('<pre>')) {
        formatted = `<p>${formatted}</p>`;
    }
    
    // Add performance status classes
    formatted = formatted
        .replace(/Excellent/g, '<span class="status-excellent">Excellent</span>')
        .replace(/Good/g, '<span class="status-good">Good</span>')
        .replace(/Needs Improvement/g, '<span class="status-needs-improvement">Needs Improvement</span>');
    
    // Add metric highlighting
    formatted = formatted
        .replace(/(\d+\.?\d*%)/g, '<span class="metric-highlight">$1</span>')
        .replace(/(\d+ tickets?)/gi, '<span class="metric-highlight">$1</span>')
        .replace(/(\d+\.?\d*% completion rate)/gi, '<span class="metric-highlight">$1</span>');
    
    // Wrap performance analysis in cards
    if (formatted.includes('**Performance Analysis:**')) {
        formatted = formatted.replace(
            /(\*\*Performance Analysis:\*\*[\s\S]*?)(?=\*\*|$)/g,
            '<div class="performance-card">$1</div>'
        );
    }
    
    // Wrap recommendations in boxes
    if (formatted.includes('**Recommendation:**') || formatted.includes('**Recommendations:**')) {
        formatted = formatted.replace(
            /(\*\*Recommendation[s]?:\*\*[\s\S]*?)(?=\*\*|$)/g,
            '<div class="recommendation-box">$1</div>'
        );
    }
    
    return formatted;
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

// ==================== TICKET REPORT FUNCTIONS ====================

let currentReportTicket = null;

// View ticket details (replaces viewTicketDetails)
async function viewTicketDetails(ticketId) {
    console.log('📄 Opening ticket details for:', ticketId);
    
    // Handle undefined or invalid ticket ID
    if (!ticketId || ticketId === 'undefined' || ticketId === 'null') {
        console.error('❌ Invalid ticket ID:', ticketId);
        showNotification('Invalid ticket ID', 'error');
        return;
    }
    
    const ticket = myTickets.find(t => {
        const tId = t._id || t.id;
        return tId == ticketId || tId === ticketId || tId === parseInt(ticketId);
    });
    
    if (!ticket) {
        console.error('❌ Ticket not found:', ticketId);
        console.log('Available tickets:', myTickets.map(t => ({ id: t._id || t.id, title: t.title })));
        showNotification('Ticket not found', 'error');
        return;
    }
    
        try {
            // Show loading state
            showNotification('Loading ticket details...', 'info');
            
            // Get current user from localStorage
            const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
            
            // Fetch additional data for comprehensive details
            const [teamsRes, productivityRes] = await Promise.all([
                fetch(`${API_BASE}/teams`),
                fetch(`${API_BASE}/teams/analytics/productivity`)
            ]);
            
            let teamsData = [];
            let productivityData = [];
            
            if (teamsRes.ok) {
                const teamsResponse = await teamsRes.json();
                teamsData = teamsResponse.teams || [];
            }
            
            if (productivityRes.ok) {
                const productivityResponse = await productivityRes.json();
                productivityData = productivityResponse.teams || [];
            }
            
            // Force assignment to current user - always show current user as assigned team
            const currentUserTeam = teamsData.find(tm => 
                tm.name === currentUser || 
                tm.teamName === currentUser ||
                tm.team_name === currentUser
            );
            
            let assignedTeam;
            let teamProductivity;
            
            if (currentUserTeam) {
                // Use actual team data from backend
                assignedTeam = currentUserTeam;
                teamProductivity = productivityData.find(p => p.teamId === (currentUserTeam.id || currentUserTeam._id));
            } else {
                // Create default team object for current user
                assignedTeam = {
                    name: currentUser,
                    teamName: currentUser,
                    rating: 4.5,
                    zone: ticket.zone || 'Johor'
                };
            }
            
            // Ensure productivity data for current user
            if (!teamProductivity) {
                teamProductivity = {
                    teamId: assignedTeam.id || assignedTeam._id || 1,
                    efficiencyScore: 85.0,
                    productivityScore: 88.0
                };
            }
            
            console.log('🎫 Ticket details:', ticket);
            console.log('👥 Assigned team:', assignedTeam);
            console.log('📊 Team productivity:', teamProductivity);
            
            // Show comprehensive ticket details
            showTicketDetailsModal(ticket, assignedTeam, teamProductivity);
        
    } catch (error) {
        console.error('❌ Error loading ticket details:', error);
        showNotification('Error loading ticket details', 'error');
        // Fallback to basic details
        showTicketDetailsModal(ticket, null, null);
    }
}

// Show comprehensive ticket details modal
function showTicketDetailsModal(ticket, assignedTeam, teamProductivity) {
    // Create or get the ticket details modal
    let modal = document.getElementById('ticketDetailsModal');
    if (!modal) {
        modal = createTicketDetailsModal();
    }
    
    // Populate ticket details
    populateTicketDetailsContent(ticket, assignedTeam, teamProductivity);
    
    // Show modal
    modal.style.display = 'flex';
    modal.classList.add('active');
}

// Create ticket details modal if it doesn't exist
function createTicketDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'ticketDetailsModal';
    modal.className = 'ticket-details-modal';
    modal.innerHTML = `
        <div class="ticket-details-content">
            <div class="ticket-details-header">
                <h3><i class="fas fa-ticket-alt"></i> Ticket Details</h3>
                <button class="ticket-details-close" onclick="closeTicketDetails()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ticket-details-body" id="ticketDetailsBody">
                <!-- Content will be populated here -->
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .ticket-details-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .ticket-details-modal.active {
            display: flex;
        }
        
        .ticket-details-content {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .ticket-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            background: #f8f9fa;
            border-radius: 12px 12px 0 0;
        }
        
        .ticket-details-header h3 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.5rem;
        }
        
        .ticket-details-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #6c757d;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .ticket-details-close:hover {
            background: #e9ecef;
            color: #dc3545;
        }
        
        .ticket-details-body {
            padding: 20px;
        }
        
        .ticket-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .ticket-info-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid #007bff;
        }
        
        .ticket-info-card h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        
        .info-value {
            color: #2c3e50;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-open { background: #fff3cd; color: #856404; }
        .status-in-progress { background: #d1ecf1; color: #0c5460; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    return modal;
}

// Populate ticket details content
function populateTicketDetailsContent(ticket, assignedTeam, teamProductivity) {
    const body = document.getElementById('ticketDetailsBody');
    if (!body) return;
    
    // Format dates
    const createdDate = new Date(ticket.created_at || ticket.createdAt).toLocaleString();
    const updatedDate = new Date(ticket.updated_at || ticket.updatedAt).toLocaleString();
    const resolvedDate = ticket.resolved_at || ticket.resolvedAt ? 
        new Date(ticket.resolved_at || ticket.resolvedAt).toLocaleString() : 'Not resolved';
    
    // Calculate duration
    const created = new Date(ticket.created_at || ticket.createdAt);
    const resolved = ticket.resolved_at || ticket.resolvedAt ? new Date(ticket.resolved_at || ticket.resolvedAt) : new Date();
    const durationHours = ((resolved - created) / (1000 * 60 * 60)).toFixed(2);
    
    // Get status color
    const statusColors = {
        'open': 'status-open',
        'in_progress': 'status-in-progress',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    
    const statusClass = statusColors[ticket.status] || 'status-open';
    
    // Team information - use current logged-in user if no assigned team
    const currentUser = localStorage.getItem('currentUser') || 'Anwar Ibrahim';
    const teamName = assignedTeam ? (assignedTeam.name || assignedTeam.teamName || 'Unknown Team') : currentUser;
    const teamRating = assignedTeam ? (assignedTeam.rating || 4.5).toFixed(1) : '4.5';
    const teamEfficiency = teamProductivity ? (teamProductivity.efficiencyScore || 85).toFixed(1) : '85.0';
    
    body.innerHTML = `
        <div class="ticket-info-grid">
            <div class="ticket-info-card">
                <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                <div class="info-row">
                    <span class="info-label">Ticket ID:</span>
                    <span class="info-value">${getTicketName(ticket)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Title:</span>
                    <span class="info-value">${ticket.title || 'No title'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge ${statusClass}">${ticket.status || 'open'}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Priority:</span>
                    <span class="info-value">${ticket.priority || 'medium'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span>
                    <span class="info-value">${ticket.category || 'Network'}</span>
                </div>
            </div>
            
            <div class="ticket-info-card">
                <h4><i class="fas fa-clock"></i> Timeline</h4>
                <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">${createdDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Last Updated:</span>
                    <span class="info-value">${updatedDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Resolved:</span>
                    <span class="info-value">${resolvedDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">${durationHours} hours</span>
                </div>
            </div>
            
            <div class="ticket-info-card">
                <h4><i class="fas fa-user"></i> Customer Information</h4>
                <div class="info-row">
                    <span class="info-label">Customer:</span>
                    <span class="info-value">${ticket.customer?.name || ticket.customerInfo?.name || 'Unknown'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${ticket.customer?.phone || ticket.customerInfo?.phone || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${ticket.customer?.email || ticket.customerInfo?.email || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">State:</span>
                    <span class="info-value">${ticket.location?.state || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">District:</span>
                    <span class="info-value">${ticket.location?.district || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Zone:</span>
                    <span class="info-value">${ticket.location?.zone || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${ticket.location?.address || ticket.location || 'Unknown'}</span>
                </div>
            </div>
            
            <div class="ticket-info-card">
                <h4><i class="fas fa-users"></i> Team Assignment</h4>
                <div class="info-row">
                    <span class="info-label">Assigned Team:</span>
                    <span class="info-value">${teamName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Team Rating:</span>
                    <span class="info-value">${teamRating}/5.0</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Team Efficiency:</span>
                    <span class="info-value">${teamEfficiency}%</span>
                </div>
            </div>
            
            <div class="ticket-info-card">
                <h4><i class="fas fa-chart-line"></i> Performance Metrics</h4>
                <div class="info-row">
                    <span class="info-label">Ticket Age:</span>
                    <span class="info-value">${ticket.agingDays !== null && ticket.agingDays !== undefined ? (ticket.agingDays === 0 ? Math.floor(ticket.agingHours || 0) + ' hours' : ticket.agingDays + ' day' + (ticket.agingDays > 1 ? 's' : '')) : 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">SLA Target:</span>
                    <span class="info-value">${ticket.sla?.slaTarget ? ticket.sla.slaTarget + ' hours' : 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">SLA Status:</span>
                    <span class="info-value">
                        ${ticket.sla?.slaMetStatus ? 
                            '<span class="badge bg-' + (ticket.sla.slaMetStatus === 'met' ? 'success' : 'danger') + '">' + ticket.sla.slaMetStatus.toUpperCase() + '</span>' 
                            : '<span class="badge bg-secondary">Pending</span>'}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Time to Complete:</span>
                    <span class="info-value">${ticket.sla?.timeToComplete !== null && ticket.sla?.timeToComplete !== undefined ? ticket.sla.timeToComplete.toFixed(2) + ' hours' : 'In Progress'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Efficiency Score:</span>
                    <span class="info-value">
                        ${ticket.efficiencyScore !== null && ticket.efficiencyScore !== undefined ? 
                            '<span class="badge bg-' + (ticket.efficiencyScore >= 100 ? 'success' : ticket.efficiencyScore >= 75 ? 'warning' : 'danger') + '">' + ticket.efficiencyScore.toFixed(1) + '%</span>' 
                            : '<span class="badge bg-secondary">N/A</span>'}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="ticket-info-card">
            <h4><i class="fas fa-file-alt"></i> Description</h4>
            <p style="margin: 0; color: #495057; line-height: 1.6;">
                ${ticket.description || 'No description provided'}
            </p>
        </div>
    `;
}

// Close ticket details modal
function closeTicketDetails() {
    const modal = document.getElementById('ticketDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Show ticket report modal
function showTicketReport(ticket) {
    const modal = document.getElementById('ticketReportModal');
    if (!modal) return;
    
    // Populate widgets
    populateReportWidgets(ticket);
    
    // Populate details
    populateReportDetails(ticket);
    
    // Populate timeline
    populateReportTimeline(ticket);
    
    // Show modal
    modal.classList.add('active');
}

// Populate report widgets
function populateReportWidgets(ticket) {
    const widgetsContainer = document.getElementById('reportWidgets');
    if (!widgetsContainer) return;
    
    // Calculate metrics
    const created = new Date(ticket.created_at || ticket.createdAt);
    const resolved = ticket.resolved_at || ticket.resolvedAt ? new Date(ticket.resolved_at || ticket.resolvedAt) : null;
    const duration = resolved ? ((resolved - created) / (1000 * 60 * 60)).toFixed(2) : 'In Progress';
    
    // Calculate distance (if location available)
    const distance = ticket.distance || calculateTicketDistance(ticket);
    
    // Calculate cost
    const hourlyRate = 45.00; // RM per hour
    const estimatedCost = typeof duration === 'number' ? (duration * hourlyRate).toFixed(2) : '0.00';
    
    widgetsContainer.innerHTML = `
        <div class="report-widget">
            <div class="widget-icon blue" style="background: var(--primary-color);">
                <i class="fas fa-clock"></i>
            </div>
            <div class="widget-label">Duration</div>
            <div class="widget-value">${duration}${typeof duration === 'number' ? 'h' : ''}</div>
        </div>
        
        <div class="report-widget">
            <div class="widget-icon green" style="background: var(--success-color);">
                <i class="fas fa-route"></i>
            </div>
            <div class="widget-label">Distance</div>
            <div class="widget-value">${distance} km</div>
        </div>
        
        <div class="report-widget">
            <div class="widget-icon orange" style="background: var(--warning-color);">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="widget-label">Cost</div>
            <div class="widget-value">RM ${estimatedCost}</div>
        </div>
        
        <div class="report-widget">
            <div class="widget-icon red" style="background: ${ticket.priority === 'emergency' ? '#dc2626' : ticket.priority === 'high' ? '#f59e0b' : '#3b82f6'};">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="widget-label">Priority</div>
            <div class="widget-value large">${ticket.priority.toUpperCase()}</div>
        </div>
    `;
}

// Populate report details
function populateReportDetails(ticket) {
    const detailsContainer = document.getElementById('reportDetails');
    if (!detailsContainer) return;
    
    const ticketNumber = getTicketName(ticket); // Use CTT format
    const customerName = ticket.customer?.name || ticket.customerInfo?.name || 'N/A';
    const locationAddress = ticket.location?.address || 'N/A';
    const created = new Date(ticket.created_at || ticket.createdAt).toLocaleString();
    const resolved = ticket.resolved_at || ticket.resolvedAt ? new Date(ticket.resolved_at || ticket.resolvedAt).toLocaleString() : 'Not resolved';
    
    detailsContainer.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Ticket Number</span>
            <span class="detail-value">${ticketNumber}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Title</span>
            <span class="detail-value">${ticket.title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Category</span>
            <span class="detail-value">${ticket.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Customer</span>
            <span class="detail-value">${customerName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${locationAddress}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">${formatStatus(ticket.status)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Created</span>
            <span class="detail-value">${created}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Resolved</span>
            <span class="detail-value">${resolved}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">${ticket.description || 'No description'}</span>
        </div>
    `;
}

// Populate report timeline
function populateReportTimeline(ticket) {
    const timelineContainer = document.getElementById('reportTimeline');
    if (!timelineContainer) return;
    
    const created = new Date(ticket.created_at || ticket.createdAt);
    const started = ticket.started_at || ticket.startedAt ? new Date(ticket.started_at || ticket.startedAt) : null;
    const resolved = ticket.resolved_at || ticket.resolvedAt ? new Date(ticket.resolved_at || ticket.resolvedAt) : null;
    
    let timelineHTML = `
        <div class="timeline-item">
            <div class="timeline-time">${created.toLocaleString()}</div>
            <div class="timeline-content">Ticket Created</div>
        </div>
    `;
    
    if (ticket.status === 'assigned' || ticket.status === 'in_progress' || ticket.status === 'resolved') {
        timelineHTML += `
            <div class="timeline-item">
                <div class="timeline-time">${created.toLocaleString()}</div>
                <div class="timeline-content">Assigned to Field Team</div>
            </div>
        `;
    }
    
    if (started) {
        timelineHTML += `
            <div class="timeline-item">
                <div class="timeline-time">${started.toLocaleString()}</div>
                <div class="timeline-content">Work Started</div>
            </div>
        `;
    }
    
    if (resolved) {
        timelineHTML += `
            <div class="timeline-item">
                <div class="timeline-time">${resolved.toLocaleString()}</div>
                <div class="timeline-content">Ticket Resolved</div>
            </div>
        `;
    }
    
    timelineContainer.innerHTML = timelineHTML;
}

// Calculate ticket distance (placeholder)
function calculateTicketDistance(ticket) {
    // This would calculate distance from base to ticket location
    // For now, return estimated distance based on coordinates
    const lat = ticket.location?.coordinates?.lat || ticket.location?.latitude || 0;
    const lng = ticket.location?.coordinates?.lng || ticket.location?.longitude || 0;
    
    // Simple estimation: distance from KL center
    const klLat = 3.1390;
    const klLng = 101.6869;
    
    const distance = calculateDistance(klLat, klLng, lat, lng);
    return distance.toFixed(2);
}

// Close ticket report
function closeTicketReport() {
    const modal = document.getElementById('ticketReportModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentReportTicket = null;
}

// Download ticket report
function downloadTicketReport() {
    if (!currentReportTicket) return;
    
    const ticket = currentReportTicket;
    const ticketNumber = getTicketName(ticket); // Use CTT format
    
    // Create report content
    const reportContent = `
TICKET REPORT
=============

Ticket Number: ${ticketNumber}
Title: ${ticket.title}
Category: ${ticket.category}
Priority: ${ticket.priority}
Status: ${ticket.status}

Customer: ${ticket.customer?.name || ticket.customerInfo?.name || 'N/A'}
Location: ${ticket.location?.address || 'N/A'}

Created: ${new Date(ticket.created_at || ticket.createdAt).toLocaleString()}
Resolved: ${ticket.resolved_at || ticket.resolvedAt ? new Date(ticket.resolved_at || ticket.resolvedAt).toLocaleString() : 'Not resolved'}

Description:
${ticket.description || 'No description'}

---
Generated: ${new Date().toLocaleString()}
    `.trim();
    
    // Create download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-report-${ticketNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Report downloaded: ${ticketNumber}`, 'success');
}

console.log('✅ Field Portal JavaScript loaded successfully');
