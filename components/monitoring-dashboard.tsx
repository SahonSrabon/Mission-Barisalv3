"use client";

import { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  Gauge,
  Zap,
  Users,
  Server,
  BarChart3,
  Settings,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getHealth,
  getAdminStats,
  getAgents,
  getSessions,
  getLocks,
  getMCPClients,
  getDomainInfo,
} from "@/lib/api";

interface DashboardData {
  health: any;
  stats: any;
  agents: any[];
  sessions: any[];
  locks: any[];
  mcpClients: any[];
  domain: any;
  lastUpdate: number;
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load all data
  const loadData = async () => {
    try {
      setError(null);
      const [health, stats, agents, sessions, locks, mcpClients, domain] =
        await Promise.all([
          getHealth(),
          getAdminStats(),
          getAgents(),
          getSessions(),
          getLocks(50),
          getMCPClients(),
          getDomainInfo(),
        ]);

      setData({
        health,
        stats,
        agents,
        sessions,
        locks,
        mcpClients,
        domain,
        lastUpdate: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(loadData, refreshInterval);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <Server className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Mission Barisal Monitor
          </h2>
          <p className="text-slate-400">
            {loading ? "Loading system data..." : error}
          </p>
        </div>
      </div>
    );
  }

  const uptimeHours = Math.floor((data.health?.uptime || 0) / 3600);
  const uptimeMins = Math.floor(((data.health?.uptime || 0) % 3600) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon-256-C6qDZPX8kl96JHIfLjzjMvzbfOAiJY.png"
                alt="MB Logo"
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Mission Barisal v3
                </h1>
                <p className="text-xs text-slate-400">
                  Real-Time Monitoring Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.health?.healthy
                      ? "bg-green-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-xs text-slate-300">
                  {data.health?.healthy ? "Online" : "Offline"}
                </span>
              </div>

              {/* Domain */}
              <div className="text-xs">
                <p className="text-slate-400">Domain</p>
                <p className="font-semibold text-white">
                  {data.domain?.detected || "unknown"}
                </p>
              </div>

              {/* Refresh Controls */}
              <button
                onClick={loadData}
                className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-100"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  autoRefresh
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {autoRefresh ? "Auto" : "Manual"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* Total Requests */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-600/50 transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Requests
              </p>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {(data.stats?.server?.total_requests || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>

          {/* Active Sessions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-green-600/50 transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Sessions
              </p>
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {data.sessions?.length || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active now</p>
          </div>

          {/* Agents */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-600/50 transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Agents
              </p>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {data.agents?.length || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Available</p>
          </div>

          {/* Memory */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-orange-600/50 transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Memory
              </p>
              <Database className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(data.stats?.server?.memory_rss_mb || 0)}
              <span className="text-sm">MB</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">RSS</p>
          </div>

          {/* Uptime */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-600/50 transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Uptime
              </p>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {uptimeHours}
              <span className="text-sm">h</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">{uptimeMins}m</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-700 flex gap-1">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "agents", label: "Agents", icon: Zap },
            { id: "sessions", label: "Sessions", icon: Users },
            { id: "activity", label: "Activity", icon: Activity },
            { id: "config", label: "Config", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Provider Health */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                Provider Health
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {["OpenCode", "Groq", "Gemini"].map((provider) => (
                  <div
                    key={provider}
                    className="bg-slate-900/50 border border-slate-700 rounded p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-400">
                        {provider}
                      </p>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300">
                      {
                        data.stats?.usage?.providers?.[provider.toLowerCase()]
                          ?.count || 0
                      }{" "}
                      calls
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Usage */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Top Models
              </h3>
              <div className="space-y-2">
                {Object.entries(data.stats?.usage?.models || {})
                  .slice(0, 5)
                  .map(([model, info]: any) => (
                    <div key={model} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 truncate">
                        {model}
                      </span>
                      <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">
                        {info.count} calls
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Model
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">
                    Calls
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.agents?.map((agent) => {
                  const agentStats = data.stats?.usage?.agents?.[agent.id] || {
                    count: 0,
                    errors: 0,
                  };
                  return (
                    <tr
                      key={agent.id}
                      className="border-b border-slate-700/50 hover:bg-slate-900/50 transition cursor-pointer"
                      onClick={() =>
                        setExpandedAgent(
                          expandedAgent === agent.id ? null : agent.id
                        )
                      }
                    >
                      <td className="px-6 py-3">
                        <code className="text-xs text-blue-400 bg-slate-900 px-2 py-1 rounded">
                          {agent.id}
                        </code>
                      </td>
                      <td className="px-6 py-3 text-slate-200">{agent.name}</td>
                      <td className="px-6 py-3 text-slate-400 capitalize">
                        {agent.role}
                      </td>
                      <td className="px-6 py-3 text-slate-400 text-xs">
                        {agent.model}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-white">
                        {agentStats.count}
                      </td>
                      <td className="px-6 py-3 text-right text-red-400">
                        {agentStats.errors || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Editor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">
                    Messages
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.sessions?.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-slate-700/50 hover:bg-slate-900/50 transition"
                  >
                    <td className="px-6 py-3">
                      <code className="text-xs text-green-400 bg-slate-900 px-2 py-1 rounded">
                        {session.client_id?.slice(0, 8)}
                      </code>
                    </td>
                    <td className="px-6 py-3 text-slate-200">
                      {session.editor || "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {session.model}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            session.status === "active"
                              ? "bg-green-400"
                              : "bg-slate-500"
                          }`}
                        />
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-white">
                      {session.messages}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.sessions?.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                No active sessions
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div
            ref={scrollRef}
            className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 h-96 overflow-y-auto font-mono text-xs"
          >
            {data.locks?.map((lock, idx) => (
              <div
                key={idx}
                className={`py-2 border-b border-slate-700/30 text-slate-300 hover:bg-slate-900/30 px-3 transition ${
                  lock.status === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                <span className="text-slate-500">
                  [{new Date(lock.timestamp).toLocaleTimeString()}]
                </span>{" "}
                <span className="text-purple-400">{lock.agent}</span>
                <span className="text-slate-500"> → </span>
                <span className="text-cyan-400">{lock.operation}</span>
                <span className="text-slate-500"> | </span>
                <span className="text-slate-400">{lock.duration_ms}ms</span>
                <span className="text-slate-500"> | </span>
                <span className={lock.status === "success" ? "text-green-400" : "text-red-400"}>
                  {lock.status === "success" ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Server Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Version</p>
                  <p className="text-white font-mono">
                    {data.stats?.server?.version}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-white font-mono capitalize">
                    {data.stats?.server?.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Models</p>
                  <p className="text-white font-mono">
                    {data.stats?.server?.models}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Providers</p>
                  <p className="text-white font-mono">
                    {data.stats?.server?.providers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pusher</p>
                  <p
                    className={`font-mono ${
                      data.stats?.server?.pusher
                        ? "text-green-400"
                        : "text-slate-400"
                    }`}
                  >
                    {data.stats?.server?.pusher ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Frontend</p>
                  <p
                    className={`font-mono ${
                      data.stats?.server?.frontend
                        ? "text-green-400"
                        : "text-slate-400"
                    }`}
                  >
                    {data.stats?.server?.frontend ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                MCP Clients
              </h3>
              {data.mcpClients?.length > 0 ? (
                <div className="space-y-2">
                  {data.mcpClients.map((client) => (
                    <div key={client.name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                      <span className="text-sm text-slate-300">{client.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        client.status === "active"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-slate-700/30 text-slate-400"
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No MCP clients connected</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900/50 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <p>
            Last update: {new Date(data.lastUpdate).toLocaleTimeString()}
          </p>
          <p>
            Refresh interval: {(refreshInterval / 1000).toFixed(0)}s
          </p>
        </div>
      </div>
    </div>
  );
}
