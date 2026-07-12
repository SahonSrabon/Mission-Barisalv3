import { WebsocketClient } from "./websocketClient";

/**
 * Chat Provider for handling AI conversations
 */
export class ChatProvider {
  private client: WebsocketClient;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(client: WebsocketClient) {
    this.client = client;
  }

  /**
   * Send a message and get response
   */
  async sendMessage(message: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: message,
    });

    try {
      // Get response
      const response = await this.client.ask(message);

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      });

      return response;
    } catch (error) {
      console.error("[ChatProvider] Error:", error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Explain code with context
   */
  async explainCodeWithContext(code: string, context?: string): Promise<string> {
    const prompt = context
      ? `Context: ${context}\n\nExplain this code:\n${code}`
      : `Explain this code:\n${code}`;

    return await this.client.explain(code);
  }
}
