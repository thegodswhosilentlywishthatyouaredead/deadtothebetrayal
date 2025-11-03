// TICKETS PERFORMANCE ANALYSIS - Complete Standalone Module
// This module handles ALL performance analysis using ticketv2 API data
console.log('🚀 [PERF] tickets-performance.js loading...');

// Global chart storage
if (!window.perfCharts) {
    window.perfCharts = {};
}

// Set Chart.js defaults
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.size = 11;
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
}

// Main function - load all performance data and render charts
window.loadTicketsPerformanceAnalysis = async function() {
    console.log('📊 [PERF] Starting performance analysis...');
    
    try {
        // Fetch data from ticketv2 analytics API
        const url = 'http://localhost:5002/api/ticketv2/analytics/performance';
        console.log('📊 [PERF] Fetching from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [PERF] Data loaded:', {
            weekly: data.weekly_trends?.length,
            projections: data.projections?.length,
            performanceMetrics: data.performance_metrics?.length,
            states: Object.keys(data.states_weekly || {}).length,
            statesPerf: data.states_performance?.length
        });
        console.log('📊 [PERF] Sample weekly trends:', data.weekly_trends?.slice(0, 2));
        console.log('📊 [PERF] Sample performance metrics:', data.performance_metrics?.slice(0, 2));
        console.log('📊 [PERF] Sample state performance data:', data.states_performance?.slice(0, 3));
        
        // Validate critical data
        if (!data.performance_metrics || data.performance_metrics.length === 0) {
            console.error('❌ [PERF] No performance_metrics in API response!');
        }
        
        // Aggressive chart cleanup to prevent canvas reuse errors
        console.log('🗑️ [PERF] Destroying old charts...');
        
        // Method 1: Destroy from our storage
        Object.values(window.perfCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (e) {
                    console.warn('⚠️ [PERF] Error destroying chart:', e.message);
                }
            }
        });
        window.perfCharts = {};
        
        // Method 2: Destroy any Chart.js instances on our canvases
        const canvasIds = [
            'ticketsByStatusWeeklyChart',
            'ticketsStatusDistributionChart',
            'ticketsPerformanceMetricsChart',
            'ticketsStatesOpenVsCompletedChart',
            'ticketsStatesProductivityAvailabilityChart',
            'ticketsStatesProductivityEfficiencyChart'
        ];
        
        canvasIds.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const chartInstance = Chart.getChart(canvas);
                if (chartInstance) {
                    try {
                        chartInstance.destroy();
                        console.log(`✅ [PERF] Destroyed existing chart on ${canvasId}`);
                    } catch (e) {
                        console.warn(`⚠️ [PERF] Error destroying chart on ${canvasId}:`, e.message);
                    }
                }
            }
        });
        
        // Render all 7 charts
        renderChart1_WeeklyTrends(data.weekly_trends, data.projections);
        renderChart2_StatusDist(data.status_distribution);
        renderChart3_PerformanceMetrics(data.performance_metrics);
        renderChart4_StatesOpenClosed(data.states_weekly);
        renderChart5_ProdVsAvail(data.states_performance);
        renderChart6_ProdVsEff(data.states_performance);
        renderSection7_AIRecommendations(data.recommendations, data.summary);
        
        console.log('✅ [PERF] All charts rendered!');
        
    } catch (error) {
        console.error('❌ [PERF] Error:', error);
        showError('Failed to load performance data: ' + error.message);
    }
};

