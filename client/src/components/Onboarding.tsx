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
  {
    emoji: "🚀",
    title: "Let's Get Started!",
    desc: "Your journey begins now. Read your first chapter and earn 10 XP instantly!",
    bg: "from-purple-900 to-pink-900",
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("onboardingComplete", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingComplete", "true");
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050012]">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-30 transition-all duration-500`} />

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
      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm">
        {/* Skip button */}
        <button onClick={handleSkip}
          className="absolute -top-16 right-0 text-gray-400 text-sm active:scale-95 transition-transform">
          Skip →
        </button>

        {/* Emoji */}
        <div className="w-28 h-28 rounded-full bg-purple-900/40 border-2 border-purple-500/30 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/10">
          <span className="text-6xl">{slide.emoji}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white font-display mb-3">{slide.title}</h1>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed">{slide.desc}</p>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-6 bg-purple-400" : "w-2 bg-gray-600"
            }`} />
          ))}
        </div>

        {/* Button */}
        <button onClick={handleNext}
          className="mt-8 w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
          {currentSlide < slides.length - 1 ? "Next" : "🚀 Start Reading!"}
        </button>
      </div>
    </div>
  );
}
