# AIFF Database Documentation

## 🗄️ Database Architecture Overview

The AIFF system uses PostgreSQL as the primary database with Redis for caching and session management. The database is designed to support high-performance operations, real-time analytics, and scalable field team management.

## 📊 Database Schema Design

### Core Entity Relationships
```
┌─────────────────────────────────────────────────────────────────┐
│                        Database Schema                         │
├─────────────────────────────────────────────────────────────────┤
│  Users ──┐                                                      │
│          │                                                      │
│  Teams ──┼── Assignments ── Tickets                            │
│          │                                                      │
│  Analytics ──┐                                                  │
│              │                                                  │
│  Performance Metrics ──┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 👥 Users and Authentication

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### User Roles and Permissions
```sql
-- User roles enumeration
CREATE TYPE user_role AS ENUM (
    'admin',        -- System administrator
    'manager',      -- Field operations manager
    'supervisor',   -- Team supervisor
    'technician',   -- Field technician
    'viewer'        -- Read-only access
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    role VARCHAR(20) NOT NULL,
    permission_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (role, permission_id)
);
```

## 👥 Teams and Field Operations

### Teams Table
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Performance metrics
    tickets_completed INTEGER DEFAULT 0,
    customer_rating DECIMAL(3,2) DEFAULT 0.00,
    response_time INTEGER DEFAULT 0, -- minutes
    completion_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
    efficiency DECIMAL(5,2) DEFAULT 0.00, -- percentage
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_teams_zone ON teams(zone);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_teams_performance ON teams(tickets_completed, customer_rating);
```

### Team Zones and Coverage
```sql
-- Zones table for geographic management
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    coordinates POINT, -- PostGIS point for geographic data
    coverage_area POLYGON, -- PostGIS polygon for coverage area
    population INTEGER,
    priority_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team zone assignments
CREATE TABLE team_zones (
    team_id INTEGER REFERENCES teams(id),
    zone_id INTEGER REFERENCES zones(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (team_id, zone_id)
);
```

## 🎫 Tickets and Service Requests

### Tickets Table
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Classification
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    category VARCHAR(50),
    subcategory VARCHAR(50),
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    status_history JSONB, -- Track status changes
    
    -- Assignment
    assigned_team INTEGER REFERENCES teams(id),
    assigned_to VARCHAR(100),
    assigned_by INTEGER REFERENCES users(id),
    
    -- Location and context
    zone VARCHAR(100),
    location VARCHAR(200),
    coordinates POINT, -- PostGIS point for precise location
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- SLA tracking
    sla_deadline TIMESTAMP WITH TIME ZONE,
    sla_breach BOOLEAN DEFAULT FALSE,
    
    -- Customer information
    customer_name VARCHAR(100),
    customer_contact VARCHAR(100),
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    
    -- Metadata
    tags TEXT[], -- Array of tags
    attachments JSONB, -- File attachments metadata
    custom_fields JSONB -- Flexible custom fields
);

-- Indexes for performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_zone ON tickets(zone);
CREATE INDEX idx_tickets_assigned_team ON tickets(assigned_team);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_due_date ON tickets(due_date);
CREATE INDEX idx_tickets_customer_rating ON tickets(customer_rating);
```

### Ticket Status Workflow
```sql
-- Ticket status enumeration
CREATE TYPE ticket_status AS ENUM (
    'open',         -- New ticket
    'assigned',     -- Assigned to team
    'in_progress',  -- Work in progress
    'on_hold',      -- Temporarily paused
    'pending',      -- Waiting for customer
    'resolved',     -- Work completed
    'closed',       -- Ticket closed
    'cancelled'     -- Ticket cancelled
);

-- Priority levels
CREATE TYPE ticket_priority AS ENUM (
    'low',      -- Non-urgent
    'medium',    -- Normal priority
    'high',      -- Urgent
    'critical'   -- Emergency
);
```

### Assignments and Relationships
```sql
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    team_id INTEGER REFERENCES teams(id),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Assignment details
    assignment_type VARCHAR(20) DEFAULT 'manual', -- manual, auto, bulk
    status VARCHAR(20) DEFAULT 'assigned',
    notes TEXT,
    
    -- SLA tracking
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics
    time_spent INTEGER, -- minutes
    quality_score DECIMAL(3,2),
    
    -- Metadata
    assignment_criteria JSONB, -- Criteria used for assignment
    feedback JSONB -- Team feedback on assignment
);

