import * as vscode from "vscode"
import { AIAssistant } from "./aiAssistant"
import { HealthChecker } from "./healthChecker"
import { WebSocketClient } from "./websocketClient"
import { MemoryLayer } from "./memoryLayer"
import type { Thenable } from "./thenable" // Import Thenable

let aiAssistant: AIAssistant
let healthChecker: HealthChecker
let wsClient: WebSocketClient
let memoryLayer: MemoryLayer

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Copilot Extension is now active!")

  // Initialize components
  memoryLayer = new MemoryLayer(context)
  healthChecker = new HealthChecker()
  wsClient = new WebSocketClient("ws://localhost:3001/ws")
  aiAssistant = new AIAssistant(wsClient, memoryLayer)

  // Register commands
  const activateCommand = vscode.commands.registerCommand("aiCopilot.activate", async () => {
    await aiAssistant.activate()
    vscode.commands.executeCommand("setContext", "aiCopilot.activated", true)
    vscode.window.showInformationMessage("AI Copilot activated!")
  })

  const healthCheckCommand = vscode.commands.registerCommand("aiCopilot.healthCheck", async () => {
    const panel = vscode.window.createWebviewPanel("healthCheck", "AI Agent Health Check", vscode.ViewColumn.One, {
      enableScripts: true,
    })

    const results = await healthChecker.runHealthCheck()
    panel.webview.html = generateHealthCheckHTML(results)
  })

  const askQuestionCommand = vscode.commands.registerCommand("aiCopilot.askQuestion", async () => {
    const question = await vscode.window.showInputBox({
      prompt: "Ask AI a question",
      placeHolder: "What would you like to know?",
    })

    if (question) {
      const response = await aiAssistant.askQuestion(question)
      vscode.window.showInformationMessage(`AI: ${response}`)
    }
  })

  const explainCodeCommand = vscode.commands.registerCommand("aiCopilot.explainCode", async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText) {
      vscode.window.showErrorMessage("No code selected")
      return
    }

    const explanation = await aiAssistant.explainCode(selectedText)

    const panel = vscode.window.createWebviewPanel("codeExplanation", "Code Explanation", vscode.ViewColumn.Beside, {
      enableScripts: true,
    })

    panel.webview.html = generateExplanationHTML(selectedText, explanation)
  })

  // Register tree data provider
  const treeDataProvider = new AITreeDataProvider(aiAssistant, healthChecker)
  vscode.window.registerTreeDataProvider("aiCopilotView", treeDataProvider)

  context.subscriptions.push(activateCommand, healthCheckCommand, askQuestionCommand, explainCodeCommand)

  // Auto-activate on startup
  vscode.commands.executeCommand("aiCopilot.activate")
}

class AITreeDataProvider implements vscode.TreeDataProvider<any> {
  // Use any instead of Thenable
  constructor(
    private aiAssistant: AIAssistant,
    private healthChecker: HealthChecker,
  ) {}

  getTreeItem(element: any): vscode.TreeItem {
    return element
  }

  getChildren(element?: any): Thenable<any[]> {
    if (!element) {
      return Promise.resolve([
        new TreeItem("Health Status", vscode.TreeItemCollapsibleState.Collapsed, "health"),
        new TreeItem("AI Assistant", vscode.TreeItemCollapsibleState.Collapsed, "assistant"),
        new TreeItem("Memory", vscode.TreeItemCollapsibleState.Collapsed, "memory"),
      ])
    }

    switch (element.contextValue) {
      case "health":
        return Promise.resolve([
          new TreeItem("Run Health Check", vscode.TreeItemCollapsibleState.None, "healthCheck"),
          new TreeItem("View Last Report", vscode.TreeItemCollapsibleState.None, "viewReport"),
        ])
      case "assistant":
        return Promise.resolve([
          new TreeItem("Ask Question", vscode.TreeItemCollapsibleState.None, "askQuestion"),
          new TreeItem("Explain Code", vscode.TreeItemCollapsibleState.None, "explainCode"),
        ])
      case "memory":
        return Promise.resolve([
          new TreeItem("View Conversations", vscode.TreeItemCollapsibleState.None, "viewMemory"),
          new TreeItem("Clear Memory", vscode.TreeItemCollapsibleState.None, "clearMemory"),
        ])
      default:
        return Promise.resolve([])
    }
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.label}`
  }
}

function generateHealthCheckHTML(results: any): string {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .status-ok { color: green; }
                .status-error { color: red; }
                .service { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
            </style>
        </head>
        <body>
            <h1>🔧 AI Agent Health Check</h1>
            <div id="results">
                ${results
                  .map(
                    (result: any) => `
                    <div class="service">
                        <h3>${result.service}</h3>
                        <p class="${result.status.includes("✅") ? "status-ok" : "status-error"}">
                            ${result.status}
                        </p>
                        <p>Response Time: ${result.responseTime}ms</p>
                        <pre>${JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </body>
        </html>
    `
}

function generateExplanationHTML(code: string, explanation: string): string {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .code-block { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .explanation { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🧠 Code Explanation</h1>
            <h2>Selected Code:</h2>
            <div class="code-block">
                <pre><code>${code}</code></pre>
            </div>
            <h2>AI Explanation:</h2>
            <div class="explanation">
                <p>${explanation}</p>
            </div>
        </body>
        </html>
    `
}

export function deactivate() {
  if (wsClient) {
    wsClient.disconnect()
  }
}
