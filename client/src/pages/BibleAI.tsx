import { useState, useRef, useEffect, useCallback } from "react";
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
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
    const raw = localStorage.getItem(GEMINI_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveGeminiHistory(history: Array<{ role: string; parts: Array<{ text: string }> }>) {
  try {
    const toSave = history.slice(-20);
    localStorage.setItem(GEMINI_HISTORY_KEY, JSON.stringify(toSave));
  } catch {}
}

function isSpeechRecognitionSupported(): boolean {
  return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
}

// Bible AI API call - uses server proxy (/api/bible-ai)
// For native apps, uses Manus hosting URL; for web, uses relative path
const SERVER_URL = "https://teenzbible.manus.space";

async function callGeminiAPI(messages: Array<{ role: string; parts: Array<{ text: string }> }>, systemPrompt: string): Promise<{ answer: string; error?: string }> {
  try {
    // Determine the base URL - on native, use the full server URL
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
    const baseUrl = isNative ? SERVER_URL : '';
    
    const resp = await fetch(`${baseUrl}/api/bible-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    const result = await resp.json();
    if (result.error) {
      // If Cloud Function fails, try direct Gemini as fallback
      console.warn("Cloud Function error, trying direct Gemini:", result.error);
      return await callGeminiDirect(messages, systemPrompt);
    }
    if (result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const answer = result.data.candidates[0].content.parts[0].text;
      return { answer };
    }
    // No valid response from Cloud Function, try direct
    return await callGeminiDirect(messages, systemPrompt);
  } catch (e: any) {
    // Network error or Cloud Function unavailable, try direct Gemini as fallback
    console.warn("Cloud Function fetch failed, trying direct Gemini:", e.message);
    return await callGeminiDirect(messages, systemPrompt);
  }
}

// Fallback: retry via server with different base URL
async function callGeminiDirect(messages: Array<{ role: string; parts: Array<{ text: string }> }>, systemPrompt: string): Promise<{ answer: string; error?: string }> {
  // Always route through server proxy (no client-side API key exposure)
  try {
    const resp = await fetch(`${SERVER_URL}/api/bible-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    const result = await resp.json();
    if (result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { answer: result.data.candidates[0].content.parts[0].text };
    }
    return { answer: "", error: result.error || "Bible AI is temporarily unavailable. Please try again in a moment! \uD83D\uDE4F" };
  } catch (e: any) {
    console.warn("Bible AI fallback error:", e.message);
    return { answer: "", error: "Bible AI is temporarily unavailable. Please try again in a moment! \uD83D\uDE4F" };
  }
}

export default function BibleAI() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone in browser settings.");
      } else if (event.error === "no-speech") {
        toast("No speech detected. Try again!", { icon: "🎤" });
      }
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => { try { recognition.abort(); } catch {} };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const lang = localStorage.getItem("teensBible_language");
      recognitionRef.current.lang = lang === "ko" ? "ko-KR" : "en-US";
      try { recognitionRef.current.start(); } catch {
        recognitionRef.current.stop();
        setTimeout(() => { try { recognitionRef.current.start(); } catch {} }, 100);
      }
    }
  }, [isListening]);

  const sendChat = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput("");
    const newUserMsg: ChatMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    chatHistoryRef.current.push({ role: "user", parts: [{ text: q }] });

    try {
      const { answer, error } = await callGeminiAPI(chatHistoryRef.current, BIBLE_SYSTEM_PROMPT);

      if (answer) {
        chatHistoryRef.current.push({ role: "model", parts: [{ text: answer }] });
        if (chatHistoryRef.current.length > 20) {
          chatHistoryRef.current = chatHistoryRef.current.slice(-16);
        }
        saveGeminiHistory(chatHistoryRef.current);
        setMessages((prev) => [...prev, { role: "bot", text: answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: error || "Something went wrong. Please try again! 🙏" }]);
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "bot", text: "Oops! Connection error. Please check your internet and try again. 🙏" }]);
    }
    setIsLoading(false);
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
    <div className="flex flex-col h-[100dvh] bg-[#0a0a1a] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-[#0d0d2b]/80 backdrop-blur-sm z-10" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
        <button
          onClick={() => navigate("/")}
          className="text-[#FF9600] font-bold hover:text-gray-800 transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <h1 className="text-gray-800 font-bold text-base">Bible AI</h1>
            <p className="text-[#FF9600] font-bold text-xs">Ask anything about the Bible</p>
          </div>
        </div>
        {hasHistory && (
          <button
            onClick={clearHistory}
            className="text-[#FF9600] font-bold hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg border border-gray-200 hover:border-red-500/30"
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
                  : "bg-gray-50 border-gray-200 text-[#FF9600] font-bold hover:border-[#FF9600]"
              }`}
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-purple-600 text-gray-800 rounded-br-sm"
                  : "bg-gray-50 text-gray-200 border border-gray-200 rounded-bl-sm"
              }`}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-300 border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
              🤔 Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-[#0d0d2b]/80 backdrop-blur-sm" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
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
                  ? "bg-red-500 text-gray-800 animate-pulse"
                  : "bg-gray-50 border border-gray-200 text-[#FF9600] font-bold hover:border-[#FF9600] hover:text-gray-800"
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
            className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF9600] transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={() => sendChat()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:opacity-50 text-gray-800 font-bold px-4 py-2.5 rounded-full text-sm transition-all active:scale-95"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
