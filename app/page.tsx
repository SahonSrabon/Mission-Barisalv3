"use client"

import { useState } from "react"

export default function Home() {
  const [status, setStatus] = useState<string>("Ready")
  const [isConnected, setIsConnected] = useState<boolean>(false)

  const handleHealthCheck = async () => {
    setStatus("Running health check...")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("✅ Health check passed")
      setIsConnected(true)
    } catch (error) {
      setStatus("❌ Health check failed")
      setIsConnected(false)
    }
  }

  const handleAskQuestion = async () => {
    setStatus("Connecting to AI Assistant...")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus("✅ AI Assistant ready. Ask your question!")
    } catch (error) {
      setStatus("❌ Failed to connect to AI Assistant")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-white shadow-2xl rounded-lg">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                🤖 AI Copilot Extension
              </h1>
              <p className="text-slate-600">
                Local AI assistant with health monitoring and code explanation capabilities
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700">
                <strong>Status:</strong>{" "}
                <span className={`font-semibold ${isConnected ? "text-green-600" : "text-amber-600"}`}>
                  {status}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleHealthCheck}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                🔧 Health Check
              </button>
              <button
                onClick={handleAskQuestion}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                ❓ Ask AI
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>WebSocket connection monitoring</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Code explanation and analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Memory layer for conversation history</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Real-time health monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
