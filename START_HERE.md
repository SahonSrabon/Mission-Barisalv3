# 🚀 Mission Barisal v3 — Monitoring Dashboard

**Start in 2 minutes:**

## Step 1: Install Dependencies

```bash
cd /vercel/share/v0-project
npm install
```

(First time only — takes ~30 seconds)

## Step 2: Start the Dashboard

```bash
npm run dev
```

## Step 3: Open Browser

```
http://localhost:3000
```

---

## What You'll See

A GitHub Copilot-style real-time monitoring dashboard showing:

### Top Row (Stat Cards)
- **Requests:** Total API calls to Mission Barisal server
- **Sessions:** Active client connections right now
- **Agents:** Number of AI agents available (6 total)
- **Memory:** Current RAM usage (RSS)
- **Uptime:** How long the server has been running

### Tabs

**Overview**
- Provider health (OpenCode, Groq, Gemini)
- Top models by usage count
- System metrics

**Agents**
- All 6 agents with names, roles, models
- Call counts and error rates
- Click any agent to see details

**Sessions**
- Active client connections
- What editor/tool they're using
- Current model and message count

**Activity**
- Real-time event log (audit trail)
- Agent actions with timestamps
- Success/failure status

**Config**
- Server version and type
- Total models and providers
- MCP clients connected

---

## Configuration

The dashboard automatically connects to:

```
http://api.selfsmartlearning.com
```

To change, edit `.env.development.local`:

```bash
NEXT_PUBLIC_SERVER_URL=http://api.selfsmartlearning.com
```

---

## Refresh Settings

**Auto-Refresh:** Toggle in top-right corner
- **ON** = Updates every 5 seconds (default)
- **OFF** = Manual only

**Manual Refresh:** Click the refresh icon anytime

---

## Troubleshooting

### Dashboard shows "Loading..."
- Check if server is running: `curl http://api.selfsmartearning.com/health`
- Should return JSON with `"healthy": true`

### "Cannot connect to server"
1. Verify server URL in `.env.development.local`
2. Check network connectivity
3. Restart dev server: `Ctrl+C` then `npm run dev`

### No data in tables
- Check browser console (F12)
- Look for API errors
- Verify `NEXT_PUBLIC_SERVER_URL` is correct

---

## Next Steps

- 📖 Full docs: [MONITORING_DASHBOARD.md](./MONITORING_DASHBOARD.md)
- 🔧 API reference: [../server/API.md](../server/API.md)
- 🏗️ Architecture: [../server/ARCHITECTURE.md](../server/ARCHITECTURE.md)

---

## Key Files

```
app/page.tsx                           → Entry point
components/monitoring-dashboard.tsx    → Main UI (606 lines)
lib/api.ts                             → Server API client (470 lines)
MONITORING_DASHBOARD.md                → Complete documentation
.env.development.local                 → Configuration
```

---

## Features Included

✅ Real-time server health monitoring  
✅ Agent analytics and error tracking  
✅ Active session display  
✅ Live activity feed (audit trail)  
✅ Runtime configuration viewer  
✅ MCP client status  
✅ Provider health dashboard  
✅ Model usage statistics  

**All data is 100% real from Mission Barisal v3 server — zero mock data.**

---

## Code Quality

- ✅ TypeScript (type-safe)
- ✅ Clean component structure
- ✅ Proper error handling
- ✅ Performance optimized
- ✅ Accessible (ARIA labels)
- ✅ Production ready

---

**Now open http://localhost:3000 and explore! 🎉**
