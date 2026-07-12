import type * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

interface Interaction {
  id: string
  type: string
  content: string
  timestamp: number
  metadata?: any
}

export class MemoryLayer {
  private memoryFile: string
  private interactions: Interaction[] = []

  constructor(private context: vscode.ExtensionContext) {
    this.memoryFile = path.join(context.globalStorageUri?.fsPath || "", "ai_memory.json")
    this.loadMemory()
  }

  async storeInteraction(type: string, content: string, metadata?: any): Promise<void> {
    const interaction: Interaction = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now(),
      metadata,
    }

    this.interactions.push(interaction)

    // Keep only last 1000 interactions
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000)
    }

    await this.saveMemory()
  }

  getInteractions(type?: string, limit?: number): Interaction[] {
    let filtered = type ? this.interactions.filter((i) => i.type === type) : this.interactions

    if (limit) {
      filtered = filtered.slice(-limit)
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  async clearMemory(): Promise<void> {
    this.interactions = []
    await this.saveMemory()
  }

  getMemoryStats(): any {
    const typeStats: { [key: string]: number } = {}

    this.interactions.forEach((interaction) => {
      typeStats[interaction.type] = (typeStats[interaction.type] || 0) + 1
    })

    return {
      total_interactions: this.interactions.length,
      types: typeStats,
      oldest_interaction:
        this.interactions.length > 0
          ? new Date(Math.min(...this.interactions.map((i) => i.timestamp))).toISOString()
          : null,
      newest_interaction:
        this.interactions.length > 0
          ? new Date(Math.max(...this.interactions.map((i) => i.timestamp))).toISOString()
          : null,
    }
  }

  private async loadMemory(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.memoryFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, "utf8")
        this.interactions = JSON.parse(data)
      }
    } catch (error) {
      console.error("Error loading memory:", error)
      this.interactions = []
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.memoryFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(this.memoryFile, JSON.stringify(this.interactions, null, 2))
    } catch (error) {
      console.error("Error saving memory:", error)
    }
  }
}
