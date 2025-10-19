// Global variables
let socket;
let map;
let tickets = [];
let fieldTeams = [];
let assignments = [];
let chartInstances = {};

// Standardized view control functions
function setActiveViewButton(containerClass, activeButton) {
    const container = document.querySelector(`.${containerClass}`);
    if (container) {
        const buttons = container.querySelectorAll('.view-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

function initializeViewControls() {
    // Initialize all view controls with standardized behavior
    document.querySelectorAll('.view-controls').forEach(container => {
        const buttons = container.querySelectorAll('.view-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                setActiveViewButton('view-controls', this);
            });
        });
    });
}

// Standardized chart configuration
const STANDARD_CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    light: '#e5e7eb',
    dark: '#374151'
};

const STANDARD_CHART_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
];

function getStandardChartConfig(type = 'line') {
    const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                intersect: false,
                mode: 'index'
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#6b7280'
                }
            },
            y: {
                grid: {
                    color: '#f3f4f6',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#6b7280'
                }
            }
        }
    };

    if (type === 'doughnut' || type === 'pie') {
        baseConfig.scales = {};
        baseConfig.plugins.legend.position = 'right';
    }

    return baseConfig;
}

function getStandardColorPalette(count) {
    const colors = [
        STANDARD_CHART_COLORS.primary,
        STANDARD_CHART_COLORS.secondary,
        STANDARD_CHART_COLORS.success,
        STANDARD_CHART_COLORS.warning,
        STANDARD_CHART_COLORS.danger,
        STANDARD_CHART_COLORS.info
    ];
    
    // If we need more colors, generate variations
    while (colors.length < count) {
        const baseColor = colors[colors.length % 6];
        const variation = Math.floor(colors.length / 6) * 0.2;
        colors.push(adjustColorBrightness(baseColor, variation));
    }
    
    return colors.slice(0, count);
}

function adjustColorBrightness(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Global test function for debugging tabs
window.testTabs = function() {
    console.log('🧪 Testing all tabs...');
    const tabs = ['overview', 'tickets', 'teams', 'planning', 'map'];
    tabs.forEach((tab, index) => {
        setTimeout(() => {
            console.log(`🧪 Testing ${tab} tab...`);
            showTab(tab);
        }, index * 1000);
    });
};
let currentProfileTeam = null;

// API Base URL
// API_BASE is now set by config.js

// Initialize the application
// Ensure chart instance registry exists before any chart code runs
if (!window.chartInstances) {
    window.chartInstances = {};
}
// Local alias used by chart functions
const chartRegistry = window.chartInstances;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FieldAssign Dashboard Initializing...');
    console.log('🚀 DOM loaded, checking tab elements...');
    console.log('🚀 Tab panes found:', document.querySelectorAll('.tab-pane').length);
    console.log('🚀 Nav links found:', document.querySelectorAll('.nav-link').length);
    
    initializeSocket();
    loadDashboardData();
    initializeMap();
    initializeViewControls(); // Initialize standardized view controls
    
    // Test tab functionality
    console.log('🧪 Testing tab functionality...');
    setTimeout(() => {
        console.log('🧪 Testing showTab function...');
        if (typeof showTab === 'function') {
            console.log('✅ showTab function is available');
            // Test switching to tickets tab
            console.log('🧪 Testing tab switch to tickets...');
            showTab('tickets');
        } else {
            console.error('❌ showTab function is not available');
        }
    }, 1000);
    
    // Load initial tab content for ALL tabs immediately
    loadRecentTickets();
    loadTeamStatusOverview();
    loadFieldTeams(); // Pre-load Field Teams data
    loadTickets(); // Pre-load Tickets data
    loadAssignments(); // Pre-load Assignments data
    loadAnalytics(); // Pre-load Analytics data
    loadMaterialForecast(); // Pre-load Predictive Planning data
    
    // Set up auto-refresh every 30 seconds for ALL tabs
    setInterval(loadDashboardData, 30000);
    setInterval(loadFieldTeams, 30000); // Auto-refresh Field Teams data
    setInterval(loadTickets, 30000); // Auto-refresh Tickets data
    setInterval(loadAssignments, 30000); // Auto-refresh Assignments data
    setInterval(loadAnalytics, 30000); // Auto-refresh Analytics data
    setInterval(loadMaterialForecast, 30000); // Auto-refresh Predictive Planning data
    
    console.log('✅ Dashboard initialization complete!');
});

// Socket.IO initialization - DISABLED (backend doesn't support Socket.IO)
function initializeSocket() {
    console.log('Socket.IO disabled - backend does not support real-time connections');
    // socket = io('http://localhost:5002');
    
    // socket.on('connect', () => {
    //     console.log('Connected to server');
    //     socket.emit('join-admin');
    // });
    
    // socket.on('team-location-update', (data) => {
    //     console.log('Team location update:', data);
    //     updateTeamLocationOnMap(data);
    // });
    
    // socket.on('team-status-update', (data) => {
    //     console.log('Team status update:', data);
    //     refreshTeamStatus();
    // });
    
    // socket.on('disconnect', () => {
    //     console.log('Disconnected from server');
    // });
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
    
    // Load section-specific data (data is already pre-loaded, just ensure views are shown)
    switch(sectionName) {
        case 'dashboard':
            // Data already loaded, just refresh if needed
            break;
        case 'tickets':
            showTicketsListView(); // Show list view by default
            break;
        case 'teams':
            showZoneView(); // Show zone view by default
            break;
        case 'assignments':
            // Data already loaded
            break;
        case 'analytics':
            // Data already loaded
            break;
        case 'map':
            refreshMap();
            break;
    }
}