// Chart 1: Weekly Trends with 4-Week Projection
function renderChart1_WeeklyTrends(weeklyData, projections) {
    const canvas = document.getElementById('ticketsByStatusWeeklyChart');
    if (!canvas) {
        console.warn('❌ Canvas not found: ticketsByStatusWeeklyChart');
        return;
    }
    
    const weeks = weeklyData.map(w => w.week_label);
    const projWeeks = projections.map(p => p.week_label);
    const allWeeks = [...weeks, ...projWeeks];
    
    // Historical data
    const openHist = weeklyData.map(w => w.open);
    const progHist = weeklyData.map(w => w.in_progress);
    const compHist = weeklyData.map(w => w.completed);
    const cancHist = weeklyData.map(w => w.cancelled);
    
    // Projected data (pad historical with nulls)
    const openProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.open)];
    const progProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.in_progress)];
    const compProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.completed)];
    const cancProj = [...Array(weeks.length).fill(null), ...projections.map(p => p.cancelled)];
    
    // Pad historical with nulls for projection weeks
    const openHistFull = [...openHist, ...Array(projections.length).fill(null)];
    const progHistFull = [...progHist, ...Array(projections.length).fill(null)];
    const compHistFull = [...compHist, ...Array(projections.length).fill(null)];
    const cancHistFull = [...cancHist, ...Array(projections.length).fill(null)];
    
    window.perfCharts.weekly = new Chart(canvas, {
        type: 'line',
        data: {
            labels: allWeeks,
            datasets: [
                {
                    label: 'Open',
                    data: openHistFull,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Open (Projected)',
                    data: openProj,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: 'In Progress',
                    data: progHistFull,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'In Progress (Projected)',
                    data: progProj,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: 'Completed',
                    data: compHistFull,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Completed (Projected)',
                    data: compProj,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: 'Cancelled',
                    data: cancHistFull,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Cancelled (Projected)',
                    data: cancProj,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.05)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 20, padding: 10, font: { size: 10 } } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, title: { display: true, text: 'Tickets' } }
            }
        }
    });
    console.log('✅ [PERF] Chart 1 rendered');
}

// Chart 2: Status Distribution (Doughnut)
function renderChart2_StatusDist(statusDist) {
    const canvas = document.getElementById('ticketsStatusDistributionChart');
    if (!canvas) return;
    
    // Update counts
    document.getElementById('status-open-count').textContent = statusDist.open;
    document.getElementById('status-inprogress-count').textContent = statusDist.in_progress;
    document.getElementById('status-completed-count').textContent = statusDist.completed;
    document.getElementById('status-cancelled-count').textContent = statusDist.cancelled;
    
    window.perfCharts.statusDist = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
            datasets: [{
                data: [statusDist.open, statusDist.in_progress, statusDist.completed, statusDist.cancelled],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 8,
                    bodyFont: { size: 10 },
                    displayColors: false
                }
            }
        }
    });
    console.log('✅ [PERF] Chart 2 rendered');
}

