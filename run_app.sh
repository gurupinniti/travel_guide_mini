#!/bin/bash
# ==========================================================
# Travel Planner Autogen + FastChat Full Startup Script
# Root Path: /home/aida/mtech/omio_mini
# ==========================================================

# Exit on error
#set -e

# -------- CONFIG --------
ENV_NAME="autogen"
ROOT_PATH="/home/aida/mtech/omio_mini"

MODEL_PATH="/media/sf_sharedfs/fileshare/TinyLlama/TinyLlama-1.1B-Chat-v1.0"
BACKEND_DIR="$ROOT_PATH/chatBe"
UI_DIR="$ROOT_PATH/chatUi"
FSCHAT_DIR="$ROOT_PATH/FastChat"
LOG_DIR="$ROOT_PATH/logs"

# Create log dir if missing
mkdir -p "$LOG_DIR"

# Activate conda env
echo ">>> Activating conda environment: $ENV_NAME"

# Activate conda environment properly
source /home/aida/anaconda3/etc/profile.d/conda.sh
conda activate $ENV_NAME

# -------- Start FastChat Components --------

echo ">>> Starting FastChat Controller..."
cd "$FSCHAT_DIR"
nohup python -m fastchat.serve.controller \
    > "$LOG_DIR/controller.log" 2>&1 &

sleep 5

echo ">>> Starting FastChat Model Worker with model: $MODEL_PATH"
nohup python -m fastchat.serve.model_worker \
    --model-path "$MODEL_PATH" \
    --device cpu \
    > "$LOG_DIR/model_worker.log" 2>&1 &

sleep 10

echo ">>> Starting FastChat OpenAI API Server on port 8000..."
nohup python -m fastchat.serve.openai_api_server \
    --host localhost \
    --port 8000 \
    > "$LOG_DIR/openai_api_server.log" 2>&1 &

sleep 5

# -------- Start Backend --------
echo ">>> Starting Backend Server on port 9005..."
cd "$BACKEND_DIR"
nohup gunicorn --worker-class uvicorn.workers.UvicornWorker \
    --workers 1 \
    --timeout 900 \
    -b 0.0.0.0:9005 app:app \
    > "$LOG_DIR/backend.log" 2>&1 &

sleep 20

# -------- Start UI --------
echo ">>> Starting Frontend UI (port 5173)..."
cd "$UI_DIR"
nohup npm run dev \
    > "$LOG_DIR/ui.log" 2>&1 &

cd $ROOT_PATH

ps -ef|grep -iE "fastchat|npm run|gunicorn"

# -------- Summary --------
echo "=========================================================="
echo "All services started!"
echo "Logs available at: $LOG_DIR"
echo "Controller log:      $LOG_DIR/controller.log"
echo "Model worker log:    $LOG_DIR/model_worker.log"
echo "API server log:      $LOG_DIR/openai_api_server.log"
echo "Backend log:         $LOG_DIR/backend.log"
echo "UI log:              $LOG_DIR/ui.log"
echo "----------------------------------------------------------"
echo "UI running on: http://localhost:5173"
echo "Backend API:   http://localhost:9005"
echo "LLM API:       http://localhost:8000"
echo "=========================================================="

