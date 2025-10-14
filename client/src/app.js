// Global variables
let socket;
let map;
let tickets = [];
let fieldTeams = [];
let assignments = [];
let currentProfileTeam = null;

// API Base URL
const API_BASE = 'http://localhost:5002/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FieldAssign Dashboard Initializing...');
    
    initializeSocket();
    loadDashboardData();
    initializeMap();
    
    // Load initial tab content
    loadRecentTickets();
    loadTeamStatusOverview();
    
    // Set up auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
    
    console.log('✅ Dashboard initialization complete!');
});

// Socket.IO initialization
function initializeSocket() {
    socket = io('http://localhost:5001');
    
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join-admin');
    });
    
    socket.on('team-location-update', (data) => {
        console.log('Team location update:', data);
        updateTeamLocationOnMap(data);
    });
    
    socket.on('team-status-update', (data) => {
        console.log('Team status update:', data);
        refreshTeamStatus();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tickets':
            loadTickets();
            break;
        case 'teams':
            loadFieldTeams();
            break;
        case 'assignments':
            loadAssignments();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'map':
            refreshMap();
            break;
    }
}

// Tab navigation function with smooth transitions
function showTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Add loading state to current active tab
    const currentActivePane = document.querySelector('.tab-pane.active');
    if (currentActivePane) {
        currentActivePane.classList.add('loading');
    }
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Remove active class from all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Add active class to corresponding nav link
    const navLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Add active class to clicked tab button (if from tab buttons)
    if (event && event.target && event.target.classList.contains('tab-button')) {
        event.target.classList.add('active');
    }
    
    // Show corresponding tab pane with smooth transition
    setTimeout(() => {
        const targetPane = document.getElementById(`${tabName}-tab`);
        if (targetPane) {
            targetPane.classList.remove('loading');
            targetPane.classList.add('active');
            console.log('Tab pane activated:', targetPane.id);
        } else {
            console.error('Tab pane not found:', `${tabName}-tab`);
        }
    }, 150);
    
    // Show/hide main dashboard cards based on tab
    const mainDashboardCards = document.getElementById('main-dashboard-cards');
    if (mainDashboardCards) {
        if (tabName === 'overview') {
            mainDashboardCards.style.display = 'grid';
        } else {
            mainDashboardCards.style.display = 'none';
        }
    }

    // Load tab-specific data
    switch(tabName) {
        case 'overview':
            loadRecentTickets();
            loadTeamStatusOverview();
            break;
        case 'tickets':
            showTicketsListView(); // Show list view by default
            break;
        case 'teams':
            showZoneView(); // Show zone view by default
            break;
        case 'planning':
            showMaterialForecast(); // Show material forecast by default
            break;
        case 'map':
            // Initialize map if not already done
            if (!map) {
                initializeMap();
            }
            refreshMap();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    console.log('🔄 Loading dashboard data from', API_BASE);
    
    try {
        const [ticketsResponse, teamsResponse, agingResponse, productivityResponse] = await Promise.all([
            fetch(`${API_BASE}/tickets`),
            fetch(`${API_BASE}/teams`),
            fetch(`${API_BASE}/analytics/tickets/aging`),
            fetch(`${API_BASE}/teams/analytics/productivity`)
        ]);
        
        console.log('✅ API responses received');
        
        const ticketsData = await ticketsResponse.json();
        const teamsData = await teamsResponse.json();
        const agingData = await agingResponse.json();
        const productivityData = await productivityResponse.json();
        
        console.log('📊 Data parsed:', {
            tickets: ticketsData.total || ticketsData.tickets?.length,
            teams: teamsData.total || teamsData.teams?.length,
            aging: agingData.efficiencyScore,
            productivity: productivityData.productivityScore
        });
        
        // Update metrics with correct data
        updateDashboardMetrics(ticketsData, teamsData, agingData, productivityData);
        
        // Load recent tickets
        await loadRecentTickets();
        
        // Load team status
        await loadTeamStatusOverview();
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        // Show sample data on error
        updateDashboardMetricsWithSampleData();
    }
}

