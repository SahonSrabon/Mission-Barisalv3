import * as vscode from "vscode";
import * as http from "http";

interface HealthResponse {
  healthy: boolean;
  version?: string;
  port?: number;
  uptime?: number;
}

export class ServerManager {
  private serverProcess: any;
  private serverUrl: string = "http://api.selfsmartearning.com";
  private wsUrl: string = "ws://api.selfsmartearning.com";
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Ensure server is running - either remote or local
   */
  async ensureServerRunning(): Promise<boolean> {
    console.log("[ServerManager] Checking server health...");

    try {
      // First try remote server
      const remoteHealthy = await this.checkHealth(this.serverUrl);
      if (remoteHealthy) {
        console.log("[ServerManager] Remote server is healthy");
        return true;
      }

      console.log("[ServerManager] Remote server not available");
      console.log("[ServerManager] Make sure Mission Barisal server is running");
      console.log(`[ServerManager] Server URL: ${this.serverUrl}`);

      return false;
    } catch (error) {
      console.error("[ServerManager] Error checking server:", error);
      return false;
    }
  }

  /**
   * Check server health
   */
  async checkHealth(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const request = http.get(`${url}/health`, (response) => {
        if (response.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      request.on("error", () => {
        resolve(false);
      });

      request.setTimeout(3000, () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Get detailed health status
   */
  async getHealthStatus(): Promise<HealthResponse | null> {
    return new Promise((resolve) => {
      const request = http.get(
        `${this.serverUrl}/health`,
        (response) => {
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        }
      );

      request.on("error", () => {
        resolve(null);
      });

      request.setTimeout(3000, () => {
        request.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Start server (local fallback)
   */
  async startServer(): Promise<boolean> {
    console.log("[ServerManager] Starting server...");
    // This would be used for local development fallback
    // For production, the server runs at api.selfsmartearning.com
    const healthy = await this.checkHealth(this.serverUrl);
    if (healthy) {
      console.log("[ServerManager] Server already running");
      return true;
    }
    return false;
  }

  /**
   * Get WebSocket URL
   */
  getWebSocketUrl(): string {
    return this.wsUrl;
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Stop server
   */
  stop(): void {
    if (this.serverProcess) {
      console.log("[ServerManager] Stopping server...");
      this.serverProcess.kill();
    }
  }
}
