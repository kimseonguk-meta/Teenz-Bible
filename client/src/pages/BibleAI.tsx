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

const GEMINI_API_KEY = "AIzaSyBj4z0lM-Jbwxc40pvqWpNIJii7S1p_zUE";

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
    // Keep last 100 messages to avoid localStorage bloat
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
    // Keep last 20 turns for context
    const toSave = history.slice(-20);
    localStorage.setItem(GEMINI_HISTORY_KEY, JSON.stringify(toSave));
  } catch {}
}

// Check if Web Speech API is available
function isSpeechRecognitionSupported(): boolean {
  return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history whenever messages change
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

    // Auto-detect language (supports both English and Korean)
    recognition.lang = ""; // Empty = auto-detect

    recognition.onstart = () => {
      setIsListening(true);
    };

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

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
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
      // Detect if user has been typing Korean
      const lang = localStorage.getItem("teensBible_language");
      if (lang === "ko") {
        recognitionRef.current.lang = "ko-KR";
      } else {
        recognitionRef.current.lang = "en-US";
      }
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
        recognitionRef.current.stop();
        setTimeout(() => {
          try { recognitionRef.current.start(); } catch {}
        }, 100);
      }
    }
  }, [isListening]);

  const sendChat = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isLoading) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput("");
    const newUserMsg: ChatMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    chatHistoryRef.current.push({ role: "user", parts: [{ text: q }] });

    const reqBody = JSON.stringify({
      system_instruction: { parts: [{ text: BIBLE_SYSTEM_PROMPT }] },
      contents: chatHistoryRef.current,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
    let data: any = null;
    let lastError = "";

    for (const model of models) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody }
        );
        data = await resp.json();
        if (data.candidates && data.candidates[0]) break;
        lastError = data.error ? data.error.message : "No candidates returned";
      } catch (e: any) {
        lastError = e.message;
      }
    }

    let answer = "";
    if (data?.candidates?.[0]?.content) {
      answer = data.candidates[0].content.parts[0].text;
      chatHistoryRef.current.push({ role: "model", parts: [{ text: answer }] });
      if (chatHistoryRef.current.length > 20) {
        chatHistoryRef.current = chatHistoryRef.current.slice(-16);
      }
    } else {
      answer = "⚠️ Error: " + (lastError || "Unknown error. Please try again.");
    }

    // Save Gemini history
    saveGeminiHistory(chatHistoryRef.current);

    const newBotMsg: ChatMessage = { role: "bot", text: answer };
    setMessages((prev) => [...prev, newBotMsg]);
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
    return text
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
      .replace(/\n/g, "<br>");
  };

  const hasHistory = messages.length > 1;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/20 bg-[#0d0d2b]/80 backdrop-blur-sm">
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
        {/* Clear history button */}
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

      {/* Suggested Questions - show when no real conversation yet */}
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
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-[#1a1a3a] text-gray-200 border border-purple-500/20 rounded-bl-sm"
              }`}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a3a] text-gray-300 border border-purple-500/20 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
              🤔 Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-purple-500/20 bg-[#0d0d2b]/80 backdrop-blur-sm">
        {/* Voice input indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-300 text-xs font-medium">Listening... Speak now</span>
            <button
              onClick={toggleListening}
              className="text-red-400 hover:text-red-300 text-xs ml-1"
            >
              ✕ Stop
            </button>
          </div>
        )}
        <div className="flex gap-2">
          {/* Microphone button */}
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
            className="flex-1 bg-[#1a1a3a] border border-purple-500/30 rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={() => sendChat()}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all active:scale-95"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
