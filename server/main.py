"""
Local AI Server using FastAPI
Provides AI capabilities for the VS Code extension
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from typing import Dict, List
import uvicorn

app = FastAPI(title="AI Copilot Server", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: List[WebSocket] = []

class AIProcessor:
    """Simple AI processor for demonstration"""
    
    def __init__(self):
        self.conversation_history = []
    
    async def process_question(self, question: str) -> str:
        """Process a general question"""
        # Simulate AI processing
        await asyncio.sleep(0.5)
        
        # Simple responses for demonstration
        responses = {
            "hello": "Hello! I'm your AI assistant. How can I help you today?",
            "how are you": "I'm doing well, thank you! Ready to assist you with your coding tasks.",
            "what can you do": "I can help explain code, answer programming questions, and assist with development tasks.",
        }
        
        question_lower = question.lower()
        for key, response in responses.items():
            if key in question_lower:
                return response
        
        return f"I understand you're asking: '{question}'. While I'm a demo AI, I'd analyze this question and provide helpful insights about programming, code structure, or development best practices."
    
    async def explain_code(self, code: str) -> str:
        """Explain code functionality"""
        await asyncio.sleep(0.8)
        
        # Simple code analysis
        lines = code.strip().split('\n')
        line_count = len(lines)
        
        # Basic analysis
        has_functions = any('def ' in line or 'function ' in line for line in lines)
        has_classes = any('class ' in line for line in lines)
        has_imports = any('import ' in line or 'from ' in line for line in lines)
        has_loops = any('for ' in line or 'while ' in line for line in lines)
        has_conditionals = any('if ' in line for line in lines)
        
        explanation = f"This code snippet contains {line_count} lines. "
        
        features = []
        if has_functions:
            features.append("function definitions")
        if has_classes:
            features.append("class definitions")
        if has_imports:
            features.append("import statements")
        if has_loops:
            features.append("loops")
        if has_conditionals:
            features.append("conditional statements")
        
        if features:
            explanation += f"It includes: {', '.join(features)}. "
        
        explanation += "The code appears to be well-structured and follows good programming practices."
        
        return explanation

# Initialize AI processor
ai_processor = AIProcessor()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "AI Copilot Server",
        "version": "1.0.0",
        "active_connections": len(active_connections)
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process message based on type
            if message.get("type") == "ping":
                response = {
                    "id": message.get("id"),
                    "type": "pong",
                    "content": "pong",
                    "timestamp": time.time()
                }
            elif message.get("type") == "question":
                content = await ai_processor.process_question(message.get("content", ""))
                response = {
                    "id": message.get("id"),
                    "type": "answer",
                    "content": content,
                    "timestamp": time.time()
                }
            elif message.get("type") == "explain_code":
                content = await ai_processor.explain_code(message.get("content", ""))
                response = {
                    "id": message.get("id"),
                    "type": "code_explanation",
                    "content": content,
                    "timestamp": time.time()
                }
            else:
                response = {
                    "id": message.get("id"),
                    "type": "error",
                    "content": "Unknown message type",
                    "timestamp": time.time()
                }
            
            # Send response
            await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.get("/stats")
async def get_stats():
    """Get server statistics"""
    return {
        "active_connections": len(active_connections),
        "uptime": time.time(),
        "status": "running"
    }

if __name__ == "__main__":
    print("🚀 Starting AI Copilot Server...")
    print("📡 Health check: http://localhost:3001/health")
    print("🔌 WebSocket: ws://localhost:3001/ws")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    )
