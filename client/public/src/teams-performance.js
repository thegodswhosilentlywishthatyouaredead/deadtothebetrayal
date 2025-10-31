// TEAMS PERFORMANCE ANALYSIS - Complete Standalone Module
// This module handles ALL teams performance analysis using teams API data
console.log('🚀 [TEAMS-PERF] teams-performance.js loading...');

// Global chart storage
window.teamsPerformanceCharts = window.teamsPerformanceCharts || {};
const teamsCharts = window.teamsPerformanceCharts;

// Set Chart.js global defaults for smaller, cleaner fonts
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.size = 11;
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    console.log('✅ [TEAMS-PERF] Chart.js defaults configured');
}

// Flag to prevent chart destruction
window.teamsPerformanceAnalysisActive = false;

// Main function to load and render all teams performance analysis
window.loadTeamsPerformanceAnalysis = async function() {
    console.log('📊 [TEAMS-PERF] Starting teams performance analysis...');
    window.teamsPerformanceAnalysisActive = true;
    
    try {
        const apiUrl = 'http://localhost:5002/api/teams/analytics/performance';
        console.log('📊 [TEAMS-PERF] Fetching from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [TEAMS-PERF] Data loaded:', {
            weekly: data.weekly_trends?.length,
            projections: data.projections?.length,
            states: data.states_performance?.length
        });
        
        // Aggressive chart cleanup to prevent canvas reuse errors
        console.log('🗑️ [TEAMS-PERF] Destroying old charts...');
        
        // Method 1: Destroy from our storage
        Object.values(teamsCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (e) {
                    console.warn('⚠️ [TEAMS-PERF] Error destroying chart:', e.message);
                }
            }
        });
        Object.keys(teamsCharts).forEach(key => delete teamsCharts[key]);
        
        // Method 2: Destroy any Chart.js instances on our canvases
        const canvasIds = [
            'teamsActivityWeeklyChart',
            'teamsActivityDistributionChart',
            'teamsPerformanceMetricsChart',
            'statesActiveInactiveChart',
            'teamsStatesProductivityAvailabilityChart',
            'teamsStatesProductivityEfficiencyChart'
        ];
        
        canvasIds.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                // Get Chart.js instance from canvas if exists
                const chartInstance = Chart.getChart(canvas);
                if (chartInstance) {
                    try {
                        chartInstance.destroy();
                        console.log(`✅ [TEAMS-PERF] Destroyed existing chart on ${canvasId}`);
                    } catch (e) {
                        console.warn(`⚠️ [TEAMS-PERF] Error destroying chart on ${canvasId}:`, e.message);
                    }
                }
            }
        });
        
        // Render all charts
        renderChart1_TeamsActivityWeekly(data.weekly_trends, data.projections);
        console.log('✅ [TEAMS-PERF] Chart 1 rendered');
        
        renderChart2_ActivityDistribution(data.activity_distribution);
        console.log('✅ [TEAMS-PERF] Chart 2 rendered');
        
        renderChart3_PerformanceMetrics(data.performance_metrics);
        console.log('✅ [TEAMS-PERF] Chart 3 rendered');
        
        renderChart4_StatesActiveInactive(data.states_weekly);
        console.log('✅ [TEAMS-PERF] Chart 4 rendered');
        
        renderChart5_StatesProdAvail(data.states_performance);
        console.log('✅ [TEAMS-PERF] Chart 5 rendered');
        
        renderChart6_StatesProdEff(data.states_performance);
        console.log('✅ [TEAMS-PERF] Chart 6 rendered');
        
        renderChart7_AIRecommendations(data.recommendations, data.summary);
        console.log('✅ [TEAMS-PERF] Chart 7 rendered');
        
        console.log('✅ [TEAMS-PERF] All charts rendered!');
        
    } catch (error) {
        console.error('❌ [TEAMS-PERF] Error loading teams performance analysis:', error);
        const container = document.getElementById('teams-performance-analytics');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.innerHTML = `<strong>Error loading charts:</strong> ${error.message}. Please ensure the backend server is running.`;
            container.prepend(errorDiv);
        }
    }
};

// Chart 1: Teams Activity by Week + Projections (Line Chart)
function renderChart1_TeamsActivityWeekly(weeklyData, projections) {
    const canvas = document.getElementById('teamsActivityWeeklyChart');
    if (!canvas) {
        console.warn('❌ Canvas not found: teamsActivityWeeklyChart');
        return;
    }
    
    const weeks = weeklyData.map(w => w.week_label);
    const projWeeks = projections.map(p => p.week_label);
    const allWeeks = [...weeks, ...projWeeks];
    
    // Historical data
    const activeHist = weeklyData.map(w => w.active);
    const inactiveHist = weeklyData.map(w => w.inactive);
    const busyHist = weeklyData.map(w => w.busy);
    
    // Projected data (pad historical with nulls)
    const activeProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.active)];
    const inactiveProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.inactive)];
    const busyProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.busy)];
    
    // Pad historical with nulls for projection weeks
    const activeHistFull = [...activeHist, ...Array(projections.length).fill(null)];
    const inactiveHistFull = [...inactiveHist, ...Array(projections.length).fill(null)];
    const busyHistFull = [...busyHist, ...Array(projections.length).fill(null)];
    
    teamsCharts.weekly = new Chart(canvas, {
        type: 'line',
        data: {
            labels: allWeeks,
            datasets: [
                {
                    label: 'Active',
                    data: activeHistFull,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Active (Projected)',
                    data: activeProj,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Inactive',
                    data: inactiveHistFull,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Inactive (Projected)',
                    data: inactiveProj,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Busy',
                    data: busyHistFull,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Busy (Projected)',
                    data: busyProj,
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, padding: 8, font: { size: 10 } }
                },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Teams' } },
                x: { title: { display: true, text: 'Week' } }
            }
        }
    });
}

