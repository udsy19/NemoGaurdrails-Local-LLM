#!/bin/bash

echo "🚀 Starting AI Safety System..."
echo "=============================="

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Start backend
echo "Starting backend..."
./start_backend.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 10

# Start frontend
echo "Starting frontend..."
./start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ System started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait