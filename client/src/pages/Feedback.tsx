import { useState, useEffect } from "react";
import { db, auth, ref, get, set, onAuthStateChanged } from "@/lib/firebase";

// Types
interface FeedbackEntry {
  id: string;
  uid: string;
  nickname: string;
  category: string;
  title: string;
  message: string;
  deviceInfo: string;
  appVersion: string;
  timestamp: number;
  status: "new" | "reviewed" | "resolved";
  developerResponse?: string;
  responseTimestamp?: number;
}

const CATEGORIES = [
  { key: "bug", label: "🐛 Bug Report", desc: "Something isn't working correctly" },
  { key: "feature", label: "💡 Feature Request", desc: "Suggest a new feature or improvement" },
  { key: "content", label: "📖 Content Feedback", desc: "Feedback about Bible content or translations" },
  { key: "ui", label: "🎨 Design & UX", desc: "Visual design or user experience feedback" },
  { key: "performance", label: "⚡ Performance", desc: "App speed, loading, or battery issues" },
  { key: "other", label: "💬 General", desc: "Any other feedback or comments" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Submitted", color: "bg-blue-500/20 text-blue-400" },
  reviewed: { label: "Under Review", color: "bg-yellow-500/20 text-yellow-400" },
  resolved: { label: "Resolved", color: "bg-green-500/20 text-green-400" },
};

export default function Feedback() {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [attempted, setAttempted] = useState(false); // tracks if user tried to submit

  // Form state
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
        try {
          const profile = JSON.parse(localStorage.getItem("teensBibleProfile") || "{}");
          setNickname(profile.nickname || "Anonymous Tester");
        } catch {
          setNickname("Anonymous Tester");
        }
      }
    });
    return () => unsub();
  }, []);

  // Load feedbacks
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const snapshot = await get(ref(db, "feedbacks"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries: FeedbackEntry[] = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val,
          }));
          entries.sort((a, b) => b.timestamp - a.timestamp);
          setFeedbacks(entries);
        }
      } catch (err) {
        console.error("Failed to load feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, [submitted]);

  // Submit feedback
  const handleSubmit = async () => {
    setAttempted(true);

    if (!category || !title.trim() || !message.trim()) return;
    if (!currentUid) return;

    setSubmitting(true);
    try {
      const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const entry: Omit<FeedbackEntry, "id"> = {
        uid: currentUid,
        nickname: nickname || "Anonymous Tester",
        category,
        title: title.trim(),
        message: message.trim(),
        deviceInfo: getDeviceInfo(),
        appVersion: "2.1.0",
        timestamp: Date.now(),
        status: "new",
      };

      await set(ref(db, `feedbacks/${feedbackId}`), entry);

      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSubmitted(true);
        setShowForm(false);
        setCategory("");
        setTitle("");
        setMessage("");
        setAttempted(false);
      }, 2200);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    const platform = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";
    const browser = /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : /Firefox/i.test(ua) ? "Firefox" : "Other";
    return `${platform} - ${browser}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Validation helpers
  const isCategoryError = attempted && !category;
  const isTitleError = attempted && !title.trim();
  const isMessageError = attempted && !message.trim();

  // Stats
  const totalFeedbacks = feedbacks.length;
  const resolvedCount = feedbacks.filter((f) => f.status === "resolved").length;

  return (
    <div className="px-4 pt-6 pb-8 space-y-5 max-w-lg mx-auto">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 animate-[fadeInScale_0.4s_cubic-bezier(0.23,1,0.32,1)]">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-[pulse_0.8s_ease-in-out_infinite]">
              <svg className="w-14 h-14 text-green-400 animate-[checkDraw_0.6s_ease-out_0.3s_both]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-bold text-lg animate-[fadeIn_0.5s_ease-out_0.5s_both]">Feedback Submitted!</p>
            <p className="text-gray-400 text-sm animate-[fadeIn_0.5s_ease-out_0.7s_both]">Thank you for helping us improve</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white font-display">📝 Feedback Center</h1>
        <p className="text-gray-400 text-sm">
          Help us improve Teenz Bible! Your feedback is valuable and reviewed by our development team.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.04] border border-[rgba(212,175,55,0.2)] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#d4af37]">{totalFeedbacks}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Total Feedback</p>
        </div>
        <div className="bg-white/[0.04] border border-green-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-400">{resolvedCount}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Submit Button / Success */}
      {submitted && !showSuccessAnimation && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center space-y-2">
          <span className="text-3xl">✅</span>
          <p className="text-green-400 font-bold text-sm">Thank you for your feedback!</p>
          <p className="text-gray-400 text-xs">Our team will review it shortly.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-xs text-[#d4af37] underline"
          >
            Submit another
          </button>
        </div>
      )}

      {!showForm && !submitted && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a08520] text-white font-bold text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-transform"
        >
          ✍️ Submit New Feedback
        </button>
      )}

      {/* Feedback Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-[rgba(212,175,55,0.2)] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">New Feedback</h2>
            <button onClick={() => { setShowForm(false); setAttempted(false); }} className="text-gray-500 text-lg">✕</button>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isCategoryError ? "text-red-400" : "text-gray-400"}`}>
              Category * {isCategoryError && <span className="text-red-400 ml-1">— Please select a category</span>}
            </label>
            <div className={`grid grid-cols-2 gap-2 rounded-lg p-1 transition-all ${isCategoryError ? "ring-1 ring-red-500/50 bg-red-500/5" : ""}`}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-2.5 rounded-lg text-left transition-all ${
                    category === cat.key
                      ? "bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.5)] text-white"
                      : "bg-white/[0.03] border border-transparent text-gray-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-xs font-medium">{cat.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isTitleError ? "text-red-400" : "text-gray-400"}`}>
              Title * {isTitleError && <span className="text-red-400 ml-1">— Required</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.05] text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all ${
                isTitleError
                  ? "border border-red-500/60 ring-1 ring-red-500/30 bg-red-500/5"
                  : "border border-[rgba(212,175,55,0.2)] focus:border-[rgba(212,175,55,0.5)]"
              }`}
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isMessageError ? "text-red-400" : "text-gray-400"}`}>
              Details * {isMessageError && <span className="text-red-400 ml-1">— Required</span>}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your feedback in detail. Include steps to reproduce if reporting a bug."
              className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.05] text-white text-sm placeholder:text-gray-600 focus:outline-none resize-none transition-all ${
                isMessageError
                  ? "border border-red-500/60 ring-1 ring-red-500/30 bg-red-500/5"
                  : "border border-[rgba(212,175,55,0.2)] focus:border-[rgba(212,175,55,0.5)]"
              }`}
              rows={4}
              maxLength={1000}
            />
            <p className="text-right text-[10px] text-gray-600">{message.length}/1000</p>
          </div>

          {/* Device Info (auto-filled) */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>📱 Device: {getDeviceInfo()}</span>
            <span>•</span>
            <span>v2.1.0</span>
          </div>

          {/* Validation Error Summary */}
          {attempted && (!category || !title.trim() || !message.trim()) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠️</span>
              <p className="text-red-400 text-xs">Please fill in all required fields highlighted above.</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              submitting
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
            }`}
          >
            {submitting ? "Submitting..." : "📤 Submit Feedback"}
          </button>
        </div>
      )}

      {/* Feedback Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-sm">📋 Feedback Log</h2>
          <span className="text-[10px] text-gray-500">{totalFeedbacks} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <span className="text-4xl">📭</span>
            <p className="text-gray-400 text-sm">No feedback submitted yet.</p>
            <p className="text-gray-500 text-xs">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {feedbacks.map((fb) => {
              const catInfo = CATEGORIES.find((c) => c.key === fb.category);
              const statusInfo = STATUS_LABELS[fb.status] || STATUS_LABELS.new;
              return (
                <div
                  key={fb.id}
                  className="bg-white/[0.03] border border-purple-500/10 rounded-xl p-3.5 space-y-2.5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {catInfo && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-[#d4af37]">
                            {catInfo.label}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium mt-1.5 truncate">{fb.title}</p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-gray-400 text-xs leading-relaxed">{fb.message}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <span>👤 {fb.nickname}</span>
                    <span>•</span>
                    <span>{formatDate(fb.timestamp)}</span>
                    <span>•</span>
                    <span>{fb.deviceInfo}</span>
                  </div>

                  {/* Developer Response */}
                  {fb.developerResponse && (
                    <div className="mt-2 bg-teal-500/5 border border-teal-500/20 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold">
                          👨‍💻 Developer Response
                        </span>
                        {fb.responseTimestamp && (
                          <span className="text-[9px] text-gray-600">{formatDate(fb.responseTimestamp)}</span>
                        )}
                      </div>
                      <p className="text-teal-300/80 text-xs leading-relaxed">{fb.developerResponse}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-4 border-t border-purple-500/10">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          All feedback is reviewed by our development team. We aim to respond within 48 hours.
          <br />
          For urgent issues, contact us at{" "}
          <a href="mailto:support@teenzbible.com" className="text-[#d4af37] underline">
            support@teenzbible.com
          </a>
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
