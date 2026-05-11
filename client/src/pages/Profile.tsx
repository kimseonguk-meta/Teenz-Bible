import { useState, useEffect, useCallback } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";
import { useLocation } from "wouter";

const ALL_BADGES = [
  { id: "첫 시작", name: "First Step", desc: "Started reading the Bible", emoji: "📖" },
  { id: "7일 독서", name: "7-Day Reader", desc: "7-day streak achieved", emoji: "🏆" },
  { id: "백 장 독파", name: "100 Chapters", desc: "Read 100 chapters", emoji: "💯" },
  { id: "복음 전도자", name: "Evangelist", desc: "Invited 3 friends", emoji: "⭐" },
  { id: "마태복음 완독", name: "Matthew Complete", desc: "Finished all of Matthew", emoji: "📕" },
];

const REMINDER_MESSAGES = [
  "📖 Time to read God's Word! Your daily Bible chapter awaits.",
  "🔥 Don't break your streak! Open Teenz Bible and read today.",
  "✨ A few minutes with the Bible can change your whole day!",
  "🙏 Hey! Your daily Bible reading is waiting for you.",
  "💪 Champions read daily! Keep your streak alive.",
];

function getNotifSettings() {
  try {
    const saved = localStorage.getItem("notifSettings");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { enabled: false, hour: 20, minute: 0, permission: "default" };
}

function saveNotifSettings(settings: any) {
  localStorage.setItem("notifSettings", JSON.stringify(settings));
}

export default function Profile() {
  const game = useGame();
  const level = game.getLevel();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [newName, setNewName] = useState(game.playerName);
  const [newClass, setNewClass] = useState(game.className);
  const [, navigate] = useLocation();

  // Notification reminder state
  const [notifSettings, setNotifSettings] = useState(getNotifSettings);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const handleSaveName = () => {
    if (newName.trim()) {
      game.setPlayerName(newName.trim());
      game.setClassName(newClass.trim());
      setShowEditName(false);
      toast.success("Profile updated!");
    }
  };

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this browser");
      return false;
    }
    if (Notification.permission === "granted") {
      setPermissionState("granted");
      return true;
    }
    if (Notification.permission === "denied") {
      toast.error("Notifications are blocked. Please enable them in your browser settings.");
      setPermissionState("denied");
      return false;
    }
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      toast.success("🔔 Notifications enabled!");
      return true;
    } else {
      toast.error("Notification permission denied");
      return false;
    }
  }, []);

  // Toggle reminder on/off
  const toggleReminder = useCallback(async () => {
    if (!notifSettings.enabled) {
      const granted = await requestPermission();
      if (granted) {
        const updated = { ...notifSettings, enabled: true, permission: "granted" };
        setNotifSettings(updated);
        saveNotifSettings(updated);
        scheduleReminder(updated);
        toast.success(`⏰ Daily reminder set for ${formatTime(updated.hour, updated.minute)}`);
      }
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotifSettings(updated);
      clearScheduledReminder();
      toast.info("Reminder turned off");
    }
  }, [notifSettings, requestPermission]);

  // Update reminder time
  const updateTime = useCallback((hour: number, minute: number) => {
    const updated = { ...notifSettings, hour, minute };
    setNotifSettings(updated);
    saveNotifSettings(updated);
    if (updated.enabled) {
      scheduleReminder(updated);
      toast.success(`⏰ Reminder updated to ${formatTime(hour, minute)}`);
    }
  }, [notifSettings]);

  // Schedule notification using setTimeout (recalculated on each page load)
  useEffect(() => {
    if (notifSettings.enabled && permissionState === "granted") {
      scheduleReminder(notifSettings);
    }
    return () => clearScheduledReminder();
  }, []);

  const matthewRead = game.getChaptersRead("Matthew").length;
  const matthewTotal = 28;

  return (
    <div className="px-4 pt-6 space-y-5 relative">
      {/* Header icons */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-gray-300 active:scale-95 transition-transform">
          ⚙️
        </button>
        <button onClick={() => setShowNotifications(true)}
          className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-gray-300 relative active:scale-95 transition-transform">
          🔔
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border border-purple-900" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] bg-purple-900/50 flex items-center justify-center"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
            <span className="text-6xl">👦</span>
          </div>
          <button onClick={() => { setNewName(game.playerName); setNewClass(game.className); setShowEditName(true); }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-sm active:scale-95 transition-transform">
            ✏️
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mt-3 font-display">{game.playerName}</h2>
        <div className="mt-1 px-4 py-1 bg-purple-600/30 border border-purple-500/40 rounded-full flex items-center gap-2">
          <span className="text-yellow-400">⭐</span>
          <span className="text-purple-200 text-sm font-bold">Lv. {level.level} {level.name}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">{game.className}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">XP</span>
            <span className="text-gray-400 text-xs">Total XP</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.totalXP}</div>
          <div className="text-[10px] text-gray-500">XP</div>
        </div>
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💎</span>
            <span className="text-gray-400 text-xs">Gems</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.gems}</div>
          <div className="text-[10px] text-gray-500">Gems</div>
        </div>
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">🔥</span>
            <span className="text-gray-400 text-xs">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.dayStreak}</div>
          <div className="text-[10px] text-gray-500">Days</div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm">🏆 Achievements</h3>
          <span className="text-gray-400 text-xs">See All &gt;</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {ALL_BADGES.map((badge) => {
            const earned = game.badges.includes(badge.id);
            return (
              <div key={badge.id}
                className={`flex-shrink-0 w-20 flex flex-col items-center text-center cursor-pointer ${!earned ? 'opacity-40' : ''}`}
                onClick={() => earned ? toast.success(`🏆 ${badge.name}: ${badge.desc}`) : toast.info("Achievement not yet unlocked")}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  earned ? 'bg-purple-600/30 border-2 border-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'bg-gray-800/50 border border-gray-700/30'
                }`}>
                  {badge.emoji}
                </div>
                <p className="text-white text-[10px] font-medium mt-1">{badge.name}</p>
                <p className="text-gray-500 text-[8px]">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Progress */}
      <div className="neon-card p-4">
        <h3 className="text-white font-bold text-sm mb-3">📖 Reading Progress</h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl">📕</div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Matthew</p>
            <p className="text-gray-400 text-xs">{matthewRead} / {matthewTotal} chapters</p>
            <div className="mt-1.5 h-2 bg-gray-800/80 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${(matthewRead / matthewTotal) * 100}%` }} />
            </div>
          </div>
          <span className="text-purple-300 text-sm font-bold">{Math.round((matthewRead / matthewTotal) * 100)}%</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/challenges")}
          className="neon-card p-3 flex items-center gap-2 active:scale-95 transition-transform">
          <span className="text-xl">🏆</span>
          <div className="text-left">
            <p className="text-white text-xs font-bold">Challenges</p>
            <p className="text-gray-500 text-[9px]">Weekly missions</p>
          </div>
        </button>
        <button onClick={() => navigate("/challenges")}
          className="neon-card p-3 flex items-center gap-2 active:scale-95 transition-transform">
          <span className="text-xl">👥</span>
          <div className="text-left">
            <p className="text-white text-xs font-bold">Invite Friends</p>
            <p className="text-gray-500 text-[9px]">Earn 50 gems</p>
          </div>
        </button>
      </div>

      {/* Equipped Items */}
      <div>
        <h3 className="text-white font-bold text-sm mb-3">✨ Equipped Items</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="neon-card p-3 text-center">
            <div className="text-2xl mb-1">
              {game.equippedPet === "Faithy Cat" ? "🐱" :
               game.equippedPet === "Hope Puppy" ? "🐶" :
               game.equippedPet === "Joy Lamb" ? "🐑" :
               game.equippedPet === "Grace Bunny" ? "🐰" :
               game.equippedPet === "Peace Dove" ? "🕊️" :
               game.equippedPet === "Love Bear" ? "🐻" : "🐱"}
            </div>
            <p className="text-white text-[10px] font-medium">{game.equippedPet}</p>
            <p className="text-gray-500 text-[8px]">Pet</p>
          </div>
          <div className="neon-card p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full" style={{
              background: game.equippedTheme === "Twilight Glow" ? "linear-gradient(135deg, #4c1d95, #7c3aed)" :
                game.equippedTheme === "Sea Breeze" ? "linear-gradient(135deg, #0e7490, #22d3ee)" :
                game.equippedTheme === "Forest Calm" ? "linear-gradient(135deg, #166534, #4ade80)" :
                game.equippedTheme === "Sunset Blaze" ? "linear-gradient(135deg, #9a3412, #fb923c)" :
                game.equippedTheme === "Cherry Blossom" ? "linear-gradient(135deg, #831843, #f472b6)" :
                "linear-gradient(135deg, #4c1d95, #7c3aed)"
            }} />
            <p className="text-white text-[10px] font-medium mt-1">{game.equippedTheme}</p>
            <p className="text-gray-500 text-[8px]">Theme</p>
          </div>
          <div className="neon-card p-3 text-center">
            <div className="text-2xl mb-1">
              {game.equippedFrame === "Gold Crown" ? "👑" :
               game.equippedFrame === "Diamond" ? "💎" :
               game.equippedFrame === "Fire Ring" ? "🔥" : "⬜"}
            </div>
            <p className="text-white text-[10px] font-medium">{game.equippedFrame}</p>
            <p className="text-gray-500 text-[8px]">Frame</p>
          </div>
        </div>
      </div>

      <div className="h-4" />

      {/* ─── Settings Modal ─── */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-[480px] bg-[#0a0020] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white font-display">⚙️ Settings</h2>

            <button onClick={() => { setShowSettings(false); setNewName(game.playerName); setNewClass(game.className); setShowEditName(true); }}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">✏️</span>
              <span className="text-white text-sm">Edit Name / Class</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => { setShowSettings(false); setShowReminderSettings(true); }}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">⏰</span>
              <div className="flex-1 text-left">
                <span className="text-white text-sm">Daily Reminder</span>
                {notifSettings.enabled && (
                  <span className="ml-2 text-green-400 text-xs">ON · {formatTime(notifSettings.hour, notifSettings.minute)}</span>
                )}
              </div>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => { setShowSettings(false); setShowNotifications(true); }}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">🔔</span>
              <span className="text-white text-sm">Notifications</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => toast.info("🌐 Language: Korean / English supported in Bible reader")}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">🌐</span>
              <span className="text-white text-sm">Language</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => toast.info("🔊 Audio: Use the 🔊 button in Bible reader for TTS")}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">🔊</span>
              <span className="text-white text-sm">Audio / TTS</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => {
              if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
              className="w-full p-3 neon-card flex items-center gap-3 border-red-500/30 active:scale-[0.98] transition-transform">
              <span className="text-lg">🗑️</span>
              <span className="text-red-400 text-sm">Reset Data</span>
            </button>

            <button onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-bold">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Daily Reminder Settings Modal ─── */}
      {showReminderSettings && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={() => setShowReminderSettings(false)}>
          <div className="w-full max-w-[480px] bg-[#0a0020] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white font-display">⏰ Daily Reminder</h2>
            <p className="text-gray-400 text-sm">Get a daily notification to remind you to read the Bible.</p>

            {/* Enable/Disable Toggle */}
            <div className="neon-card p-4 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">Enable Reminder</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {permissionState === "denied" ? "⚠️ Blocked in browser settings" :
                   notifSettings.enabled ? `Reminder at ${formatTime(notifSettings.hour, notifSettings.minute)}` :
                   "Tap to turn on"}
                </p>
              </div>
              <button onClick={toggleReminder}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                  notifSettings.enabled ? 'bg-purple-600' : 'bg-gray-700'
                }`}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  notifSettings.enabled ? 'left-7' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Time Picker */}
            {notifSettings.enabled && (
              <div className="neon-card p-4 space-y-3">
                <p className="text-white text-sm font-bold">Reminder Time</p>
                <div className="flex items-center justify-center gap-3">
                  {/* Hour */}
                  <div className="flex flex-col items-center">
                    <button onClick={() => updateTime((notifSettings.hour + 1) % 24, notifSettings.minute)}
                      className="text-purple-300 text-lg active:scale-90 transition-transform">▲</button>
                    <div className="w-16 h-14 bg-purple-900/50 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold font-mono">{String(notifSettings.hour).padStart(2, '0')}</span>
                    </div>
                    <button onClick={() => updateTime((notifSettings.hour - 1 + 24) % 24, notifSettings.minute)}
                      className="text-purple-300 text-lg active:scale-90 transition-transform">▼</button>
                    <span className="text-gray-500 text-[10px] mt-0.5">Hour</span>
                  </div>

                  <span className="text-white text-2xl font-bold mt-[-20px]">:</span>

                  {/* Minute */}
                  <div className="flex flex-col items-center">
                    <button onClick={() => updateTime(notifSettings.hour, (notifSettings.minute + 5) % 60)}
                      className="text-purple-300 text-lg active:scale-90 transition-transform">▲</button>
                    <div className="w-16 h-14 bg-purple-900/50 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold font-mono">{String(notifSettings.minute).padStart(2, '0')}</span>
                    </div>
                    <button onClick={() => updateTime(notifSettings.hour, (notifSettings.minute - 5 + 60) % 60)}
                      className="text-purple-300 text-lg active:scale-90 transition-transform">▼</button>
                    <span className="text-gray-500 text-[10px] mt-0.5">Minute</span>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 justify-center pt-2">
                  {[
                    { label: "Morning", h: 7, m: 0, emoji: "🌅" },
                    { label: "Noon", h: 12, m: 0, emoji: "☀️" },
                    { label: "Evening", h: 20, m: 0, emoji: "🌙" },
                  ].map(preset => (
                    <button key={preset.label} onClick={() => updateTime(preset.h, preset.m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        notifSettings.hour === preset.h && notifSettings.minute === preset.m
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-purple-900/30 text-gray-400 border border-purple-500/20'
                      }`}>
                      {preset.emoji} {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test notification */}
            {notifSettings.enabled && (
              <button onClick={() => {
                if (Notification.permission === "granted") {
                  new Notification("📖 Teenz Bible Reminder", {
                    body: REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)],
                    icon: "📖",
                  });
                  toast.success("Test notification sent!");
                } else {
                  toast.error("Please enable notifications first");
                }
              }}
                className="w-full p-3 neon-card flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                <span>🔔</span>
                <span className="text-purple-300 text-sm">Send Test Notification</span>
              </button>
            )}

            <button onClick={() => setShowReminderSettings(false)}
              className="w-full py-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-bold">
              Done
            </button>
          </div>
        </div>
      )}

      {/* ─── Edit Name Modal ─── */}
      {showEditName && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6" onClick={() => setShowEditName(false)}>
          <div className="w-full max-w-[400px] bg-[#0a0020] border border-purple-500/30 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white font-display">✏️ Edit Profile</h2>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                placeholder="Enter your name" />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">Class</label>
              <input type="text" value={newClass} onChange={(e) => setNewClass(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                placeholder="Enter your class" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditName(false)}
                className="flex-1 py-2.5 bg-gray-800/50 border border-gray-700/30 rounded-xl text-gray-300 text-sm">
                Cancel
              </button>
              <button onClick={handleSaveName}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notifications Modal ─── */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-[480px] bg-[#0a0020] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white font-display">🔔 Notifications</h2>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">📖</span>
              <div className="flex-1">
                <p className="text-white text-sm">Start today's Bible reading!</p>
                <p className="text-gray-500 text-xs">Just now</p>
              </div>
            </div>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">🎁</span>
              <div className="flex-1">
                <p className="text-white text-sm">Claim your daily reward!</p>
                <p className="text-gray-500 text-xs">Today</p>
              </div>
            </div>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">🔥</span>
              <div className="flex-1">
                <p className="text-white text-sm">Keep your streak going! Day {game.dayStreak}</p>
                <p className="text-gray-500 text-xs">Today</p>
              </div>
            </div>

            {/* Reminder status */}
            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">⏰</span>
              <div className="flex-1">
                <p className="text-white text-sm">
                  {notifSettings.enabled
                    ? `Daily reminder: ${formatTime(notifSettings.hour, notifSettings.minute)}`
                    : "Daily reminder: Off"}
                </p>
                <p className="text-gray-500 text-xs">
                  {notifSettings.enabled ? "You'll get a daily reading reminder" : "Set up in Settings → Daily Reminder"}
                </p>
              </div>
              <button onClick={() => { setShowNotifications(false); setShowReminderSettings(true); }}
                className="text-purple-400 text-xs font-bold">Setup</button>
            </div>

            <button onClick={() => setShowNotifications(false)}
              className="w-full py-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-bold">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper functions ───
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleReminder(settings: { enabled: boolean; hour: number; minute: number }) {
  clearScheduledReminder();
  if (!settings.enabled) return;

  const now = new Date();
  const target = new Date();
  target.setHours(settings.hour, settings.minute, 0, 0);

  // If the target time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  reminderTimeout = setTimeout(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const messages = [
        "📖 Time to read God's Word! Your daily Bible chapter awaits.",
        "🔥 Don't break your streak! Open Teenz Bible and read today.",
        "✨ A few minutes with the Bible can change your whole day!",
        "🙏 Hey! Your daily Bible reading is waiting for you.",
        "💪 Champions read daily! Keep your streak alive.",
      ];
      new Notification("📖 Teenz Bible Reminder", {
        body: messages[Math.floor(Math.random() * messages.length)],
      });
    }
    // Reschedule for next day
    scheduleReminder(settings);
  }, delay);
}

function clearScheduledReminder() {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
    reminderTimeout = null;
  }
}
