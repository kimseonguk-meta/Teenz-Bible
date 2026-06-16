// V2 UI Assets - All paths for generated game UI elements
// Hosted directly on Firebase Hosting in /assets/ folder

export const ASSETS = {
  // === Bottom Navigation Icons ===
  nav: {
    home: "/assets/nav_home_castle.png",
    bible: "/assets/nav_bible_book.png",
    ranking: "/assets/nav_ranking_trophy.png",
    store: "/assets/nav_store_chest.png",
    profile: "/assets/nav_profile_shield.png",
  },

  // === Gold Ribbon Banners ===
  ribbons: {
    welcomeBack: "/assets/ribbon_welcome_back.png",
    bible: "/assets/ribbon_bible.png",
    ranking: "/assets/ribbon_ranking.png",
    store: "/assets/ribbon_store.png",
    profile: "/assets/ribbon_profile.png",
    dailyQuiz: "/assets/ribbon_daily_quiz.png",
  },

  // === Stat Icons ===
  stats: {
    fire: "/assets/icon_fire_streak.png",
    gem: "/assets/icon_purple_gem.png",
    xp: "/assets/icon_xp_star.png",
  },

  // === Quick Action Icons ===
  quickActions: {
    brain: "/assets/icon_brain_quiz.png",
    candle: "/assets/icon_candle_devotion.png",
    friends: "/assets/icon_friends.png",
    scroll: "/assets/icon_scroll_quest.png",
  },

  // === Frames ===
  frames: {
    missionCard: "/assets/frame_mission_card.png",
    statPill: "/assets/frame_stat_pill.png",
    progressBar: "/assets/frame_progress_bar.png",
    avatarCircle: "/assets/frame_avatar_circle.png",
    petCard: "/assets/frame_pet_card.png",
    featuredBanner: "/assets/frame_featured_banner.png",
    quizCard: "/assets/frame_quiz_card.png",
    inputGold: "/assets/frame_input_gold.png",
  },

  // === Bible Page ===
  bible: {
    bookUnlocked: "/assets/card_book_unlocked.png",
    bookLocked: "/assets/card_book_locked.png",
    lock: "/assets/icon_lock.png",
    checkmark: "/assets/icon_checkmark.png",
  },

  // === Ranking Page ===
  ranking: {
    podium: "/assets/podium_ranking.png",
    badgeGold: "/assets/badge_gold_1st.png",
    badgeSilver: "/assets/badge_silver_2nd.png",
    badgeBronze: "/assets/badge_bronze_3rd.png",
  },

  // === Store Page ===
  store: {
    gemCurrency: "/assets/icon_gem_currency.png",
    coinGold: "/assets/icon_coin_gold.png",
    petCard: "/assets/frame_pet_card.png",
    featuredBanner: "/assets/frame_featured_banner.png",
  },

  // === Buttons ===
  buttons: {
    purpleGold: "/assets/btn_purple_gold.png",
    answerGold: "/assets/btn_answer_gold.png",
    answerCorrect: "/assets/btn_answer_correct.png",
    answerWrong: "/assets/btn_answer_wrong.png",
    startAdventure: "/assets/btn_start_adventure.png",
  },

  // === Profile & Achievements ===
  achievements: {
    star: "/assets/badge_achievement_star.png",
    book: "/assets/badge_achievement_book.png",
    sword: "/assets/badge_achievement_sword.png",
    settingsGear: "/assets/icon_settings_gear.png",
    groupBanner: "/assets/icon_group_banner.png",
  },

  // === Misc Icons ===
  misc: {
    rewardChest: "/assets/icon_reward_chest.png",
    logoShield: "/assets/logo_tb_shield.png",
  },

  // === Backgrounds ===
  backgrounds: {
    darkPurple: "/assets/bg_dark_purple.png",
    parchment: "/assets/bg_parchment_full.png",
    navBar: "/assets/bg_nav_bar.png",
  },
} as const;
