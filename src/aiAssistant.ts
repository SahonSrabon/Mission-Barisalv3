import * as vscode from "vscode"
import type { WebSocketClient } from "./websocketClient"
import type { MemoryLayer } from "./memoryLayer"

export class AIAssistant {
  private isActive = false

  constructor(
    private wsClient: WebSocketClient,
    private memoryLayer: MemoryLayer,
  ) {}

  async activate(): Promise<void> {
    try {
      await this.wsClient.connect()
      this.isActive = true
      console.log("AI Assistant activated")
    } catch (error) {
      console.error("Failed to activate AI Assistant:", error)
      vscode.window.showErrorMessage("Failed to connect to AI server")
    }
  }

  async askQuestion(question: string): Promise<string> {
    if (!this.isActive) {
      return "AI Assistant is not active. Please activate it first."
    }

    try {
      // Store question in memory
      await this.memoryLayer.storeInteraction("question", question)

      // Send to AI server
      const response = await this.wsClient.sendMessage({
        type: "question",
        content: question,
        timestamp: Date.now(),
      })

      // Store response in memory
      await this.memoryLayer.storeInteraction("response", response)

      return response
    } catch (error) {
      console.error("Error asking question:", error)
      return "Sorry, I encountered an error processing your question."
    }
  }

  async explainCode(code: string): Promise<string> {
    if (!this.isActive) {
      return "AI Assistant is not active. Please activate it first."
    }

    try {
      const prompt = `Please explain this code:\n\n${code}`

      // Store code explanation request
      await this.memoryLayer.storeInteraction("code_explanation_request", code)

      const response = await this.wsClient.sendMessage({
        type: "explain_code",
        content: prompt,
        timestamp: Date.now(),
      })

      // Store explanation
      await this.memoryLayer.storeInteraction("code_explanation_response", response)

      return response
    } catch (error) {
      console.error("Error explaining code:", error)
      return "Sorry, I encountered an error explaining the code."
    }
  }

  isActivated(): boolean {
    return this.isActive
  }
}
