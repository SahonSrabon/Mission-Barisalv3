"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, Code2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatCompletion, healthCheck, getMemoryState, getSyllabus, getAvailableModels } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface SystemStatus {
  serverOnline: boolean;
  currentModel: string;
  memorySize: number;
  syllabusTopics: number;
}

/**
 * Mission Barisal Chat Interface
 * 
 * Features:
 * - Real-time streaming responses
 * - Integration with server memory and syllabus
 * - Model selection and status monitoring
 * - Session history tracking
 */
export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SystemStatus>({
    serverOnline: false,
    currentModel: "code-guru",
    memorySize: 0,
    syllabusTopics: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);

  // Initialize: Check server health and load system state
  useEffect(() => {
    const initialize = async () => {
      try {
        // Health check
        const isOnline = await healthCheck();
        setStatus((prev) => ({ ...prev, serverOnline: isOnline }));

        if (isOnline) {
          // Fetch available models
          const availableModels = await getAvailableModels();
          if (availableModels.length > 0) {
            setModels(availableModels.map((m) => ({ id: m.id, name: m.name })));
            setStatus((prev) => ({ ...prev, currentModel: availableModels[0].id }));
          }

          // Load memory state
          const memory = await getMemoryState();
          if (memory) {
            setStatus((prev) => ({
              ...prev,
              memorySize: memory.session_index.total_sessions,
            }));
          }

          // Load syllabus
          const syllabus = await getSyllabus();
          if (syllabus) {
            // Count topics in syllabus
            const topics = (syllabus.syllabus.match(/^## /gm) || []).length;
            setStatus((prev) => ({ ...prev, syllabusTopics: topics }));
          }
        } else {
          setError("Cannot connect to Mission Barisal server. Make sure it's running on port 5000.");
        }
      } catch (err) {
        console.error("[ChatInterface] Initialization failed:", err);
      }
    };

    initialize();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !status.serverOnline) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      let assistantContent = "";

      // Stream response
      await chatCompletion(
        [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: input },
        ],
        status.currentModel,
        (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.role === "assistant") {
              return [...prev.slice(0, -1), { ...lastMsg, content: assistantContent }];
            }
            return prev;
          });
        }
      );

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      console.error("[ChatInterface] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-900">Mission Barisal</h1>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              Code Guru
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {status.serverOnline ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Connected</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Offline</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* System Info Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-8">
            <TabsTrigger value="status" className="text-xs">
              Status
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">
              Memory
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs">
              Knowledge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-2 text-sm text-slate-600">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-500">Server</span>
                <p className="font-semibold text-slate-900">
                  {status.serverOnline ? "Online" : "Offline"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Model</span>
                <p className="font-semibold text-slate-900 truncate">{status.currentModel}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Messages</span>
                <p className="font-semibold text-slate-900">{messages.length}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-2 text-sm text-slate-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">Sessions</span>
                <p className="font-semibold text-slate-900">{status.memorySize}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Current</span>
                <p className="font-semibold text-slate-900">{messages.length}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-2 text-sm text-slate-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">Topics</span>
                <p className="font-semibold text-slate-900">{status.syllabusTopics}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Type</span>
                <p className="font-semibold text-slate-900">Dynamic</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Start a Conversation</h3>
              <p className="text-sm text-slate-500">
                Ask questions about your code, project architecture, or request explanations.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <Card
                    className={`max-w-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white border-0"
                        : "bg-white text-slate-900 border-slate-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user" ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="bg-white text-slate-900 border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-slate-600">Agent is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={scrollRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                status.serverOnline ? "Ask anything about your code..." : "Server offline..."
              }
              disabled={isLoading || !status.serverOnline}
              className="text-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !status.serverOnline || !input.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
