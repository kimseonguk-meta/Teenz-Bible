import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { auth, db, ref, update } from "@/lib/firebase";

// ─── Profile Photo Upload Prompt ────────────────────────────
// Uploads photo to Firebase Storage, stores URL in localStorage.
// Falls back to base64 in localStorage if upload fails.
// Dispatches "profile-photo-changed" event when photo is set.

// Filters available for photos
const FILTERS = [
  { name: "None", class: "", style: { filter: "" } },
  { name: "B&W", class: "grayscale", style: { filter: "grayscale(100%)" } },
  { name: "Warm", class: "", style: { filter: "sepia(40%) saturate(130%) brightness(105%)" } },
  { name: "Cool", class: "", style: { filter: "saturate(80%) brightness(105%) hue-rotate(15deg)" } },
  { name: "Vivid", class: "", style: { filter: "saturate(160%) contrast(110%)" } },
  { name: "Fade", class: "", style: { filter: "brightness(110%) contrast(90%) saturate(80%)" } },
];

function getProfilePhoto(): string | null {
  // Prefer Firebase URL, fall back to base64
  return localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto");
}

export function hasProfilePhoto(): boolean {
  return !!(localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto"));
}

export function getProfilePhotoUrl(): string | null {
  return localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto");
}

export function setProfilePhoto(base64: string) {
  localStorage.setItem("profilePhoto", base64);
  window.dispatchEvent(new CustomEvent("profile-photo-changed"));
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

export function setProfilePhotoUrl(url: string) {
  localStorage.setItem("profilePhotoUrl", url);
  window.dispatchEvent(new CustomEvent("profile-photo-changed"));
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

export function removeProfilePhoto() {
  localStorage.removeItem("profilePhoto");
  localStorage.removeItem("profilePhotoUrl");
  window.dispatchEvent(new CustomEvent("profile-photo-changed"));
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

// Upload photo to Firebase Realtime DB as compressed base64
export async function uploadPhotoToFirebase(base64: string): Promise<string | null> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    // Compress to smaller size for DB storage (max ~30KB)
    const compressed = await compressForDB(base64, 150, 0.6);
    
    // Store in Realtime DB under users/{uid} and groups
    await update(ref(db, `users/${uid}`), { profilePhotoUrl: compressed });
    
    // Also update in the user's group
    const profile = JSON.parse(localStorage.getItem("teensBibleProfile") || "{}");
    const groupCode = profile.groupCode || localStorage.getItem("teensBibleGroup");
    if (groupCode) {
      await update(ref(db, `groups/${groupCode}/members/${uid}`), { profilePhotoUrl: compressed });
    }
    
    return compressed;
  } catch (err) {
    console.error("Firebase DB photo upload error:", err);
    return null;
  }
}

// Compress image to small base64 for DB storage
async function compressForDB(base64: string, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height, maxSize);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      
      // Center crop
      const sx = (img.width - Math.min(img.width, img.height)) / 2;
      const sy = (img.height - Math.min(img.width, img.height)) / 2;
      const sSize = Math.min(img.width, img.height);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
      
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64); // fallback to original
    img.src = base64;
  });
}

