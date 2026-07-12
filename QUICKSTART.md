# Mission Barisal - Quick Start Guide

> 5 মিনিটে শুরু করুন | Start in 5 minutes

---

## Prerequisites ✅

- **Node.js** v18+ (`node --version`)
- **Mission Barisal Server** (see below)

---

## Step 1: Start the Server (Terminal 1)

```bash
cd server
node hamba.js
```

Expected output:
```
Server running on port 5000
```

**Verify:**
```bash
curl http://localhost:5000/v1/models
# Should return JSON with available models
```

---

## Step 2: Start the Dashboard (Terminal 2)

```bash
cd /vercel/share/v0-project
npm install  # (first time only)
npm run dev
```

Expected output:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Step 3: Open Browser

Go to **http://localhost:3000**

You should see:
- ✅ "Connected" status
- ✅ Available models listed
- ✅ Memory and Knowledge stats

---

## Step 4: Send Your First Message

Type anything in the chat box:
- "Explain what this code does"
- "What's the best way to handle async errors?"
- "Generate documentation for my project"

Press **Send** and watch the response stream in real-time.

---

## Troubleshooting

### "Cannot connect to Mission Barisal server"

**Check:**
1. Is server running? `curl http://localhost:5000/v1/models`
2. Port 5000 available? `ss -tlnp | grep 5000`
3. Node version? `node --version` (need v18+)

**Fix:**
```bash
# Kill any process on 5000
lsof -i :5000 | grep -v PID | awk '{print $2}' | xargs kill -9

# Start server fresh
cd server && node hamba.js
```

### Messages not streaming

**Check browser console:** DevTools → Console (look for errors)

**Fix:**
```bash
# Restart both servers
# Terminal 1: Ctrl+C, then: node hamba.js
# Terminal 2: Ctrl+C, then: npm run dev
```

---

## Next Steps

- 📖 Read full docs: `IMPLEMENTATION.md`
- 🔧 Configure server: See `server/SETUP.md`
- 🚀 Deploy: See `DEPLOYMENT.md`

---

## Project Structure

```
server/                    ← Node.js AI server
├── hamba.js             ← Main server file
└── .zombiecoder/        ← Agent data (SSOT, memory, syllabus)

/vercel/share/v0-project/ ← Next.js web dashboard
├── app/
│   ├── page.tsx         ← Entry point
│   └── layout.tsx       ← Root layout
├── components/
│   └── chat-interface.tsx ← Main UI ⭐
├── lib/
│   └── api.ts           ← Server client ⭐
└── package.json
```

---

## Key Files to Understand

| File | Purpose |
|------|---------|
| `lib/api.ts` | How to talk to server |
| `components/chat-interface.tsx` | The chat UI |
| `app/page.tsx` | Entry point |
| `IMPLEMENTATION.md` | Deep documentation |

---

## Common Commands

```bash
# Start servers
npm run dev              # Dashboard (Terminal 2)
node server/hamba.js    # Server (Terminal 1)

# Build for production
npm run build

# Format code
npm run lint

# TypeScript check
npm run compile
```

---

## Architecture in 30 seconds

```
You type in browser
    ↓
NextJS app sends to server (port 5000)
    ↓
Server processes with AI agents
    ↓
Server streams response back
    ↓
You see answer appear in real-time
```

---

## Features

✅ Real-time chat  
✅ Multi-agent AI  
✅ Code explanation  
✅ Memory system (remembers past conversations)  
✅ Knowledge base (learns from web + GitHub)  
✅ SSOT (Single Source of Truth for projects)  

---

## Server API Reference

Quick reference - full docs in `IMPLEMENTATION.md`:

```bash
# List available models
curl http://localhost:5000/v1/models

# Check memory state
curl http://localhost:5000/api/memory

# Get knowledge base
curl http://localhost:5000/api/syllabus

# Chat (streaming)
curl -X POST http://localhost:5000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "code-guru",
    "messages": [{"role": "user", "content": "hi"}],
    "stream": true
  }'
```

---

## Environment Setup

Already configured in `.env.development.local`:

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

Change this if server runs on different port/host.

---

## Need Help?

1. Check console logs: Browser DevTools or server terminal
2. Read `IMPLEMENTATION.md` for detailed troubleshooting
3. Verify setup with curl commands above
4. Check server status: `curl http://localhost:5000/v1/models`

---

**Ready? Open http://localhost:3000 and start chatting!** 🚀
