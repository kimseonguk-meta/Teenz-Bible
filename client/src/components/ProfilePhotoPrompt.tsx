import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Profile Photo Upload Prompt ────────────────────────────
// Shows on app load if user hasn't uploaded a profile photo yet.
// Stores photo as base64 in localStorage under "profilePhoto".
// Dispatches "profile-photo-changed" event when photo is set.

function getProfilePhoto(): string | null {
  return localStorage.getItem("profilePhoto");
}

export function hasProfilePhoto(): boolean {
  return !!localStorage.getItem("profilePhoto");
}

export function getProfilePhotoUrl(): string | null {
  return localStorage.getItem("profilePhoto");
}

export function setProfilePhoto(base64: string) {
  localStorage.setItem("profilePhoto", base64);
  window.dispatchEvent(new CustomEvent("profile-photo-changed"));
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

export function removeProfilePhoto() {
  localStorage.removeItem("profilePhoto");
  window.dispatchEvent(new CustomEvent("profile-photo-changed"));
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

// Resize and compress image to a reasonable size for localStorage
function resizeImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Crop to square (center crop)
        const size = Math.min(w, h);
        const sx = (w - size) / 2;
        const sy = (h - size) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);

        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePhotoPrompt() {
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Show prompt after 3 seconds if no profile photo
    const timer = setTimeout(() => {
      const photo = getProfilePhoto();
      const dismissed = localStorage.getItem("photoPromptDismissed");
      if (!photo && !dismissed) {
        setShowModal(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    try {
      const base64 = await resizeImage(file, 200);
      setPreview(base64);
    } catch (err) {
      console.error("Image resize error:", err);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!preview) return;
    setSaving(true);
    setProfilePhoto(preview);
    setTimeout(() => {
      setSaving(false);
      setShowModal(false);
    }, 500);
  }, [preview]);

  const handleSkip = useCallback(() => {
    localStorage.setItem("photoPromptDismissed", "1");
    setShowModal(false);
  }, []);

  const handleLater = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <Dialog open={showModal} onOpenChange={(open) => { if (!open) handleLater(); }}>
      <DialogContent className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-purple-500/30 rounded-2xl p-0 max-w-[340px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="p-6 text-center">
          {/* Header */}
          <div className="text-5xl mb-3">📸</div>
          <h2 className="font-display text-purple-400 text-xl mb-2">Add a Profile Photo!</h2>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Show off your style! Upload a photo so your friends can recognize you on the leaderboard.
          </p>

          {/* Preview / Upload area */}
          <div className="mb-5">
            {preview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-300 text-xs underline"
                >
                  Choose different photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-purple-500/50 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all active:scale-95"
              >
                <span className="text-2xl mb-1">📷</span>
                <span className="text-[10px] text-gray-500">Tap to upload</span>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="space-y-2">
            {preview && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-transform active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Photo! ✨"}
              </button>
            )}
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-xl border border-gray-700/50 bg-gray-800/30 text-gray-400 text-sm transition-all hover:bg-gray-700/30"
            >
              Skip for now
            </button>
          </div>

          <p className="text-gray-600 text-[10px] mt-3">
            You can always change your photo in Profile settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reusable Photo Upload Button for Profile page ──────────
export function ProfilePhotoUploader() {
  const [photo, setPhoto] = useState<string | null>(getProfilePhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setPhoto(getProfilePhoto());
    window.addEventListener("profile-photo-changed", handler);
    return () => window.removeEventListener("profile-photo-changed", handler);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImage(file, 200);
      setProfilePhoto(base64);
      setPhoto(base64);
    } catch (err) {
      console.error("Image resize error:", err);
    }
  }, []);

  const handleRemove = useCallback(() => {
    removeProfilePhoto();
    setPhoto(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative cursor-pointer group"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-purple-500/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-900/40 flex items-center justify-center">
              <span className="text-3xl">{(() => { try { const p = JSON.parse(localStorage.getItem("teensBibleProfile") || "{}"); return p.avatar || "👦"; } catch { return "👦"; } })()}</span>
            </div>
          )}
        </div>
        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
          <span className="text-white text-lg">📷</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-purple-300 text-[10px] underline"
        >
          {photo ? "Change" : "Upload Photo"}
        </button>
        {photo && (
          <button
            onClick={handleRemove}
            className="text-red-400 text-[10px] underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
