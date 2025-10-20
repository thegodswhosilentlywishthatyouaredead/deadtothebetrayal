#!/bin/bash

echo "🚀 Starting AIFF Microservices..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
services=("postgres:5432" "gateway:8085" "auth:8000" "tickets:8001" "analytics:8002" "ai:8003")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if docker-compose exec -T $name curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name is healthy"
    else
        echo "⚠️  $name health check failed"
    fi
done

# Seed database
echo "🌱 Seeding database..."
docker-compose exec -T postgres psql -U aiff -d aiff_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is ready"
    echo "📊 Run 'python scripts/seed_data.py' to seed sample data"
else
    echo "⚠️  Database not ready yet"
fi

echo ""
echo "🎉 Services started successfully!"
echo ""
echo "📋 Service URLs:"
echo "   - API Gateway: http://localhost:8085"
echo "   - pgAdmin: http://localhost:8083 (admin@local.test / admin123)"
echo "   - Frontend: http://localhost:8080"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: docker-compose logs -f [service_name]"
echo "   - Stop services: docker-compose down"
echo "   - Restart service: docker-compose restart [service_name]"
echo ""
