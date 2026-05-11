import { useState, useRef, useEffect } from "react";
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

export default function BibleAI() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hey! 👋 Got questions about the Bible? I'm here to help. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<Array<{ role: string; parts: Array<{ text: string }> }>>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChat = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
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

    setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    setIsLoading(false);
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
      .replace(/\n/g, "<br>");
  };

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base">Bible AI</h1>
            <p className="text-purple-300 text-xs">Ask anything about the Bible</p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
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
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Ask anything..."
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
