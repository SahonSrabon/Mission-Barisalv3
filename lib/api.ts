/**
 * Mission Barisal Server API Client
 * 
 * Connects to Mission Barisal v3 server at api.selfsmartearning.com
 * Server File: hamba.js (9,323 lines, zero-dependency Node.js)
 * Endpoints: REST + WebSocket + JSON-RPC 2.0 (MCP)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://api.selfsmartearning.com";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface ModelInfo {
  id: string;
  object: string;
  name: string;
  provider: string;
  capabilities?: {
    function_calling?: boolean;
    streaming?: boolean;
  };
}

interface WorkspaceResponse {
  ok: boolean;
  workspacePath: string;
  ssotPath: string;
  generated: boolean;
  server_ts: number;
}

interface MemoryState {
  current_session: {
    id: string | null;
    started_at: string | null;
    message_count: number;
    summary: string | null;
  };
  recent_context: Array<{
    session_id: string;
    summary: string;
    tags: string[];
    timestamp: string;
  }>;
  session_index: {
    last_accessed: string | null;
    total_sessions: number;
    total_archived: number;
  };
}

interface SyllabusResponse {
  ok: boolean;
  syllabus: string;
  path: string;
}

/**
 * Fetch available AI models from server
 * Endpoint: GET /v1/models
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("[API] Failed to fetch models:", error);
    return [];
  }
}

/**
 * Register workspace with server
 * Endpoint: POST /api/workspace
 * 
 * Server will:
 * 1. Auto-detect project type and tech stack
 * 2. Generate SSOT.md in .zombiecoder directory
 * 3. Set mcpWorkingDir for subsequent requests
 */
export async function registerWorkspace(workspacePath: string): Promise<WorkspaceResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workspace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspacePath,
        source: "web-dashboard",
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[API] Failed to register workspace:", error);
    return null;
  }
}

/**
 * Get current memory state
 * Endpoint: GET /api/memory
 * 
 * Returns:
 * - Current session info
 * - Recent context from archived sessions
 * - Session statistics
 */
export async function getMemoryState(): Promise<MemoryState | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/memory`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.memory || null;
  } catch (error) {
    console.error("[API] Failed to fetch memory state:", error);
    return null;
  }
}

/**
 * Get agent's syllabus (knowledge base)
 * Endpoint: GET /api/syllabus
 * 
 * Returns markdown-formatted syllabus containing:
 * - Latest learnings with sources and dates
 * - Topic-based knowledge organization
 * - Web search results and GitHub findings
 */
export async function getSyllabus(): Promise<SyllabusResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/syllabus`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[API] Failed to fetch syllabus:", error);
    return null;
  }
}

/**
 * Stream chat completions (OpenAI-compatible)
 * Endpoint: POST /v1/chat/completions
 * 
 * Features:
 * - Multi-agent execution for complex queries
 * - Auto-injection of SSOT + Syllabus + Memory
 * - Streaming support
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "code-guru",
  onData?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  let fullContent = "";
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No response body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onData?.(content);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullContent;
}

/**
 * Health check endpoint
 * Quick test to verify server is running
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return false;
  }
}

// ============ MONITORING DASHBOARD ENDPOINTS ============

interface HealthResponse {
  healthy: boolean;
  version: string;
  domain: string;
  serverType: string;
  agents: number;
  models: number;
  pusher: boolean;
  hasFrontend: boolean;
  maxRateLimit: number;
  uptime: number;
  session_count: number;
  rate_limit: { limited: boolean; domain: string };
}

interface AdminStats {
  server: {
    version: string;
    domain: string;
    type: string;
    uptime_sec: number;
    total_requests: number;
    agents: number;
    providers: number;
    models: number;
    pusher: boolean;
    frontend: boolean;
    sessions: number;
    memory_rss_mb: number;
    memory_heap_mb: number;
    lock_log_entries: number;
  };
  usage: {
    providers: Record<string, any>;
    models: Record<string, any>;
    agents: Record<string, any>;
    domains: Record<string, any>;
  };
  rate_limit: { limited: boolean; provider: string | null; model: string | null };
  agents: Array<{ id: string; name: string; role: string; priority: number }>;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  provider: string;
}

interface Session {
  id: string;
  client_id: string;
  editor: string;
  model: string;
  provider: string;
  messages: number;
  status: string;
  created_at: string;
  last_activity: string;
}

interface LockEntry {
  agent: string;
  operation: string;
  status: string;
  duration_ms: number;
  timestamp: string;
}

interface MCPClient {
  name: string;
  version: string;
  status: string;
  working_dir: string;
}

/**
 * GET /health — Server health check
 */
export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return null;
  }
}

/**
 * GET /api/admin/stats — Full runtime statistics
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Failed to get admin stats:", error);
    return null;
  }
}

/**
 * GET /api/agents — List all agents
 */
export async function getAgents(): Promise<Agent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents`);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.agents || [];
  } catch (error) {
    console.error("[API] Failed to get agents:", error);
    return [];
  }
}

/**
 * GET /api/sessions — Active sessions
 */
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions`);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error("[API] Failed to get sessions:", error);
    return [];
  }
}

/**
 * GET /api/locks — Lock log (audit trail)
 */
export async function getLocks(limit: number = 50): Promise<LockEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locks?limit=${limit}`);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.latest || [];
  } catch (error) {
    console.error("[API] Failed to get locks:", error);
    return [];
  }
}

/**
 * GET /api/mcp-clients — Connected MCP clients
 */
export async function getMCPClients(): Promise<MCPClient[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcp-clients`);
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    return data.connected_clients || [];
  } catch (error) {
    console.error("[API] Failed to get MCP clients:", error);
    return [];
  }
}

/**
 * GET /api/domain — Domain detection
 */
export async function getDomainInfo(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/domain`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Failed to get domain info:", error);
    return null;
  }
}

/**
 * GET /api/config — Runtime configuration
 */
export async function getConfig(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Failed to get config:", error);
    return null;
  }
}

/**
 * GET /api/rate-limit — Rate limit status
 */
export async function getRateLimit(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rate-limit`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Failed to get rate limit:", error);
    return null;
  }
}