// Tab navigation function with smooth transitions
function showTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    console.log('🔄 Available tab panes:', document.querySelectorAll('.tab-pane').length);
    console.log('🔄 Target tab pane:', document.getElementById(`${tabName}-tab`));
    
    // Simple test to see if function is being called
    if (tabName === 'tickets') {
        console.log('🎫 Tickets tab clicked - function is working!');
    }
    
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
    // Note: event parameter might not be available in all contexts
    try {
        if (typeof event !== 'undefined' && event && event.target && event.target.classList.contains('tab-button')) {
            event.target.classList.add('active');
        }
    } catch (e) {
        // Event not available, continue without it
        console.log('Event not available in showTab context');
    }
    
    // Show corresponding tab pane with smooth transition
    setTimeout(() => {
        const targetPane = document.getElementById(`${tabName}-tab`);
        if (targetPane) {
            targetPane.classList.remove('loading');
            targetPane.classList.add('active');
            console.log('✅ Tab pane activated:', targetPane.id);
            console.log('✅ Tab pane classes:', targetPane.className);
        } else {
            console.error('❌ Tab pane not found:', `${tabName}-tab`);
            console.error('❌ Available tab panes:', Array.from(document.querySelectorAll('.tab-pane')).map(p => p.id));
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
            showZoneView(); // Show zone view by default (data already loaded)
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
    
    // Update UI - Total Tickets
    const totalTickets = tickets.length;
    updateElement('total-tickets-count', totalTickets);
    updateElement('today-tickets', todayTickets.length);
    updateElement('monthly-tickets', monthlyTickets.length);
    
    const totalTicketChange = monthlyTickets.length > 0 
        ? ((monthlyTickets.length / totalTickets) * 100).toFixed(2)
        : 0;
    updateTrendElement('total-tickets-trend', 'total-tickets-change', totalTicketChange, '% this month');
    
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
    updateElement('total-tickets-count', 150);
    updateElement('today-tickets', 8);
    updateElement('monthly-tickets', 75);
    updateTrendElement('total-tickets-trend', 'total-tickets-change', 50.00, '% this month');
    
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
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();
        const teams = data.teams || data.fieldTeams || [];
        
        const container = document.getElementById('team-status');
        if (!container) return;
        container.innerHTML = '';
        
        if (teams.length > 0) {
            teams.forEach(team => {
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
    
    // Calculate metrics with proper formatting
    const productivityPercentage = parseFloat(zone.productivityScore || 0).toFixed(2);
    const activeTeams = zone.teams ? zone.teams.filter(t => t.status === 'active' || t.status === 'available').length : 0;
    const totalTeams = zone.teams ? zone.teams.length : 0;
    const totalTickets = (zone.openTickets || 0) + (zone.closedTickets || 0);
    const avgRating = parseFloat(zone.averageRating || 0).toFixed(2);
    
    // Determine productivity color
    let productivityColor = '#28a745'; // green
    if (productivityPercentage < 50) productivityColor = '#dc3545'; // red
    else if (productivityPercentage < 70) productivityColor = '#ffc107'; // yellow
    
    zoneCard.innerHTML = `
        <div class="zone-header">
            <div class="zone-name">${zone.zoneName || zone.zone}</div>
            <div class="zone-rank rank-${rank}">#${rank}</div>
        </div>
        
        <div class="zone-metrics">
            <div class="zone-metric">
                <span class="zone-metric-value">${totalTickets}</span>
                <div class="zone-metric-label">Total Tickets</div>
            </div>
            <div class="zone-metric">
                <span class="zone-metric-value">${activeTeams}/${totalTeams}</span>
                <div class="zone-metric-label">Active Teams</div>
            </div>
        </div>
        
        <div class="zone-productivity">
            <div class="productivity-label">Productivity Score</div>
            <div class="productivity-score" style="color: ${productivityColor}">${productivityPercentage}%</div>
        </div>
        
        <div class="productivity-bar">
            <div class="productivity-fill" style="width: ${Math.min(100, Math.max(0, productivityPercentage))}%; background: linear-gradient(90deg, ${productivityColor} 0%, ${productivityColor}cc 100%);"></div>
        </div>
        
        <div class="mt-2" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-top: 1px solid rgba(0, 102, 204, 0.1);">
            <small style="color: #6c757d; font-weight: 500;">
                <i class="fas fa-folder-open" style="color: #ffc107;"></i> ${zone.openTickets || 0} open
            </small>
            <small style="color: #6c757d; font-weight: 500;">
                <i class="fas fa-check-circle" style="color: #28a745;"></i> ${zone.closedTickets || 0} closed
            </small>
            <small style="color: #6c757d; font-weight: 500;">
                <i class="fas fa-star" style="color: #ffc107;"></i> ${avgRating}
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
    
    // Calculate totals
    const totalTickets = allTickets.length;
    const resolvedTickets = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const pendingTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const criticalTickets = allTickets.filter(t => t.priority === 'emergency').length;
    
    // Calculate resolution rate
    const resolutionRate = totalTickets > 0 
        ? ((resolvedTickets / totalTickets) * 100).toFixed(2)
        : 0;
    
    // Calculate average resolution time
    const resolvedWithTime = allTickets.filter(t => t.resolvedAt || t.resolved_at);
    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
        const totalTime = resolvedWithTime.reduce((sum, t) => {
            const created = new Date(t.createdAt || t.created_at);
            const resolved = new Date(t.resolvedAt || t.resolved_at);
            return sum + (resolved - created);
        }, 0);
        avgResolutionTime = (totalTime / resolvedWithTime.length / (1000 * 60 * 60)).toFixed(2);
    }
    
    // Calculate customer satisfaction (from teams data)
    const avgSatisfaction = window.fieldTeams && window.fieldTeams.length > 0
        ? (window.fieldTeams.reduce((sum, t) => sum + (t.rating || 4.5), 0) / window.fieldTeams.length).toFixed(1)
        : 4.5;
    
    // Calculate auto-assigned percentage
    const assignedTickets = allTickets.filter(t => t.assignedTeam).length;
    const autoAssignedRate = totalTickets > 0
        ? ((assignedTickets / totalTickets) * 100).toFixed(2)
        : 0;
    
    // Update UI
    updateElement('tickets-total', totalTickets);
    updateElement('tickets-pending', pendingTickets);
    updateElement('tickets-resolved', resolvedTickets);
    updateElement('tickets-critical', criticalTickets);
    updateElement('tickets-efficiency', `${resolutionRate}%`);
    updateElement('tickets-avg-time', `${avgResolutionTime}h`);
    updateElement('tickets-satisfaction', avgSatisfaction);
    updateElement('tickets-assigned', `${autoAssignedRate}%`);
    
    console.log('✅ Tickets tab metrics updated:', {
        total: totalTickets,
        resolved: resolvedTickets,
        pending: pendingTickets,
        critical: criticalTickets,
        resolutionRate,
        avgTime: avgResolutionTime
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
function updateFieldTeamsMetrics(teams, tickets, zonesData) {
    console.log('📊 Updating Field Teams metrics with:', {
        teams: teams.length,
        tickets: tickets.length,
        zones: zonesData.zones ? Object.keys(zonesData.zones).length : 0
    });
    
    // Calculate metrics
    const totalTeams = teams.length;
    const activeTeams = teams.filter(t => t.status === 'active' || t.status === 'available').length;
    
    // Calculate average productivity from zones
    let totalProductivity = 0;
    let zoneCount = 0;
    if (zonesData.zones) {
        Object.values(zonesData.zones).forEach(zone => {
            if (zone.productivityScore) {
                totalProductivity += zone.productivityScore;
                zoneCount++;
            }
        });
    }
    const avgProductivity = zoneCount > 0 ? (totalProductivity / zoneCount).toFixed(2) : 0;
    
    // Count unique zones
    const uniqueZones = new Set();
    teams.forEach(team => {
        if (team.zone) uniqueZones.add(team.zone);
    });
    const coverageZones = uniqueZones.size;
    
    // Calculate average rating
    const avgRating = teams.length > 0
        ? (teams.reduce((sum, t) => sum + (t.rating || 4.5), 0) / teams.length).toFixed(2)
        : 4.50;
    
    // Calculate average response time from resolved tickets
    const resolvedTickets = tickets.filter(t => t.resolved_at || t.resolvedAt);
    let avgResponseTime = 0;
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, t) => {
            const created = new Date(t.created_at || t.createdAt);
            const resolved = new Date(t.resolved_at || t.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgResponseTime = (totalTime / resolvedTickets.length / (1000 * 60 * 60)).toFixed(2);
    }
    
    // Calculate completion rate
    const completedTickets = tickets.filter(t => 
        t.status === 'resolved' || t.status === 'closed' || t.status === 'completed'
    ).length;
    const completionRate = tickets.length > 0 
        ? ((completedTickets / tickets.length) * 100).toFixed(2)
        : 0;
    
    // Calculate daily cost (sum of hourly rates * 8 hours)
    const dailyCost = teams.reduce((sum, t) => sum + ((t.hourlyRate || 150) * 8), 0).toFixed(2);
    
    // Calculate trends (simplified for demo)
    const totalTeamsTrend = Math.floor(Math.random() * 3) + 1; // 1-3
    const activeTeamsTrend = Math.floor(Math.random() * 2) + 1; // 1-2
    const productivityTrend = Math.floor(Math.random() * 6) + 1; // 1-6
    const zonesTrend = coverageZones > 0 ? 100 : 0;
    const ratingTrend = (Math.random() * 0.5 + 0.1).toFixed(2); // 0.1-0.6
    const responseTrend = Math.floor(Math.random() * 25) + 5; // 5-30
    const completionTrend = Math.floor(Math.random() * 4) + 1; // 1-4
    const costTrend = Math.floor(Math.random() * 8) + 1; // 1-8
    
    // Update UI elements
    updateElement('teams-total', totalTeams);
    updateElement('teams-active', activeTeams);
    updateElement('teams-productivity', `${avgProductivity}%`);
    updateElement('teams-zones', coverageZones);
    updateElement('teams-rating', avgRating);
    updateElement('teams-response', `${avgResponseTime}h`);
    updateElement('teams-completion', `${completionRate}%`);
    updateElement('teams-cost', `RM ${(parseFloat(dailyCost) / 1000).toFixed(1)}K`);
    
    // Update trend indicators
    updateElement('teams-total-trend', `+${totalTeamsTrend}`);
    updateElement('teams-active-trend', `+${activeTeamsTrend}`);
    updateElement('teams-productivity-trend', `+${productivityTrend}%`);
    updateElement('teams-zones-trend', `${zonesTrend}%`);
    updateElement('teams-rating-trend', `+${ratingTrend}`);
    updateElement('teams-response-trend', `-${responseTrend}%`);
    updateElement('teams-completion-trend', `+${completionTrend}%`);
    updateElement('teams-cost-trend', `+${costTrend}%`);
    
    console.log('✅ Field Teams metrics updated:', {
        totalTeams,
        activeTeams,
        avgProductivity: `${avgProductivity}%`,
        coverageZones,
        avgRating,
        avgResponseTime: `${avgResponseTime}h`
    });
    
    // Populate zone performance list
    populateTeamsZoneList(zonesData);
    
    // Populate top performers list using zones data (same as main dashboard)
    populateTopPerformersFromZones(zonesData);
}

function populateTeamsZoneList(zonesData) {
    const container = document.getElementById('teams-zone-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (zonesData.zones && Object.keys(zonesData.zones).length > 0) {
        // Convert zones object to array and sort by productivity
        const zonesArray = Object.entries(zonesData.zones).map(([zoneName, zoneData]) => ({
            zone: zoneName,
            ...zoneData
        }));
        
        const sortedZones = zonesArray.sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));
        
        sortedZones.forEach(zone => {
            const zoneItem = document.createElement('div');
            zoneItem.className = 'zone-item';
            
            const productivity = parseFloat(zone.productivityScore || 0).toFixed(2);
            const trendClass = productivity >= 70 ? 'trend-up' : productivity >= 50 ? 'trend-neutral' : 'trend-down';
            const trendIcon = productivity >= 70 ? '↑' : productivity >= 50 ? '→' : '↓';
            
            zoneItem.innerHTML = `
                <span class="zone-name">${zone.zoneName || zone.zone}</span>
                <span class="zone-metric">${productivity}%</span>
                <span class="zone-trend ${trendClass}">${trendIcon}</span>
            `;
            
            container.appendChild(zoneItem);
        });
    }
}

function populateTopPerformersFromZones(zonesData) {
    const container = document.getElementById('teams-top-performers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!zonesData.zones || Object.keys(zonesData.zones).length === 0) {
        container.innerHTML = '<p class="text-muted">No team data available</p>';
        return;
    }
    
    // Extract all teams from zones data (same as main dashboard)
    const allTeams = [];
    Object.entries(zonesData.zones).forEach(([zoneName, zoneData]) => {
        if (zoneData.teams && Array.isArray(zoneData.teams)) {
            zoneData.teams.forEach(team => {
                allTeams.push({
                    ...team,
                    zone: zoneName,
                    // Add zone-level data to team
                    zoneProductivity: zoneData.productivityScore || 0,
                    zoneOpenTickets: zoneData.openTickets || 0,
                    zoneClosedTickets: zoneData.closedTickets || 0
                });
            });
        }
    });
    
    if (allTeams.length === 0) {
        container.innerHTML = '<p class="text-muted">No teams found in zones</p>';
        return;
    }
    
    // Sort teams by productivity score (from zone data) or tickets completed
    const sortedTeams = allTeams.sort((a, b) => {
        // First try zone productivity score
        const aScore = a.zoneProductivity || 0;
        const bScore = b.zoneProductivity || 0;
        if (aScore !== bScore) return bScore - aScore;
        
        // Then by tickets completed if available
        const aCompleted = a.productivity?.totalTicketsCompleted || a.ticketsCompleted || 0;
        const bCompleted = b.productivity?.totalTicketsCompleted || b.ticketsCompleted || 0;
        return bCompleted - aCompleted;
    });
    
    // Take top 5 performers
    const topPerformers = sortedTeams.slice(0, 5);
    
    topPerformers.forEach((team, index) => {
        const performerItem = document.createElement('div');
        performerItem.className = 'top-performer-item';
        
        const teamName = team.name || 'Unknown';
        const teamState = team.state || 'Unknown';
        const teamZone = team.zone || 'Unknown';
        const ticketsCompleted = team.productivity?.totalTicketsCompleted || team.ticketsCompleted || 0;
        const ratingValue = team.productivity?.customerRating || team.rating || 4.5;
        const rating = parseFloat(ratingValue).toFixed(2);
        const ratingClass = rating >= 4.5 ? 'positive' : rating >= 4.0 ? 'neutral' : 'negative';
        
        performerItem.innerHTML = `
            <div class="performer-info">
                <div class="performer-name">${teamName}</div>
                <div class="performer-details">
                    <span>${teamState}</span>
                    <span>${teamZone} Zone</span>
                    <span>${ticketsCompleted} tickets</span>
                </div>
            </div>
            <div class="performer-metrics">
                <div class="performer-rating ${ratingClass}">${rating}</div>
                <div class="performer-stats">Rank #${index + 1}</div>
            </div>
        `;
        
        container.appendChild(performerItem);
    });
    
    console.log('🏆 Top performers populated:', topPerformers.length, 'teams from zones data');
}

// Load comprehensive teams performance analytics
async function loadTeamsPerformanceAnalytics() {
    try {
        console.log('📊 Loading teams performance analytics...');
        
        // Hide any existing error messages
        hideErrorMessage();
        
        // Fetch all required data
        const [zonesResponse, teamsResponse, ticketsResponse] = await Promise.all([
            fetch(`${API_BASE}/teams/analytics/zones`),
            fetch(`${API_BASE}/teams`),
            fetch(`${API_BASE}/tickets`)
        ]);
        
        // Check if responses are ok
        if (!zonesResponse.ok || !teamsResponse.ok || !ticketsResponse.ok) {
            throw new Error(`API Error: ${zonesResponse.status} ${teamsResponse.status} ${ticketsResponse.status}`);
        }
        
        const zonesData = await zonesResponse.json();
        const teamsData = await teamsResponse.json();
        const ticketsData = await ticketsResponse.json();
        
        const zones = zonesData.zones || {};
        const teams = teamsData.teams || [];
        const tickets = ticketsData.tickets || [];
        
        console.log('📊 Data loaded:', { zones: Object.keys(zones).length, teams: teams.length, tickets: tickets.length });
        
        // Update KPI cards
        updateAnalyticsKPIs(teams, zones, tickets);
        
        // Create charts with error handling
        try {
            createZonePerformanceChart(tickets); // Pass tickets array, not zones object
            createStatePerformanceChart(teams);
            createTeamProductivityChart(teams);
            createRatingDistributionChart(teams);
        } catch (chartError) {
            console.error('❌ Error creating charts:', chartError);
            showErrorMessage('Error creating charts. Please refresh the page.');
        }
        
        // Populate tables
        populateZoneRankingTable(zones);
        populateTopTeamsTable(teams);
        
        console.log('✅ Performance analytics loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading performance analytics:', error);
        showErrorMessage('Error loading analytics data. Please check your connection and try again.');
        
        // Load sample data as fallback
        loadSamplePerformanceAnalytics();
    }
}

// Show error message
function showErrorMessage(message) {
    // Remove any existing error messages
    hideErrorMessage();
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'analytics-error';
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideErrorMessage();
    }, 5000);
}

// Hide error message
function hideErrorMessage() {
    const existingError = document.getElementById('analytics-error');
    if (existingError) {
        existingError.remove();
    }
}

// Load sample data as fallback
function loadSamplePerformanceAnalytics() {
    console.log('📊 Loading sample performance analytics data...');
    
    // Sample zones data
    const sampleZones = {
        'Central Zone': {
            productivityScore: 85.5,
            openTickets: 12,
            closedTickets: 45,
            teams: [
                { name: 'Team Alpha', state: 'Kuala Lumpur', status: 'active' },
                { name: 'Team Beta', state: 'Selangor', status: 'active' }
            ]
        },
        'Northern Zone': {
            productivityScore: 78.2,
            openTickets: 8,
            closedTickets: 32,
            teams: [
                { name: 'Team Gamma', state: 'Penang', status: 'active' }
            ]
        },
        'Southern Zone': {
            productivityScore: 82.1,
            openTickets: 6,
            closedTickets: 28,
            teams: [
                { name: 'Team Delta', state: 'Johor', status: 'active' }
            ]
        }
    };
    
    // Sample teams data
    const sampleTeams = [
        { name: 'Team Alpha', state: 'Kuala Lumpur', zone: 'Central Zone', status: 'active', rating: 4.8, productivity: { totalTicketsCompleted: 45, customerRating: 4.8 } },
        { name: 'Team Beta', state: 'Selangor', zone: 'Central Zone', status: 'active', rating: 4.6, productivity: { totalTicketsCompleted: 38, customerRating: 4.6 } },
        { name: 'Team Gamma', state: 'Penang', zone: 'Northern Zone', status: 'active', rating: 4.7, productivity: { totalTicketsCompleted: 32, customerRating: 4.7 } },
        { name: 'Team Delta', state: 'Johor', zone: 'Southern Zone', status: 'active', rating: 4.5, productivity: { totalTicketsCompleted: 28, customerRating: 4.5 } }
    ];
    
    // Sample tickets data
    const sampleTickets = [
        { status: 'resolved', created_at: '2024-01-15T10:00:00Z', resolved_at: '2024-01-15T14:30:00Z' },
        { status: 'closed', created_at: '2024-01-14T09:00:00Z', resolved_at: '2024-01-14T16:45:00Z' },
        { status: 'resolved', created_at: '2024-01-13T11:00:00Z', resolved_at: '2024-01-13T15:20:00Z' }
    ];
    
    // Update KPI cards with sample data
    updateAnalyticsKPIs(sampleTeams, sampleZones, sampleTickets);
    
    // Create charts with sample data
    createZonePerformanceChart(sampleZones);
    createStatePerformanceChart(sampleTeams);
    createTeamProductivityChart(sampleTeams);
    createRatingDistributionChart(sampleTeams);
    
    // Populate tables with sample data
    populateZoneRankingTable(sampleZones);
    populateTopTeamsTable(sampleTeams);
    
    console.log('✅ Sample performance analytics loaded');
}

// Update analytics KPI cards
function updateAnalyticsKPIs(teams, zones, tickets) {
    const totalTeams = teams.length;
    const activeTeams = teams.filter(t => t.status === 'active' || t.status === 'available').length;
    
    // Calculate average productivity from zones
    let totalProductivity = 0;
    let zoneCount = 0;
    Object.values(zones).forEach(zone => {
        if (zone.productivityScore) {
            totalProductivity += zone.productivityScore;
            zoneCount++;
        }
    });
    const avgProductivity = zoneCount > 0 ? (totalProductivity / zoneCount).toFixed(2) : 0;
    
    // Calculate average rating
    const avgRating = teams.length > 0
        ? (teams.reduce((sum, t) => {
            const rating = t.rating || t.productivity?.customerRating || 4.5;
            return sum + rating;
        }, 0) / teams.length).toFixed(2)
        : 4.50;
    
    // Calculate average response time
    const resolvedTickets = tickets.filter(t => t.resolved_at || t.resolvedAt);
    let avgResponseTime = 0;
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, t) => {
            const created = new Date(t.created_at || t.createdAt);
            const resolved = new Date(t.resolved_at || t.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgResponseTime = (totalTime / resolvedTickets.length / (1000 * 60 * 60)).toFixed(2);
    }
    
    // Update UI
    updateElement('analytics-total-teams', totalTeams);
    updateElement('analytics-active-teams', `${activeTeams} Active`);
    updateElement('analytics-avg-productivity', `${avgProductivity}%`);
    updateElement('analytics-avg-rating', avgRating);
    updateElement('analytics-avg-response', `${avgResponseTime}h`);
    
    // Update trends (simplified for demo)
    updateElement('analytics-productivity-trend', `+${Math.floor(Math.random() * 6) + 1}% vs last week`);
    updateElement('analytics-rating-trend', `+${(Math.random() * 0.5 + 0.1).toFixed(2)} vs last week`);
    updateElement('analytics-response-trend', `-${Math.floor(Math.random() * 25) + 5}% faster`);
}

// Create zone performance chart
function createZonePerformanceChart(zones) {
    const ctx = document.getElementById('zonePerformanceChart');
    if (!ctx) {
        console.error('❌ Zone performance chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    if (chartRegistry.zonePerformanceChart) {
        chartRegistry.zonePerformanceChart.destroy();
    }
    
    const zoneNames = Object.keys(zones);
    if (zoneNames.length === 0) {
        console.warn('⚠️ No zones data available for chart');
        return;
    }
    
    const productivityScores = zoneNames.map(name => zones[name].productivityScore || 0);
    const openTickets = zoneNames.map(name => zones[name].openTickets || 0);
    const closedTickets = zoneNames.map(name => zones[name].closedTickets || 0);
    
    chartRegistry.zonePerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: zoneNames,
            datasets: [
                {
                    label: 'Productivity Score (%)',
                    data: productivityScores,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Open Tickets',
                    data: openTickets,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Closed Tickets',
                    data: closedTickets,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Zone Performance Overview'
                },
                legend: {
                    position: 'top'
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

// Create state performance chart
function createStatePerformanceChart(teams) {
    const ctx = document.getElementById('statePerformanceChart');
    if (!ctx) {
        console.error('❌ State performance chart canvas not found');
        return;
    }
    
    if (chartRegistry.statePerformanceChart) {
        chartRegistry.statePerformanceChart.destroy();
    }
    
    if (!teams || teams.length === 0) {
        console.warn('⚠️ No teams data available for state chart');
        return;
    }
    
    // Group teams by state
    const stateStats = {};
    teams.forEach(team => {
        const state = team.state || 'Unknown';
        if (!stateStats[state]) {
            stateStats[state] = {
                totalTeams: 0,
                activeTeams: 0,
                totalTickets: 0,
                avgRating: 0,
                ratingSum: 0,
                ratingCount: 0
            };
        }
        stateStats[state].totalTeams++;
        if (team.status === 'active' || team.status === 'available') {
            stateStats[state].activeTeams++;
        }
        const tickets = team.productivity?.totalTicketsCompleted || team.ticketsCompleted || 0;
        stateStats[state].totalTickets += tickets;
        const rating = team.rating || team.productivity?.customerRating || 4.5;
        stateStats[state].ratingSum += rating;
        stateStats[state].ratingCount++;
    });
    
    // Calculate averages
    Object.keys(stateStats).forEach(state => {
        const stats = stateStats[state];
        stats.avgRating = stats.ratingCount > 0 ? (stats.ratingSum / stats.ratingCount).toFixed(2) : 4.5;
    });
    
    const states = Object.keys(stateStats);
    const activeTeams = states.map(state => stateStats[state].activeTeams);
    const totalTickets = states.map(state => stateStats[state].totalTickets);
    const avgRatings = states.map(state => parseFloat(stateStats[state].avgRating));
    
    chartRegistry.statePerformanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: states,
            datasets: [{
                label: 'Active Teams',
                data: activeTeams,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Teams Distribution by State'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create team productivity chart
function createTeamProductivityChart(teams) {
    const ctx = document.getElementById('teamProductivityChart');
    if (!ctx) {
        console.error('❌ Team productivity chart canvas not found');
        return;
    }
    
    if (chartRegistry.teamProductivityChart) {
        chartRegistry.teamProductivityChart.destroy();
    }
    
    if (!teams || teams.length === 0) {
        console.warn('⚠️ No teams data available for productivity chart');
        return;
    }
    
    // Sort teams by productivity and take top 10
    const sortedTeams = teams
        .map(team => ({
            name: team.name || 'Unknown',
            productivity: team.productivity?.totalTicketsCompleted || team.ticketsCompleted || 0,
            rating: team.rating || team.productivity?.customerRating || 4.5
        }))
        .sort((a, b) => b.productivity - a.productivity)
        .slice(0, 10);
    
    const teamNames = sortedTeams.map(t => t.name);
    const productivities = sortedTeams.map(t => t.productivity);
    const ratings = sortedTeams.map(t => t.rating);
    
    chartRegistry.teamProductivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: teamNames,
            datasets: [
                {
                    label: 'Tickets Completed',
                    data: productivities,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Rating',
                    data: ratings,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Teams Performance'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Tickets Completed'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Rating'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Create rating distribution chart
function createRatingDistributionChart(teams) {
    const ctx = document.getElementById('ratingDistributionChart');
    if (!ctx) {
        console.error('❌ Rating distribution chart canvas not found');
        return;
    }
    
    if (chartRegistry.ratingDistributionChart) {
        chartRegistry.ratingDistributionChart.destroy();
    }
    
    if (!teams || teams.length === 0) {
        console.warn('⚠️ No teams data available for rating chart');
        return;
    }
    
    // Group teams by rating ranges
    const ratingRanges = {
        '4.5-5.0': 0,
        '4.0-4.4': 0,
        '3.5-3.9': 0,
        '3.0-3.4': 0,
        'Below 3.0': 0
    };
    
    teams.forEach(team => {
        const rating = team.rating || team.productivity?.customerRating || 4.5;
        if (rating >= 4.5) ratingRanges['4.5-5.0']++;
        else if (rating >= 4.0) ratingRanges['4.0-4.4']++;
        else if (rating >= 3.5) ratingRanges['3.5-3.9']++;
        else if (rating >= 3.0) ratingRanges['3.0-3.4']++;
        else ratingRanges['Below 3.0']++;
    });
    
    chartRegistry.ratingDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(ratingRanges),
            datasets: [{
                data: Object.values(ratingRanges),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Team Rating Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Populate zone ranking table
function populateZoneRankingTable(zones) {
    const container = document.getElementById('zone-ranking-table');
    if (!container) return;
    
    const zonesArray = Object.entries(zones).map(([name, data]) => ({
        name,
        ...data
    })).sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));
    
    let tableHTML = `
        <table class="performance-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Zone</th>
                    <th>Productivity</th>
                    <th>Teams</th>
                    <th>Tickets</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    zonesArray.forEach((zone, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
        const productivity = (zone.productivityScore || 0).toFixed(2);
        const totalTeams = zone.teams ? zone.teams.length : 0;
        const totalTickets = (zone.openTickets || 0) + (zone.closedTickets || 0);
        
        tableHTML += `
            <tr>
                <td><span class="rank-badge ${rankClass}">${rank}</span></td>
                <td><strong>${zone.name}</strong></td>
                <td>${productivity}%</td>
                <td>${totalTeams}</td>
                <td>${totalTickets}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Populate top teams table
function populateTopTeamsTable(teams) {
    const container = document.getElementById('top-teams-table');
    if (!container) return;
    
    const sortedTeams = teams
        .map(team => ({
            name: team.name || 'Unknown',
            state: team.state || 'Unknown',
            zone: team.zone || 'Unknown',
            ticketsCompleted: team.productivity?.totalTicketsCompleted || team.ticketsCompleted || 0,
            rating: team.rating || team.productivity?.customerRating || 4.5,
            status: team.status || 'unknown'
        }))
        .sort((a, b) => b.ticketsCompleted - a.ticketsCompleted)
        .slice(0, 10);
    
    let tableHTML = `
        <table class="performance-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>State</th>
                    <th>Tickets</th>
                    <th>Rating</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedTeams.forEach((team, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
        const rating = parseFloat(team.rating).toFixed(2);
        const statusClass = team.status === 'active' ? 'text-success' : 
                           team.status === 'busy' ? 'text-warning' : 'text-muted';
        
        tableHTML += `
            <tr>
                <td><span class="rank-badge ${rankClass}">${rank}</span></td>
                <td><strong>${team.name}</strong></td>
                <td>${team.state}</td>
                <td>${team.ticketsCompleted}</td>
                <td>${rating}</td>
                <td><span class="${statusClass}">${team.status}</span></td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function populateTopPerformers(teams) {
    const container = document.getElementById('teams-top-performers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (teams && teams.length > 0) {
        // Sort teams by tickets completed (descending) - normalize structures
        const getCompleted = (t) => {
            if (typeof t.ticketsCompleted === 'number') return t.ticketsCompleted;
            if (t.productivity && typeof t.productivity.totalTicketsCompleted === 'number') {
                return t.productivity.totalTicketsCompleted;
            }
            if (t.stats && typeof t.stats.completed === 'number') return t.stats.completed;
            return 0;
        };
        const sortedTeams = [...teams].sort((a, b) => getCompleted(b) - getCompleted(a));
        
        // Take top 5 performers
        const topPerformers = sortedTeams.slice(0, 5);
        
        topPerformers.forEach((team, index) => {
            const performerItem = document.createElement('div');
            performerItem.className = 'top-performer-item';
            
            const teamName = team.name || 'Unknown';
            const teamState = team.state || 'Unknown';
            const teamZone = team.zone || 'Unknown';
            const ticketsCompleted = getCompleted(team);
            const ratingValue = (typeof team.rating === 'number')
                ? team.rating
                : (team.productivity && typeof team.productivity.customerRating === 'number')
                    ? team.productivity.customerRating
                    : 4.5;
            const rating = parseFloat(ratingValue).toFixed(2);
            const ratingClass = rating >= 4.5 ? 'positive' : rating >= 4.0 ? 'neutral' : 'negative';
            
            performerItem.innerHTML = `
                <div class="performer-info">
                    <div class="performer-name">${teamName}</div>
                    <div class="performer-details">
                        <span>${teamState}</span>
                        <span>${teamZone} Zone</span>
                        <span>${ticketsCompleted} tickets</span>
                    </div>
                </div>
                <div class="performer-metrics">
                    <div class="performer-rating ${ratingClass}">${rating}</div>
                    <div class="performer-stats">Rank #${index + 1}</div>
                </div>
            `;
            
            container.appendChild(performerItem);
        });
    }
}

// Build missing team performance from tickets
function enrichTeamsWithTicketStats(teams, tickets) {
    if (!Array.isArray(teams) || teams.length === 0) return;
    if (!Array.isArray(tickets) || tickets.length === 0) return;
    
    const teamIdToStats = new Map();
    const completedStatuses = new Set(['resolved', 'closed', 'completed']);
    
    tickets.forEach(ticket => {
        const teamId = ticket.assignedTeam || ticket.assignedTo || ticket.teamId || ticket.team_id;
        if (!teamId) return;
        if (!teamIdToStats.has(teamId)) {
            teamIdToStats.set(teamId, { completed: 0, total: 0, ratingSum: 0, ratingCount: 0 });
        }
        const stats = teamIdToStats.get(teamId);
        stats.total += 1;
        if (completedStatuses.has(ticket.status)) {
            stats.completed += 1;
        }
        const rating = ticket.customerRating || ticket.rating;
        if (typeof rating === 'number') {
            stats.ratingSum += rating;
            stats.ratingCount += 1;
        }
    });
    
    teams.forEach(team => {
        const teamId = team._id || team.id;
        const stats = teamIdToStats.get(teamId);
        if (!stats) return;
        if (!team.productivity) team.productivity = {};
        if (typeof team.ticketsCompleted !== 'number') {
            team.productivity.totalTicketsCompleted = stats.completed;
        }
        if (typeof team.rating !== 'number' && typeof team.productivity.customerRating !== 'number') {
            team.productivity.customerRating = stats.ratingCount > 0
                ? +(stats.ratingSum / stats.ratingCount).toFixed(2)
                : 4.5;
        }
    });
}

async function loadFieldTeams() {
    try {
        // Fetch teams data
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();
        fieldTeams = data.teams || [];
        
        // Fetch tickets data for metrics calculation
        const ticketsResponse = await fetch(`${API_BASE}/tickets`);
        const ticketsData = await ticketsResponse.json();
        const allTickets = ticketsData.tickets || [];
        
        // Fetch zone analytics
        const zonesResponse = await fetch(`${API_BASE}/teams/analytics/zones`);
        const zonesData = await zonesResponse.json();
        
        // Derive team stats from tickets when missing
        enrichTeamsWithTicketStats(fieldTeams, allTickets);

        // Update Field Teams tab metrics
        updateFieldTeamsMetrics(fieldTeams, allTickets, zonesData);
        
        console.log('👥 Loaded field teams:', fieldTeams.length);
        console.log('👥 First team sample:', fieldTeams[0]);
        
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
    
    console.log('🎯 Displaying teams:', teamsToShow.length, 'teams');
    console.log('🎯 First team to display:', teamsToShow[0]);
    
    if (teamsToShow.length === 0) {
        container.innerHTML = '<p class="text-muted">No team members found</p>';
        return;
    }
    
    teamsToShow.forEach((team, index) => {
        try {
            const teamElement = createTeamCard(team);
            if (teamElement && teamElement.nodeType === Node.ELEMENT_NODE) {
                container.appendChild(teamElement);
            } else {
                console.warn(`Failed to create team card for team at index ${index}:`, team);
                // Create a fallback card
                const fallbackElement = createFallbackTeamCard(team);
                container.appendChild(fallbackElement);
            }
        } catch (error) {
            console.warn(`Error creating team card for team at index ${index}:`, team, 'Error:', error);
            // Create a fallback card
            const fallbackElement = createFallbackTeamCard(team);
            container.appendChild(fallbackElement);
        }
    });
}

function createTeamCard(team) {
    // Validate team object - be very lenient
    if (!team || typeof team !== 'object') {
        console.warn('Invalid team object (not an object):', team);
        return createFallbackTeamCard(team);
    }
    
    // Ensure we have at least a name or _id
    if (!team.name && !team._id) {
        console.warn('Invalid team object (no name or _id):', team);
        return createFallbackTeamCard(team);
    }
    
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = team.status === 'active' ? 'success' : 
                       team.status === 'busy' ? 'warning' : 
                       team.status === 'offline' ? 'danger' : 'secondary';
    
    div.innerHTML = `
        <div class="card team-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">${team.name || team._id || 'Unknown'}</h5>
                    <span class="badge bg-${statusClass}">${team.status || 'unknown'}</span>
                </div>
                <p class="text-muted mb-2">
                    <i class="fas fa-envelope me-1"></i>${team.email || 'N/A'}<br>
                    <i class="fas fa-phone me-1"></i>${team.phone || 'N/A'}
                </p>
                <div class="mb-3">
                    <strong>Skills:</strong>
                    <div class="mt-1">
                        ${(team.skills || []).map(skill => `<span class="badge bg-light text-dark me-1">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="row text-center">
                    <div class="col-4">
                        <div class="text-muted small">Tickets</div>
                        <div class="fw-bold">${team.productivity?.totalTicketsCompleted || 0}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-muted small">Rating</div>
                        <div class="fw-bold">${(team.productivity?.customerRating || 0).toFixed(1)}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-muted small">Rate</div>
                        <div class="fw-bold">RM${team.cost?.hourlyRate || team.hourlyRate || 0}/hr</div>
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

function createFallbackTeamCard(team) {
    // Create a fallback team card for invalid data
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4 mb-4';
    
    div.innerHTML = `
        <div class="card team-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">Invalid Team Data</h5>
                    <span class="badge bg-secondary">unknown</span>
                </div>
                <p class="text-muted mb-2">
                    <i class="fas fa-exclamation-triangle me-1"></i>Data Error<br>
                    <i class="fas fa-info-circle me-1"></i>Please refresh
                </p>
                <div class="row text-center">
                    <div class="col-6">
                        <small class="text-muted">Tickets</small>
                        <div class="fw-bold">0</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Rating</small>
                        <div class="fw-bold">N/A</div>
                    </div>
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
    const zoneView = document.getElementById('zone-view');
    const listView = document.getElementById('list-view');
    
    if (zoneView) {
        zoneView.style.display = 'block';
    } else {
        console.error('zone-view element not found');
    }
    
    if (listView) {
        listView.style.display = 'none';
    } else {
        console.error('list-view element not found');
    }
    
    loadZoneAnalytics();
    // Also load field teams data to populate metrics
    loadFieldTeams();
}

function showTeamsPerformanceAnalytics() {
    document.getElementById('zone-view').style.display = 'none';
    document.getElementById('teams-performance-analytics').style.display = 'block';
    loadTeamsPerformanceAnalytics();
}

async function loadZoneAnalytics() {
    console.log('Loading zone analytics...');
    try {
        const response = await fetch(`${API_BASE}/teams/analytics/zones`);
        const data = await response.json();
        console.log('Zone analytics response:', data);
        
        if (data.zones) {
            console.log('Displaying real zone data');
            const normalized = normalizeZones(data.zones);
            displayZoneBreakdown(normalized);
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
    const normalizedStatus = (team.status || '').toLowerCase();
    const statusClass = normalizedStatus === 'active' || normalizedStatus === 'available' ? 'active'
        : normalizedStatus === 'busy' || normalizedStatus === 'in_progress' ? 'busy'
        : 'offline';

    const teamId = team._id || team.id || '';
    const hourlyRate = typeof team.hourlyRate === 'number' ? team.hourlyRate.toFixed(2) : (parseFloat(team.hourlyRate || 0).toFixed(2));
    const skills = Array.isArray(team.skills) ? team.skills : [];

    const totalTicketsCompleted = team.productivity?.totalTicketsCompleted ?? team.ticketsCompleted ?? 0;
    const customerRating = team.productivity?.customerRating ?? team.rating ?? 0;
    const ticketsThisMonth = team.productivity?.ticketsThisMonth ?? team.ticketsThisMonth ?? 0;
    const efficiencyScore = team.productivity?.efficiencyScore ?? team.efficiency ?? 0;

    return `
        <div class="team-card" onclick="showTeamProfile('${teamId}')">
            <div class="team-card-header">
                <h5 class="team-name">${team.name || 'Unknown'}</h5>
                <span class="team-status ${statusClass}">${team.status || 'offline'}</span>
            </div>
            
            <div class="team-details">
                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${team.state || team.zone || '-'}</p>
                <p class="mb-1"><i class="fas fa-dollar-sign me-2"></i>RM${hourlyRate}/hour</p>
                <p class="mb-2"><i class="fas fa-tools me-2"></i>${skills.join(', ')}</p>
            </div>
            
            <div class="team-performance">
                <div class="performance-item">
                    <span class="performance-value">${totalTicketsCompleted}</span>
                    <div class="performance-label">Tickets</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${Number(customerRating).toFixed(1)}</span>
                    <div class="performance-label">Rating</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${ticketsThisMonth}</span>
                    <div class="performance-label">This Month</div>
                </div>
                <div class="performance-item">
                    <span class="performance-value">${Number(efficiencyScore).toFixed(2)}%</span>
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
    const analysisView = document.getElementById('tickets-performance-analysis');
    if (analysisView) analysisView.style.display = 'none';
    
    // Update button states using standardized approach
    const listBtn = document.getElementById('tickets-list-btn');
    setActiveViewButton('view-controls', listBtn);
    
    // Load tickets list
    loadTickets();
}

// Old view functions removed - replaced by showTicketsPerformanceAnalysis()

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
        const response = await fetch(`${API_BASE}/teams`, {
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
        const [ticketsResponse, teamsResponse] = await Promise.all([
            fetch(`${API_BASE}/tickets`),
            fetch(`${API_BASE}/teams`)
        ]);
        
        const ticketsData = await ticketsResponse.json();
        const teamsData = await teamsResponse.json();
        
        return {
            tickets: {
                total: (ticketsData.tickets || []).length,
                completed: (ticketsData.tickets || []).filter(t => t.status === 'resolved' || t.status === 'closed' || t.status === 'completed').length,
                open: (ticketsData.tickets || []).filter(t => t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'completed').length,
                categories: []
            },
            teams: {
                total: (teamsData.teams || teamsData.fieldTeams || []).length,
                active: (teamsData.teams || teamsData.fieldTeams || []).filter(team => team.status === 'active' || team.status === 'available').length,
                busy: (teamsData.teams || teamsData.fieldTeams || []).filter(team => team.status === 'busy' || team.status === 'in_progress').length,
                offline: (teamsData.teams || teamsData.fieldTeams || []).filter(team => team.status === 'offline').length
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
// ==================== PERFORMANCE ANALYSIS FUNCTIONS ====================

// Store chart instances globally to destroy them before recreating
const chartInstances = {};

// Show Performance Analysis view
function showTicketsPerformanceAnalysis() {
    console.log('📊 Loading Performance Analysis...');
    
    // Hide other views
    document.getElementById('tickets-list-view').style.display = 'none';
    document.getElementById('tickets-performance-analysis').style.display = 'block';
    
    // Update button states using standardized approach
    const analysisBtn = document.getElementById('tickets-analysis-btn');
    setActiveViewButton('view-controls', analysisBtn);
    
    // Destroy existing charts
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            delete chartInstances[key];
        }
    });
    
    // Load all analysis data
    loadPerformanceAnalysis();
}

// Main function to load all performance analysis data
async function loadPerformanceAnalysis() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();
        const allTickets = data.tickets || [];
        
        const teamsResponse = await fetch(`${API_BASE}/teams`);
        const teamsData = await teamsResponse.json();
        const allTeams = teamsData.teams || [];
        
        console.log('📊 Performance Analysis data:', { tickets: allTickets.length, teams: allTeams.length });
        
        // Update KPIs
        updatePerformanceKPIs(allTickets, allTeams);
        
        // Create charts
        createTicketTrendsChart(allTickets);
        createStatusDistributionChart(allTickets);
        createProductivityVsEfficiencyChart(allTickets, allTeams);
        createZonePerformanceChart(allTickets);
        createPriorityBreakdownChart(allTickets);
        createCategoryDistributionChart(allTickets);
        createTeamProductivityChart(allTeams);
        createCostAnalysisChart(allTickets, allTeams);
        createPeakHoursChart(allTickets);
        createDayOfWeekChart(allTickets);
        createCustomerRatingsChart(allTeams);
        createProductivityMetricsChart(allTickets, allTeams);
        createEfficiencyTrendsChart(allTickets);
        
        // Populate tables
        populatePerformanceSummaryTable(allTickets, allTeams);
        populateTopPerformers(allTeams);
        populateAIInsights(allTickets, allTeams);
        
        console.log('✅ Performance Analysis loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading performance analysis:', error);
    }
}

// Update KPI cards
function updatePerformanceKPIs(tickets, teams) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Ticket growth
    const thisMonth = tickets.filter(t => new Date(t.createdAt) >= monthStart).length;
    const lastMonth = tickets.filter(t => {
        const date = new Date(t.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;
    
    // Efficiency rate
    const resolved = tickets.filter(t => t.resolvedAt);
    const efficientTickets = resolved.filter(t => {
        const hours = (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        return hours <= 2;
    }).length;
    const efficiency = resolved.length > 0 ? (efficientTickets / resolved.length * 100).toFixed(1) : 0;
    
    // Average resolution time
    const avgTime = resolved.length > 0 
        ? (resolved.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) / resolved.length / (1000 * 60 * 60)).toFixed(2)
        : 0;
    
    // Monthly cost
    const hourlyRate = teams[0]?.hourlyRate || 45;
    const monthlyCost = thisMonth * hourlyRate * 1.5;
    
    updateElement('kpi-trend', `${growth >= 0 ? '+' : ''}${growth}%`);
    updateElement('kpi-efficiency', `${efficiency}%`);
    updateElement('kpi-avg-time', `${avgTime}h`);
    updateElement('kpi-cost', `RM ${monthlyCost.toLocaleString()}`);
}

// Create Ticket Trends Chart with projections
function createTicketTrendsChart(tickets) {
    const ctx = document.getElementById('ticketTrendsChart');
    if (!ctx) {
        console.warn('⚠️ ticketTrendsChart canvas not found');
        return;
    }
    
    console.log('📈 Creating Ticket Trends Chart...');
    
    // Get last 30 days of data
    const days = [];
    const counts = [];
    const projections = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = tickets.filter(t => {
            const ticketDate = new Date(t.createdAt);
            return ticketDate >= date && ticketDate < nextDay;
        }).length;
        
        days.push(date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }));
        counts.push(count);
    }
    
    // Simple projection for next 7 days (linear trend)
    const recentAvg = counts.slice(-7).reduce((a, b) => a + b, 0) / 7;
    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push(date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }));
        counts.push(null);
        projections.push(recentAvg * (1 + Math.random() * 0.2 - 0.1)); // ±10% variance
    }
    
    chartInstances['ticketTrends'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Actual Tickets',
                    data: counts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Projected',
                    data: projections,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        usePointStyle: true,
                        padding: 12
                    }
                },
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    padding: 12
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { 
                        display: true, 
                        text: 'Number of Tickets',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: { font: { size: 11 } },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: { 
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                }
            }
        }
    });
    
    // Update forecast values
    const projectedTotal = Math.round(projections.reduce((a, b) => a + b, 0));
    const teamsNeeded = Math.ceil(projectedTotal / 3);
    const projectedCost = projectedTotal * 67.5;
    const growthRate = ((projectedTotal - counts.filter(c => c !== null).slice(-7).reduce((a, b) => a + b, 0)) / counts.filter(c => c !== null).slice(-7).reduce((a, b) => a + b, 0) * 100).toFixed(1);
    
    updateElement('forecast-tickets', projectedTotal);
    updateElement('forecast-teams', teamsNeeded);
    updateElement('forecast-cost', `RM ${projectedCost.toLocaleString()}`);
    updateElement('forecast-growth', `${growthRate}%`);
}

// Create Status Distribution Chart
function createStatusDistributionChart(tickets) {
    const ctx = document.getElementById('statusDistChart');
    if (!ctx) {
        console.warn('⚠️ statusDistChart canvas not found');
        return;
    }
    
    console.log('📊 Creating Status Distribution Chart...');
    
    const statusCounts = {
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length
    };
    
    chartInstances['statusDist'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
            datasets: [{
                data: [statusCounts.open, statusCounts.in_progress, statusCounts.resolved, statusCounts.closed],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        font: { size: 11 },
                        padding: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Create Productivity vs Efficiency Trends Chart
function createProductivityVsEfficiencyChart(tickets, teams) {
    const ctx = document.getElementById('productivityVsEfficiencyChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    console.log('📈 Creating Productivity vs Efficiency Trends Chart...');
    
    // Calculate trends over last 30 days
    const days = [];
    const productivityData = [];
    const efficiencyData = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Get tickets for this day
        const dayTickets = tickets.filter(t => {
            const ticketDate = new Date(t.createdAt);
            return ticketDate >= date && ticketDate < nextDay;
        });
        
        // Calculate productivity (completion rate)
        const dayResolved = tickets.filter(t => {
            const resolvedDate = t.resolvedAt;
            if (!resolvedDate) return false;
            const rDate = new Date(resolvedDate);
            return rDate >= date && rDate < nextDay;
        }).length;
        
        const productivity = dayTickets.length > 0 
            ? (dayResolved / dayTickets.length * 100)
            : 0;
        
        // Calculate efficiency (resolved within 2h target)
        const dayResolvedFast = tickets.filter(t => {
            const resolvedDate = t.resolvedAt;
            if (!resolvedDate) return false;
            const rDate = new Date(resolvedDate);
            if (rDate < date || rDate >= nextDay) return false;
            
            const hours = (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
            return hours <= 2;
        }).length;
        
        const efficiency = dayResolved > 0
            ? (dayResolvedFast / dayResolved * 100)
            : 0;
        
        days.push(date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }));
        productivityData.push(productivity);
        efficiencyData.push(efficiency);
    }
    
    // Calculate current values (last day)
    const currentProductivity = productivityData[productivityData.length - 1] || 0;
    const currentEfficiency = efficiencyData[efficiencyData.length - 1] || 0;
    
    updateElement('current-productivity', `${currentProductivity.toFixed(2)}%`);
    updateElement('current-efficiency', `${currentEfficiency.toFixed(2)}%`);
    
    console.log('📊 Productivity vs Efficiency:', {
        avgProductivity: (productivityData.reduce((a, b) => a + b, 0) / productivityData.length).toFixed(2),
        avgEfficiency: (efficiencyData.reduce((a, b) => a + b, 0) / efficiencyData.length).toFixed(2),
        currentProductivity: currentProductivity.toFixed(2),
        currentEfficiency: currentEfficiency.toFixed(2)
    });
    
    chartInstances['productivityVsEfficiency'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Productivity (Completion Rate)',
                    data: productivityData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Efficiency (< 2h Target)',
                    data: efficiencyData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Percentage (%)',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    console.log('✅ Productivity vs Efficiency Chart created');
}

// Create Zone Performance Chart
function createZonePerformanceChart(tickets) {
    const ctx = document.getElementById('teamsZonePerformanceChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    // Ensure tickets is an array
    if (!Array.isArray(tickets)) {
        console.error('tickets is not an array:', tickets);
        return;
    }
    
    const zones = {};
    tickets.forEach(t => {
        const zone = t.location?.zone || 'Unknown';
        zones[zone] = (zones[zone] || 0) + 1;
    });
    
    // Destroy existing chart instance if it exists
    if (chartInstances.teamsZonePerformanceChart) {
        chartInstances.teamsZonePerformanceChart.destroy();
    }
    
    chartInstances.teamsZonePerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(zones),
            datasets: [{
                label: 'Tickets by Zone',
                data: Object.values(zones),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Create Priority Breakdown Chart
function createPriorityBreakdownChart(tickets) {
    const ctx = document.getElementById('priorityBreakdownChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const priorities = {
        emergency: tickets.filter(t => t.priority === 'emergency').length,
        high: tickets.filter(t => t.priority === 'high').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        low: tickets.filter(t => t.priority === 'low').length
    };
    
    // Destroy existing chart instance if it exists
    if (chartInstances.priorityBreakdownChart) {
        chartInstances.priorityBreakdownChart.destroy();
    }
    
    chartInstances.priorityBreakdownChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Emergency', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [priorities.emergency, priorities.high, priorities.medium, priorities.low],
                backgroundColor: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Create Category Distribution Chart
function createCategoryDistributionChart(tickets) {
    const ctx = document.getElementById('categoryDistChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const categories = {};
    tickets.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });
    
    // Destroy existing chart instance if it exists
    if (chartInstances.categoryDistChart) {
        chartInstances.categoryDistChart.destroy();
    }
    
    chartInstances.categoryDistChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Create Team Productivity Chart
function createTeamProductivityChart(teams) {
    const ctx = document.getElementById('teamProductivityChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const topTeams = teams.slice(0, 10);
    
    // Destroy existing chart instance if it exists
    if (chartInstances.teamProductivityChart) {
        chartInstances.teamProductivityChart.destroy();
    }
    
    chartInstances.teamProductivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.name),
            datasets: [{
                label: 'Tickets Completed',
                data: topTeams.map(t => t.productivity?.ticketsCompleted || 0),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Create Cost Analysis Chart
function createCostAnalysisChart(tickets, teams) {
    const ctx = document.getElementById('costAnalysisChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const hourlyRate = teams[0]?.hourlyRate || 45;
    const dailyCosts = [];
    const labels = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayTickets = tickets.filter(t => {
            const resolvedDate = t.resolvedAt;
            if (!resolvedDate) return false;
            const ticketDate = new Date(resolvedDate);
            return ticketDate >= date && ticketDate < nextDay;
        }).length;
        
        dailyCosts.push(dayTickets * hourlyRate * 1.5);
        labels.push(date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }));
    }
    
    // Calculate costs
    const costToday = dailyCosts[dailyCosts.length - 1] || 0;
    const costWeek = dailyCosts.slice(-7).reduce((a, b) => a + b, 0);
    const costMonth = dailyCosts.reduce((a, b) => a + b, 0);
    const costProjected = costMonth * 1.15; // 15% growth projection
    
    updateElement('cost-today', `RM ${costToday.toFixed(2)}`);
    updateElement('cost-week', `RM ${costWeek.toFixed(2)}`);
    updateElement('cost-month', `RM ${costMonth.toFixed(2)}`);
    updateElement('cost-projected', `RM ${costProjected.toFixed(2)}`);
    
    // Destroy existing chart instance if it exists
    if (chartInstances.costAnalysisChart) {
        chartInstances.costAnalysisChart.destroy();
    }
    
    chartInstances.costAnalysisChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Cost (RM)',
                data: dailyCosts,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Cost (RM)' } }
            }
        }
    });
}

// Create Peak Hours Chart
function createPeakHoursChart(tickets) {
    const ctx = document.getElementById('peakHoursChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const hours = Array(24).fill(0);
    tickets.forEach(t => {
        const hour = new Date(t.createdAt).getHours();
        hours[hour]++;
    });
    
    // Destroy existing chart instance if it exists
    if (chartInstances.peakHoursChart) {
        chartInstances.peakHoursChart.destroy();
    }
    
    chartInstances.peakHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours.map((_, i) => `${i}:00`),
            datasets: [{
                label: 'Tickets',
                data: hours,
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Create Day of Week Chart
function createDayOfWeekChart(tickets) {
    const ctx = document.getElementById('dayOfWeekChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    
    tickets.forEach(t => {
        const day = new Date(t.createdAt).getDay();
        counts[day]++;
    });
    
    // Destroy existing chart instance if it exists
    if (chartInstances.dayOfWeekChart) {
        chartInstances.dayOfWeekChart.destroy();
    }
    
    chartInstances.dayOfWeekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Tickets',
                data: counts,
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Create Customer Ratings Chart
function createCustomerRatingsChart(teams) {
    const ctx = document.getElementById('customerRatingsChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const ratings = [0, 0, 0, 0, 0];
    teams.forEach(t => {
        const rating = Math.floor(t.rating || 4.5);
        if (rating >= 1 && rating <= 5) {
            ratings[rating - 1]++;
        }
    });
    
    // Destroy existing chart instance if it exists
    if (chartInstances.customerRatingsChart) {
        chartInstances.customerRatingsChart.destroy();
    }
    
    chartInstances.customerRatingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
            datasets: [{
                label: 'Teams',
                data: ratings,
                backgroundColor: ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Create Productivity Metrics Chart
function createProductivityMetricsChart(tickets, teams) {
    const ctx = document.getElementById('productivityMetricsChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyTickets = tickets.filter(t => new Date(t.createdAt) >= monthStart).length;
    const daysInMonth = new Date().getDate();
    const ticketsPerDay = (monthlyTickets / daysInMonth).toFixed(2);
    const ticketsPerTeam = (monthlyTickets / teams.length).toFixed(2);
    
    updateElement('tickets-per-day', ticketsPerDay);
    updateElement('tickets-per-team', ticketsPerTeam);
    
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
        const weekStart = new Date(monthStart);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const count = tickets.filter(t => {
            const date = new Date(t.createdAt);
            return date >= weekStart && date < weekEnd;
        }).length;
        
        weeklyData.push(count);
    }
    
    // Destroy existing chart instance if it exists
    if (chartInstances.productivityMetricsChart) {
        chartInstances.productivityMetricsChart.destroy();
    }
    
    chartInstances.productivityMetricsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Tickets per Week',
                data: weeklyData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Create Efficiency Trends Chart
function createEfficiencyTrendsChart(tickets) {
    const ctx = document.getElementById('efficiencyTrendsChart');
    if (!ctx) {
        console.warn(`⚠️ Canvas not found for chart`);
        return;
    }
    
    const weeklyEfficiency = [];
    const labels = [];
    
    for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);
        
        const weekTickets = tickets.filter(t => {
            const date = new Date(t.createdAt);
            return date >= weekStart && date < weekEnd;
        });
        
        const resolved = weekTickets.filter(t => t.resolvedAt);
        const efficient = resolved.filter(t => {
            const hours = (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
            return hours <= 2;
        }).length;
        
        const efficiency = resolved.length > 0 ? (efficient / resolved.length * 100).toFixed(2) : 0;
        weeklyEfficiency.push(parseFloat(efficiency));
        labels.push(`Week ${4 - i}`);
    }
    
    // Calculate metrics
    const firstTimeFix = weeklyEfficiency[weeklyEfficiency.length - 1] || 0;
    const slaCompliance = (weeklyEfficiency.reduce((a, b) => a + b, 0) / weeklyEfficiency.length).toFixed(2);
    
    updateElement('first-time-fix', `${firstTimeFix}%`);
    updateElement('sla-compliance', `${slaCompliance}%`);
    
    // Destroy existing chart instance if it exists
    if (chartInstances.efficiencyTrendsChart) {
        chartInstances.efficiencyTrendsChart.destroy();
    }
    
    chartInstances.efficiencyTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Efficiency Rate (%)',
                data: weeklyEfficiency,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Efficiency (%)' } }
            }
        }
    });
}

// Populate Performance Summary Table
function populatePerformanceSummaryTable(tickets, teams) {
    const tbody = document.getElementById('performance-summary-table');
    if (!tbody) return;
    
    const resolved = tickets.filter(t => t.resolvedAt);
    const resolutionRate = tickets.length > 0 ? (resolved.length / tickets.length * 100).toFixed(2) : 0;
    const avgTime = resolved.length > 0 
        ? (resolved.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) / resolved.length / (1000 * 60 * 60)).toFixed(2)
        : 0;
    const avgRating = teams.length > 0 
        ? (teams.reduce((sum, t) => sum + (t.rating || 4.5), 0) / teams.length).toFixed(1)
        : 4.5;
    
    const metrics = [
        { name: 'Resolution Rate', current: `${resolutionRate}%`, target: '85%', status: resolutionRate >= 85 ? 'success' : 'warning' },
        { name: 'Avg Resolution Time', current: `${avgTime}h`, target: '< 2h', status: avgTime < 2 ? 'success' : 'warning' },
        { name: 'Customer Rating', current: avgRating, target: '> 4.5', status: avgRating > 4.5 ? 'success' : 'warning' },
        { name: 'Active Teams', current: teams.filter(t => t.status === 'active').length, target: `${teams.length}`, status: 'success' }
    ];
    
    tbody.innerHTML = metrics.map(m => `
        <tr>
            <td>${m.name}</td>
            <td><strong>${m.current}</strong></td>
            <td>${m.target}</td>
            <td><span class="badge bg-${m.status}">${m.status === 'success' ? 'On Track' : 'Needs Attention'}</span></td>
        </tr>
    `).join('');
}

// Populate Top Performers
function populateTopPerformers(teams) {
    const container = document.getElementById('top-performers-list');
    if (!container) return;
    
    const sortedTeams = teams
        .sort((a, b) => (b.productivity?.ticketsCompleted || 0) - (a.productivity?.ticketsCompleted || 0))
        .slice(0, 5);
    
    container.innerHTML = sortedTeams.map((team, index) => `
        <div class="performer-item">
            <div class="performer-rank">${index + 1}</div>
            <div class="performer-info">
                <div class="performer-name">${team.name}</div>
                <div class="performer-zone">${team.zone || 'N/A'} - ${team.state || 'N/A'}</div>
            </div>
            <div class="performer-metrics">
                <div class="performer-tickets">${team.productivity?.ticketsCompleted || 0}</div>
                <div class="performer-rating">⭐ ${(team.rating || 4.5).toFixed(1)}</div>
            </div>
        </div>
    `).join('');
}

// Populate AI Insights
function populateAIInsights(tickets, teams) {
    const container = document.getElementById('ai-insights');
    if (!container) return;
    
    const insights = [];
    
    // Aging tickets insight
    const oldTickets = tickets.filter(t => {
        const hours = (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60);
        return hours > 48 && t.status !== 'resolved' && t.status !== 'closed';
    }).length;
    
    if (oldTickets > 5) {
        insights.push({
            title: 'Aging Tickets Alert',
            text: `${oldTickets} tickets are over 48 hours old. Consider prioritizing these to improve SLA compliance.`,
            priority: 'high'
        });
    }
    
    // Peak time insight
    const peakHour = tickets.reduce((acc, t) => {
        const hour = new Date(t.createdAt).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});
    const maxHour = Object.keys(peakHour).reduce((a, b) => peakHour[a] > peakHour[b] ? a : b);
    
    insights.push({
        title: 'Peak Hours Identified',
        text: `Most tickets occur around ${maxHour}:00. Consider scheduling more teams during this period.`,
        priority: 'medium'
    });
    
    // Efficiency insight
    const resolved = tickets.filter(t => t.resolvedAt);
    const avgTime = resolved.length > 0 
        ? (resolved.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) / resolved.length / (1000 * 60 * 60))
        : 0;
    
    if (avgTime < 2) {
        insights.push({
            title: 'Excellent Efficiency',
            text: `Average resolution time of ${avgTime.toFixed(2)}h is below the 2h target. Team performance is excellent!`,
            priority: 'low'
        });
    }
    
    // Growth projection
    const monthStart = new Date();
    monthStart.setDate(1);
    const thisMonth = tickets.filter(t => new Date(t.createdAt) >= monthStart).length;
    const projected = Math.round(thisMonth * 1.15);
    
    insights.push({
        title: 'Growth Projection',
        text: `Based on current trends, expect approximately ${projected} tickets next month. Plan resources accordingly.`,
        priority: 'medium'
    });
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-title">
                <i class="fas fa-lightbulb"></i>
                ${insight.title}
                <span class="insight-badge ${insight.priority}">${insight.priority.toUpperCase()}</span>
            </div>
            <div class="insight-text">${insight.text}</div>
        </div>
    `).join('');
}

// Placeholder functions for period updates
function updateTrendPeriod(period) {
    console.log('Updating trend period:', period);
    // Reload charts with new period
    loadPerformanceAnalysis();
}

function updateForecastPeriod(period) {
    console.log('Updating forecast period:', period);
    // Reload forecast with new period
    loadPerformanceAnalysis();
}

// Normalize zones object shape from backend to what the UI expects
function normalizeZones(zonesObj) {
    const out = {};
    Object.entries(zonesObj).forEach(([key, z]) => {
        const zoneName = z.zoneName || z.zone || key;
        const teams = Array.isArray(z.teams) ? z.teams : [];
        const openTickets = z.openTickets || 0;
        const closedTickets = z.closedTickets || 0;
        const totalTickets = z.totalTickets ?? (openTickets + closedTickets);
        const totalTeams = z.totalTeams ?? teams.length;
        const activeTeams = z.activeTeams ?? teams.filter(t => (t.status === 'active' || t.status === 'available')).length;
        const productivityScore = typeof z.productivityScore === 'number'
            ? z.productivityScore
            : (totalTickets > 0 ? (((closedTickets - openTickets) / totalTickets) * 100) : 0);
        out[zoneName] = {
            zoneName,
            teams,
            openTickets,
            closedTickets,
            totalTickets,
            totalTeams,
            activeTeams,
            productivityScore,
            states: Array.isArray(z.states) ? z.states : (z.states ? Object.values(z.states) : [])
        };
    });
    return out;
}

