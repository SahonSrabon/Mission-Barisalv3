import * as vscode from "vscode";
import { ServerManager } from "./serverManager";
import { WebsocketClient } from "./websocketClient";
import { ChatProvider } from "./chatProvider";

let serverManager: ServerManager;
let websocketClient: WebsocketClient;
let chatProvider: ChatProvider;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  console.log("[MissionBarisal] Extension activating...");

  // Initialize core components
  serverManager = new ServerManager(context);
  websocketClient = new WebsocketClient();
  chatProvider = new ChatProvider(websocketClient);

  // Create status bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "missionBarisal.showStatus";
  statusBarItem.text = "$(loading~spin) Mission Barisal: Starting...";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  registerCommands(context);

  // Start server on activation
  try {
    const serverRunning = await serverManager.ensureServerRunning();
    if (serverRunning) {
      statusBarItem.text = "$(circle-filled) Mission Barisal: Ready";
      statusBarItem.color = "#10b981";

      // Connect WebSocket
      const connected = await websocketClient.connect(
        serverManager.getWebSocketUrl()
      );
      if (connected) {
        vscode.window.showInformationMessage(
          "Mission Barisal connected successfully!"
        );
      } else {
        vscode.window.showWarningMessage(
          "Mission Barisal: WebSocket connection failed"
        );
      }
    } else {
      statusBarItem.text = "$(circle-outline) Mission Barisal: Server error";
      statusBarItem.color = "#ef4444";
    }
  } catch (error) {
    statusBarItem.text = "$(error) Mission Barisal: Error";
    statusBarItem.color = "#ef4444";
    console.error("[MissionBarisal] Activation error:", error);
  }

  console.log("[MissionBarisal] Extension activated successfully");
}

function registerCommands(context: vscode.ExtensionContext) {
  // Start server command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "missionBarisal.activate",
      async () => {
        statusBarItem.text = "$(loading~spin) Starting server...";
        try {
          const running = await serverManager.startServer();
          if (running) {
            statusBarItem.text = "$(circle-filled) Mission Barisal: Ready";
            statusBarItem.color = "#10b981";
            vscode.window.showInformationMessage("Server started successfully");
          } else {
            vscode.window.showErrorMessage("Failed to start server");
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Server error: ${error}`);
        }
      }
    )
  );

  // Ask question command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "missionBarisal.askQuestion",
      async () => {
        const question = await vscode.window.showInputBox({
          placeHolder: "Ask Mission Barisal a question...",
          prompt: "Enter your question about code",
        });

        if (question) {
          try {
            const response = await websocketClient.ask(question);
            vscode.window.showInformationMessage(`Response: ${response}`);
          } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
          }
        }
      }
    )
  );

  // Explain code command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "missionBarisal.explainCode",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor");
          return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
          vscode.window.showErrorMessage("No code selected");
          return;
        }

        try {
          vscode.window.showInformationMessage("Analyzing code...");
          const explanation = await websocketClient.explain(selectedText);
          showCodeExplanation(explanation);
        } catch (error) {
          vscode.window.showErrorMessage(`Analysis failed: ${error}`);
        }
      }
    )
  );

  // Show status command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "missionBarisal.showStatus",
      async () => {
        const health = await serverManager.getHealthStatus();
        const wsConnected = websocketClient.isConnected();

        const message =
          `Mission Barisal Status\n\n` +
          `Server: ${health?.healthy ? "✓ Running" : "✗ Offline"}\n` +
          `WebSocket: ${wsConnected ? "✓ Connected" : "✗ Disconnected"}\n` +
          `Port: ${health?.port || "N/A"}\n` +
          `Uptime: ${health?.uptime || "N/A"}`;

        vscode.window.showInformationMessage(message);
      }
    )
  );

  // Open dashboard command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "missionBarisal.viewDashboard",
      () => {
        const dashboardUrl = "http://localhost:3000";
        vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
      }
    )
  );
}

function showCodeExplanation(explanation: string) {
  const panel = vscode.window.createWebviewPanel(
    "codeExplanation",
    "Code Explanation",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: system-ui; padding: 20px; }
          .explanation { white-space: pre-wrap; color: #e5e7eb; }
        </style>
      </head>
      <body>
        <h2>Code Explanation</h2>
        <div class="explanation">${escapeHtml(explanation)}</div>
      </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function deactivate() {
  console.log("[MissionBarisal] Extension deactivating...");
  if (websocketClient) {
    websocketClient.disconnect();
  }
  if (serverManager) {
    serverManager.stop();
  }
}
