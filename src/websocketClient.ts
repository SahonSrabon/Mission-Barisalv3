import * as WebSocket from "ws"

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private url: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.on("open", () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          resolve()
        })

        this.ws.on("error", (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        })

        this.ws.on("close", () => {
          console.log("WebSocket disconnected")
          this.attemptReconnect()
        })

        this.ws.on("message", (data) => {
          this.handleMessage(data.toString())
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async sendMessage(message: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket is not connected"))
        return
      }

      const messageId = Date.now().toString()
      const messageWithId = { ...message, id: messageId }

      // Set up response handler
      const responseHandler = (data: string) => {
        try {
          const response = JSON.parse(data)
          if (response.id === messageId) {
            this.ws?.removeListener("message", responseHandler)
            resolve(response.content)
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      }

      this.ws.on("message", responseHandler)

      // Send message
      this.ws.send(JSON.stringify(messageWithId))

      // Timeout after 30 seconds
      setTimeout(() => {
        this.ws?.removeListener("message", responseHandler)
        reject(new Error("Request timeout"))
      }, 30000)
    })
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      console.log("Received message:", message)
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