// Chart 3: Performance Metrics (Productivity, Availability, Efficiency)
function renderChart3_PerformanceMetrics(perfData) {
    console.log('📊 [PERF] Chart 3 - Starting renderChart3_PerformanceMetrics...');
    console.log('📊 [PERF] Chart 3 - perfData:', perfData);
    
    const canvas = document.getElementById('ticketsPerformanceMetricsChart');
    if (!canvas) {
        console.error('❌ [PERF] Chart 3 - Canvas not found: ticketsPerformanceMetricsChart');
        return;
    }
    
    // Handle empty or invalid data
    if (!perfData || !Array.isArray(perfData) || perfData.length === 0) {
        console.warn('⚠️ [PERF] Chart 3 - No performance data available, using defaults');
        document.getElementById('avg-productivity')?.setAttribute('textContent', '0.00%');
        document.getElementById('avg-availability')?.setAttribute('textContent', '0.00%');
        document.getElementById('avg-efficiency')?.setAttribute('textContent', '0.00%');
        return;
    }
    
    const labels = perfData.map(w => w.week_label || 'N/A');
    const prodData = perfData.map(w => parseFloat(w.productivity) || 0);
    const availData = perfData.map(w => parseFloat(w.availability) || 0);
    const effData = perfData.map(w => parseFloat(w.efficiency) || 0);
    
    console.log('📊 [PERF] Chart 3 - Data extracted:', {
        labels: labels.length,
        productivity: prodData,
        availability: availData,
        efficiency: effData
    });
    
    // Calculate and display averages with fallbacks
    const avgProd = prodData.length > 0 
        ? (prodData.reduce((a,b)=>a+b,0)/prodData.length).toFixed(2) 
        : '0.00';
    const avgAvail = availData.length > 0 
        ? (availData.reduce((a,b)=>a+b,0)/availData.length).toFixed(2) 
        : '0.00';
    const avgEff = effData.length > 0 
        ? (effData.reduce((a,b)=>a+b,0)/effData.length).toFixed(2) 
        : '0.00';
    
    console.log('📊 [PERF] Chart 3 - Calculated averages:', { avgProd, avgAvail, avgEff });
    
    // Update DOM elements
    const prodEl = document.getElementById('avg-productivity');
    const availEl = document.getElementById('avg-availability');
    const effEl = document.getElementById('avg-efficiency');
    
    if (prodEl) {
        prodEl.textContent = `${avgProd}%`;
        console.log('✅ [PERF] Chart 3 - Updated avg-productivity:', prodEl.textContent);
    } else {
        console.error('❌ [PERF] Chart 3 - Element not found: avg-productivity');
    }
    
    if (availEl) {
        availEl.textContent = `${avgAvail}%`;
        console.log('✅ [PERF] Chart 3 - Updated avg-availability:', availEl.textContent);
    } else {
        console.error('❌ [PERF] Chart 3 - Element not found: avg-availability');
    }
    
    if (effEl) {
        effEl.textContent = `${avgEff}%`;
        console.log('✅ [PERF] Chart 3 - Updated avg-efficiency:', effEl.textContent);
    } else {
        console.error('❌ [PERF] Chart 3 - Element not found: avg-efficiency');
    }
    
    // Render the chart
    try {
        window.perfCharts.perfMetrics = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Productivity',
                        data: prodData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Availability',
                        data: availData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Efficiency',
                        data: effData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
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
                        position: 'top', 
                        labels: { 
                            usePointStyle: true, 
                            padding: 15, 
                            font: { size: 11, weight: '500' } 
                        } 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: { 
                        beginAtZero: true, 
                        max: 100, 
                        ticks: { 
                            callback: v => v + '%',
                            font: { size: 10 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        console.log('✅ [PERF] Chart 3 - Chart rendered successfully');
    } catch (error) {
        console.error('❌ [PERF] Chart 3 - Error rendering chart:', error);
    }
    
    console.log('✅ [PERF] Chart 3 completed');
}

// Chart 4: States Open vs Completed (Stacked Bar)
function renderChart4_StatesOpenClosed(statesWeekly) {
    const canvas = document.getElementById('ticketsStatesOpenVsCompletedChart');
    if (!canvas) return;
    
    // Get selected state or aggregate all
    const selector = document.getElementById('stateSelector');
    const selectedState = selector?.value || 'all';
    
    // Populate state selector if empty
    if (selector && selector.options.length === 1) {
        Object.keys(statesWeekly).sort().forEach(state => {
            const opt = document.createElement('option');
            opt.value = state;
            opt.textContent = state;
            selector.appendChild(opt);
        });
        
        // Add change listener
        selector.addEventListener('change', () => {
            if (window.perfCharts.statesOpen) window.perfCharts.statesOpen.destroy();
            renderChart4_StatesOpenClosed(statesWeekly);
        });
    }
    
    let chartData;
    if (selectedState === 'all') {
        // Aggregate all states
        const firstState = Object.values(statesWeekly)[0] || [];
        chartData = firstState.map((_, idx) => {
            const week = { week_label: '', open: 0, completed: 0 };
            Object.values(statesWeekly).forEach(stateData => {
                if (stateData[idx]) {
                    week.week_label = stateData[idx].week_label;
                    week.open += stateData[idx].open;
                    week.completed += stateData[idx].completed;
                }
            });
            return week;
        });
    } else {
        chartData = statesWeekly[selectedState] || [];
    }
    
    window.perfCharts.statesOpen = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: chartData.map(w => w.week_label),
            datasets: [
                {
                    label: 'Open',
                    data: chartData.map(w => w.open),
                    backgroundColor: '#f59e0b'
                },
                {
                    label: 'Completed',
                    data: chartData.map(w => w.completed),
                    backgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: selectedState === 'all' ? 'All States' : selectedState }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
    console.log('✅ [PERF] Chart 4 rendered');
}

// Chart 5: Productivity vs Availability (Horizontal Bar)
function renderChart5_ProdVsAvail(statesPerf) {
    const canvas = document.getElementById('ticketsStatesProductivityAvailabilityChart');
    if (!canvas) return;
    
    const sorted = [...statesPerf].sort((a,b) => b.productivity - a.productivity);
    
    window.perfCharts.prodAvail = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s.state),
            datasets: [
                {
                    label: 'Productivity (%)',
                    data: sorted.map(s => s.productivity),
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Availability (%)',
                    data: sorted.map(s => s.availability),
                    backgroundColor: '#3b82f6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { beginAtZero: true, max: 100 }
            }
        }
    });
    console.log('✅ [PERF] Chart 5 rendered');
}

// Chart 6: Productivity vs Efficiency (Horizontal Bar)
function renderChart6_ProdVsEff(statesPerf) {
    const canvas = document.getElementById('ticketsStatesProductivityEfficiencyChart');
    if (!canvas) return;
    
    console.log('📊 [PERF] Chart 6 - States data:', statesPerf.slice(0, 3));
    console.log('📊 [PERF] Chart 6 - Sample efficiency values:', statesPerf.slice(0, 5).map(s => ({state: s.state, eff: s.efficiency})));
    
    const sorted = [...statesPerf].sort((a,b) => b.productivity - a.productivity);
    
    window.perfCharts.prodEff = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s.state),
            datasets: [
                {
                    label: 'Productivity (%)',
                    data: sorted.map(s => s.productivity),
                    backgroundColor: '#10b981'
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
            scales: {
                x: { beginAtZero: true, max: 100 }
            }
        }
    });
    console.log('✅ [PERF] Chart 6 rendered');
}