// Chart 2: Activity Distribution (Doughnut)
function renderChart2_ActivityDistribution(distribution) {
    const canvas = document.getElementById('teamsActivityDistributionChart');
    if (!canvas) return;
    
    teamsCharts.distribution = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Inactive', 'Busy', 'Idle'],
            datasets: [{
                data: [
                    distribution.active,
                    distribution.inactive,
                    distribution.busy,
                    distribution.idle
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        }
    });
    
    // Custom legend
    const legendEl = document.getElementById('activityDistributionLegend');
    if (legendEl) {
        legendEl.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem; font-size: 0.65rem;">
                <div><span style="color: #10b981;">●</span> Active: ${distribution.active}</div>
                <div><span style="color: #ef4444;">●</span> Inactive: ${distribution.inactive}</div>
                <div><span style="color: #f59e0b;">●</span> Busy: ${distribution.busy}</div>
                <div><span style="color: #6b7280;">●</span> Idle: ${distribution.idle}</div>
            </div>
        `;
    }
}

// Chart 3: Performance Metrics (Line Chart)
function renderChart3_PerformanceMetrics(metrics) {
    const canvas = document.getElementById('teamsPerformanceMetricsChart');
    if (!canvas) return;
    
    teamsCharts.metrics = new Chart(canvas, {
        type: 'line',
        data: {
            labels: metrics.map(m => m.week_label),
            datasets: [
                {
                    label: 'Productivity',
                    data: metrics.map(m => m.productivity),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Availability (%)',
                    data: metrics.map(m => m.availability),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Efficiency (%)',
                    data: metrics.map(m => m.efficiency),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } }
            },
            scales: {
                y: { beginAtZero: true },
                x: { title: { display: true, text: 'Week' } }
            }
        }
    });
}

// Chart 4: States Active vs Inactive (Stacked Bar)
function renderChart4_StatesActiveInactive(statesWeekly) {
    const canvas = document.getElementById('statesActiveInactiveChart');
    if (!canvas) return;
    
    const states = Object.keys(statesWeekly);
    const weeks = statesWeekly[states[0]]?.weeks || [];
    
    teamsCharts.statesWeekly = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: weeks.map(w => w.week),
            datasets: states.slice(0, 5).map((state, idx) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                return {
                    label: `${state} (Active)`,
                    data: statesWeekly[state].weeks.map(w => w.active),
                    backgroundColor: colors[idx],
                    stack: 'Stack 0'
                };
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, padding: 6, font: { size: 9 } } }
            },
            scales: {
                y: { stacked: true, beginAtZero: true },
                x: { stacked: true }
            }
        }
    });
}

// Chart 5: States Productivity vs Availability (Horizontal Bar)
function renderChart5_StatesProdAvail(statesPerf) {
    const canvas = document.getElementById('teamsStatesProductivityAvailabilityChart');
    if (!canvas) return;
    
    const sorted = [...statesPerf].sort((a, b) => b.productivity - a.productivity);
    
    teamsCharts.prodAvail = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s.state),
            datasets: [
                {
                    label: 'Productivity',
                    data: sorted.map(s => s.productivity),
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'Availability (%)',
                    data: sorted.map(s => s.availability),
                    backgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { position: 'top' } },
            scales: { x: { beginAtZero: true } }
        }
    });
}

// Chart 6: States Productivity vs Efficiency (Horizontal Bar)
function renderChart6_StatesProdEff(statesPerf) {
    const canvas = document.getElementById('teamsStatesProductivityEfficiencyChart');
    if (!canvas) return;
    
    const sorted = [...statesPerf].sort((a, b) => b.productivity - a.productivity);
    
    teamsCharts.prodEff = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s.state),
            datasets: [
                {
                    label: 'Productivity',
                    data: sorted.map(s => s.productivity),
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'Efficiency (%)',
                    data: sorted.map(s => s.efficiency),
                    backgroundColor: '#f59e0b'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { position: 'top' } },
            scales: { x: { beginAtZero: true, max: 100 } }
        }
    });
}

// Chart 7: AI Recommendations
function renderChart7_AIRecommendations(recommendations, summary) {
    // Update summary cards
    document.getElementById('ai-teams-total-teams').textContent = summary.total_teams;
    document.getElementById('ai-teams-avg-productivity').textContent = `${summary.avg_productivity}%`;
    document.getElementById('ai-teams-avg-rating').textContent = summary.avg_rating.toFixed(1);
    document.getElementById('ai-teams-projected-growth').textContent = `${summary.projected_growth > 0 ? '+' : ''}${summary.projected_growth.toFixed(1)}%`;
    
    // Render recommendation cards
    const container = document.getElementById('ai-teams-recommendations-list');
    if (container) {
        container.innerHTML = recommendations.map((rec, idx) => `
            <div class="ai-recommendation-card ${rec.type}" style="margin-bottom: 0.75rem;">
                <div class="recommendation-header">
                    <h6 style="margin: 0; font-size: 0.85rem;">
                        <i class="fas ${rec.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2"></i>
                        ${rec.title}
                    </h6>
                    <span class="badge badge-${rec.type === 'warning' ? 'warning' : 'success'}" style="font-size: 0.7rem;">${rec.category}</span>
                </div>
                <p style="margin: 0.5rem 0; font-size: 0.75rem; color: #6b7280;">${rec.description}</p>
                <div class="recommendation-action" style="font-size: 0.75rem;">
                    <i class="fas fa-lightbulb me-2"></i><strong>Action:</strong> ${rec.action}
                </div>
            </div>
        `).join('');
    }
}

console.log('✅ [TEAMS-PERF] teams-performance.js loaded successfully');

