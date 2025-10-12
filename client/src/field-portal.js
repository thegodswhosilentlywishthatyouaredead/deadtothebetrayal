// Field Team Portal JavaScript
// Global variables
let currentUser = null;
let myTickets = [];
let routeMap = null;
let routeMarkers = [];
let charts = {};

// API Base URL
const API_BASE = 'http://localhost:5001/api';

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
    try {
        const response = await fetch(`${API_BASE}/tickets?assignedTo=${currentUser.id}`);
        const data = await response.json();
        myTickets = data.tickets || [];
        
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
function displayMyTickets() {
    const container = document.getElementById('my-tickets-list');
    container.innerHTML = '';
    
    if (myTickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No tickets assigned</h5>
                <p class="text-muted">You don't have any tickets assigned at the moment.</p>
            </div>
        `;
        return;
    }
    
    myTickets.forEach(ticket => {
        const ticketElement = createTicketCard(ticket);
        container.appendChild(ticketElement);
    });
}

// Create ticket card
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    const priorityClass = `priority-${ticket.priority}`;
    const statusClass = `status-${ticket.status.replace('-', '-')}`;
    
    card.innerHTML = `
        <div class="ticket-header">
            <div>
                <div class="ticket-title">${ticket.title}</div>
                <div class="ticket-number">${ticket.ticketNumber}</div>
            </div>
            <div class="ticket-priority ${priorityClass}">${ticket.priority}</div>
        </div>
        
        <div class="ticket-details">
            <div class="ticket-detail">
                <i class="fas fa-user"></i>
                <span>${ticket.customer.name}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${ticket.location.address}</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-clock"></i>
                <span>${ticket.estimatedDuration} min</span>
            </div>
            <div class="ticket-detail">
                <i class="fas fa-tag"></i>
                <span>${ticket.category}</span>
            </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center">
            <div class="status-indicator ${statusClass}">
                <i class="fas fa-circle"></i>
                <span>${ticket.status.replace('-', ' ')}</span>
            </div>
            <div class="ticket-actions">
                ${getTicketActions(ticket)}
            </div>
        </div>
    `;
    
    return card;
}

// Get ticket actions based on status
function getTicketActions(ticket) {
    switch (ticket.status) {
        case 'assigned':
            return `
                <button class="btn btn-primary btn-sm" onclick="startTicket('${ticket._id}')">
                    <i class="fas fa-play me-1"></i>
                    Start
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="viewTicketDetails('${ticket._id}')">
                    <i class="fas fa-eye me-1"></i>
                    View
                </button>
            `;
        case 'in-progress':
            return `
                <button class="btn btn-success btn-sm" onclick="completeTicket('${ticket._id}')">
                    <i class="fas fa-check me-1"></i>
                    Complete
                </button>
                <button class="btn btn-outline-warning btn-sm" onclick="pauseTicket('${ticket._id}')">
                    <i class="fas fa-pause me-1"></i>
                    Pause
                </button>
            `;
        case 'completed':
            return `
                <button class="btn btn-outline-primary btn-sm" onclick="viewTicketDetails('${ticket._id}')">
                    <i class="fas fa-eye me-1"></i>
                    View Details
                </button>
                <button class="btn btn-outline-success btn-sm" onclick="addExpenseForTicket('${ticket._id}')">
                    <i class="fas fa-receipt me-1"></i>
                    Add Expense
                </button>
            `;
        default:
            return `
                <button class="btn btn-outline-primary btn-sm" onclick="viewTicketDetails('${ticket._id}')">
                    <i class="fas fa-eye me-1"></i>
                    View
                </button>
            `;
    }
}

// Load quick stats
async function loadQuickStats() {
    try {
        const today = new Date().toDateString();
        const todayTickets = myTickets.filter(ticket => 
            new Date(ticket.createdAt).toDateString() === today
        );
        const completedTickets = myTickets.filter(ticket => ticket.status === 'completed');
        const avgRating = 4.8; // This would come from API
        const earningsToday = completedTickets.length * currentUser.hourlyRate * 0.5; // Assuming 30 min average
        
        document.getElementById('today-tickets').textContent = todayTickets.length;
        document.getElementById('completed-tickets').textContent = completedTickets.length;
        document.getElementById('avg-rating').textContent = avgRating.toFixed(1);
        document.getElementById('earnings-today').textContent = `$${earningsToday.toFixed(0)}`;
    } catch (error) {
        console.error('Error loading quick stats:', error);
    }
}

// Initialize route map
function initializeRouteMap() {
    routeMap = L.map('route-map').setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
    
    loadRouteData();
}

// Load route data
async function loadRouteData() {
    try {
        // Clear existing markers
        routeMarkers.forEach(marker => routeMap.removeLayer(marker));
        routeMarkers = [];
        
        // Add markers for assigned tickets
        const assignedTickets = myTickets.filter(ticket => 
            ticket.status === 'assigned' || ticket.status === 'in-progress'
        );
        
        assignedTickets.forEach((ticket, index) => {
            const marker = L.marker([ticket.location.latitude, ticket.location.longitude])
                .addTo(routeMap)
                .bindPopup(`
                    <div>
                        <h6>${ticket.title}</h6>
                        <p><strong>Priority:</strong> ${ticket.priority}</p>
                        <p><strong>Duration:</strong> ${ticket.estimatedDuration} min</p>
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
    } catch (error) {
        console.error('Error loading route data:', error);
    }
}

// Update route list
function updateRouteList(tickets) {
    const container = document.getElementById('route-list');
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
        routeItem.innerHTML = `
            <div class="route-info">
                <h6>${ticket.title}</h6>
                <small>${ticket.location.address}</small>
            </div>
            <div class="route-time">
                ${ticket.estimatedDuration}m
            </div>
        `;
        container.appendChild(routeItem);
    });
    
    // Update totals
    const totalDistance = tickets.length * 2.5; // Estimated
    const totalTime = tickets.reduce((sum, ticket) => sum + ticket.estimatedDuration, 0);
    
    document.getElementById('total-distance').textContent = `${totalDistance.toFixed(1)} km`;
    document.getElementById('total-time').textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;
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
    // Performance data would be loaded from API
    // For now, using sample data in charts
}

// Load expense data
async function loadExpenseData() {
    try {
        // Load expense summary
        const expenseSummary = document.getElementById('expense-summary');
        expenseSummary.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span>This Month:</span>
                <strong>$335</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Last Month:</span>
                <strong>$298</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Average/Day:</span>
                <strong>$11.2</strong>
            </div>
            <div class="d-flex justify-content-between">
                <span>Reimbursed:</span>
                <strong class="text-success">$320</strong>
            </div>
        `;
        
        // Load recent expenses
        const recentExpenses = document.getElementById('recent-expenses');
        recentExpenses.innerHTML = `
            <div class="list-group">
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Fuel - Gas Station</h6>
                        <small class="text-muted">Today, 2:30 PM</small>
                    </div>
                    <span class="badge bg-danger">$45.20</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Materials - Hardware Store</h6>
                        <small class="text-muted">Yesterday, 4:15 PM</small>
                    </div>
                    <span class="badge bg-primary">$28.50</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Lunch - Restaurant</h6>
                        <small class="text-muted">Yesterday, 12:30 PM</small>
                    </div>
                    <span class="badge bg-warning">$12.75</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading expense data:', error);
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
            loadRouteData();
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