// Section 7: AI Recommendations
function renderSection7_AIRecommendations(recommendations, summary) {
    // Update summary cards
    document.getElementById('ai-total-tickets').textContent = summary.total_tickets;
    document.getElementById('ai-completion-rate').textContent = `${summary.completion_rate}%`;
    document.getElementById('ai-active-teams').textContent = summary.active_teams;
    document.getElementById('ai-growth-rate').textContent = `${summary.projected_growth > 0 ? '+' : ''}${summary.projected_growth}%`;
    
    // Render recommendation cards
    const container = document.getElementById('ai-recommendations-list');
    if (container) {
        container.innerHTML = recommendations.map((rec, idx) => `
            <div class="ai-recommendation-card ${rec.type}">
                <div class="recommendation-header">
                    <h6 style="margin: 0; font-size: 0.85rem;">
                        <i class="fas fa-${rec.icon || 'lightbulb'} me-2"></i>${rec.title}
                    </h6>
                    <span class="badge bg-${rec.type === 'warning' ? 'warning' : rec.type === 'success' ? 'success' : 'info'}" style="font-size: 0.65rem;">
                        ${rec.priority || 'MEDIUM'}
                    </span>
                </div>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #6b7280;">${rec.description}</p>
            </div>
        `).join('');
    }
    
    console.log('✅ [PERF] Section 7 rendered');
}

// Error display helper
function showError(message) {
    const container = document.getElementById('tickets-performance-analysis');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.style.margin = '20px';
        errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
        container.prepend(errorDiv);
    }
}

console.log('✅ [PERF] tickets-performance.js loaded successfully');

