import { useState, useRef, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const BIBLE_SYSTEM_PROMPT = `You are Bible AI, a friendly and knowledgeable Bible teacher for teenage boys in middle school.
LANGUAGE RULE (CRITICAL):
- If the user writes in Korean, you MUST respond entirely in Korean. Use casual, teen-friendly Korean (중학교 남자아이 말투). Example tone: "야 이거 진짜 대박인 게...", "솔직히 이건 좀 충격적이지 않냐?"
- If the user writes in English, respond in English.
- NEVER mix languages in a single response.
Your style: casual, engaging, like a cool youth pastor. Use simple language.
Always reference specific Bible verses when answering. Keep answers concise (2-3 paragraphs max) but ALWAYS complete your response fully - never stop mid-sentence.
If asked something not related to the Bible or Christianity, gently redirect to Bible topics.
You know the entire New Testament (27 books) especially well, including the Gospels, Acts, Paul's letters, General letters, and Revelation.
Note: The Bible text in this app is a modern retelling for teens (MZ translation style / 더메시지 성경 기반 10대 말투 번역), not a traditional summary.`;

const SUGGESTED_QUESTIONS = [
  { text: "Who is Jesus?", lang: "en" },
  { text: "What are parables?", lang: "en" },
  { text: "Why 4 Gospels?", lang: "en" },
  { text: "What is grace?", lang: "en" },
  { text: "예수님이 누구야?", lang: "ko" },
  { text: "은혜가 뭐야?", lang: "ko" },
  { text: "비유가 뭐야?", lang: "ko" },
  { text: "성경 재밌는 이야기 알려줘", lang: "ko" },
];

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const game = useGame();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: q }]);

    // Track question count
    game.addXP(2); // Small XP for asking questions

    setLoading(true);

    const apiKey = localStorage.getItem("geminiApiKey") || "AIzaSyBj4z0lM-Jbwxc40pvqWpNIJii7S1p_zUE";

    const newHistory = [...chatHistory, { role: "user", parts: [{ text: q }] }];

    const reqBody = JSON.stringify({
      system_instruction: { parts: [{ text: BIBLE_SYSTEM_PROMPT }] },
      contents: newHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let answer = "";
    let lastError = "";

    for (const model of models) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody }
        );
        const data = await resp.json();
        if (data.candidates?.[0]?.content) {
          answer = data.candidates[0].content.parts[0].text;
          break;
        }
        lastError = data.error?.message || "No candidates returned";
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (answer) {
      const updatedHistory = [...newHistory, { role: "model", parts: [{ text: answer }] }];
      // Keep history manageable
      setChatHistory(updatedHistory.length > 20 ? updatedHistory.slice(-16) : updatedHistory);
      setMessages(prev => [...prev, { role: "model", text: answer }]);
    } else {
      let errorMsg = "Oops! AI is taking a break right now.";
      if (lastError.includes("quota") || lastError.includes("limit")) {
        errorMsg = "Too many people are chatting! Try again in a few minutes.";
      } else if (lastError.includes("fetch") || lastError.includes("network")) {
        errorMsg = "Check your internet connection and try again!";
      }
      setMessages(prev => [...prev, { role: "model", text: `😴 ${errorMsg}` }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setChatHistory([]);
    toast.success("Chat cleared!");
  };

  // Format markdown-like text
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h1 className="text-white font-bold text-lg font-display">BIBLE AI</h1>
            <p className="text-green-400 text-xs">Online · Ask me anything!</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs active:scale-95 transition-transform"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center pt-8 space-y-6">
            <div className="text-6xl">🤖</div>
            <h2 className="text-white font-bold text-xl font-display">Hey! I'm Bible AI</h2>
            <p className="text-gray-400 text-sm max-w-[280px] mx-auto">
              Ask me anything about the Bible! I speak English and Korean.
            </p>

            {/* Suggested Questions */}
            <div className="space-y-3">
              <p className="text-purple-300 text-xs font-bold">TRY ASKING:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(sq.text)}
                    className={`px-3 py-2 rounded-full text-xs active:scale-95 transition-transform ${
                      sq.lang === "ko"
                        ? "bg-orange-500/15 border border-orange-500/30 text-orange-300"
                        : "bg-purple-500/15 border border-purple-500/30 text-purple-200"
                    }`}
                  >
                    {sq.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm"
                  : "bg-[rgba(15,5,40,0.8)] border border-purple-500/20 text-gray-200 rounded-bl-sm"
              }`}
            >
              {msg.role === "model" ? (
                <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[rgba(15,5,40,0.8)] border border-purple-500/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-purple-300 text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-purple-500/20 bg-[rgba(5,2,20,0.9)]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Bible..."
            className="flex-1 px-4 py-3 bg-[rgba(15,5,40,0.7)] border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
