#### create conda environment

conda create -n autogen python3.9
conda activate autogen

### install fastapi related dependencies

pip install -r requirements.txt

### install the required Autogen and openai deps
pip install pyautogen==0.2.0 "openai>=1.2.0" diskcache

### Install the dependencies from FastChat

cd ~/mtech/autogen_rag/FastChat
conda activate autogen
pip install .
pip install .[model_worker]

#### Optional dependencies

### Run the following in 3 terminals for controller, model worker, server

cd ~/mtech/autogen_rag/FastChat
## Start the controller
python -m fastchat.serve.controller

## Start the llm model worker for serving the api calls.
# python -m fastchat.serve.model_worker --model-path TinyLlama/TinyLlama-1.1B-Chat-v1.0 --device cpu
# python -m fastchat.serve.model_worker --model-path /media/sf_sharedfs/fileshare/TinyLlama/TinyLlama-1.1B-Chat-v1.0 --device cpu

# python -m fastchat.serve.model_worker --model-path /media/sf_sharedfs/fileshare/llama-2-7b-chat.Q4_0.gguf --device cpu

### Start the server to accept the requests
python -m fastchat.serve.openai_api_server --host localhost --port 8000

### The following in 2 terminals for starting backend and ui ####

##### To process the requests from UI, start backend server
cd ~/mtech/autogen_rag/chatBe
gunicorn --worker-class uvicorn.workers.UvicornWorker --workers 1 --timeout 300 -b 0.0.0.0:9005 app:app


#### Install the UI Deps ###
npm install axios react-toastify
npm install react-scroll-to-bottom
npm install react-icons
### Start the UI
~/mtech/autogen_rag/chatUi
npm run dev