function updateDashboardMetrics(ticketsData, teamsData, agingData, productivityData) {
    const tickets = ticketsData.tickets || [];
    const teams = teamsData.teams || [];
    
    console.log('📊 Updating dashboard metrics with:', {
        tickets: tickets.length,
        teams: teams.length,
        agingData,
        productivityData
    });
    
    // Calculate today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Filter today's tickets
    const todayTickets = tickets.filter(t => {
        const createdDate = new Date(t.created_at || t.createdAt);
        return createdDate >= today && createdDate < tomorrow;
    });
    
    // Filter this month's tickets
    const monthlyTickets = tickets.filter(t => {
        const createdDate = new Date(t.created_at || t.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
    });
    
    // Active tickets (not closed/resolved)
    const activeTickets = tickets.filter(t => 
        t.status !== 'closed' && t.status !== 'resolved'
    ).length;
    
    // Today's completed tickets
    const todayCompleted = tickets.filter(t => {
        const resolvedDate = t.resolved_at || t.resolvedAt || t.completed_at || t.completedAt;
        if (!resolvedDate) return false;
        const date = new Date(resolvedDate);
        return date >= today && date < tomorrow;
    }).length;
    
    // Monthly completed tickets
    const monthlyCompleted = tickets.filter(t => {
        const resolvedDate = t.resolved_at || t.resolvedAt || t.completed_at || t.completedAt;
        if (!resolvedDate) return false;
        const date = new Date(resolvedDate);
        return date >= monthStart && date <= monthEnd;
    }).length;
    
    // Calculate productivity score (completed / total * 100)
    const productivityScore = monthlyTickets.length > 0 
        ? (monthlyCompleted / monthlyTickets.length * 100).toFixed(2)
        : 0;
    
    // Calculate efficiency rate (tickets resolved within target time)
    const targetHours = 2;
    const efficientTickets = tickets.filter(t => {
        if (!t.resolved_at && !t.resolvedAt) return false;
        const created = new Date(t.created_at || t.createdAt);
        const resolved = new Date(t.resolved_at || t.resolvedAt);
        const hours = (resolved - created) / (1000 * 60 * 60);
        return hours <= targetHours;
    }).length;
    
    const totalResolved = tickets.filter(t => t.resolved_at || t.resolvedAt).length;
    const efficiencyRate = totalResolved > 0 
        ? (efficientTickets / totalResolved * 100).toFixed(2)
        : 0;
    
    // Calculate average resolution time
    const resolvedTickets = tickets.filter(t => t.resolved_at || t.resolvedAt);
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, t) => {
            const created = new Date(t.created_at || t.createdAt);
            const resolved = new Date(t.resolved_at || t.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgResolutionTime = (totalTime / resolvedTickets.length / (1000 * 60 * 60)).toFixed(2);
    }
    
    // Calculate team performance rating
    const avgRating = teams.length > 0
        ? (teams.reduce((sum, t) => sum + (t.rating || 4.5), 0) / teams.length).toFixed(1)
        : 4.5;
    
    // Today's active teams
    const todayActiveTeams = teams.filter(t => t.status === 'active').length;
    
    // Update UI - Today's Tickets
    updateElement('today-tickets', todayTickets.length);
    updateElement('monthly-tickets', monthlyTickets.length);
    updateElement('active-tickets', activeTickets);
    
    const ticketChange = monthlyTickets.length > 0 
        ? ((todayTickets.length / (monthlyTickets.length / 30)) * 100 - 100).toFixed(2)
        : 0;
    updateTrendElement('today-tickets-trend', 'today-tickets-change', ticketChange, '% vs daily avg');
    
    // Update UI - Productivity
    updateElement('productivity-score', `${productivityScore}%`);
    updateElement('today-completed', todayCompleted);
    updateElement('monthly-completed', monthlyCompleted);
    
    const productivityChange = productivityData?.productivityScore 
        ? (productivityScore - productivityData.productivityScore).toFixed(2)
        : 0;
    updateTrendElement('productivity-trend', 'productivity-change', productivityChange, '% from last month');
    
    // Update UI - Efficiency
    updateElement('efficiency-score', `${efficiencyRate}%`);
    updateElement('avg-resolution-time', `${avgResolutionTime}h`);
    
    const efficiencyChange = agingData?.efficiencyScore 
        ? (efficiencyRate - agingData.efficiencyScore).toFixed(2)
        : 0;
    updateTrendElement('efficiency-trend', 'efficiency-change', efficiencyChange, '% improvement');
    
    // Update UI - Team Performance
    updateElement('team-rating', avgRating);
    updateElement('today-teams-active', todayActiveTeams);
    updateElement('total-teams', teams.length);
    
    const performanceChange = 0.2; // Sample change
    updateTrendElement('performance-trend', 'performance-change', performanceChange, ' from last month');
    
    // Store data globally for other functions
    window.tickets = tickets;
    window.fieldTeams = teams;
    
    console.log('✅ Dashboard metrics updated:', {
        todayTickets: todayTickets.length,
        monthlyTickets: monthlyTickets.length,
        productivityScore,
        efficiencyRate,
        avgRating
    });
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateTrendElement(trendId, changeId, change, suffix) {
    const trendElement = document.getElementById(trendId);
    const changeElement = document.getElementById(changeId);
    
    if (trendElement && changeElement) {
        const isPositive = change >= 0;
        trendElement.className = `metric-trend ${isPositive ? 'trend-up' : 'trend-down'}`;
        trendElement.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span id="${changeId}">${Math.abs(change).toFixed(2)}${suffix}</span>
        `;
    }
}

function updateDashboardMetricsWithSampleData() {
    // Sample data for demonstration
    updateElement('today-tickets', 8);
    updateElement('monthly-tickets', 75);
    updateElement('active-tickets', 45);
    updateTrendElement('today-tickets-trend', 'today-tickets-change', 12.50, '% vs daily avg');
    
    updateElement('productivity-score', '87.50%');
    updateElement('today-completed', 5);
    updateElement('monthly-completed', 42);
    updateTrendElement('productivity-trend', 'productivity-change', 5.20, '% from last month');
    
    updateElement('efficiency-score', '92.30%');
    updateElement('avg-resolution-time', '1.80h');
    updateTrendElement('efficiency-trend', 'efficiency-change', 3.50, '% improvement');
    
    updateElement('team-rating', 4.7);
    updateElement('today-teams-active', 18);
    updateElement('total-teams', 25);
    updateTrendElement('performance-trend', 'performance-change', 0.20, ' from last month');
}

async function loadRecentTickets() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();
        
        console.log('📋 Loaded tickets:', data.tickets ? data.tickets.length : 0);
        
        const container = document.getElementById('recent-tickets');
        if (!container) {
            console.error('❌ Element "recent-tickets" not found in DOM');
            return;
        }
        
        container.innerHTML = '';
        
        if (data.tickets && data.tickets.length > 0) {
            // Show first 5 tickets
            const recentTickets = data.tickets.slice(0, 5);
            console.log('📋 Displaying', recentTickets.length, 'recent tickets');
            
            recentTickets.forEach(ticket => {
                const ticketElement = createTicketElement(ticket, true);
                container.appendChild(ticketElement);
            });
        } else {
            // Show sample data if no real data available
            const sampleTickets = [
                {
                    _id: '1',
                    ticketNumber: 'TK-001',
                    title: 'Network Breakdown - NTT Class 1 (Major)',
                    description: 'Complete network infrastructure failure - NTT Class 1 major breakdown affecting all customer services and network connectivity',
                    priority: 'emergency',
                    status: 'open',
                    category: 'network',
                    customer: { name: 'Ali' },
                    location: { address: 'Jalan Ampang, Kuala Lumpur City Centre, 50450 KL' }
                },
                {
                    _id: '2',
                    ticketNumber: 'TK-002',
                    title: 'Network Breakdown - NTT Class 2 (Intermediate)',
                    description: 'Intermediate network infrastructure issues - NTT Class 2 breakdown affecting multiple customer services and network segments',
                    priority: 'high',
                    status: 'assigned',
                    category: 'network',
                    customer: { name: 'Muthu' },
                    location: { address: 'Jalan Bukit Bintang, Bukit Bintang, 55100 KL' }
                },
                {
                    _id: '3',
                    ticketNumber: 'TK-003',
                    title: 'Customer - Drop Fiber',
                    description: 'Customer drop fiber connection failure - fiber optic cable damage or termination issues requiring immediate field repair',
                    priority: 'high',
                    status: 'in-progress',
                    category: 'customer',
                    customer: { name: 'Ah-Hock' },
                    location: { address: 'Jalan Sultan Ismail, Chow Kit, 50350 KL' }
                },
                {
                    _id: '4',
                    ticketNumber: 'TK-004',
                    title: 'Customer - CPE',
                    description: 'Customer Premises Equipment (CPE) troubleshooting - router, modem, or network equipment configuration and connectivity issues',
                    priority: 'medium',
                    status: 'assigned',
                    category: 'customer',
                    customer: { name: 'Nurul' },
                    location: { address: 'Jalan Tun Razak, Mont Kiara, 50480 KL' }
                },
                {
                    _id: '5',
                    ticketNumber: 'TK-005',
                    title: 'Customer - FDP Breakdown',
                    description: 'Fiber Distribution Point (FDP) equipment failure - distribution cabinet or fiber optic splitter issues affecting multiple customer connections',
                    priority: 'high',
                    status: 'open',
                    category: 'customer',
                    customer: { name: 'Ali' },
                    location: { address: 'Jalan Pudu, Pudu, 55100 KL' }
                },
                {
                    _id: '6',
                    ticketNumber: 'TK-006',
                    title: 'Network Breakdown - NTT (Minor)',
                    description: 'Minor network infrastructure issues - NTT minor breakdown with localized impact on specific network segments or customer services',
                    priority: 'low',
                    status: 'completed',
                    category: 'network',
                    customer: { name: 'Muthu' },
                    location: { address: 'Jalan Klang Lama, Old Klang Road, 58000 KL' }
                }
            ];
            
            sampleTickets.forEach(ticket => {
                const ticketElement = createTicketElement(ticket, true);
                container.appendChild(ticketElement);
            });
        }
    } catch (error) {
        console.error('Error loading recent tickets:', error);
        // Show sample data on error
        const container = document.getElementById('recent-tickets');
        container.innerHTML = '';
        
        const sampleTickets = [
            {
                _id: '1',
                ticketNumber: 'TK-001',
                title: 'Network Outage - Downtown Office',
                description: 'Network Repair',
                priority: 'high',
                status: 'open',
                category: 'electrical',
                customer: { name: 'John Smith' },
                location: { address: '123 Main St, Downtown, NY 10001' }
            },
            {
                _id: '2',
                ticketNumber: 'TK-002',
                title: 'HVAC System Not Working',
                description: 'Air conditioning unit needs repair',
                priority: 'medium',
                status: 'assigned',
                category: 'hvac',
                customer: { name: 'Sarah Johnson' },
                location: { address: '456 Oak Ave, Midtown, NY 10002' }
            }
        ];
        
        sampleTickets.forEach(ticket => {
            const ticketElement = createTicketElement(ticket, true);
            container.appendChild(ticketElement);
        });
    }
}

async function loadTeamStatus() {
    try {
        const response = await fetch(`${API_BASE}/field-teams`);
        const data = await response.json();
        
        const container = document.getElementById('team-status');
        container.innerHTML = '';
        
        if (data.fieldTeams && data.fieldTeams.length > 0) {
            data.fieldTeams.forEach(team => {
                const teamElement = createTeamStatusElement(team);
                container.appendChild(teamElement);
            });
        } else {
            container.innerHTML = '<p class="text-muted">No team members</p>';
        }
    } catch (error) {
        console.error('Error loading team status:', error);
    }
}

async function loadTeamStatusOverview() {
    try {
        const response = await fetch(`${API_BASE}/teams/analytics/zones`);
        const data = await response.json();
        
        console.log('👥 Loaded zones:', data.zones ? Object.keys(data.zones).length : 0);
        
        const container = document.getElementById('team-status-overview');
        if (!container) {
            console.error('❌ Element "team-status-overview" not found in DOM');
            return;
        }
        
        container.innerHTML = '';
        
        if (data.zones && Object.keys(data.zones).length > 0) {
            // Convert zones object to array and sort by productivity score (descending)
            const zonesArray = Object.entries(data.zones).map(([zoneName, zoneData]) => ({
                zone: zoneName,
                ...zoneData
            }));
            
            const sortedZones = zonesArray.sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));
            
            console.log('👥 Displaying', sortedZones.length, 'zones');
            
            sortedZones.forEach((zone, index) => {
                const zoneElement = createZonePerformanceElement(zone, index + 1);
                container.appendChild(zoneElement);
            });
        } else {
            console.log('⚠️  No zones data, showing sample data');
            displaySampleZonePerformance();
        }
    } catch (error) {
        console.error('❌ Error loading zone performance overview:', error);
        // Show sample data on error
        displaySampleZonePerformance();
    }
}

function createZonePerformanceElement(zone, rank) {
    const zoneCard = document.createElement('div');
    zoneCard.className = `zone-performance-card rank-${rank}`;
    
    const productivityPercentage = Math.round(zone.productivityScore || 0);
    const activeTeams = zone.teams ? zone.teams.filter(t => t.status === 'active').length : 0;
    const totalTeams = zone.teams ? zone.teams.length : 0;
    const efficiencyPercentage = Math.round(zone.averageRating ? zone.averageRating * 20 : 85);
    
    zoneCard.innerHTML = `
        <div class="zone-header">
            <div class="zone-name">${zone.zoneName || zone.zone}</div>
            <div class="zone-rank rank-${rank}">#${rank}</div>
        </div>
        
        <div class="zone-metrics">
            <div class="zone-metric">
                <span class="zone-metric-value">${zone.totalTickets || 0}</span>
                <div class="zone-metric-label">Total Tickets</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value">${totalTeams}</span>
                <div class="zone-metric-label">Teams</div>
            </div>
        </div>
        
        <div class="zone-productivity">
            <div class="productivity-label">Productivity</div>
            <div class="productivity-score">${productivityPercentage}%</div>
        </div>
        
        <div class="productivity-bar">
            <div class="productivity-fill" style="width: ${Math.min(100, Math.max(0, productivityPercentage))}%"></div>
        </div>
        
        <div class="mt-2">
            <small class="text-muted">
                ${zone.openTickets || 0} open • ${zone.closedTickets || 0} closed • ${zone.averageRating ? zone.averageRating.toFixed(2) : '0.00'}★ rating
            </small>
        </div>
    `;
    
    return zoneCard;
}

function displaySampleZonePerformance() {
    const container = document.getElementById('team-status-overview');
    container.innerHTML = '';
    
    const sampleZones = [
        {
            zone: 'Central Zone (KL)',
            totalTickets: 45,
            openTickets: 8,
            closedTickets: 37,
            activeTeams: 3,
            productivityScore: 92,
            efficiency: 88
        },
        {
            zone: 'Northern Zone (Penang)',
            totalTickets: 32,
            openTickets: 5,
            closedTickets: 27,
            activeTeams: 2,
            productivityScore: 89,
            efficiency: 85
        },
        {
            zone: 'Southern Zone (Johor)',
            totalTickets: 28,
            openTickets: 6,
            closedTickets: 22,
            activeTeams: 2,
            productivityScore: 84,
            efficiency: 82
        },
        {
            zone: 'East Malaysia',
            totalTickets: 22,
            openTickets: 4,
            closedTickets: 18,
            activeTeams: 1,
            productivityScore: 78,
            efficiency: 79
        }
    ];
    
    sampleZones.forEach((zone, index) => {
        const zoneElement = createZonePerformanceElement(zone, index + 1);
        container.appendChild(zoneElement);
    });
}

// Ticket functions
async function loadTickets() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();
        tickets = data.tickets || [];
        
        console.log('🎫 Loading tickets tab data:', tickets.length);
        
        // Update Tickets tab metrics
        updateTicketsTabMetrics(tickets);
        
        if (tickets.length === 0) {
            // Show sample data if no real data available
            tickets = [
                {
                    _id: '1',
                    ticketNumber: 'TK-001',
                    title: 'Network Outage - Downtown Office',
                    description: 'Complete network failure affecting all systems',
                    priority: 'high',
                    status: 'open',
                    category: 'electrical',
                    customer: { name: 'John Smith', email: 'john@company.com', phone: '555-0123' },
                    location: { address: '123 Main St, Downtown, NY 10001', latitude: 40.7128, longitude: -74.0060 },
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    ticketNumber: 'TK-002',
                    title: 'HVAC System Not Working',
                    description: 'Air conditioning unit needs repair - no cooling',
                    priority: 'medium',
                    status: 'assigned',
                    category: 'hvac',
                    customer: { name: 'Sarah Johnson', email: 'sarah@company.com', phone: '555-0124' },
                    location: { address: '456 Oak Ave, Midtown, NY 10002', latitude: 40.7589, longitude: -73.9851 },
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    _id: '3',
                    ticketNumber: 'TK-003',
                    title: 'Plumbing Emergency',
                    description: 'Water leak in basement - urgent repair needed',
                    priority: 'emergency',
                    status: 'in-progress',
                    category: 'plumbing',
                    customer: { name: 'Mike Davis', email: 'mike@company.com', phone: '555-0125' },
                    location: { address: '789 Pine St, Uptown, NY 10003', latitude: 40.7831, longitude: -73.9712 },
                    createdAt: new Date(Date.now() - 7200000).toISOString()
                },
                {
                    _id: '4',
                    ticketNumber: 'TK-004',
                    title: 'General Maintenance',
                    description: 'Routine maintenance check for building systems',
                    priority: 'low',
                    status: 'completed',
                    category: 'maintenance',
                    customer: { name: 'Lisa Wilson', email: 'lisa@company.com', phone: '555-0126' },
                    location: { address: '321 Elm St, Brooklyn, NY 11201', latitude: 40.6892, longitude: -73.9442 },
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];
        }
        
        displayTickets(tickets);
    } catch (error) {
        console.error('Error loading tickets:', error);
        // Show sample data on error
        tickets = [
            {
                _id: '1',
                ticketNumber: 'TK-001',
                title: 'Network Outage - Downtown Office',
                description: 'Complete network failure affecting all systems',
                priority: 'high',
                status: 'open',
                category: 'electrical',
                customer: { name: 'John Smith', email: 'john@company.com', phone: '555-0123' },
                location: { address: '123 Main St, Downtown, NY 10001', latitude: 40.7128, longitude: -74.0060 },
                createdAt: new Date().toISOString()
            },
            {
                _id: '2',
                ticketNumber: 'TK-002',
                title: 'HVAC System Not Working',
                description: 'Air conditioning unit needs repair - no cooling',
                priority: 'medium',
                status: 'assigned',
                category: 'hvac',
                customer: { name: 'Sarah Johnson', email: 'sarah@company.com', phone: '555-0124' },
                location: { address: '456 Oak Ave, Midtown, NY 10002', latitude: 40.7589, longitude: -73.9851 },
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }
        ];
        displayTickets(tickets);
    }
}

// Update Tickets tab metrics with real data
function updateTicketsTabMetrics(allTickets) {
    console.log('📊 Updating Tickets tab metrics...', allTickets.length);
    
    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter tickets by date
    const todayTickets = allTickets.filter(t => {
        const date = new Date(t.createdAt || t.created_at);
        return date >= today;
    });
    
    const yesterdayTickets = allTickets.filter(t => {
        const date = new Date(t.createdAt || t.created_at);
        return date >= yesterday && date < today;
    });
    
    const monthlyTickets = allTickets.filter(t => {
        const date = new Date(t.createdAt || t.created_at);
        return date >= monthStart;
    });
    
    // Today's resolved
    const todayResolved = allTickets.filter(t => {
        const resolvedDate = t.resolvedAt || t.resolved_at;
        if (!resolvedDate) return false;
        const date = new Date(resolvedDate);
        return date >= today;
    }).length;
    
    // Yesterday's resolved
    const yesterdayResolved = allTickets.filter(t => {
        const resolvedDate = t.resolvedAt || t.resolved_at;
        if (!resolvedDate) return false;
        const date = new Date(resolvedDate);
        return date >= yesterday && date < today;
    }).length;
    
    // Monthly resolved
    const monthlyResolved = allTickets.filter(t => {
        const resolvedDate = t.resolvedAt || t.resolved_at;
        if (!resolvedDate) return false;
        const date = new Date(resolvedDate);
        return date >= monthStart;
    }).length;
    
    // Status counts
    const openTickets = allTickets.filter(t => t.status === 'open').length;
    const inProgressTickets = allTickets.filter(t => t.status === 'in_progress').length;
    const pendingTickets = openTickets + inProgressTickets;
    
    // Priority counts
    const criticalTickets = allTickets.filter(t => t.priority === 'emergency').length;
    const highTickets = allTickets.filter(t => t.priority === 'high').length;
    const emergencyTickets = criticalTickets;
    
    // Update UI - Today's Tickets
    updateElement('tickets-today', todayTickets.length);
    updateElement('tickets-yesterday', yesterdayTickets.length);
    updateElement('tickets-monthly', monthlyTickets.length);
    
    const todayChange = yesterdayTickets.length > 0 
        ? ((todayTickets.length - yesterdayTickets.length) / yesterdayTickets.length * 100)
        : 0;
    updateTrendElement('tickets-today-trend', 'tickets-today-change', todayChange, '% vs yesterday');
    
    // Update UI - Pending
    updateElement('tickets-pending', pendingTickets);
    updateElement('tickets-open', openTickets);
    updateElement('tickets-inprogress', inProgressTickets);
    
    const pendingChange = 0; // Can calculate from historical data
    updateTrendElement('tickets-pending-trend', 'tickets-pending-change', pendingChange, ' active');
    
    // Update UI - Resolved Today
    updateElement('tickets-resolved', todayResolved);
    updateElement('tickets-resolved-yesterday', yesterdayResolved);
    updateElement('tickets-resolved-monthly', monthlyResolved);
    
    const resolvedChange = yesterdayResolved > 0
        ? ((todayResolved - yesterdayResolved) / yesterdayResolved * 100)
        : 0;
    updateTrendElement('tickets-resolved-trend', 'tickets-resolved-change', resolvedChange, '% vs yesterday');
    
    // Update UI - Critical Priority
    updateElement('tickets-critical', criticalTickets);
    updateElement('tickets-high', highTickets);
    updateElement('tickets-emergency', emergencyTickets);
    
    const criticalChange = 0; // Can calculate from historical data
    updateTrendElement('tickets-critical-trend', 'tickets-critical-change', criticalChange, ' urgent');
    
    console.log('✅ Tickets tab metrics updated:', {
        today: todayTickets.length,
        yesterday: yesterdayTickets.length,
        monthly: monthlyTickets.length,
        todayResolved,
        pending: pendingTickets
    });
}

function displayTickets(ticketsToShow) {
    const container = document.getElementById('tickets-list');
    container.innerHTML = '';
    
    if (ticketsToShow.length === 0) {
        container.innerHTML = '<p class="text-muted">No tickets found</p>';
        return;
    }
    
    ticketsToShow.forEach(ticket => {
        const ticketElement = createTicketElement(ticket);
        container.appendChild(ticketElement);
    });
}

function createTicketElement(ticket, isCompact = false) {
    const div = document.createElement('div');
    
    // Handle different data structures from backend
    const ticketNumber = ticket.ticketNumber || ticket._id.substring(0, 8);
    const customerName = ticket.customer?.name || ticket.customerInfo?.name || 'N/A';
    const locationAddress = ticket.location?.address || 'N/A';
    
    if (isCompact) {
        div.className = 'ticket-card';
        div.innerHTML = `
            <div class="ticket-header">
                <h3 class="ticket-title">${ticketNumber} - ${ticket.title}</h3>
                <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
            </div>
            <p class="ticket-description">${ticket.description}</p>
            <div class="ticket-details">
                <div class="ticket-detail">
                    <i class="fas fa-user"></i>
                    <span>${customerName}</span>
                </div>
                <div class="ticket-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${locationAddress}</span>
                </div>
            </div>
        `;
    } else {
        div.className = 'ticket-card';
        div.innerHTML = `
            <div class="ticket-header">
                <h3 class="ticket-title">${ticketNumber} - ${ticket.title}</h3>
                <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
            </div>
            <p class="ticket-description">${ticket.description}</p>
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
                    <i class="fas fa-tag"></i>
                    <span>${ticket.category}</span>
                </div>
            </div>
            <div class="mt-3">
                <div class="btn-group" role="group">
                    ${ticket.status === 'open' ? `
                        <button class="btn btn-sm btn-primary" onclick="autoAssignTicket('${ticket._id}')">
                            <i class="fas fa-magic me-1"></i>Auto Assign
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewTicketDetails('${ticket._id}')">
                        <i class="fas fa-eye me-1"></i>View Details
                    </button>
                    ${ticket.status === 'open' ? `
                        <button class="btn btn-sm btn-outline-warning" onclick="showAssignModal('${ticket._id}')">
                            <i class="fas fa-user-plus me-1"></i>Manual Assign
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    return div;
}

function filterTickets() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('search-tickets').value.toLowerCase();
    
    let filteredTickets = tickets.filter(ticket => {
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
        const matchesCategory = !categoryFilter || ticket.category === categoryFilter;
        const matchesSearch = !searchTerm || 
            ticket.ticketNumber.toLowerCase().includes(searchTerm) ||
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.customer.name.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
    
    displayTickets(filteredTickets);
}

// Field Team functions
async function loadFieldTeams() {
    try {
        const response = await fetch(`${API_BASE}/field-teams`);
        const data = await response.json();
        fieldTeams = data.fieldTeams || [];
        
        if (fieldTeams.length === 0) {
            // Show sample data if no real data available
            fieldTeams = [
                {
                    _id: '1',
                    name: 'Zamri',
                    email: 'zamri@company.com',
                    phone: '555-0101',
                    status: 'active',
                    skills: ['network', 'customer'],
                    hourlyRate: 180.00,
                    state: 'Kuala Lumpur',
                    zone: 'Central',
                    productivity: {
                        totalTicketsCompleted: 156,
                        customerRating: 4.8,
                        ticketsThisMonth: 23,
                        averageResponseTime: 15,
                        efficiencyScore: 92
                    },
                    currentLocation: {
                        address: 'Jalan Ampang, Kuala Lumpur City Centre, 50450 KL',
                        latitude: 3.1390,
                        longitude: 101.6869
                    }
                },
                {
                    _id: '2',
                    name: 'Nurul',
                    email: 'nurul@company.com',
                    phone: '555-0102',
                    status: 'busy',
                    skills: ['network', 'customer'],
                    hourlyRate: 168.00,
                    state: 'Perak',
                    zone: 'Northern',
                    productivity: {
                        totalTicketsCompleted: 134,
                        customerRating: 4.6,
                        ticketsThisMonth: 18,
                        averageResponseTime: 22,
                        efficiencyScore: 87
                    },
                    currentLocation: {
                        address: 'Jalan Sultan Idris Shah, Ipoh, 30000 Perak',
                        latitude: 4.5841,
                        longitude: 101.0829
                    }
                },
                {
                    _id: '3',
                    name: 'Ah-Hock',
                    email: 'ah-hock@company.com',
                    phone: '555-0103',
                    status: 'active',
                    skills: ['customer', 'network'],
                    hourlyRate: 192.00,
                    state: 'Selangor',
                    zone: 'Central',
                    productivity: {
                        totalTicketsCompleted: 189,
                        customerRating: 4.9,
                        ticketsThisMonth: 28,
                        averageResponseTime: 12,
                        efficiencyScore: 95
                    },
                    currentLocation: {
                        address: 'Jalan Sultan Ismail, Chow Kit, 50350 KL',
                        latitude: 3.1650,
                        longitude: 101.7000
                    }
                },
                {
                    _id: '4',
                    name: 'Muthu',
                    email: 'muthu@company.com',
                    phone: '555-0104',
                    status: 'offline',
                    skills: ['network', 'customer'],
                    hourlyRate: 176.00,
                    state: 'Johor',
                    zone: 'Southern',
                    productivity: {
                        totalTicketsCompleted: 142,
                        customerRating: 4.7,
                        ticketsThisMonth: 16,
                        averageResponseTime: 18,
                        efficiencyScore: 89
                    },
                    currentLocation: {
                        address: 'Jalan Tun Abdul Razak, Johor Bahru, 80000 Johor',
                        latitude: 1.4927,
                        longitude: 103.7414
                    }
                }
            ];
        }
        
        displayFieldTeams(fieldTeams);
    } catch (error) {
        console.error('Error loading field teams:', error);
        // Show sample data on error
        fieldTeams = [
            {
                _id: '1',
                name: 'John Smith',
                email: 'john.smith@company.com',
                phone: '555-0101',
                status: 'active',
                skills: ['electrical', 'general'],
                hourlyRate: 180.00,
                productivity: {
                    totalTicketsCompleted: 156,
                    customerRating: 4.8
                },
                currentLocation: {
                    address: '123 Main St, Downtown, NY 10001',
                    latitude: 40.7128,
                    longitude: -74.0060
                }
            },
            {
                _id: '2',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                phone: '555-0102',
                status: 'busy',
                skills: ['hvac', 'maintenance'],
                hourlyRate: 168.00,
                productivity: {
                    totalTicketsCompleted: 134,
                    customerRating: 4.6
                },
                currentLocation: {
                    address: '456 Oak Ave, Midtown, NY 10002',
                    latitude: 40.7589,
                    longitude: -73.9851
                }
            }
        ];
        displayFieldTeams(fieldTeams);
    }
}

function displayFieldTeams(teamsToShow) {
    const container = document.getElementById('teams-grid');
    container.innerHTML = '';
    
    if (teamsToShow.length === 0) {
        container.innerHTML = '<p class="text-muted">No team members found</p>';
        return;
    }
    
    teamsToShow.forEach(team => {
        const teamElement = createTeamCard(team);
        container.appendChild(teamElement);
    });
}

function createTeamCard(team) {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = team.status === 'active' ? 'success' : 
                       team.status === 'busy' ? 'warning' : 
                       team.status === 'offline' ? 'danger' : 'secondary';
    
    div.innerHTML = `
        <div class="card team-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">${team.name}</h5>
                    <span class="badge bg-${statusClass}">${team.status}</span>
                </div>
                <p class="text-muted mb-2">
                    <i class="fas fa-envelope me-1"></i>${team.email}<br>
                    <i class="fas fa-phone me-1"></i>${team.phone}
                </p>
                <div class="mb-3">
                    <strong>Skills:</strong>
                    <div class="mt-1">
                        ${team.skills.map(skill => `<span class="badge bg-light text-dark me-1">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="row text-center">
                    <div class="col-4">
                        <div class="text-muted small">Tickets</div>
                        <div class="fw-bold">${team.productivity.totalTicketsCompleted}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-muted small">Rating</div>
                        <div class="fw-bold">${team.productivity.customerRating.toFixed(1)}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-muted small">Rate</div>
                        <div class="fw-bold">$${team.cost.hourlyRate}/hr</div>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="btn-group w-100" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewTeamDetails('${team._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateTeamLocation('${team._id}')">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewTeamPerformance('${team._id}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function createTeamStatusElement(team) {
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-2';
    
    const statusClass = team.status === 'active' ? 'success' : 
                       team.status === 'busy' ? 'warning' : 
                       team.status === 'offline' ? 'danger' : 'secondary';
    
    div.innerHTML = `
        <div>
            <strong><a href="#" class="team-member-name" onclick="showTeamProfile('${team._id}'); return false;">${team.name}</a></strong>
            <br>
            <small class="text-muted">${team.skills.join(', ')}</small>
        </div>
        <span class="badge bg-${statusClass}">${team.status}</span>
    `;
    
    return div;
}

// Assignment functions
async function loadAssignments() {
    try {
        const response = await fetch(`${API_BASE}/assignments`);
        const data = await response.json();
        assignments = data.assignments || [];
        displayAssignments(assignments);
    } catch (error) {
        console.error('Error loading assignments:', error);
        showNotification('Error loading assignments', 'error');
    }
}

function displayAssignments(assignmentsToShow) {
    const container = document.getElementById('assignments-list');
    container.innerHTML = '';
    
    if (assignmentsToShow.length === 0) {
        container.innerHTML = '<p class="text-muted">No assignments found</p>';
        return;
    }
    
    assignmentsToShow.forEach(assignment => {
        const assignmentElement = createAssignmentElement(assignment);
        container.appendChild(assignmentElement);
    });
}

function createAssignmentElement(assignment) {
    const div = document.createElement('div');
    div.className = 'assignment-item p-3 mb-3 border rounded';
    
    const statusClass = assignment.status === 'completed' ? 'success' : 
                       assignment.status === 'in-progress' ? 'warning' : 
                       assignment.status === 'assigned' ? 'primary' : 'secondary';
    
    div.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h6 class="mb-1">${assignment.ticket.ticketNumber} - ${assignment.ticket.title}</h6>
                <p class="text-muted mb-2">Assigned to: ${assignment.fieldTeam.name}</p>
                <div class="d-flex gap-2 mb-2">
                    <span class="badge bg-${statusClass}">${assignment.status}</span>
                    <span class="badge bg-info">${assignment.assignmentType}</span>
                    <span class="badge bg-secondary">Score: ${assignment.assignmentScore.toFixed(1)}</span>
                </div>
                <small class="text-muted">
                    Assigned: ${new Date(assignment.assignedAt).toLocaleString()}
                    ${assignment.estimatedArrivalTime ? ` | ETA: ${new Date(assignment.estimatedArrivalTime).toLocaleString()}` : ''}
                </small>
            </div>
            <div class="col-md-4 text-end">
                <div class="btn-group-vertical" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewAssignmentDetails('${assignment._id}')">
                        <i class="fas fa-eye me-1"></i>View Details
                    </button>
                    ${assignment.status === 'assigned' ? `
                        <button class="btn btn-sm btn-outline-warning" onclick="updateAssignmentStatus('${assignment._id}', 'accepted')">
                            <i class="fas fa-check me-1"></i>Accept
                        </button>
                    ` : ''}
                    ${assignment.status === 'accepted' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="updateAssignmentStatus('${assignment._id}', 'in-progress')">
                            <i class="fas fa-play me-1"></i>Start
                        </button>
                    ` : ''}
                    ${assignment.status === 'in-progress' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="updateAssignmentStatus('${assignment._id}', 'completed')">
                            <i class="fas fa-check-circle me-1"></i>Complete
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return div;
}

// Analytics functions
async function loadAnalytics() {
    try {
        const [performanceResponse, ticketsResponse] = await Promise.all([
            fetch(`${API_BASE}/assignments/analytics/performance`),
            fetch(`${API_BASE}/tickets/analytics/overview`)
        ]);
        
        const performanceData = await performanceResponse.json();
        const ticketsData = await ticketsResponse.json();
        
        displayPerformanceMetrics(performanceData);
        displayCategoryBreakdown(ticketsData);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

function displayPerformanceMetrics(data) {
    const container = document.getElementById('performance-metrics');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-6">
                <div class="text-center">
                    <h3 class="text-primary">${data.totalAssignments}</h3>
                    <p class="text-muted">Total Assignments</p>
                </div>
            </div>
            <div class="col-6">
                <div class="text-center">
                    <h3 class="text-success">${data.completedAssignments}</h3>
                    <p class="text-muted">Completed</p>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-6">
                <div class="text-center">
                    <h3 class="text-warning">${data.averageRating.toFixed(1)}</h3>
                    <p class="text-muted">Avg Rating</p>
                </div>
            </div>
            <div class="col-6">
                <div class="text-center">
                    <h3 class="text-info">${Math.round(data.averageCompletionTime)}m</h3>
                    <p class="text-muted">Avg Time</p>
                </div>
            </div>
        </div>
    `;
}

function displayCategoryBreakdown(data) {
    const container = document.getElementById('category-breakdown');
    
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
        container.innerHTML = data.categoryBreakdown.map(category => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${category._id}</span>
                <span class="badge bg-primary">${category.count}</span>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="text-muted">No category data available</p>';
    }
}

// Map functions with Malaysian settings
function initializeMap() {
    // Set view to Malaysia (Kuala Lumpur coordinates)
    map = L.map('map').setView([3.1390, 101.6869], 7); // Malaysia view
    
    // Use OpenStreetMap tiles with Malaysian attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Malaysia Field Operations',
        maxZoom: 18,
        minZoom: 6
    }).addTo(map);
    
    // Add Malaysian state boundaries (simplified)
    addMalaysianStateBoundaries();
    
    // Initialize map controls
    addMapControls();
}

function refreshMap() {
    if (!map) {
        initializeMap();
    }
    
    // Clear existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    
    // Add Malaysian field team markers with enhanced UX
    fieldTeams.forEach(team => {
        if (team.currentLocation) {
            const marker = L.marker([team.currentLocation.latitude, team.currentLocation.longitude])
                .addTo(map)
                .bindPopup(`
                    <div class="map-popup">
                        <div class="popup-header">
                            <h6><i class="fas fa-user"></i> ${team.name}</h6>
                            <span class="badge badge-${team.status === 'active' ? 'success' : team.status === 'busy' ? 'warning' : 'danger'}">${team.status}</span>
                        </div>
                        <div class="popup-content">
                            <p><strong>Zone:</strong> ${team.zone || 'N/A'}</p>
                            <p><strong>State:</strong> ${team.state || 'N/A'}</p>
                            <p><strong>Skills:</strong> ${team.skills.join(', ')}</p>
                            <p><strong>Rating:</strong> ${team.productivity.customerRating.toFixed(1)}/5.0</p>
                            <p><strong>Last Update:</strong> ${new Date().toLocaleTimeString('en-MY')}</p>
                        </div>
                        <div class="popup-actions">
                            <button class="btn btn-sm btn-primary" onclick="showTeamProfile('${team.id}')">
                                <i class="fas fa-user"></i> View Profile
                            </button>
                        </div>
                    </div>
                `);
            
            // Enhanced marker styling with Malaysian theme
            const iconColor = team.status === 'active' ? '#28a745' : 
                             team.status === 'busy' ? '#ffc107' : '#dc3545';
            
            marker.setIcon(L.divIcon({
                className: 'custom-team-marker',
                html: `
                    <div class="team-marker" style="background-color: ${iconColor};">
                        <i class="fas fa-user"></i>
                        <div class="marker-pulse"></div>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }));
        }
    });
    
    // Add Malaysian ticket markers with enhanced UX
    tickets.forEach(ticket => {
        if (ticket.status === 'open' || ticket.status === 'assigned') {
            const marker = L.marker([ticket.location.latitude, ticket.location.longitude])
                .addTo(map)
                .bindPopup(`
                    <div class="map-popup">
                        <div class="popup-header">
                            <h6><i class="fas fa-ticket-alt"></i> ${ticket.ticketNumber}</h6>
                            <span class="badge badge-${ticket.priority === 'critical' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'info'}">${ticket.priority}</span>
                        </div>
                        <div class="popup-content">
                            <p><strong>Title:</strong> ${ticket.title}</p>
                            <p><strong>Category:</strong> ${ticket.category}</p>
                            <p><strong>Status:</strong> ${ticket.status}</p>
                            <p><strong>Location:</strong> ${ticket.location.address}</p>
                            <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleDateString('en-MY')}</p>
                        </div>
                        <div class="popup-actions">
                            <button class="btn btn-sm btn-primary" onclick="showTicketDetails('${ticket.id}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                `);
            
            // Enhanced ticket marker styling
            const iconColor = ticket.priority === 'critical' ? '#dc3545' : 
                             ticket.priority === 'high' ? '#fd7e14' : 
                             ticket.priority === 'medium' ? '#ffc107' : '#28a745';
            
            marker.setIcon(L.divIcon({
                className: 'custom-ticket-marker',
                html: `
                    <div class="ticket-marker" style="background-color: ${iconColor};">
                        <i class="fas fa-ticket-alt"></i>
                        <div class="marker-pulse"></div>
                    </div>
                `,
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            }));
        }
    });
    
    // Add network infrastructure markers
    addNetworkInfrastructureMarkers();
    
    // Update map metrics
    updateMapMetrics();
}

function updateTeamLocationOnMap(data) {
    // This would update the team member's location on the map in real-time
    console.log('Updating team location on map:', data);
}

function toggleMapLayers() {
    showNotification('Map layers toggle - Coming soon!', 'info');
}

// Malaysian map helper functions
function addMalaysianStateBoundaries() {
    // Simplified Malaysian state boundaries (approximate)
    const malaysianStates = [
        { name: 'Kuala Lumpur', bounds: [[3.05, 101.6], [3.25, 101.8]] },
        { name: 'Selangor', bounds: [[2.8, 101.2], [3.8, 101.8]] },
        { name: 'Penang', bounds: [[5.2, 100.1], [5.5, 100.5]] },
        { name: 'Johor', bounds: [[1.2, 103.0], [2.8, 104.5]] },
        { name: 'Perak', bounds: [[3.8, 100.5], [5.2, 101.8]] },
        { name: 'Sabah', bounds: [[4.0, 115.0], [7.5, 119.0]] },
        { name: 'Sarawak', bounds: [[0.5, 109.0], [5.0, 115.0]] }
    ];
    
    malaysianStates.forEach(state => {
        const rectangle = L.rectangle(state.bounds, {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.3,
            fillOpacity: 0.1
        }).addTo(map);
        
        rectangle.bindTooltip(state.name, {
            permanent: false,
            direction: 'center',
            className: 'state-tooltip'
        });
    });
}

function addMapControls() {
    // Add fullscreen control
    const fullscreenControl = L.control.fullscreen({
        position: 'topright',
        title: 'Toggle Fullscreen',
        titleCancel: 'Exit Fullscreen'
    });
    map.addControl(fullscreenControl);
    
    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);
    
    // Add custom zoom control
    const zoomControl = L.control.zoom({
        position: 'topright'
    });
    map.addControl(zoomControl);
}

function addNetworkInfrastructureMarkers() {
    // Add network infrastructure points across Malaysia
    const networkInfrastructure = [
        { name: 'KL Data Center', coords: [3.1390, 101.6869], type: 'datacenter' },
        { name: 'Penang Hub', coords: [5.4164, 100.3327], type: 'hub' },
        { name: 'Johor Gateway', coords: [1.4927, 103.7414], type: 'gateway' },
        { name: 'Kota Kinabalu Node', coords: [5.9804, 116.0735], type: 'node' },
        { name: 'Kuching Station', coords: [1.5533, 110.3593], type: 'station' }
    ];
    
    networkInfrastructure.forEach(infra => {
        const marker = L.marker(infra.coords)
            .addTo(map)
            .bindPopup(`
                <div class="map-popup">
                    <div class="popup-header">
                        <h6><i class="fas fa-server"></i> ${infra.name}</h6>
                        <span class="badge badge-info">${infra.type}</span>
                    </div>
                    <div class="popup-content">
                        <p><strong>Type:</strong> Network Infrastructure</p>
                        <p><strong>Status:</strong> <span class="text-success">Operational</span></p>
                        <p><strong>Uptime:</strong> 99.9%</p>
                    </div>
                </div>
            `);
        
        marker.setIcon(L.divIcon({
            className: 'custom-infra-marker',
            html: `
                <div class="infra-marker">
                    <i class="fas fa-server"></i>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }));
    });
}

function updateMapMetrics() {
    // Update map metrics in the dashboard
    const activeTeams = fieldTeams.filter(team => team.status === 'active').length;
    const activeTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'assigned').length;
    
    document.getElementById('map-active-locations').textContent = activeTickets;
    document.getElementById('map-active-teams').textContent = activeTeams;
    document.getElementById('map-optimized-routes').textContent = Math.floor(activeTeams * 2.5);
    document.getElementById('map-avg-travel').textContent = '18m';
    document.getElementById('map-network-health').textContent = '94%';
    document.getElementById('map-alerts').textContent = '2';
    document.getElementById('map-device-battery').textContent = '87%';
    document.getElementById('map-connectivity').textContent = '98%';
}

// Map view functions
function showMapView() {
    document.querySelector('[onclick="showMapView()"]').classList.add('active');
    document.querySelector('[onclick="showTrackingView()"]').classList.remove('active');
    
    // Show map view
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.display = 'block';
    }
    
    // Refresh map data
    refreshMap();
}

function showTrackingView() {
    document.querySelector('[onclick="showMapView()"]').classList.remove('active');
    document.querySelector('[onclick="showTrackingView()"]').classList.add('active');
    
    // Show tracking view (could be a different map mode or overlay)
    showNotification('Tracking view activated - Real-time team movement', 'info');
}

// Modal functions
function showCreateTicketModal() {
    const modal = new bootstrap.Modal(document.getElementById('createTicketModal'));
    modal.show();
}

function showCreateTeamModal() {
    const modal = new bootstrap.Modal(document.getElementById('createTeamModal'));
    modal.show();
}

function showAIAssistModal() {
    const modal = new bootstrap.Modal(document.getElementById('aiAssistModal'));
    modal.show();
}

// Team Profile functionality
function showTeamProfile(teamId) {
    const team = fieldTeams.find(t => t._id === teamId);
    if (!team) return;
    
    currentProfileTeam = team;
    
    // Update profile information
    document.getElementById('profileName').textContent = team.name;
    document.getElementById('profileEmail').textContent = team.email;
    document.getElementById('profilePhone').textContent = team.phone;
    document.getElementById('profileRate').textContent = `RM${team.hourlyRate.toFixed(2)}/hour`;
    document.getElementById('profileLocation').textContent = team.currentLocation.address;
    
    // Update status badge
    const statusBadge = document.getElementById('profileStatus');
    statusBadge.textContent = team.status.charAt(0).toUpperCase() + team.status.slice(1);
    statusBadge.className = 'badge';
    
    switch(team.status) {
        case 'active':
            statusBadge.classList.add('bg-success');
            break;
        case 'busy':
            statusBadge.classList.add('bg-warning');
            break;
        case 'offline':
            statusBadge.classList.add('bg-secondary');
            break;
        default:
            statusBadge.classList.add('bg-danger');
    }
    
    // Update performance metrics
    document.getElementById('profileTicketsCompleted').textContent = team.productivity.totalTicketsCompleted;
    document.getElementById('profileRating').textContent = team.productivity.customerRating;
    
    // Update skills
    const skillsContainer = document.getElementById('profileSkills');
    skillsContainer.innerHTML = '';
    team.skills.forEach(skill => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary me-2 mb-2';
        badge.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
        skillsContainer.appendChild(badge);
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('teamProfileModal'));
    modal.show();
    
    // Draw activity chart
    drawActivityChart();
}

function drawActivityChart() {
    const canvas = document.getElementById('activityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw simple activity chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = [
        { x: 50, y: 150 },
        { x: 100, y: 120 },
        { x: 150, y: 100 },
        { x: 200, y: 80 },
        { x: 250, y: 90 },
        { x: 300, y: 70 },
        { x: 350, y: 60 }
    ];
    
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#3b82f6';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Add labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.fillText('Activity Trend (Last 7 Days)', 10, 20);
}

function viewTeamTickets() {
    if (!currentProfileTeam) return;
    
    // Switch to tickets tab and filter by team member
    showTab('tickets');
    
    // Filter tickets by team member
    const teamTickets = tickets.filter(ticket => ticket.assignedTo === currentProfileTeam._id);
    
    // Update the tickets display
    const ticketsContainer = document.getElementById('tickets-container');
    if (ticketsContainer) {
        ticketsContainer.innerHTML = '';
        teamTickets.forEach(ticket => {
            const ticketElement = createTicketElement(ticket, false);
            ticketsContainer.appendChild(ticketElement);
        });
    }
    
    // Close the profile modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('teamProfileModal'));
    modal.hide();
}

function contactTeamMember() {
    if (!currentProfileTeam) return;
    
    // Create contact options
    const contactOptions = `
        Contact ${currentProfileTeam.name}:
        
        📧 Email: ${currentProfileTeam.email}
        📞 Phone: ${currentProfileTeam.phone}
        
        Choose contact method:
    `;
    
    // Show contact options (in a real app, this would open email/phone apps)
    alert(contactOptions);
}

// Zone View functionality
function showZoneView() {
    console.log('Showing zone view...');
    document.getElementById('zone-view').style.display = 'block';
    document.getElementById('list-view').style.display = 'none';
    loadZoneAnalytics();
}

function showListView() {
    document.getElementById('zone-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
    loadFieldTeams();
}

async function loadZoneAnalytics() {
    console.log('Loading zone analytics...');
    try {
        const response = await fetch(`${API_BASE}/teams/analytics/zones`);
        const data = await response.json();
        console.log('Zone analytics response:', data);
        
        if (data.zones) {
            console.log('Displaying real zone data');
            displayZoneBreakdown(data.zones);
        } else {
            console.log('No zones data, showing sample data');
            displaySampleZoneData();
        }
    } catch (error) {
        console.error('Error loading zone analytics:', error);
        console.log('Showing sample data due to error');
        displaySampleZoneData();
    }
}

function displayZoneBreakdown(zones) {
    console.log('Displaying zone breakdown:', zones);
    const container = document.getElementById('zones-container');
    if (!container) {
        console.error('zones-container element not found!');
        return;
    }
    container.innerHTML = '';
    
    Object.values(zones).forEach(zone => {
        console.log('Creating zone element for:', zone.zoneName);
        const zoneElement = createZoneElement(zone);
        container.appendChild(zoneElement);
    });
    console.log('Zone breakdown displayed successfully');
}

function createZoneElement(zone) {
    const div = document.createElement('div');
    div.className = 'zone-card';
    
    // Calculate productivity color
    const productivityScore = zone.productivityScore || 0;
    const productivityColor = productivityScore >= 50 ? '#28a745' : productivityScore >= 0 ? '#ffc107' : '#dc3545';
    
    div.innerHTML = `
        <div class="zone-header">
            <h3 class="zone-title">${zone.zoneName} Zone</h3>
        </div>
        
        <div class="zone-metrics">
            <div class="zone-metric">
                <span class="zone-metric-value">${zone.totalTeams}</span>
                <div class="zone-metric-label">Teams</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value">${zone.activeTeams}</span>
                <div class="zone-metric-label">Active</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value">${zone.totalTickets}</span>
                <div class="zone-metric-label">Total Tickets</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value" style="color: #28a745;">${zone.closedTickets || 0}</span>
                <div class="zone-metric-label">Closed</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value" style="color: #dc3545;">${zone.openTickets || 0}</span>
                <div class="zone-metric-label">Open</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value" style="color: ${productivityColor};">${productivityScore}%</span>
                <div class="zone-metric-label">Productivity</div>
            </div>
        </div>
        
        <!-- Ticket Status Visualization -->
        <div class="ticket-status-chart mb-3">
            <h6 class="mb-2">Ticket Status Distribution</h6>
            <div class="progress" style="height: 25px;">
                <div class="progress-bar bg-success" role="progressbar" 
                     style="width: ${zone.totalTickets > 0 ? ((zone.closedTickets / zone.totalTickets) * 100) : 0}%"
                     aria-label="Closed tickets">
                    ${zone.closedTickets || 0} Closed
                </div>
                <div class="progress-bar bg-danger" role="progressbar" 
                     style="width: ${zone.totalTickets > 0 ? ((zone.openTickets / zone.totalTickets) * 100) : 0}%"
                     aria-label="Open tickets">
                    ${zone.openTickets || 0} Open
                </div>
            </div>
        </div>
        
        <div class="states-container">
            ${Object.values(zone.states).map(state => createStateElement(state)).join('')}
        </div>
    `;
    
    return div;
}

function createStateElement(state) {
    const productivityScore = state.productivityScore || 0;
    const productivityColor = productivityScore >= 50 ? '#28a745' : productivityScore >= 0 ? '#ffc107' : '#dc3545';
    
    return `
        <div class="state-section">
            <div class="state-header">
                <h4 class="state-name">${state.stateName}</h4>
                <div class="state-metrics">
                    <div class="state-metric">
                        <div class="state-metric-value">${state.teams.length}</div>
                        <div class="state-metric-label">Teams</div>
                    </div>
                    <div class="state-metric">
                        <div class="state-metric-value">${state.totalTickets}</div>
                        <div class="state-metric-label">Total</div>
                    </div>
                    <div class="state-metric">
                        <div class="state-metric-value" style="color: #28a745;">${state.closedTickets || 0}</div>
                        <div class="state-metric-label">Closed</div>
                    </div>
                    <div class="state-metric">
                        <div class="state-metric-value" style="color: #dc3545;">${state.openTickets || 0}</div>
                        <div class="state-metric-label">Open</div>
                    </div>
                    <div class="state-metric">
                        <div class="state-metric-value" style="color: ${productivityColor};">${productivityScore}%</div>
                        <div class="state-metric-label">Productivity</div>
                    </div>
                </div>
            </div>
            
            <!-- State Ticket Status Chart -->
            <div class="state-ticket-chart mb-3">
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-success" role="progressbar" 
                         style="width: ${state.totalTickets > 0 ? ((state.closedTickets / state.totalTickets) * 100) : 0}%"
                         aria-label="Closed tickets">
                        ${state.closedTickets || 0} Closed
                    </div>
                    <div class="progress-bar bg-danger" role="progressbar" 
                         style="width: ${state.totalTickets > 0 ? ((state.openTickets / state.totalTickets) * 100) : 0}%"
                         aria-label="Open tickets">
                        ${state.openTickets || 0} Open
                    </div>
                </div>
            </div>
            
            <div class="team-grid">
                ${state.teams.map(team => createTeamCard(team)).join('')}
            </div>
        </div>
    `;
}

function createTeamCard(team) {
    const statusClass = team.status === 'active' ? 'active' : 
                       team.status === 'busy' ? 'busy' : 'offline';
    
    return `
        <div class="team-card" onclick="showTeamProfile('${team._id}')">
            <div class="team-card-header">
                <h5 class="team-name">${team.name}</h5>
                <span class="team-status ${statusClass}">${team.status}</span>
            </div>
            
            <div class="team-details">
                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${team.state}</p>
                <p class="mb-1"><i class="fas fa-dollar-sign me-2"></i>RM${team.hourlyRate}/hour</p>
                <p class="mb-2"><i class="fas fa-tools me-2"></i>${team.skills.join(', ')}</p>
            </div>
            
            <div class="team-performance">
                <div class="performance-item">
                    <span class="performance-value">${team.productivity.totalTicketsCompleted}</span>
                    <div class="performance-label">Tickets</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${team.productivity.customerRating}</span>
                    <div class="performance-label">Rating</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${team.productivity.ticketsThisMonth}</span>
                    <div class="performance-label">This Month</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${team.productivity.efficiencyScore}%</span>
                    <div class="performance-label">Efficiency</div>
                </div>
            </div>
        </div>
    `;
}

function displaySampleZoneData() {
    const sampleZones = {
        "Central": {
            "zoneName": "Central",
            "totalTeams": 2,
            "activeTeams": 2,
            "totalTickets": 345,
            "openTickets": 25,
            "closedTickets": 320,
            "productivityScore": 85.5,
            "averageRating": 4.8,
            "averageEfficiency": 93,
            "states": {
                "Kuala Lumpur": {
                    "stateName": "Kuala Lumpur",
                    "teams": [
                        {
                            "_id": "1",
                            "name": "Zamri",
                            "status": "active",
                            "state": "Kuala Lumpur",
                            "hourlyRate": 180.00,
                            "skills": ["network", "customer"],
                            "productivity": {
                                "totalTicketsCompleted": 156,
                                "customerRating": 4.8,
                                "ticketsThisMonth": 23,
                                "efficiencyScore": 92
                            }
                        }
                    ],
                    "totalTickets": 156,
                    "openTickets": 12,
                    "closedTickets": 144,
                    "productivityScore": 84.6,
                    "averageRating": 4.8,
                    "averageEfficiency": 92
                },
                "Selangor": {
                    "stateName": "Selangor",
                    "teams": [
                        {
                            "_id": "3",
                            "name": "Ah-Hock",
                            "status": "active",
                            "state": "Selangor",
                            "hourlyRate": 192.00,
                            "skills": ["customer", "network"],
                            "productivity": {
                                "totalTicketsCompleted": 189,
                                "customerRating": 4.9,
                                "ticketsThisMonth": 28,
                                "efficiencyScore": 95
                            }
                        }
                    ],
                    "totalTickets": 189,
                    "openTickets": 13,
                    "closedTickets": 176,
                    "productivityScore": 86.2,
                    "averageRating": 4.9,
                    "averageEfficiency": 95
                }
            }
        },
        "Northern": {
            "zoneName": "Northern",
            "totalTeams": 2,
            "activeTeams": 1,
            "totalTickets": 301,
            "openTickets": 35,
            "closedTickets": 266,
            "productivityScore": 76.7,
            "averageRating": 4.7,
            "averageEfficiency": 89,
            "states": {
                "Perak": {
                    "stateName": "Perak",
                    "teams": [
                        {
                            "_id": "2",
                            "name": "Nurul",
                            "status": "busy",
                            "state": "Perak",
                            "hourlyRate": 168.00,
                            "skills": ["network", "customer"],
                            "productivity": {
                                "totalTicketsCompleted": 134,
                                "customerRating": 4.6,
                                "ticketsThisMonth": 18,
                                "efficiencyScore": 87
                            }
                        }
                    ],
                    "totalTickets": 134,
                    "openTickets": 18,
                    "closedTickets": 116,
                    "productivityScore": 73.1,
                    "averageRating": 4.6,
                    "averageEfficiency": 87
                },
                "Penang": {
                    "stateName": "Penang",
                    "teams": [
                        {
                            "_id": "5",
                            "name": "Siti",
                            "status": "active",
                            "state": "Penang",
                            "hourlyRate": 172.00,
                            "skills": ["network", "customer"],
                            "productivity": {
                                "totalTicketsCompleted": 167,
                                "customerRating": 4.8,
                                "ticketsThisMonth": 21,
                                "efficiencyScore": 91
                            }
                        }
                    ],
                    "totalTickets": 167,
                    "openTickets": 17,
                    "closedTickets": 150,
                    "productivityScore": 79.6,
                    "averageRating": 4.8,
                    "averageEfficiency": 91
                }
            }
        },
        "Southern": {
            "zoneName": "Southern",
            "totalTeams": 2,
            "activeTeams": 1,
            "totalTickets": 320,
            "openTickets": 28,
            "closedTickets": 292,
            "productivityScore": 82.5,
            "averageRating": 4.8,
            "averageEfficiency": 91,
            "states": {
                "Johor": {
                    "stateName": "Johor",
                    "teams": [
                        {
                            "_id": "4",
                            "name": "Muthu",
                            "status": "offline",
                            "state": "Johor",
                            "hourlyRate": 176.00,
                            "skills": ["network", "customer"],
                            "productivity": {
                                "totalTicketsCompleted": 142,
                                "customerRating": 4.7,
                                "ticketsThisMonth": 16,
                                "efficiencyScore": 89
                            }
                        }
                    ],
                    "totalTickets": 142,
                    "openTickets": 16,
                    "closedTickets": 126,
                    "productivityScore": 77.5,
                    "averageRating": 4.7,
                    "averageEfficiency": 89
                },
                "Melaka": {
                    "stateName": "Melaka",
                    "teams": [
                        {
                            "_id": "8",
                            "name": "Lim",
                            "status": "active",
                            "state": "Melaka",
                            "hourlyRate": 180.00,
                            "skills": ["customer", "network"],
                            "productivity": {
                                "totalTicketsCompleted": 178,
                                "customerRating": 4.9,
                                "ticketsThisMonth": 25,
                                "efficiencyScore": 93
                            }
                        }
                    ],
                    "totalTickets": 178,
                    "openTickets": 12,
                    "closedTickets": 166,
                    "productivityScore": 86.5,
                    "averageRating": 4.9,
                    "averageEfficiency": 93
                }
            }
        },
        "East Malaysia": {
            "zoneName": "East Malaysia",
            "totalTeams": 2,
            "activeTeams": 1,
            "totalTickets": 268,
            "openTickets": 42,
            "closedTickets": 226,
            "productivityScore": 68.7,
            "averageRating": 4.6,
            "averageEfficiency": 86,
            "states": {
                "Sabah": {
                    "stateName": "Sabah",
                    "teams": [
                        {
                            "_id": "6",
                            "name": "Ravi",
                            "status": "busy",
                            "state": "Sabah",
                            "hourlyRate": 184.00,
                            "skills": ["customer", "network"],
                            "productivity": {
                                "totalTicketsCompleted": 123,
                                "customerRating": 4.5,
                                "ticketsThisMonth": 14,
                                "efficiencyScore": 85
                            }
                        }
                    ],
                    "totalTickets": 123,
                    "openTickets": 22,
                    "closedTickets": 101,
                    "productivityScore": 64.2,
                    "averageRating": 4.5,
                    "averageEfficiency": 85
                },
                "Sarawak": {
                    "stateName": "Sarawak",
                    "teams": [
                        {
                            "_id": "7",
                            "name": "Ahmad",
                            "status": "active",
                            "state": "Sarawak",
                            "hourlyRate": 188.00,
                            "skills": ["network", "customer"],
                            "productivity": {
                                "totalTicketsCompleted": 145,
                                "customerRating": 4.7,
                                "ticketsThisMonth": 19,
                                "efficiencyScore": 88
                            }
                        }
                    ],
                    "totalTickets": 145,
                    "openTickets": 20,
                    "closedTickets": 125,
                    "productivityScore": 72.4,
                    "averageRating": 4.7,
                    "averageEfficiency": 88
                }
            }
        }
    };
    
    displayZoneBreakdown(sampleZones);
}

// Tickets Tab View functionality
function showTicketsListView() {
    document.getElementById('tickets-list-view').style.display = 'block';
    document.getElementById('tickets-analytics-view').style.display = 'none';
    
    // Update button states
    document.querySelector('[onclick="showTicketsListView()"]').classList.add('active');
    document.querySelector('[onclick="showTicketsAnalyticsView()"]').classList.remove('active');
    
    // Load tickets list
    loadTickets();
}

function showTicketsAnalyticsView() {
    document.getElementById('tickets-list-view').style.display = 'none';
    document.getElementById('tickets-analytics-view').style.display = 'block';
    document.getElementById('tickets-performance-view').style.display = 'none';
    
    // Update button states
    document.querySelector('[onclick="showTicketsListView()"]').classList.remove('active');
    document.querySelector('[onclick="showTicketsAnalyticsView()"]').classList.add('active');
    document.querySelector('[onclick="showTicketsPerformanceView()"]').classList.remove('active');
    
    // Load ticket analytics data
    loadTicketAnalytics();
}

function showTicketsPerformanceView() {
    document.getElementById('tickets-list-view').style.display = 'none';
    document.getElementById('tickets-analytics-view').style.display = 'none';
    document.getElementById('tickets-performance-view').style.display = 'block';
    
    // Update button states
    document.querySelector('[onclick="showTicketsListView()"]').classList.remove('active');
    document.querySelector('[onclick="showTicketsAnalyticsView()"]').classList.remove('active');
    document.querySelector('[onclick="showTicketsPerformanceView()"]').classList.add('active');
    
    // Load ticket performance data
    loadTicketPerformance();
}

async function loadTicketPerformance() {
    try {
        // Load ticket performance metrics
        const response = await fetch(`${API_BASE}/tickets/analytics/overview`);
        const data = await response.json();
        
        // Update performance metrics
        if (data.totalTickets) {
            document.getElementById('tickets-total').textContent = data.totalTickets;
        }
        if (data.pendingTickets) {
            document.getElementById('tickets-pending').textContent = data.pendingTickets;
        }
        if (data.resolvedTickets) {
            document.getElementById('tickets-resolved').textContent = data.resolvedTickets;
        }
        if (data.criticalTickets) {
            document.getElementById('tickets-critical').textContent = data.criticalTickets;
        }
        
        // Create resolution trends chart
        createTicketResolutionChart();
        
    } catch (error) {
        console.error('Error loading ticket performance:', error);
        // Show sample data
        displaySampleTicketPerformance();
    }
}

function createTicketResolutionChart() {
    const canvas = document.getElementById('ticketResolutionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data for resolution trends
    const data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        resolved: [45, 52, 48, 61],
        pending: [12, 8, 15, 9]
    };
    
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Scales
    const maxValue = Math.max(...data.resolved, ...data.pending);
    const xScale = chartWidth / (data.labels.length - 1);
    const yScale = chartHeight / maxValue;
    
    // Draw axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Draw resolved tickets line
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.resolved.forEach((value, index) => {
        const x = margin.left + (index * xScale);
        const y = height - margin.bottom - (value * yScale);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw pending tickets line
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.pending.forEach((value, index) => {
        const x = margin.left + (index * xScale);
        const y = height - margin.bottom - (value * yScale);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw data points
    data.resolved.forEach((value, index) => {
        const x = margin.left + (index * xScale);
        const y = height - margin.bottom - (value * yScale);
        
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    data.pending.forEach((value, index) => {
        const x = margin.left + (index * xScale);
        const y = height - margin.bottom - (value * yScale);
        
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    data.labels.forEach((label, index) => {
        const x = margin.left + (index * xScale);
        ctx.fillText(label, x, height - margin.bottom + 20);
    });
}

function displaySampleTicketPerformance() {
    // Sample performance data
    document.getElementById('tickets-total').textContent = '127';
    document.getElementById('tickets-pending').textContent = '23';
    document.getElementById('tickets-resolved').textContent = '104';
    document.getElementById('tickets-critical').textContent = '5';
    
    // Create sample chart
    createTicketResolutionChart();
}

async function loadTicketAnalytics() {
    try {
        // Get zone analytics data
        const zoneResponse = await fetch(`${API_BASE}/teams/analytics/zones`);
        const zoneData = await zoneResponse.json();
        
        // Get tickets data
        const ticketsResponse = await fetch(`${API_BASE}/tickets`);
        const ticketsData = await ticketsResponse.json();
        
        // Display ticket information
        displayTicketInfo(ticketsData.tickets || []);
        
        // Create distribution charts
        createTicketStatusChart(ticketsData.tickets || []);
        createZoneDistributionChart(zoneData.zones || {});
        createPriorityDistributionChart(ticketsData.tickets || []);
        createTeamPerformanceChart(zoneData.zones || {});
        
    } catch (error) {
        console.error('Error loading ticket analytics:', error);
        // Show sample data on error
        displaySampleTicketAnalytics();
    }
}

function displayTicketInfo(tickets) {
    const container = document.getElementById('ticket-info');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p class="text-muted">No ticket data available</p>';
        return;
    }
    
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const closedTickets = tickets.filter(t => t.status === 'completed').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-6">
                <div class="metric-item">
                    <h4 class="text-primary">${totalTickets}</h4>
                    <small class="text-muted">Total Tickets</small>
                </div>
            </div>
            <div class="col-6">
                <div class="metric-item">
                    <h4 class="text-success">${closedTickets}</h4>
                    <small class="text-muted">Completed</small>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-6">
                <div class="metric-item">
                    <h4 class="text-warning">${inProgressTickets}</h4>
                    <small class="text-muted">In Progress</small>
                </div>
            </div>
            <div class="col-6">
                <div class="metric-item">
                    <h4 class="text-danger">${openTickets}</h4>
                    <small class="text-muted">Open</small>
                </div>
            </div>
        </div>
        <hr>
        <div class="ticket-summary">
            <h6>Recent Tickets</h6>
            ${tickets.slice(0, 3).map(ticket => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="ticket-title">${ticket.title}</span>
                    <span class="badge bg-${getStatusColor(ticket.status)}">${ticket.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function getStatusColor(status) {
    switch(status) {
        case 'completed': return 'success';
        case 'in_progress': return 'warning';
        case 'open': return 'danger';
        default: return 'secondary';
    }
}

function createTicketStatusChart(tickets) {
    const canvas = document.getElementById('ticketStatusChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const statusCounts = {
        'open': tickets.filter(t => t.status === 'open').length,
        'in_progress': tickets.filter(t => t.status === 'in_progress').length,
        'completed': tickets.filter(t => t.status === 'completed').length
    };
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return;
    
    const colors = ['#dc3545', '#ffc107', '#28a745'];
    const labels = ['Open', 'In Progress', 'Completed'];
    const values = [statusCounts.open, statusCounts.in_progress, statusCounts.completed];
    
    // Draw pie chart
    let currentAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    values.forEach((value, index) => {
        if (value === 0) return;
        
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${labels[index]}: ${value}`, labelX, labelY);
        
        currentAngle += sliceAngle;
    });
}

function createZoneDistributionChart(zones) {
    const canvas = document.getElementById('zoneDistributionChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const zoneNames = Object.keys(zones);
    const zoneTickets = zoneNames.map(zone => zones[zone].totalTickets || 0);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545'];
    
    // Draw bar chart
    const barWidth = canvas.width / zoneNames.length - 10;
    const maxTickets = Math.max(...zoneTickets);
    
    zoneNames.forEach((zone, index) => {
        const barHeight = (zoneTickets[index] / maxTickets) * (canvas.height - 40);
        const x = index * (barWidth + 10) + 5;
        const y = canvas.height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone, x + barWidth/2, canvas.height - 5);
        ctx.fillText(zoneTickets[index].toString(), x + barWidth/2, y - 5);
    });
}

function createPriorityDistributionChart(tickets) {
    const canvas = document.getElementById('priorityDistributionChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const priorityCounts = {
        'high': tickets.filter(t => t.priority === 'high').length,
        'medium': tickets.filter(t => t.priority === 'medium').length,
        'low': tickets.filter(t => t.priority === 'low').length
    };
    
    const total = Object.values(priorityCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return;
    
    const colors = ['#dc3545', '#ffc107', '#28a745'];
    const labels = ['High', 'Medium', 'Low'];
    const values = [priorityCounts.high, priorityCounts.medium, priorityCounts.low];
    
    // Draw horizontal bar chart
    const barHeight = 30;
    const maxValue = Math.max(...values);
    
    values.forEach((value, index) => {
        if (value === 0) return;
        
        const barWidth = (value / maxValue) * (canvas.width - 100);
        const y = index * (barHeight + 10) + 20;
        
        // Draw bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(50, y, barWidth, barHeight);
        
        // Draw label and value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(labels[index], 5, y + barHeight/2 + 4);
        ctx.textAlign = 'right';
        ctx.fillText(value.toString(), 45, y + barHeight/2 + 4);
    });
}

function createTeamPerformanceChart(zones) {
    const canvas = document.getElementById('teamPerformanceChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const zoneNames = Object.keys(zones);
    const productivityScores = zoneNames.map(zone => zones[zone].productivityScore || 0);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545'];
    
    // Draw line chart
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw productivity line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    zoneNames.forEach((zone, index) => {
        const x = padding + (index * chartWidth) / (zoneNames.length - 1);
        const y = canvas.height - padding - (productivityScores[index] / 100) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw zone label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone, x, canvas.height - padding + 15);
        ctx.fillText(`${productivityScores[index]}%`, x, y - 10);
    });
    
    ctx.stroke();
}

function displaySampleTicketAnalytics() {
    // Sample data for demonstration
    const sampleTickets = [
        { title: 'Network Breakdown - NTT Class 1 (Major)', status: 'completed', priority: 'high' },
        { title: 'Customer - Drop Fiber', status: 'in_progress', priority: 'medium' },
        { title: 'Network Breakdown - NTT (Minor)', status: 'open', priority: 'low' }
    ];
    
    const sampleZones = {
        'Central': { totalTickets: 345, productivityScore: 85.5 },
        'Northern': { totalTickets: 301, productivityScore: 76.7 },
        'Southern': { totalTickets: 320, productivityScore: 82.5 },
        'East Malaysia': { totalTickets: 268, productivityScore: 68.7 }
    };
    
    displayTicketInfo(sampleTickets);
    createTicketStatusChart(sampleTickets);
    createZoneDistributionChart(sampleZones);
    createPriorityDistributionChart(sampleTickets);
    createTeamPerformanceChart(sampleZones);
}

function exportTicketData() {
    // Simple export functionality
    const data = {
        timestamp: new Date().toISOString(),
        tickets: tickets || [],
        zones: fieldTeams || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Predictive Planning Functions
function showMaterialForecast() {
    document.getElementById('material-forecast-view').style.display = 'block';
    document.getElementById('inventory-management-view').style.display = 'none';
    document.getElementById('reorder-alerts-view').style.display = 'none';
    
    // Update button states
    document.querySelector('[onclick="showMaterialForecast()"]').classList.add('active');
    document.querySelector('[onclick="showInventoryManagement()"]').classList.remove('active');
    document.querySelector('[onclick="showReorderAlerts()"]').classList.remove('active');
    
    // Load material forecast data
    loadMaterialForecast();
}

function showInventoryManagement() {
    document.getElementById('material-forecast-view').style.display = 'none';
    document.getElementById('inventory-management-view').style.display = 'block';
    document.getElementById('reorder-alerts-view').style.display = 'none';
    
    // Update button states
    document.querySelector('[onclick="showMaterialForecast()"]').classList.remove('active');
    document.querySelector('[onclick="showInventoryManagement()"]').classList.add('active');
    document.querySelector('[onclick="showReorderAlerts()"]').classList.remove('active');
    
    // Load inventory data
    loadInventoryManagement();
}

function showReorderAlerts() {
    document.getElementById('material-forecast-view').style.display = 'none';
    document.getElementById('inventory-management-view').style.display = 'none';
    document.getElementById('reorder-alerts-view').style.display = 'block';
    
    // Update button states
    document.querySelector('[onclick="showMaterialForecast()"]').classList.remove('active');
    document.querySelector('[onclick="showInventoryManagement()"]').classList.remove('active');
    document.querySelector('[onclick="showReorderAlerts()"]').classList.add('active');
    
    // Load reorder alerts
    loadReorderAlerts();
}

async function loadMaterialForecast() {
    try {
        // Load AI forecast data
        const forecastResponse = await fetch(`${API_BASE}/planning/forecast`);
        const forecastData = await forecastResponse.json();
        
        // Update forecast summary
        document.getElementById('forecast-7days').textContent = `${forecastData.next7Days} tickets`;
        document.getElementById('forecast-workforce').textContent = `${forecastData.workforceNeeded} technicians`;
        document.getElementById('forecast-materials').textContent = `${forecastData.materialDemand.fiber}m fiber, ${forecastData.materialDemand.cpe} CPE`;
        document.getElementById('forecast-peak').textContent = forecastData.peakHours;
        
        // Load zone material usage
        loadZoneMaterialUsage();
        
        // Load material trends chart
        createMaterialTrendsChart(forecastData.trends);
        
        // Load top materials by zone
        loadTopMaterialsByZone(forecastData.topMaterials);
        
    } catch (error) {
        console.error('Error loading material forecast:', error);
        displaySampleMaterialForecast();
    }
}

async function loadZoneMaterialUsage() {
    try {
        const response = await fetch(`${API_BASE}/planning/zone-materials`);
        const data = await response.json();
        
        const container = document.getElementById('zone-material-usage');
        container.innerHTML = data.zones.map(zone => `
            <div class="zone-material-item">
                <span class="zone-material-name">${zone.zoneName}</span>
                <span class="zone-material-usage">${zone.totalUsage} units</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading zone material usage:', error);
        displaySampleZoneMaterialUsage();
    }
}

function displaySampleZoneMaterialUsage() {
    const container = document.getElementById('zone-material-usage');
    const sampleZones = [
        { zoneName: 'Central Zone', totalUsage: 45 },
        { zoneName: 'Northern Zone', totalUsage: 32 },
        { zoneName: 'Southern Zone', totalUsage: 28 },
        { zoneName: 'Eastern Zone', totalUsage: 22 }
    ];
    
    container.innerHTML = sampleZones.map(zone => `
        <div class="zone-material-item">
            <span class="zone-material-name">${zone.zoneName}</span>
            <span class="zone-material-usage">${zone.totalUsage} units</span>
        </div>
    `).join('');
}

function createMaterialTrendsChart(trends) {
    const canvas = document.getElementById('materialTrendsChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample data for demonstration
    const data = trends || {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        fiber: [35, 42, 38, 45],
        cpe: [8, 12, 10, 12],
        connectors: [15, 18, 16, 20]
    };
    
    // Draw simple line chart
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data lines
    const colors = ['#007bff', '#28a745', '#ffc107'];
    const datasets = [
        { data: data.fiber, label: 'Fiber (m)', color: colors[0] },
        { data: data.cpe, label: 'CPE Units', color: colors[1] },
        { data: data.connectors, label: 'Connectors', color: colors[2] }
    ];
    
    datasets.forEach((dataset, index) => {
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        dataset.data.forEach((value, i) => {
            const x = padding + (i * chartWidth) / (data.labels.length - 1);
            const y = height - padding - (value * chartHeight) / Math.max(...data.fiber, ...data.cpe, ...data.connectors);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    });
    
    // Draw legend
    ctx.font = '12px Arial';
    datasets.forEach((dataset, index) => {
        ctx.fillStyle = dataset.color;
        ctx.fillRect(width - 120, 20 + index * 20, 10, 10);
        ctx.fillStyle = '#333';
        ctx.fillText(dataset.label, width - 105, 30 + index * 20);
    });
}

function loadTopMaterialsByZone(topMaterials) {
    const container = document.getElementById('top-materials-zone');
    const materials = topMaterials || [
        { name: 'Fiber Cable', usage: 45, zone: 'Central' },
        { name: 'CPE Units', usage: 32, zone: 'Northern' },
        { name: 'Connectors', usage: 28, zone: 'Southern' },
        { name: 'Splitters', usage: 22, zone: 'Eastern' }
    ];
    
    container.innerHTML = materials.map(material => `
        <div class="top-material-item">
            <div>
                <div class="fw-bold">${material.name}</div>
                <small class="text-muted">${material.zone} Zone</small>
            </div>
            <span class="badge bg-primary">${material.usage}</span>
        </div>
    `).join('');
}

async function loadInventoryManagement() {
    try {
        const response = await fetch(`${API_BASE}/planning/inventory`);
        const data = await response.json();
        
        // Update inventory table
        const tbody = document.getElementById('inventory-table');
        tbody.innerHTML = data.inventory.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.currentStock}</td>
                <td>${item.minLevel}</td>
                <td>${item.usageRate}/day</td>
                <td>
                    <span class="badge ${getStockStatusClass(item.status)}">${item.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="reorderMaterial('${item.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update stats
        document.getElementById('total-items').textContent = data.stats.totalItems;
        document.getElementById('low-stock').textContent = data.stats.lowStock;
        document.getElementById('out-stock').textContent = data.stats.outOfStock;
        document.getElementById('reorder-needed').textContent = data.stats.reorderNeeded;
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        displaySampleInventory();
    }
}

function displaySampleInventory() {
    const sampleInventory = [
        { id: '1', name: 'Fiber Cable (100m)', currentStock: 5, minLevel: 10, usageRate: 2, status: 'Low Stock' },
        { id: '2', name: 'CPE Units', currentStock: 0, minLevel: 5, usageRate: 1, status: 'Out of Stock' },
        { id: '3', name: 'Connectors', currentStock: 25, minLevel: 15, usageRate: 3, status: 'Good' },
        { id: '4', name: 'Splitters', currentStock: 8, minLevel: 10, usageRate: 1, status: 'Low Stock' },
        { id: '5', name: 'Patch Panels', currentStock: 12, minLevel: 8, usageRate: 2, status: 'Good' }
    ];
    
    const tbody = document.getElementById('inventory-table');
    tbody.innerHTML = sampleInventory.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.currentStock}</td>
            <td>${item.minLevel}</td>
            <td>${item.usageRate}/day</td>
            <td>
                <span class="badge ${getStockStatusClass(item.status)}">${item.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="reorderMaterial('${item.id}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update stats
    document.getElementById('total-items').textContent = sampleInventory.length;
    document.getElementById('low-stock').textContent = sampleInventory.filter(item => item.status === 'Low Stock').length;
    document.getElementById('out-stock').textContent = sampleInventory.filter(item => item.status === 'Out of Stock').length;
    document.getElementById('reorder-needed').textContent = sampleInventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
}

function getStockStatusClass(status) {
    switch (status) {
        case 'Good': return 'bg-success';
        case 'Low Stock': return 'bg-warning';
        case 'Out of Stock': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

async function loadReorderAlerts() {
    try {
        const response = await fetch(`${API_BASE}/planning/reorder-alerts`);
        const data = await response.json();
        
        // Load critical alerts
        const criticalContainer = document.getElementById('critical-alerts-list');
        criticalContainer.innerHTML = data.critical.map(alert => `
            <div class="alert-item">
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-danger" onclick="handleAlert('${alert.id}', 'critical')">
                        <i class="fas fa-exclamation-circle"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Load warning alerts
        const warningContainer = document.getElementById('warning-alerts-list');
        warningContainer.innerHTML = data.warning.map(alert => `
            <div class="alert-item warning">
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-warning" onclick="handleAlert('${alert.id}', 'warning')">
                        <i class="fas fa-exclamation-triangle"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading reorder alerts:', error);
        displaySampleReorderAlerts();
    }
}

function displaySampleReorderAlerts() {
    const sampleAlerts = {
        critical: [
            { id: '1', title: 'CPE Units Out of Stock', description: 'No CPE units available. Urgent reorder needed.' },
            { id: '2', title: 'Fiber Cable Critical Low', description: 'Only 5 units left. Minimum level: 10 units.' }
        ],
        warning: [
            { id: '3', title: 'Splitters Low Stock', description: '8 units remaining. Consider reordering soon.' },
            { id: '4', title: 'Connectors Usage High', description: 'Usage rate increased by 40% this week.' }
        ]
    };
    
    // Load critical alerts
    const criticalContainer = document.getElementById('critical-alerts-list');
    criticalContainer.innerHTML = sampleAlerts.critical.map(alert => `
        <div class="alert-item">
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-sm btn-danger" onclick="handleAlert('${alert.id}', 'critical')">
                    <i class="fas fa-exclamation-circle"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Load warning alerts
    const warningContainer = document.getElementById('warning-alerts-list');
    warningContainer.innerHTML = sampleAlerts.warning.map(alert => `
        <div class="alert-item warning">
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-sm btn-warning" onclick="handleAlert('${alert.id}', 'warning')">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function displaySampleMaterialForecast() {
    // Update forecast summary with sample data
    document.getElementById('forecast-7days').textContent = '23 tickets';
    document.getElementById('forecast-workforce').textContent = '8 technicians';
    document.getElementById('forecast-materials').textContent = '45m fiber, 12 CPE';
    document.getElementById('forecast-peak').textContent = '9-11 AM, 2-4 PM';
    
    // Load sample zone material usage
    displaySampleZoneMaterialUsage();
    
    // Load sample material trends chart
    createMaterialTrendsChart();
    
    // Load sample top materials
    loadTopMaterialsByZone();
}

// Utility functions
function reorderMaterial(materialId) {
    alert(`Reordering material ${materialId}. This would trigger a purchase order in a real system.`);
}

function handleAlert(alertId, type) {
    alert(`Handling ${type} alert ${alertId}. This would open a detailed view in a real system.`);
}

function showAddMaterialModal() {
    alert('Add Material modal would open here. This would allow adding new materials to inventory.');
}

// API functions
async function createTicket() {
    const ticketData = {
        title: document.getElementById('ticket-title').value,
        description: document.getElementById('ticket-description').value,
        priority: document.getElementById('ticket-priority').value,
        category: document.getElementById('ticket-category').value,
        estimatedDuration: parseInt(document.getElementById('ticket-duration').value),
        customer: {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value
        },
        location: {
            address: document.getElementById('ticket-address').value,
            latitude: parseFloat(document.getElementById('ticket-latitude').value),
            longitude: parseFloat(document.getElementById('ticket-longitude').value)
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification('Ticket created successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createTicketModal')).hide();
            document.getElementById('create-ticket-form').reset();
            loadTickets();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error creating ticket', 'error');
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        showNotification('Error creating ticket', 'error');
    }
}

async function createTeamMember() {
    const skills = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        skills.push(checkbox.value);
    });
    
    const teamData = {
        name: document.getElementById('team-name').value,
        email: document.getElementById('team-email').value,
        phone: document.getElementById('team-phone').value,
        skills: skills,
        hourlyRate: parseFloat(document.getElementById('team-rate').value),
        currentLocation: {
            address: document.getElementById('team-address').value,
            latitude: parseFloat(document.getElementById('team-latitude').value),
            longitude: parseFloat(document.getElementById('team-longitude').value)
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}/field-teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });
        
        if (response.ok) {
            showNotification('Team member added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createTeamModal')).hide();
            document.getElementById('create-team-form').reset();
            loadFieldTeams();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error adding team member', 'error');
        }
    } catch (error) {
        console.error('Error creating team member:', error);
        showNotification('Error adding team member', 'error');
    }
}

async function autoAssignTicket(ticketId) {
    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}/auto-assign`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification('Ticket auto-assigned successfully!', 'success');
            loadTickets();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error auto-assigning ticket', 'error');
        }
    } catch (error) {
        console.error('Error auto-assigning ticket:', error);
        showNotification('Error auto-assigning ticket', 'error');
    }
}

async function updateAssignmentStatus(assignmentId, status) {
    try {
        const response = await fetch(`${API_BASE}/assignments/${assignmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification('Assignment status updated successfully!', 'success');
            loadAssignments();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error updating assignment status', 'error');
        }
    } catch (error) {
        console.error('Error updating assignment status:', error);
        showNotification('Error updating assignment status', 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function refreshData() {
    loadDashboardData();
    showNotification('Data refreshed', 'success');
}

// Placeholder functions for future implementation
function viewTicketDetails(ticketId) {
    showNotification('Ticket details view - Coming soon!', 'info');
}

function showAssignModal(ticketId) {
    showNotification('Manual assignment modal - Coming soon!', 'info');
}

function viewTeamDetails(teamId) {
    showNotification('Team details view - Coming soon!', 'info');
}

function updateTeamLocation(teamId) {
    showNotification('Update team location - Coming soon!', 'info');
}

function viewTeamPerformance(teamId) {
    showNotification('Team performance view - Coming soon!', 'info');
}

function viewAssignmentDetails(assignmentId) {
    showNotification('Assignment details view - Coming soon!', 'info');
}

// AI Assist Functions
let aiChatHistory = [];

function handleAIChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addAIMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showAITyping();
    
    try {
        // Get current system data for context
        const systemData = await getSystemDataForAI();
        
        // Send to AI service
        const response = await fetch(`${API_BASE}/ai/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: message,
                context: systemData,
                chatHistory: aiChatHistory.slice(-5) // Last 5 messages for context
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            hideAITyping();
            addAIMessage(result.response, 'assistant');
            
            // Add to chat history
            aiChatHistory.push({ role: 'user', content: message });
            aiChatHistory.push({ role: 'assistant', content: result.response });
        } else {
            hideAITyping();
            addAIMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
        }
    } catch (error) {
        console.error('Error sending AI message:', error);
        hideAITyping();
        addAIMessage('Sorry, I\'m having trouble connecting to the AI service. Please check your connection and try again.', 'assistant');
    }
}

function askAISuggestion(suggestion) {
    document.getElementById('ai-chat-input').value = suggestion;
    sendAIMessage();
}

function addAIMessage(content, sender) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'ai-content';
    messageContent.innerHTML = formatAIMessage(content);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatAIMessage(content) {
    // Convert markdown-like formatting to HTML
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

function showAITyping() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-assistant';
    typingDiv.id = 'ai-typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="ai-content">
            <div class="ai-typing">
                <span>AI is thinking</span>
                <div class="ai-typing-dots">
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideAITyping() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function getSystemDataForAI() {
    try {
        const [ticketsResponse, teamsResponse, assignmentsResponse] = await Promise.all([
            fetch(`${API_BASE}/tickets/analytics/overview`),
            fetch(`${API_BASE}/field-teams`),
            fetch(`${API_BASE}/assignments/analytics/overview`)
        ]);
        
        const ticketsData = await ticketsResponse.json();
        const teamsData = await teamsResponse.json();
        const assignmentsData = await assignmentsResponse.json();
        
        return {
            tickets: {
                total: ticketsData.totalTickets || 0,
                completed: ticketsData.completedTickets || 0,
                open: ticketsData.openTickets || 0,
                categories: ticketsData.categoryBreakdown || []
            },
            teams: {
                total: teamsData.fieldTeams?.length || 0,
                active: teamsData.fieldTeams?.filter(team => team.status === 'active').length || 0,
                busy: teamsData.fieldTeams?.filter(team => team.status === 'busy').length || 0,
                offline: teamsData.fieldTeams?.filter(team => team.status === 'offline').length || 0
            },
            assignments: {
                total: assignmentsData.totalAssignments || 0,
                completed: assignmentsData.completedAssignments || 0,
                averageRating: assignmentsData.averageRating || 0,
                averageCompletionTime: assignmentsData.averageCompletionTime || 0
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting system data for AI:', error);
        return {
            error: 'Unable to fetch current system data',
            timestamp: new Date().toISOString()
        };
    }
}
