from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .routers import screener
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for Frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/explorer")
async def get_explorer():
    with open(os.path.join(static_dir, "explorer.html"), "r") as f:
        html_content = f.read()
    return Response(content=html_content, media_type="text/html")

@app.get("/dashboard")
async def get_dashboard():
    with open(os.path.join(static_dir, "dashboard.html"), "r") as f:
        html_content = f.read()
    return Response(content=html_content, media_type="text/html")

@app.get("/")
def read_root():
    return {"message": "Welcome to Elite Trader Stock Screener API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from .services.orchestrator import update_market_data
from .services.websocket_manager import manager

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_market_data())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include Routers
app.include_router(screener.router, prefix=f"{settings.API_V1_STR}/screener", tags=["screener"])
