# AI Copilot VS Code Extension

A comprehensive VS Code extension with AI assistant capabilities, health monitoring, and real-time communication.

## Features

🔧 **Agent Health Checker**
- Monitor API endpoints
- Check WebSocket connections
- Test file operations
- Generate detailed health reports

🧠 **AI Assistant**
- Ask questions to AI
- Explain selected code
- Real-time WebSocket communication
- Persistent memory layer

🔌 **WebSocket Integration**
- Real-time communication with local AI server
- Auto-reconnection capabilities
- Message queuing and response handling

📁 **Memory Layer**
- Store conversation history
- Track interactions
- Persistent storage across sessions

## Installation

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the AI Server**
   \`\`\`bash
   cd server
   pip install -r requirements.txt
   python main.py
   \`\`\`

3. **Compile Extension**
   \`\`\`bash
   npm run compile
   \`\`\`

4. **Run Health Check**
   \`\`\`bash
   python scripts/agent_debugger.py
   \`\`\`

## Usage

### Commands

- `Ctrl+Shift+A` (Cmd+Shift+A on Mac): Ask AI Question
- `AI Copilot: Run Health Check`: Check system health
- `AI Copilot: Explain Selected Code`: Explain highlighted code

### Health Checker

Run the standalone health checker:
\`\`\`bash
python scripts/agent_debugger.py
\`\`\`

This will check:
- ✅ API endpoints (localhost:3001, 8000, 5000)
- 🔌 WebSocket connections
- 📁 File read/write operations
- 📊 Generate detailed report

### AI Server

The FastAPI server provides:
- `/health` - Health check endpoint
- `/ws` - WebSocket for real-time communication
- `/stats` - Server statistics

## Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VS Code       │    │   WebSocket      │    │   FastAPI       │
│   Extension     │◄──►│   Client         │◄──►│   Server        │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│   Memory        │                            │   AI            │
│   Layer         │                            │   Processor     │
└─────────────────┘                            └─────────────────┘
\`\`\`

## Development

1. **Watch Mode**
   \`\`\`bash
   npm run watch
   \`\`\`

2. **Debug Extension**
   - Press F5 in VS Code
   - Select "Run Extension"

3. **Test Health Checker**
   \`\`\`bash
   python scripts/agent_debugger.py
   \`\`\`

## Configuration

The extension automatically connects to:
- AI Server: `http://localhost:3001`
- WebSocket: `ws://localhost:3001/ws`
- Health endpoints: Multiple ports (3001, 8000, 5000)

## Troubleshooting

1. **Server not responding**
   - Run health check: `python scripts/agent_debugger.py`
   - Check if server is running on port 3001

2. **WebSocket connection failed**
   - Verify server is running
   - Check firewall settings
   - Review console logs

3. **Extension not activating**
   - Reload VS Code window
   - Check extension logs in Developer Console

## License

MIT License
