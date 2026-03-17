#!/bin/bash
# ==========================================================
# Stop Travel Planner Autogen + FastChat Services
# Root Path: /home/aida/mtech/omio_mini
# ==========================================================

ROOT_PATH="/home/aida/mtech/omio_mini"
LOG_DIR="$ROOT_PATH/logs"

echo ">>> Stopping all services..."

# -------- Stop Frontend UI (npm run dev) --------
UI_PORT=5173
UI_PID=$(lsof -ti tcp:$UI_PORT)
if [ -n "$UI_PID" ]; then
    echo "Stopping UI (port $UI_PORT, PID: $UI_PID)..."
    kill -9 $UI_PID
else
    echo "No UI process found on port $UI_PORT"
fi

# -------- Stop Backend (Gunicorn) --------
BACKEND_PORT=9005
BACKEND_PID=$(lsof -ti tcp:$BACKEND_PORT)
if [ -n "$BACKEND_PID" ]; then
    echo "Stopping Backend (port $BACKEND_PORT, PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID
else
    echo "No Backend process found on port $BACKEND_PORT"
fi

# -------- Stop FastChat OpenAI API Server --------
LLM_API_PORT=8000
LLM_API_PID=$(lsof -ti tcp:$LLM_API_PORT)
if [ -n "$LLM_API_PID" ]; then
    echo "Stopping LLM API Server (port $LLM_API_PORT, PID: $LLM_API_PID)..."
    kill -9 $LLM_API_PID
else
    echo "No LLM API Server found on port $LLM_API_PORT"
fi

# -------- Stop FastChat Controller --------
FC_CONTROLLER_PIDS=$(ps -ef | grep -i "fastchat.serve.controller" | grep -v grep | awk '{print $2}')
if [ -n "$FC_CONTROLLER_PIDS" ]; then
    echo "Stopping FastChat Controller (PIDs: $FC_CONTROLLER_PIDS)..."
    kill -9 $FC_CONTROLLER_PIDS
else
    echo "No FastChat Controller process found"
fi

# -------- Stop FastChat Model Worker --------
FC_WORKER_PIDS=$(ps -ef | grep -i "fastchat.serve.model_worker" | grep -v grep | awk '{print $2}')
if [ -n "$FC_WORKER_PIDS" ]; then
    echo "Stopping FastChat Model Worker (PIDs: $FC_WORKER_PIDS)..."
    kill -9 $FC_WORKER_PIDS
else
    echo "No FastChat Model Worker process found"
fi

echo ">>> Remaining FastChat/Backend/UI processes (if any):"
ps -ef | grep -iE "fastchat|npm run|gunicorn" | grep -v grep

echo ">>> All requested services stopped."
echo "=========================================================="

