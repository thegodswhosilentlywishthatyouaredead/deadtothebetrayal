#!/usr/bin/env python3
"""
Production server for Intelligent Field Assignment System
Combines all microservices into a single production server
"""

import os
import sys
import subprocess
import threading
import time
import signal
from pathlib import Path

# Add services to path
sys.path.append(str(Path(__file__).parent / "services" / "gateway"))
sys.path.append(str(Path(__file__).parent / "services" / "auth"))
sys.path.append(str(Path(__file__).parent / "services" / "tickets"))
sys.path.append(str(Path(__file__).parent / "services" / "analytics"))
sys.path.append(str(Path(__file__).parent / "services" / "ai"))

def start_service(service_name, port, module_path):
    """Start a microservice in a separate thread"""
    try:
        print(f"🚀 Starting {service_name} on port {port}")
        
        # Import and run the service
        if service_name == "gateway":
            from services.gateway.main import app
            app.run(host='0.0.0.0', port=port, debug=False)
        elif service_name == "auth":
            from services.auth.main import app
            app.run(host='0.0.0.0', port=port, debug=False)
        elif service_name == "tickets":
            from services.tickets.main import app
            app.run(host='0.0.0.0', port=port, debug=False)
        elif service_name == "analytics":
            from services.analytics.main import app
            app.run(host='0.0.0.0', port=port, debug=False)
        elif service_name == "ai":
            from services.ai.main import app
            app.run(host='0.0.0.0', port=port, debug=False)
            
    except Exception as e:
        print(f"❌ Error starting {service_name}: {e}")

def start_frontend():
    """Start the frontend server"""
    try:
        print("🌐 Starting frontend server...")
        frontend_path = Path(__file__).parent / "client" / "public"
        
        # Start HTTP server for frontend
        import http.server
        import socketserver
        import os
        
        os.chdir(frontend_path)
        
        PORT = int(os.environ.get('FRONTEND_PORT', 8080))
        
        class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
            def end_headers(self):
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                super().end_headers()
        
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🌐 Frontend server running on port {PORT}")
            httpd.serve_forever()
            
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

def main():
    """Main production server"""
    print("🚀 Starting Intelligent Field Assignment System")
    print("=" * 50)
    
    # Set environment variables
    os.environ.setdefault('GATEWAY_PORT', '8080')
    os.environ.setdefault('AUTH_PORT', '8000')
    os.environ.setdefault('TICKETS_PORT', '8001')
    os.environ.setdefault('ANALYTICS_PORT', '8002')
    os.environ.setdefault('AI_PORT', '8003')
    
    # Start services in separate threads
    services = [
        ("auth", 8000, "services.auth.main"),
        ("tickets", 8001, "services.tickets.main"),
        ("analytics", 8002, "services.analytics.main"),
        ("ai", 8003, "services.ai.main"),
    ]
    
    # Start microservices
    threads = []
    for service_name, port, module_path in services:
        thread = threading.Thread(
            target=start_service,
            args=(service_name, port, module_path),
            daemon=True
        )
        thread.start()
        threads.append(thread)
        time.sleep(2)  # Stagger startup
    
    # Wait a bit for services to start
    time.sleep(5)
    
    # Start gateway (main entry point)
    print("🌐 Starting Gateway (Main Entry Point)")
    start_service("gateway", 8080, "services.gateway.main")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        sys.exit(0)

if __name__ == "__main__":
    main()
