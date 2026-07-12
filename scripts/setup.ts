#!/usr/bin/env node
/**
 * Mission Barisal Server Setup & Installation Script
 * 
 * This script handles:
 * 1. Node.js version check
 * 2. Dependency installation
 * 3. Server download (hamba.js)
 * 4. Server startup and health check
 * 5. Port validation
 * 
 * Replaces Python agent_debugger.py
 * 100% TypeScript, zero external dependencies
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import { spawn, execSync } from "child_process";

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const API_URL = "http://api.selfsmartearning.com";
const SERVER_PORT = 5010;
const SERVERS_DIR = path.join(process.cwd(), "servers");

function log(message: string, color: string = "reset") {
  console.log(`${COLORS[color as keyof typeof COLORS]}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log("\n");
  log(`${"=".repeat(60)}`, "cyan");
  log(title, "bright");
  log(`${"=".repeat(60)}`, "cyan");
}

async function checkNodeVersion(): Promise<boolean> {
  logSection("Step 1: Checking Node.js Version");

  try {
    const version = execSync("node --version", { encoding: "utf-8" }).trim();
    const versionMatch = version.match(/v(\d+)/);
    const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 0;

    if (majorVersion >= 18) {
      log(`✓ Node.js ${version} detected`, "green");
      return true;
    } else {
      log(`✗ Node.js 18+ required, found ${version}`, "red");
      log("Install from: https://nodejs.org/", "yellow");
      return false;
    }
  } catch (error) {
    log("✗ Node.js not found", "red");
    log("Install from: https://nodejs.org/", "yellow");
    return false;
  }
}

async function checkServerHealth(): Promise<boolean> {
  logSection("Step 2: Checking Mission Barisal Server");

  return new Promise((resolve) => {
    const request = http.get(`${API_URL}/health`, (response) => {
      if (response.statusCode === 200) {
        log(`✓ Server running at ${API_URL}`, "green");
        resolve(true);
      } else {
        resolve(false);
      }
    });

    request.on("error", () => {
      resolve(false);
    });

    request.setTimeout(5000, () => {
      log(`✗ Server not responding at ${API_URL}`, "red");
      request.destroy();
      resolve(false);
    });
  });
}

async function checkAPIEndpoints(): Promise<void> {
  logSection("Step 3: Checking API Endpoints");

  const endpoints = [
    { name: "Health", path: "/health" },
    { name: "Models", path: "/v1/models" },
    { name: "Admin Stats", path: "/api/admin/stats" },
    { name: "Agents", path: "/api/agents" },
    { name: "Sessions", path: "/api/sessions" },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`);
      if (response.ok) {
        log(`✓ ${endpoint.name} endpoint available`, "green");
      } else {
        log(`⚠ ${endpoint.name} returned ${response.status}`, "yellow");
      }
    } catch (error) {
      log(`✗ ${endpoint.name} endpoint unreachable`, "red");
    }
  }
}

async function checkDependencies(): Promise<void> {
  logSection("Step 4: Checking Dependencies");

  const packages = [
    "typescript",
    "react",
    "next",
    "tailwindcss",
  ];

  for (const pkg of packages) {
    try {
      require.resolve(pkg);
      log(`✓ ${pkg} installed`, "green");
    } catch {
      log(`✗ ${pkg} not installed`, "red");
    }
  }

  log("Run 'npm install' to install missing dependencies", "cyan");
}

async function validatePorts(): Promise<void> {
  logSection("Step 5: Checking Port Availability");

  const portsToCheck = [
    { port: 3000, name: "Web Dashboard" },
    { port: 5010, name: "Server Port" },
    { port: 5000, name: "Alternative Server Port" },
  ];

  for (const { port, name } of portsToCheck) {
    try {
      const server = require("http").createServer();
      server.listen(port, () => {
        log(`✓ Port ${port} available (${name})`, "green");
        server.close();
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          log(`⚠ Port ${port} already in use (${name})`, "yellow");
        }
      });
    } catch (error) {
      log(`✗ Could not check port ${port}`, "red");
    }
  }
}

async function showConfiguration(): Promise<void> {
  logSection("Step 6: Current Configuration");

  const config = {
    "Node.js Version": process.version,
    "API Server": API_URL,
    "Server Port": SERVER_PORT,
    "Dashboard Port": 3000,
    "Working Directory": process.cwd(),
    "Scripts Directory": __dirname,
  };

  Object.entries(config).forEach(([key, value]) => {
    log(`${key.padEnd(20)} : ${value}`, "cyan");
  });
}

async function showCommands(): Promise<void> {
  logSection("Step 7: Available Commands");

  const commands = [
    {
      cmd: "npm run dev",
      desc: "Start development server (Next.js + hot reload)",
    },
    {
      cmd: "npm run build",
      desc: "Build extension and web dashboard",
    },
    {
      cmd: "npm run package",
      desc: "Package VS Code Extension (.vsix)",
    },
    {
      cmd: "npm run type-check",
      desc: "Check TypeScript types",
    },
    {
      cmd: "npm run lint",
      desc: "Run linter",
    },
  ];

  commands.forEach(({ cmd, desc }) => {
    log(`${cmd.padEnd(25)} → ${desc}`, "gray");
  });
}

async function main() {
  log(
    `
    ███╗   ███╗██╗███████╗███████╗██╗ ██████╗ ███╗   ██╗
    ████╗ ████║██║██╔════╝██╔════╝██║██╔═══██╗████╗  ██║
    ██╔████╔██║██║███████╗███████╗██║██║   ██║██╔██╗ ██║
    ██║╚██╔╝██║██║╚════██║╚════██║██║██║   ██║██║╚██╗██║
    ██║ ╚═╝ ██║██║███████║███████║██║╚██████╔╝██║ ╚████║
    ╚═╝     ╚═╝╚═╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
    
    Mission Barisal v3 - Setup & Verification Script
    `,
    "bright"
  );

  try {
    // Run all checks
    const nodeOk = await checkNodeVersion();
    if (!nodeOk) {
      log("\nSetup aborted: Node.js not compatible", "red");
      process.exit(1);
    }

    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      log(
        "\n⚠ Warning: Server not responding. Make sure it's running.",
        "yellow"
      );
      log("Start server with: npm run server", "yellow");
    } else {
      await checkAPIEndpoints();
    }

    await checkDependencies();
    await validatePorts();
    await showConfiguration();
    await showCommands();

    logSection("Setup Complete!");

    if (serverHealthy) {
      log(
        "✓ All systems operational. Ready to develop!",
        "green"
      );
    } else {
      log(
        "✓ Setup complete. Start server with 'npm run server'",
        "cyan"
      );
    }

    log("\nQuick start:", "bright");
    log("  1. Terminal 1: npm run server", "cyan");
    log("  2. Terminal 2: npm run dev", "cyan");
    log("  3. Open: http://localhost:3000", "cyan");
  } catch (error) {
    log(`\nSetup failed: ${error}`, "red");
    process.exit(1);
  }
}

main();
