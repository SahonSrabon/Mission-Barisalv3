/**
 * WebSocket Client for Mission Barisal Server
 * 
 * Handles real-time communication with the AI backend
 */

export class WebsocketClient {
  private connected: boolean = false;
  private messageQueue: string[] = [];
  private responseHandlers: Map<string, (response: any) => void> = new Map();

  /**
   * Connect to WebSocket server
   */
  async connect(wsUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // In VS Code extension context, we use fetch instead of WebSocket
        // for better compatibility and error handling
        console.log("[WebSocket] Connecting to:", wsUrl);
        this.connected = true;
        resolve(true);
      } catch (error) {
        console.error("[WebSocket] Connection error:", error);
        this.connected = false;
        resolve(false);
      }
    });
  }

  /**
   * Send a question to the AI
   */
  async ask(question: string): Promise<string> {
    if (!this.connected) {
      throw new Error("WebSocket not connected");
    }

    try {
      const response = await fetch("http://api.selfsmartearning.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          model: "auto",
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "No response";
    } catch (error) {
      console.error("[WebSocket] Ask error:", error);
      throw error;
    }
  }

  /**
   * Explain selected code
   */
  async explain(code: string): Promise<string> {
    if (!this.connected) {
      throw new Error("WebSocket not connected");
    }

    try {
      const prompt = `Explain this code in detail:\n\n${code}`;

      const response = await fetch("http://api.selfsmartearning.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "auto",
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Could not analyze code";
    } catch (error) {
      console.error("[WebSocket] Explain error:", error);
      throw error;
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    console.log("[WebSocket] Disconnecting...");
    this.connected = false;
  }
}
