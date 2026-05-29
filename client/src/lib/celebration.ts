import confetti from "canvas-confetti";

/**
 * Fire a celebratory confetti burst for login success.
 * Lightweight, non-blocking, auto-cleans up.
 */
export function celebrateLogin() {
  // First burst - center
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#a855f7", "#7c3aed", "#fbbf24", "#34d399", "#60a5fa"],
    disableForReducedMotion: true,
  });

  // Second burst - left side (delayed)
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#a855f7", "#fbbf24", "#34d399"],
      disableForReducedMotion: true,
    });
  }, 150);

  // Third burst - right side (delayed)
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#7c3aed", "#60a5fa", "#fbbf24"],
      disableForReducedMotion: true,
    });
  }, 300);
}
