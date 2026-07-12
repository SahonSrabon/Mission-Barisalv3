# Mission Barisal VS Code Extension

Multi-agent AI assistant directly in your VS Code editor.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)

## Features

🚀 **Ask AI Questions** - Real-time Q&A with context-aware responses  
💡 **Code Explanation** - Understand complex code instantly  
🔧 **Zero Configuration** - Auto-detects and connects to server  
⚡ **Fast & Lightweight** - ~100KB installed size  
🔐 **Privacy First** - Processes on your local machine  

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Mission Barisal"
4. Click Install

### From VSIX File

```bash
code --install-extension mission-barisal-1.0.0.vsix
```

## Quick Start

1. **Install the extension** (see above)
2. **Server will auto-start** when you open VS Code
3. **Open command palette** (Ctrl+Shift+P)
4. **Type "Mission Barisal"** to see available commands

## Commands

| Command | Shortcut | Purpose |
|---------|----------|---------|
| Ask Question | Ctrl+Shift+M | Ask AI anything |
| Explain Code | Ctrl+Shift+E | Explain selected code |
| Show Status | — | Server status info |
| Open Dashboard | — | Open web UI |
| Start Server | — | Manually start server |

## Usage Examples

### Ask a Question

1. Press `Ctrl+Shift+M`
2. Type your question
3. Get instant response

### Explain Code

1. Select code in editor
2. Press `Ctrl+Shift+E`
3. See explanation in side panel

## System Requirements

- **VS Code:** 1.85.0 or later
- **Node.js:** 18.0 or later
- **Memory:** 512MB minimum
- **Internet:** Connection to api.selfsmartlearning.com

## Configuration

The extension works out of the box. For advanced configuration:

1. Open VS Code Settings
2. Search for "Mission Barisal"
3. Adjust as needed

Default settings:
```json
{
  "missionBarisal.serverUrl": "http://api.selfsmartlearning.com",
  "missionBarisal.autoStart": true,
  "missionBarisal.timeout": 30000
}
```

## Architecture

```
VS Code Extension (TypeScript)
    ↓
Extension API (activate/deactivate)
    ↓
ServerManager (health checks)
    ↓
WebSocket Client (real-time comms)
    ↓
ChatProvider (conversation state)
    ↓
Mission Barisal Server (ai.selfsmartlearning.com)
```

## Development

See [EXTENSION_GUIDE.md](../EXTENSION_GUIDE.md) for:
- Building from source
- Development setup
- Publishing to marketplace
- Troubleshooting

## Source Code

```
src/
├── extension.ts        (Main entry point)
├── serverManager.ts    (Server lifecycle)
├── websocketClient.ts  (Real-time comms)
└── chatProvider.ts     (Chat logic)
```

All code is TypeScript with **zero external dependencies**.

## Stats

- **Size:** ~100KB installed
- **Load Time:** <100ms
- **Memory:** ~50MB typical
- **Dependencies:** 0 external

## Privacy

- All responses processed server-side
- No data stored locally
- Encrypted connection
- No telemetry

## Support

- **Report Issues:** [GitHub Issues](https://github.com/SahonSrabon/Mission-Barisalv3/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/SahonSrabon/Mission-Barisalv3/discussions)
- **Documentation:** [EXTENSION_GUIDE.md](../EXTENSION_GUIDE.md)

## License

MIT License - See LICENSE file for details

## Changelog

### v1.0.0 (2025-07-13)

- ✅ Initial release
- ✅ Ask Question command
- ✅ Code Explanation command
- ✅ Server auto-detection
- ✅ WebSocket support
- ✅ VS Code 1.85+ support

---

**Made with ❤️ by Mission Barisal Team**

[Website](https://mission-barisal.dev) | [GitHub](https://github.com/SahonSrabon/Mission-Barisalv3) | [Docs](../EXTENSION_GUIDE.md)