// Apply filter to canvas and return base64
function applyFilterToCanvas(
  img: HTMLImageElement,
  maxSize: number,
  cropArea: { x: number; y: number; size: number },
  filterStyle: Record<string, string>
): string {
  const canvas = document.createElement("canvas");
  canvas.width = maxSize;
  canvas.height = maxSize;
  const ctx = canvas.getContext("2d")!;

  // Apply filter
  if (filterStyle.filter) {
    ctx.filter = filterStyle.filter;
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.size,
    cropArea.size,
    0,
    0,
    maxSize,
    maxSize
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

// Load image from file
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Resize and compress image to a reasonable size
function resizeImage(file: File, maxSize = 300): Promise<{ base64: string; img: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = img.width;
        const h = img.height;

        // Crop to square (center crop)
        const size = Math.min(w, h);
        const sx = (w - size) / 2;
        const sy = (h - size) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);

        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ base64, img });
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
  const [rawImg, setRawImg] = useState<HTMLImageElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const photo = getProfilePhoto();
      const dismissed = localStorage.getItem("photoPromptDismissed");
      if (!photo && !dismissed) {
        setShowModal(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Re-apply filter when filter selection changes
  useEffect(() => {
    if (!rawImg) return;
    const w = rawImg.width;
    const h = rawImg.height;
    const size = Math.min(w, h);
    const sx = (w - size) / 2;
    const sy = (h - size) / 2;

    const filtered = applyFilterToCanvas(
      rawImg,
      300,
      { x: sx, y: sy, size },
      FILTERS[selectedFilter].style
    );
    setPreview(filtered);
  }, [selectedFilter, rawImg]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      const { base64, img } = await resizeImage(file, 300);
      setRawImg(img);
      setSelectedFilter(0);
      setPreview(base64);
    } catch (err) {
      console.error("Image resize error:", err);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!preview) return;
    setSaving(true);
    setUploadProgress("Saving locally...");

    // Save base64 locally first (instant)
    setProfilePhoto(preview);

    // Try uploading to Firebase Storage
    setUploadProgress("Uploading to cloud...");
    const url = await uploadPhotoToFirebase(preview);
    if (url) {
      setProfilePhotoUrl(url);
      setUploadProgress("Synced! ✨");
    } else {
      setUploadProgress("Saved locally ✓");
    }

    setTimeout(() => {
      setSaving(false);
      setUploadProgress("");
      setShowModal(false);
    }, 800);
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
      <DialogContent className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-purple-500/30 rounded-2xl p-0 max-w-[380px] w-[92%] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="p-6 text-center">
          {/* Header */}
          <div className="text-5xl mb-3">📸</div>
          <h2 className="font-display text-purple-400 text-xl mb-2">Add a Profile Photo!</h2>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Show off your style! Upload a photo so your friends can recognize you on the leaderboard.
          </p>

          {/* Preview / Upload area */}
          <div className="mb-4">
            {preview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => { fileInputRef.current?.click(); }}
                  className="text-purple-300 text-xs underline"
                >
                  Choose different photo
                </button>
              </div>
            ) : (
              <div className="flex gap-3 justify-center">
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-purple-500/50 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all active:scale-95"
                >
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-[10px] text-gray-500">Take Photo</span>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-purple-500/50 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all active:scale-95"
                >
                  <span className="text-2xl mb-1">🖼️</span>
                  <span className="text-[10px] text-gray-500">Gallery</span>
                </div>
              </div>
            )}
          </div>

          {/* Filter selection - only show when image is selected */}
          {preview && rawImg && (
            <div className="mb-4">
              <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-wider">Choose a filter</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {FILTERS.map((f, idx) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFilter(idx)}
                    className={`flex flex-col items-center gap-1 transition-all ${
                      selectedFilter === idx
                        ? "scale-105"
                        : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                        selectedFilter === idx ? "border-purple-400" : "border-transparent"
                      }`}
                    >
                      <img
                        src={preview}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        style={idx === selectedFilter ? {} : f.style}
                      />
                    </div>
                    <span className={`text-[9px] ${
                      selectedFilter === idx ? "text-purple-300 font-bold" : "text-gray-500"
                    }`}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelect}
            className="hidden"
          />
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
                {saving ? uploadProgress || "Saving..." : "Save Photo! ✨"}
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handler = () => setPhoto(getProfilePhoto());
    window.addEventListener("profile-photo-changed", handler);
    return () => window.removeEventListener("profile-photo-changed", handler);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setUploading(true);
      const { base64 } = await resizeImage(file, 300);
      setProfilePhoto(base64);
      setPhoto(base64);

      // Upload to Firebase Storage
      const url = await uploadPhotoToFirebase(base64);
      if (url) {
        setProfilePhotoUrl(url);
        setPhoto(url);
      }
      setUploading(false);
    } catch (err) {
      console.error("Image resize error:", err);
      setUploading(false);
    }
  }, []);

  const handleRemove = useCallback(() => {
    removeProfilePhoto();
    setPhoto(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-3 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-purple-300 text-xs underline disabled:opacity-50"
        >
          {uploading ? "Uploading..." : photo ? "📷 Change Photo" : "📷 Upload Photo"}
        </button>
        {photo && (
          <button
            onClick={handleRemove}
            className="text-red-400 text-xs underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
