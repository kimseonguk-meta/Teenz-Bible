import { useState, useRef, useEffect, useCallback } from "react";
import { safeParseJSON } from "@/lib/safeStorage";
import { useLocation } from "wouter";
import { toast } from "sonner";


const BIBLE_SYSTEM_PROMPT = `You are Bible AI, a friendly and knowledgeable Bible teacher for teenage boys in middle school. 
Your style: casual, engaging, like a cool youth pastor. Use simple English. 
Always reference specific Bible verses when answering. Keep answers concise (2-3 paragraphs max) but ALWAYS complete your response fully - never stop mid-sentence.
If asked something not related to the Bible or Christianity, gently redirect to Bible topics.
You know the entire Bible (66 books) especially well, including the Old Testament and New Testament.
Note: The Bible text in this app is a modern retelling for teens (MZ translation style), not a traditional summary.
If the user writes in Korean, respond in casual Korean (반말) suitable for middle school teens. Keep the same friendly, engaging tone.`;

const SUGGESTED_QUESTIONS = [
  { text: "Who is Jesus?", isKo: false },
  { text: "What are parables?", isKo: false },
  { text: "Why 4 Gospels?", isKo: false },
  { text: "What is faith?", isKo: false },
  { text: "Who were the disciples?", isKo: false },
  { text: "What is grace?", isKo: false },
  { text: "What is Revelation about?", isKo: false },
  { text: "예수님이 누구야?", isKo: true },
  { text: "은혜가 뭐야?", isKo: true },
  { text: "요한계시록이 뭔 내용이야?", isKo: true },
];

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

const STORAGE_KEY = "bibleAI_chatHistory";
const GEMINI_HISTORY_KEY = "bibleAI_geminiHistory";
const WELCOME_MSG: ChatMessage = { role: "bot", text: "Hey! 👋 Got questions about the Bible? I'm here to help. Ask me anything!" };

function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = safeParseJSON<any[]>(STORAGE_KEY, []);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted – fallback to welcome
    try { localStorage.setItem(`_corrupted_${STORAGE_KEY}`, localStorage.getItem(STORAGE_KEY) || ''); } catch {}
  }
  return [WELCOME_MSG];
}

