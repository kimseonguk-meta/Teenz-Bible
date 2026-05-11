import { useState } from "react";

const slides = [
  {
    emoji: "📖",
    title: "Welcome to Teenz Bible!",
    desc: "Your daily companion for reading God's Word. Earn XP, collect gems, and grow in faith!",
    bg: "from-purple-900 to-indigo-900",
  },
  {
    emoji: "🔥",
    title: "Build Your Streak",
    desc: "Read every day to build your streak! The longer your streak, the bigger the rewards.",
    bg: "from-orange-900 to-red-900",
  },
  {
    emoji: "🧠",
    title: "Take Quizzes",
    desc: "After reading each chapter, test your knowledge with fun quizzes. Earn bonus XP and gems!",
    bg: "from-blue-900 to-cyan-900",
  },
  {
    emoji: "🏆",
    title: "Compete & Collect",
    desc: "Climb the leaderboard, unlock achievements, and collect pets & themes in the Gem Store!",
    bg: "from-yellow-900 to-amber-900",
  },
];

// Separate profile setup step (not in slides array)
const PROFILE_STEP = slides.length;
const FINAL_STEP = slides.length + 1;

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const totalSteps = slides.length + 2; // slides + profile + final

  const handleNext = () => {
    if (currentSlide === PROFILE_STEP) {
      // Save name and class
      const finalName = name.trim() || "Friend";
      const finalClass = className.trim() || "";
      localStorage.setItem("playerName", finalName);
      if (finalClass) localStorage.setItem("className", finalClass);
      setCurrentSlide(FINAL_STEP);
    } else if (currentSlide === FINAL_STEP) {
      localStorage.setItem("onboardingComplete", "true");
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingComplete", "true");
    onComplete();
  };

  const isProfileStep = currentSlide === PROFILE_STEP;
  const isFinalStep = currentSlide === FINAL_STEP;
  const slide = currentSlide < slides.length ? slides[currentSlide] : null;

  const bgGradient = isProfileStep
    ? "from-purple-900 to-violet-900"
    : isFinalStep
    ? "from-purple-900 to-pink-900"
    : slide?.bg || "";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050012]">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30 transition-all duration-500`} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm w-full">
        {/* Skip button */}
        <button onClick={handleSkip}
          className="absolute -top-16 right-0 text-gray-400 text-sm active:scale-95 transition-transform">
          Skip →
        </button>

        {isProfileStep ? (
          <>
            {/* Profile Setup Step */}
            <div className="w-28 h-28 rounded-full bg-purple-900/40 border-2 border-purple-500/30 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
              <span className="text-6xl">✏️</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-display mb-2">What's Your Name?</h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">Tell us about yourself so we can personalize your experience!</p>

            <div className="w-full space-y-4 mb-4">
              <div>
                <label className="block text-left text-xs text-purple-300 mb-1.5 font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-purple-900/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-left text-xs text-purple-300 mb-1.5 font-medium">Class / Group <span className="text-gray-500">(optional)</span></label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Youth Group A, Class 1..."
                  maxLength={30}
                  className="w-full px-4 py-3 bg-purple-900/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                />
              </div>
            </div>
          </>
        ) : isFinalStep ? (
          <>
            {/* Final Step */}
            <div className="w-28 h-28 rounded-full bg-purple-900/40 border-2 border-purple-500/30 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/10">
              <span className="text-6xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-display mb-3">
              {name.trim() ? `Let's Go, ${name.trim()}!` : "Let's Get Started!"}
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your journey begins now. Read your first chapter and earn 10 XP instantly!
            </p>
          </>
        ) : (
          <>
            {/* Regular slide */}
            <div className="w-28 h-28 rounded-full bg-purple-900/40 border-2 border-purple-500/30 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/10">
              <span className="text-6xl">{slide!.emoji}</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-display mb-3">{slide!.title}</h1>
            <p className="text-gray-300 text-sm leading-relaxed">{slide!.desc}</p>
          </>
        )}

        {/* Dots */}
        <div className="flex items-center gap-2 mt-8">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-6 bg-purple-400" : "w-2 bg-gray-600"
            }`} />
          ))}
        </div>

        {/* Button */}
        <button onClick={handleNext}
          className="mt-8 w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
          {isFinalStep
            ? "🚀 Start Reading!"
            : isProfileStep
            ? (name.trim() ? "Continue" : "Skip for Now")
            : "Next"}
        </button>
      </div>
    </div>
  );
}