-- Indexes for performance
CREATE INDEX idx_assignments_ticket_id ON assignments(ticket_id);
CREATE INDEX idx_assignments_team_id ON assignments(team_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_assigned_at ON assignments(assigned_at);
```

## 📊 Analytics and Performance Data

### Analytics Table
```sql
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    
    -- Metric identification
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- performance, efficiency, satisfaction
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20), -- percentage, count, minutes, rating
    
    -- Context
    team_id INTEGER REFERENCES teams(id),
    zone VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Time dimension
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Additional context
    metadata JSONB, -- Flexible additional data
    tags TEXT[], -- Categorization tags
    
    -- Data quality
    confidence_score DECIMAL(3,2) DEFAULT 1.00,
    data_source VARCHAR(50) DEFAULT 'system'
);

-- Indexes for performance
CREATE INDEX idx_analytics_metric_name ON analytics(metric_name);
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_team_id ON analytics(team_id);
CREATE INDEX idx_analytics_zone ON analytics(zone);
CREATE INDEX idx_analytics_date_recorded ON analytics(date_recorded);
CREATE INDEX idx_analytics_period ON analytics(period_start, period_end);
```

### Performance Metrics Views
```sql
-- Team performance summary view
CREATE VIEW team_performance_summary AS
SELECT 
    t.id,
    t.name,
    t.zone,
    t.tickets_completed,
    t.customer_rating,
    t.response_time,
    t.completion_rate,
    t.efficiency,
    t.status,
    COUNT(a.id) as active_assignments,
    AVG(a.time_spent) as avg_time_spent,
    AVG(a.quality_score) as avg_quality_score
FROM teams t
LEFT JOIN assignments a ON t.id = a.team_id 
    AND a.status = 'assigned'
GROUP BY t.id, t.name, t.zone, t.tickets_completed, 
         t.customer_rating, t.response_time, t.completion_rate, 
         t.efficiency, t.status;

-- Zone performance summary view
CREATE VIEW zone_performance_summary AS
SELECT 
    t.zone,
    COUNT(t.id) as total_teams,
    COUNT(CASE WHEN t.is_active THEN 1 END) as active_teams,
    AVG(t.tickets_completed) as avg_tickets_completed,
    AVG(t.customer_rating) as avg_customer_rating,
    AVG(t.response_time) as avg_response_time,
    AVG(t.completion_rate) as avg_completion_rate,
    AVG(t.efficiency) as avg_efficiency,
    COUNT(tk.id) as total_tickets,
    COUNT(CASE WHEN tk.status = 'open' THEN 1 END) as open_tickets,
    COUNT(CASE WHEN tk.status = 'closed' THEN 1 END) as closed_tickets
FROM teams t
LEFT JOIN tickets tk ON t.zone = tk.zone
GROUP BY t.zone;
```

## 🔄 Real-time Data and Caching

### Redis Cache Structure
```redis
# Session Management
session:{user_id} -> {
    "user_id": "123",
    "username": "john_doe",
    "role": "admin",
    "permissions": ["read", "write", "delete"],
    "expires": "2024-01-01T00:00:00Z"
}

# Team Performance Cache
team:performance:{team_id} -> {
    "tickets_completed": 45,
    "customer_rating": 4.8,
    "response_time": 25,
    "completion_rate": 92.5,
    "efficiency": 88.3,
    "last_updated": "2024-01-01T00:00:00Z"
}

# Zone Analytics Cache
zone:analytics:{zone_name} -> {
    "total_teams": 5,
    "active_teams": 4,
    "open_tickets": 12,
    "closed_tickets": 38,
    "productivity": 4.6,
    "efficiency": 85.2,
    "last_updated": "2024-01-01T00:00:00Z"
}

# API Rate Limiting
rate_limit:{user_id}:{endpoint} -> {
    "count": 45,
    "window_start": "2024-01-01T00:00:00Z",
    "limit": 100
}

# Real-time Updates
realtime:updates -> {
    "ticket_updates": ["ticket_123", "ticket_456"],
    "team_updates": ["team_1", "team_2"],
    "analytics_updates": ["zone_kl", "zone_penang"]
}
```

## 📈 Data Aggregation and Reporting

### Materialized Views for Performance
```sql
-- Daily performance metrics
CREATE MATERIALIZED VIEW daily_performance_metrics AS
SELECT 
    DATE(created_at) as date,
    zone,
    COUNT(*) as tickets_created,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as tickets_closed,
    AVG(CASE WHEN customer_rating IS NOT NULL THEN customer_rating END) as avg_rating,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_resolution_hours
FROM tickets
GROUP BY DATE(created_at), zone;

-- Refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_performance_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW daily_performance_metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (using pg_cron extension)
SELECT cron.schedule('refresh-daily-metrics', '0 1 * * *', 'SELECT refresh_daily_performance_metrics();');
```

### Data Partitioning
```sql
-- Partition tickets table by date for better performance
CREATE TABLE tickets_partitioned (
    LIKE tickets INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE tickets_2024_01 PARTITION OF tickets_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE tickets_2024_02 PARTITION OF tickets_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month
```

## 🔍 Full-Text Search

### Search Configuration
```sql
-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search indexes
CREATE INDEX idx_tickets_title_search ON tickets USING gin(to_tsvector('english', title));
CREATE INDEX idx_tickets_description_search ON tickets USING gin(to_tsvector('english', description));
CREATE INDEX idx_teams_name_search ON teams USING gin(to_tsvector('english', name));

-- Search function
CREATE OR REPLACE FUNCTION search_tickets(search_query TEXT)
RETURNS TABLE(
    id INTEGER,
    ticket_number VARCHAR(20),
    title VARCHAR(200),
    description TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.ticket_number,
        t.title,
        t.description,
        ts_rank(to_tsvector('english', t.title || ' ' || COALESCE(t.description, '')), 
                plainto_tsquery('english', search_query)) as rank
    FROM tickets t
    WHERE to_tsvector('english', t.title || ' ' || COALESCE(t.description, '')) 
          @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

## 🔒 Security and Access Control

### Row-Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for different roles
CREATE POLICY tickets_manager_policy ON tickets
    FOR ALL TO manager_role
    USING (true);

CREATE POLICY tickets_technician_policy ON tickets
    FOR ALL TO technician_role
    USING (assigned_team IN (
        SELECT id FROM teams WHERE zone IN (
            SELECT zone FROM teams WHERE id IN (
                SELECT team_id FROM user_teams WHERE user_id = current_user_id()
            )
        )
    ));

CREATE POLICY tickets_viewer_policy ON tickets
    FOR SELECT TO viewer_role
    USING (true);
```

### Data Encryption
```sql
-- Encrypt sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt customer contact information
ALTER TABLE tickets ADD COLUMN customer_contact_encrypted BYTEA;
UPDATE tickets SET customer_contact_encrypted = pgp_sym_encrypt(customer_contact, 'encryption_key');

-- Create function to decrypt
CREATE OR REPLACE FUNCTION decrypt_customer_contact(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, 'encryption_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Data Backup and Recovery

### Backup Strategy
```sql
-- Create backup script
#!/bin/bash
# backup_database.sh

# Full backup
pg_dump -h localhost -U aiff -d aiff_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Incremental backup (WAL archiving)
pg_basebackup -h localhost -U aiff -D /backup/base_$(date +%Y%m%d_%H%M%S) -Ft -z -P

# Point-in-time recovery setup
# In postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backup/wal/%f'
# max_wal_senders = 3
# wal_keep_segments = 64
```

### Data Retention Policies
```sql
-- Create data retention function
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old analytics data (older than 2 years)
    DELETE FROM analytics 
    WHERE date_recorded < CURRENT_DATE - INTERVAL '2 years';
    
    -- Archive old tickets (older than 1 year)
    INSERT INTO tickets_archive 
    SELECT * FROM tickets 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    DELETE FROM tickets 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Clean up old sessions
    DELETE FROM user_sessions 
    WHERE last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

## 🚀 Performance Optimization

### Query Optimization
```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT t.*, tm.name as team_name, tm.zone
FROM tickets t
LEFT JOIN teams tm ON t.assigned_team = tm.id
WHERE t.status = 'open'
  AND t.zone = 'Kuala Lumpur'
  AND t.created_at >= CURRENT_DATE - INTERVAL '7 days';

-- Create composite indexes for common queries
CREATE INDEX idx_tickets_status_zone_date ON tickets(status, zone, created_at);
CREATE INDEX idx_tickets_team_status ON tickets(assigned_team, status);
CREATE INDEX idx_analytics_team_date ON analytics(team_id, date_recorded);
```

### Connection Pooling
```sql
-- Configure connection pooling
-- In postgresql.conf:
# max_connections = 200
# shared_buffers = 256MB
# effective_cache_size = 1GB
# work_mem = 4MB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
```

## 📊 Monitoring and Maintenance

### Database Monitoring
```sql
-- Create monitoring views
CREATE VIEW database_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'public';

-- Table size monitoring
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Maintenance Tasks
```sql
-- Automated maintenance
CREATE OR REPLACE FUNCTION maintenance_tasks()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Vacuum tables
    VACUUM ANALYZE;
    
    -- Reindex if needed
    IF (SELECT COUNT(*) FROM pg_stat_user_tables WHERE n_dead_tup > 1000) > 0 THEN
        REINDEX DATABASE aiff_db;
    END IF;
    
    -- Update materialized views
    REFRESH MATERIALIZED VIEW daily_performance_metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance
SELECT cron.schedule('maintenance-tasks', '0 3 * * *', 'SELECT maintenance_tasks();');
```

---

This database documentation provides comprehensive information about the AIFF database design, schema, performance optimization, security, and maintenance strategies.