function saveChatHistory(messages: ChatMessage[]) {
  try {
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

function loadGeminiHistory(): Array<{ role: string; parts: Array<{ text: string }> }> {
  try {
    const parsed = safeParseJSON<any[]>(GEMINI_HISTORY_KEY, []);
    if (Array.isArray(parsed)) {
        // Normalize legacy roles: bot -> model
        return parsed.map((m: any) => ({
          role: m.role === "bot" ? "model" : m.role === "assistant" ? "model" : m.role,
          parts: Array.isArray(m.parts) ? m.parts : [{ text: String(m.text || "") }],
        })).filter((m: any) => m.role === "user" || m.role === "model");
      }
  } catch {
    try { localStorage.setItem(`_corrupted_${GEMINI_HISTORY_KEY}`, localStorage.getItem(GEMINI_HISTORY_KEY) || ''); } catch {}
  }
  return [];
}

function saveGeminiHistory(history: Array<{ role: string; parts: Array<{ text: string }> }>) {
  try {
    const toSave = history.slice(-20);
    localStorage.setItem(GEMINI_HISTORY_KEY, JSON.stringify(toSave));
  } catch {}
}

function isSpeechRecognitionSupported(): boolean {
  // Android Chrome uses webkitSpeechRecognition, iOS Safari does not support, desktop Chrome supports both
  const w = window as any;
  return !!(w.webkitSpeechRecognition || w.SpeechRecognition || w.mozSpeechRecognition || w.msSpeechRecognition);
}

function getSpeechRecognitionCtor(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || w.mozSpeechRecognition || w.msSpeechRecognition || null;
}

// Bible AI API call - uses Firebase Cloud Function proxy (/api/bible-ai)
// This works for both web and native (via Firebase Hosting URL)
// SECURITY: Client must NEVER contain Gemini API keys – only Cloud Function uses secret
const FIREBASE_HOSTING_URL = "https://teens-bible-94271.web.app";

// Normalize history to Gemini format: user->user, bot->model
function normalizeGeminiHistory(history: Array<{ role: string; parts: Array<{ text: string }> }>): Array<{ role: string; parts: Array<{ text: string }> }> {
  return history
    .map((m) => {
      let role = m.role;
      if (role === "bot") role = "model";
      if (role === "assistant") role = "model";
      if (role !== "user" && role !== "model") {
        // Unknown role, default based on heuristic
        role = "user";
      }
      const parts = Array.isArray(m.parts) && m.parts.length > 0 ? m.parts : [{ text: "" }];
      // Ensure each part has text
      const cleanParts = parts.map((p: any) => ({ text: String(p?.text || "") })).filter(p => p.text.trim().length > 0);
      if (cleanParts.length === 0) return null;
      return { role, parts: cleanParts };
    })
    .filter(Boolean) as Array<{ role: string; parts: Array<{ text: string }> }>;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiAPI(messages: Array<{ role: string; parts: Array<{ text: string }> }>, systemPrompt: string): Promise<{ answer: string; error?: string; errorType?: string }> {
  const normalized = normalizeGeminiHistory(messages);
  console.log("[BibleAI] callGeminiAPI – normalized history len:", normalized.length);

  const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
  const baseUrl = isNative ? FIREBASE_HOSTING_URL : '';

  const attemptFetch = async (retry = false): Promise<{ answer: string; error?: string; errorType?: string }> => {
    try {
      const resp = await fetchWithTimeout(`${baseUrl}/api/bible-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: normalized, systemPrompt }),
      }, 15000);

      if (!resp.ok) {
        if (resp.status === 429) {
          console.warn("[BibleAI] /api/bible-ai 429 rate limit");
          return { answer: "", error: "Bible AI is busy right now (429). Want to try again in a moment? 🙏", errorType: "RATE_LIMIT" };
        }
        if (resp.status === 400) {
          console.warn("[BibleAI] /api/bible-ai 400 bad request");
          return { answer: "", error: "That request didn't look right (400). Want to try a different question? 🙏", errorType: "BAD_REQUEST" };
        }
        if (resp.status === 404) {
          console.warn("[BibleAI] /api/bible-ai 404");
          return { answer: "", error: "Can't reach the Bible AI server (404). Please try again in a moment.", errorType: "NOT_FOUND" };
        }
        if (resp.status === 405) {
          return { answer: "", error: "Invalid request (405).", errorType: "METHOD_NOT_ALLOWED" };
        }
        console.warn("[BibleAI] /api/bible-ai HTTP", resp.status);
        const errText = await resp.text().catch(()=>"");
        return { answer: "", error: `Server error (${resp.status}). Please try again in a moment.`, errorType: "SERVER_ERROR" };
      }

      let result: any;
      try {
        result = await resp.json();
      } catch (e) {
        console.warn("[BibleAI] /api/bible-ai JSON parse failed", e);
        return { answer: "", error: "Couldn't read the server response. Want to try again?", errorType: "PARSE_ERROR" };
      }

      if (result.error) {
        console.warn("[BibleAI] Cloud Function returned error:", result.error);
        return { answer: "", error: result.error || "Something went wrong with Bible AI.", errorType: "FUNCTION_ERROR" };
      }
      if (result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const answer = result.data.candidates[0].content.parts[0].text;
        return { answer };
      }
      if (result.answer) {
        return { answer: result.answer };
      }
      console.warn("[BibleAI] Cloud Function no valid candidates");
      return { answer: "", error: "Couldn't generate an answer. Want to try a different question?", errorType: "NO_CANDIDATES" };
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.warn("[BibleAI] /api/bible-ai timeout 15s", retry ? "(retry)" : "");
        if (!retry) {
          console.log("[BibleAI] Retrying /api/bible-ai after timeout");
          return await attemptFetch(true);
        }
        return { answer: "", error: "Bible AI is taking too long (timeout). Want to try again?", errorType: "TIMEOUT" };
      }
      console.warn("[BibleAI] Cloud Function fetch failed:", e.message, retry ? "(retry)" : "");
      if (!retry) {
        console.log("[BibleAI] Retrying /api/bible-ai after network error");
        return await attemptFetch(true);
      }
      return { answer: "", error: "네트워크 오류로 연결하지 못했어요. 인터넷을 확인해주세요.", errorType: "NETWORK_ERROR" };
    }
  };

  return await attemptFetch(false);
}


export default function BibleAI() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<Array<{ role: string; parts: Array<{ text: string }> }>>(loadGeminiHistory());
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Initialize speech recognition - robust Android Chrome support
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      console.log("[BibleAI] SpeechRecognition not supported");
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = ""; // set dynamically on start

      recognition.onstart = () => {
        console.log("[BibleAI] SpeechRecognition started");
        setIsListening(true);
      };
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        // Use final if available, else interim for live typing
        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
          setInput(transcript);
        }
      };
      recognition.onerror = (event: any) => {
        console.error("[BibleAI] Speech recognition error:", event.error, event.message);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone access denied. Please allow microphone in browser settings. 🎤");
        } else if (event.error === "no-speech") {
          toast("No speech detected. Try again! 🎤", { duration: 2000 });
        } else if (event.error === "audio-capture") {
          toast.error("No microphone found. Check device mic.");
        } else if (event.error === "network") {
          toast.error("Voice recognition network error - check internet.");
        }
      };
      recognition.onend = () => {
        console.log("[BibleAI] SpeechRecognition ended");
        setIsListening(false);
      };
      recognition.onspeechend = () => {
        // Android Chrome sometimes doesn't auto-stop, give it a moment
        try { recognition.stop(); } catch {}
      };
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("[BibleAI] Failed to init SpeechRecognition", e);
    }

    return () => { try { recognitionRef.current?.abort(); } catch {} };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!isSpeechRecognitionSupported()) {
        toast.error("Voice input not supported on this device/browser. Try Chrome on Android or Desktop. 🎤");
      } else {
        toast.error("Voice input is not ready. Reload page and try again.");
      }
      return;
    }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
      return;
    }
    // Start listening - ensure mic permission
    const lang = localStorage.getItem("teensBible_language");
    recognitionRef.current.lang = lang === "ko" ? "ko-KR" : "en-US";
    // Android Chrome needs explicit interimResults reset
    try { recognitionRef.current.interimResults = true; } catch {}
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn("[BibleAI] start() failed, retrying", e?.message);
      try { recognitionRef.current.stop(); } catch {}
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch (err) {
          console.error("[BibleAI] second start failed", err);
          toast.error("Could not start mic - check permissions. 🎤");
          setIsListening(false);
        }
      }, 250);
    }
  }, [isListening]);

  const sendChat = async (question?: string, retryCount = 0) => {
    const q = (question || input).trim();
    if (!q || isLoading) return;
    // Backoff if retry
    if (retryCount > 0) {
      const backoffMs = Math.min(1000 * Math.pow(2, retryCount-1), 5000);
      console.log(`[BibleAI] Retry ${retryCount} backoff ${backoffMs}ms`);
      await new Promise(r => setTimeout(r, backoffMs));
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput("");
    setLastQuestion(q);
    const newUserMsg: ChatMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    // Ensure history uses correct Gemini roles: user->user, bot->model
    chatHistoryRef.current.push({ role: "user", parts: [{ text: q }] });

    try {
      const { answer, error, errorType } = await callGeminiAPI(chatHistoryRef.current, BIBLE_SYSTEM_PROMPT);

      if (answer && answer.trim().length > 0) {
        chatHistoryRef.current.push({ role: "model", parts: [{ text: answer }] });
        if (chatHistoryRef.current.length > 20) {
          chatHistoryRef.current = chatHistoryRef.current.slice(-16);
        }
        saveGeminiHistory(chatHistoryRef.current);
        setMessages((prev) => [...prev, { role: "bot", text: answer }]);
      } else {
        console.warn("[BibleAI] Empty answer, errorType:", errorType, "error:", error);
        // Distinguish error types for better UX
        let displayMsg = error || "Bible AI connection is unstable. Want to try again? 🙏";
        if (!displayMsg || displayMsg.trim().length === 0) {
          displayMsg = "Bible AI connection is unstable. Want to try again? 🙏";
        }
        // If key missing, show helpful message with env hint
        if (errorType === "KEY_MISSING") {
          displayMsg = error || "Bible AI isn't set up yet. Please try again later. 🙏";
        }
        setMessages((prev) => [...prev, { role: "bot", text: displayMsg }]);
      }
    } catch (e: any) {
      console.error("[BibleAI] sendChat exception:", e?.message || e);
      setMessages((prev) => [...prev, { role: "bot", text: "Bible AI connection is unstable. Want to try again? 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([WELCOME_MSG]);
    chatHistoryRef.current = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GEMINI_HISTORY_KEY);
    toast.success("Chat history cleared!");
  };

  const formatMessage = (text: string) => {
    // Sanitize HTML first to prevent XSS from AI responses
    const sanitized = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    // Then apply safe markdown formatting
    return sanitized
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
      .replace(/\n/g, "<br>");
  };

  const hasHistory = messages.length > 1;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#080808] overflow-hidden">
      {/* Header – black theme with gold accent */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-amber-400/15 bg-[#0a0a0a]/80 backdrop-blur-sm z-10" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
        <button
          onClick={() => navigate("/")}
          className="text-purple-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base">Bible AI</h1>
            <p className="text-purple-300 text-xs">Ask anything about the Bible</p>
          </div>
        </div>
        {hasHistory && (
          <button
            onClick={clearHistory}
            className="text-purple-400 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg border border-purple-500/20 hover:border-red-500/30"
            title="Clear chat history"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Suggested Questions */}
      {!hasHistory && (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendChat(q.text)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                q.isKo
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300 hover:border-red-400"
                  : "bg-purple-900/30 border-purple-500/30 text-purple-300 hover:border-purple-400"
              }`}
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => {
          const isRetryable = msg.role === "bot" && (
            msg.text.includes("connection is unstable") ||
            msg.text.includes("try again") ||
            msg.text.includes("busy right now") ||
            msg.text.includes("taking too long") ||
            msg.text.includes("isn't set up yet")
          );
          return (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-[#1a1a3a] text-gray-200 border border-purple-500/20 rounded-bl-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                {isRetryable && lastQuestion && (
                  <button
                    onClick={() => sendChat(lastQuestion, 1)}
                    className="self-start text-xs px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors"
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a3a] text-gray-300 border border-purple-500/20 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm flex items-center gap-1">
              <span>🤔 Thinking</span>
              <span className="inline-flex gap-0.5 ml-1">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input – black theme */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-amber-400/15 bg-[#0a0a0a]/80 backdrop-blur-sm" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-300 text-xs font-medium">Listening... Speak now</span>
            <button onClick={toggleListening} className="text-red-400 hover:text-red-300 text-xs ml-1">✕ Stop</button>
          </div>
        )}
        <div className="flex gap-2 w-full">
          {isSpeechRecognitionSupported() && (
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[#1a1a3a] border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-white"
              } disabled:opacity-50`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              🎤
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder={isListening ? "Listening..." : "Ask anything..."}
            className="flex-1 min-w-0 bg-[#1a1a3a] border border-purple-500/30 rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={() => sendChat()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-full text-sm transition-all active:scale-95"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}