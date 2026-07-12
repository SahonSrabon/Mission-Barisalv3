/**
 * Mission Barisal Server API Client
 * 
 * Handles all communication with the Node.js server at port 5000
 * API Reference: http://localhost:5000 (see SETUP.md and API.md)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

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
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return false;
  }
}
