import { allBibleData, otBooks, ntBooks } from "@/data/allBibleData";

// book meta reused from Bible.tsx but duplicated here to avoid import cycle
const bookMeta: Record<string, { emoji: string; desc: string }> = {
  Matthew: { emoji: "✝️", desc: "Jesus as the promised King" },
  Mark: { emoji: "🦁", desc: "Jesus the servant in action" },
  Luke: { emoji: "📜", desc: "Jesus for all people" },
  John: { emoji: "🕊️", desc: "Jesus the Son of God" },
  Acts: { emoji: "🔥", desc: "The Church's explosive beginning" },
  Romans: { emoji: "⚖️", desc: "The ultimate theology deep-dive" },
  "1 Corinthians": { emoji: "💌", desc: "Fixing a messy church" },
  "2 Corinthians": { emoji: "💪", desc: "Strength through weakness" },
  Galatians: { emoji: "🔓", desc: "Freedom in Christ" },
  Ephesians: { emoji: "🛡️", desc: "The armor of God" },
  Philippians: { emoji: "😊", desc: "Joy no matter what" },
  Colossians: { emoji: "👑", desc: "Jesus above everything" },
  "1 Thessalonians": { emoji: "⌛", desc: "Hope for the future" },
  "2 Thessalonians": { emoji: "⚡", desc: "Stand firm till the end" },
  "1 Timothy": { emoji: "📋", desc: "Leadership 101" },
  "2 Timothy": { emoji: "🏃", desc: "Finish the race strong" },
  Titus: { emoji: "🏝️", desc: "Good works that matter" },
  Philemon: { emoji: "🤝", desc: "Forgiveness in action" },
  Hebrews: { emoji: "🏛️", desc: "Jesus is better than everything" },
  James: { emoji: "🔨", desc: "Faith that works" },
  "1 Peter": { emoji: "🪨", desc: "Hope through suffering" },
  "2 Peter": { emoji: "🔭", desc: "Watch out for fakes" },
  "1 John": { emoji: "❤️", desc: "God is love" },
  "2 John": { emoji: "📝", desc: "Walk in truth and love" },
  "3 John": { emoji: "🤗", desc: "Support the truth-tellers" },
  Jude: { emoji: "⚔️", desc: "Fight for the faith" },
  Revelation: { emoji: "🌟", desc: "The epic finale" },
  Genesis: { emoji: "🌍", desc: "The beginning of everything" },
  Exodus: { emoji: "🔥", desc: "The epic escape from Egypt" },
  Leviticus: { emoji: "📜", desc: "God's rulebook for holy living" },
  Numbers: { emoji: "🏜️", desc: "Wilderness wandering and counting" },
  Deuteronomy: { emoji: "📖", desc: "Moses' final speech" },
  Joshua: { emoji: "⚔️", desc: "Conquering the Promised Land" },
  Judges: { emoji: "🛡️", desc: "Israel's cycle of chaos and heroes" },
  Ruth: { emoji: "💕", desc: "A love story of loyalty" },
  "1 Samuel": { emoji: "👑", desc: "From judges to Israel's first kings" },
  "2 Samuel": { emoji: "👑", desc: "King David's rise and struggles" },
  "1 Kings": { emoji: "🏛️", desc: "Solomon's glory and the kingdom splits" },
  "2 Kings": { emoji: "🏛️", desc: "The fall of both kingdoms" },
  "1 Chronicles": { emoji: "📋", desc: "Israel's history from David's view" },
  "2 Chronicles": { emoji: "📋", desc: "The temple, kings, and exile" },
  Ezra: { emoji: "🏗️", desc: "Rebuilding the temple after exile" },
  Nehemiah: { emoji: "🧱", desc: "Rebuilding Jerusalem's walls" },
  Esther: { emoji: "👸", desc: "A queen saves her people" },
  Job: { emoji: "💔", desc: "Why do good people suffer?" },
  Psalms: { emoji: "🎵", desc: "The ultimate playlist of prayers" },
  Proverbs: { emoji: "🧠", desc: "Life hacks from the wisest king" },
  Ecclesiastes: { emoji: "🤔", desc: "Is anything actually meaningful?" },
  "Song of Solomon": { emoji: "❤️", desc: "The most romantic love poem" },
  Isaiah: { emoji: "🕊️", desc: "Warnings, hope, and the Messiah" },
  Jeremiah: { emoji: "😢", desc: "The weeping prophet's warnings" },
  Lamentations: { emoji: "😭", desc: "Crying over Jerusalem's destruction" },
  Ezekiel: { emoji: "👁️", desc: "Wild visions and hope" },
  Daniel: { emoji: "🦁", desc: "Faith under fire in a foreign empire" },
  Hosea: { emoji: "💍", desc: "God's unfailing love despite betrayal" },
  Joel: { emoji: "🦗", desc: "The day of the Lord is coming" },
  Amos: { emoji: "⚖️", desc: "Justice for the poor" },
  Obadiah: { emoji: "⛰️", desc: "Edom's downfall" },
  Jonah: { emoji: "🐋", desc: "The prophet who ran from God" },
  Micah: { emoji: "🌾", desc: "What does God really want?" },
  Nahum: { emoji: "🌊", desc: "Nineveh's final judgment" },
  Habakkuk: { emoji: "❓", desc: "Questioning God and finding faith" },
  Zephaniah: { emoji: "🌅", desc: "Judgment day and restoration" },
  Haggai: { emoji: "🏠", desc: "Get back to building God's house" },
  Zechariah: { emoji: "🌟", desc: "Visions of hope and the King" },
  Malachi: { emoji: "📬", desc: "God's final message before silence" },
};

function isKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

function findBookInQuery(q: string): string | null {
  const lower = q.toLowerCase();
  const allBooks = [...otBooks, ...ntBooks];
  // direct match longest first
  const sorted = [...allBooks].sort((a,b)=>b.length-a.length);
  for (const b of sorted) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  // Korean book name mapping rough
  const koMap: Record<string, string> = {
    "창세기":"Genesis","출애굽기":"Exodus","레위기":"Leviticus","민수기":"Numbers","신명기":"Deuteronomy",
    "여호수아":"Joshua","사사기":"Judges","룻기":"Ruth","사무엘상":"1 Samuel","사무엘하":"2 Samuel",
    "열왕기상":"1 Kings","열왕기하":"2 Kings","역대상":"1 Chronicles","역대하":"2 Chronicles",
    "에스라":"Ezra","느헤미야":"Nehemiah","에스더":"Esther","욥기":"Job","시편":"Psalms","잠언":"Proverbs",
    "전도서":"Ecclesiastes","아가":"Song of Solomon","이사야":"Isaiah","예레미야":"Jeremiah","애가":"Lamentations",
    "에스겔":"Ezekiel","다니엘":"Daniel","호세아":"Hosea","요엘":"Joel","아모스":"Amos","오바댜":"Obadiah",
    "요나":"Jonah","미가":"Micah","나훔":"Nahum","하박국":"Habakkuk","스바냐":"Zephaniah","학개":"Haggai",
    "스가랴":"Zechariah","말라기":"Malachi","마태복음":"Matthew","마가복음":"Mark","누가복음":"Luke","요한복음":"John",
    "사도행전":"Acts","로마서":"Romans","고린도전서":"1 Corinthians","고린도후서":"2 Corinthians","갈라디아서":"Galatians",
    "에베소서":"Ephesians","빌립보서":"Philippians","골로새서":"Colossians","데살로니가전서":"1 Thessalonians",
    "데살로니가후서":"2 Thessalonians","디모데전서":"1 Timothy","디모데후서":"2 Timothy","디도서":"Titus","빌레몬서":"Philemon",
    "히브리서":"Hebrews","야고보서":"James","베드로전서":"1 Peter","베드로후서":"2 Peter","요한1서":"1 John","요한2서":"2 John","요한3서":"3 John","유다서":"Jude","요한계시록":"Revelation","계시록":"Revelation"
  };
  for (const [ko, en] of Object.entries(koMap)) {
    if (q.includes(ko)) return en;
  }
  return null;
}

function extractChapter(q: string): number | null {
  const m = q.match(/(?:chapter\s*|장\s*|ch\s*)(\d{1,3})/i) || q.match(/(\d{1,3})\s*장/);
  if (m) {
    const n = parseInt(m[1]);
    if (n >= 1 && n <= 150) return n;
  }
  // bare number like "Genesis 1"
  const bare = q.match(/\b(\d{1,3})\b/);
  if (bare) {
    const n = parseInt(bare[1]);
    if (n >= 1 && n <= 150) return n;
  }
  return null;
}

const FAQ: Array<{ kws: string[]; en: string; ko: string }> = [
  {
    kws: ["who is jesus","jesus who","예수 누구","예수가 누구"],
    en: `**Jesus is the center of the whole Bible.** ✝️\n\nHe's God who became human to rescue us. Born in Bethlehem, lived 33 years, taught about love, died on the cross for our sins, and rose again 3 days later. That's the Gospel!\n\n- **Matthew 1:21** – "You shall call His name Jesus, for He will save His people from their sins."\n- **John 3:16** – "For God so loved the world that He gave His one and only Son..."\n\nWant to know more? Read **John** or **Mark** – they're the best starting points! 📖`,
    ko: `**예수님은 성경 전체의 주인공이야** ✝️\n\n하나님이 사람으로 오신 분! 베들레헴에서 태어나서 33년 살다가 우리 죄 때문에 십자가에서 죽고 3일 만에 부활했어. 이게 복음의 핵심이야!\n\n- **마태복음 1:21** – "아들을 낳으리니 이름을 예수라 하라, 이는 그가 자기 백성을 죄에서 구원할 자이심이라"\n- **요한복음 3:16** – "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니..."\n\n**요한복음**이나 **마가복음**부터 읽어봐, 예수님을 제일 쉽게 만날 수 있어! 📖`
  },
  {
    kws: ["faith","믿음","믿음이 뭐"],
    en: `**Faith = trusting God even when you can't see everything.** 🙏\n\nHebrews 11:1 says "Faith is confidence in what we hope for and assurance about what we do not see."\n\nIt's not just believing God exists – even demons believe that (James 2:19). Real faith is:\n1. **Trust** – relying on Jesus, not yourself\n2. **Action** – faith shows up in how you live (James 2:17)\n3. **Daily** – small steps, like reading 1 chapter today!\n\nStart with **Romans 4** – it's all about faith! 💪`,
    ko: `**믿음 = 안 보여도 하나님을 신뢰하는 거야** 🙏\n\n히브리서 11:1 – "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니"\n\n하나님 있다는 걸 아는 게 다가 아니야 – 귀신들도 알아 (야고보서 2:19). 진짜 믿음은:\n1. **신뢰** – 내 힘 말고 예수님 의지하기\n2. **행동** – 믿음은 삶으로 보여 (야고보서 2:17)\n3. **매일** – 오늘 1장 읽는 작은 실천!\n\n**로마서 4장**부터 읽어봐, 믿음에 대해 제일 잘 설명돼 있어! 💪`
  },
  {
    kws: ["grace","은혜","은혜가 뭐"],
    en: `**Grace = God's gift you could never earn.** 🎁\n\nEphesians 2:8 – "For it is by grace you have been saved, through faith – and this is not from yourselves, it is the gift of God."\n\nWe all mess up (Romans 3:23), but God still loves us. Grace means:\n- You don't have to be perfect to come to God\n- Jesus already did the work on the cross\n- You just receive it by faith\n\nFeeling guilty? Read **Psalms 103** – it lists all the benefits of His grace! ✨`,
    ko: `**은혜 = 네가 절대 벌 수 없는 하나님의 선물** 🎁\n\n에베소서 2:8 – "너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이는 너희에게서 난 것이 아니요 하나님의 선물이라"\n\n우리 다 실수해 (로마서 3:23), 근데도 하나님은 우리 사랑해. 은혜는:\n- 완벽하지 않아도 하나님께 나갈 수 있다는 거\n- 예수님이 십자가에서 다 끝내셨다는 거\n- 믿음으로 그냥 받으면 된다는 거\n\n죄책감 들어? **시편 103편** 읽어봐, 은혜의 혜택이 쫙 나와! ✨`
  },
  {
    kws: ["parable","비유","parables"],
    en: `**Parables = Jesus' storytelling hack to make deep truths stick.** 📚\n\nJesus told ~40 parables – short stories with a twist. Why?\n- Easy to remember (like memes!)\n- Makes you think\n- Separates hungry hearts from casual listeners (Matthew 13:11-13)\n\nFamous ones:\n- **Good Samaritan** (Luke 10:25-37) – love your enemy\n- **Prodigal Son** (Luke 15:11-32) – God runs to you when you return\n- **Sower** (Matthew 13:1-23) – what kind of heart do you have?\n\nWant more? Read **Matthew 13** – it's parable central! 🌾`,
    ko: `**비유 = 예수님의 꿀강의 스킬** 📚\n\n예수님이 40개 정도 비유로 가르치셨어. 왜?\n- 기억하기 쉬워서 (밈처럼!)\n- 생각하게 만들어서\n- 진짜 알고 싶은 사람만 알게 하려고 (마태복음 13:11-13)\n\n유명한 거:\n- **선한 사마리아인** (누가복음 10:25-37) – 원수도 사랑해\n- **탕자** (누가복음 15:11-32) – 돌아오면 하나님이 달려오셔\n- **씨 뿌리는 자** (마태복음 13:1-23) – 네 마음은 어떤 밭이야?\n\n더 보고 싶어? **마태복음 13장** 가봐, 비유 맛집이야! 🌾`
  },
  {
    kws: ["revelation","계시록","요한계시록"],
    en: `**Revelation = the epic finale with a happy ending.** 🌟\n\nWritten by John on Patmos Island when he was ~90 years old. It's not just about scary beasts – it's about **Jesus wins.**\n\nStructure:\n- Ch 1-3: Letters to 7 churches (still relevant today!)\n- Ch 4-20: Battles, but God is in control\n- Ch 21-22: **New Heaven & New Earth** – no more tears, death, pain (21:4) 🎉\n\nKey verse: **Revelation 21:4** – "He will wipe every tear from their eyes."\n\nScared? Don't be. If you're with Jesus, Revelation is your victory story. Start with **Revelation 1, 21, 22** – the encouraging parts! ✨`,
    ko: `**요한계시록 = 해피엔딩으로 끝나는 대서사시** 🌟\n\n요한이 90살쯤 밧모섬에서 썼어. 무서운 짐승 이야기만이 아니라 **예수님이 이긴다**는 이야기야.\n\n구성:\n- 1-3장: 7교회에 보낸 편지 (지금 우리에게도 해당!)\n- 4-20장: 전쟁 같지만 하나님이 컨트롤하고 계셔\n- 21-22장: **새 하늘 새 땅** – 눈물도 죽음도 아픔도 없는 곳 (21:4) 🎉\n\n핵심 구절: **계시록 21:4** – "모든 눈물을 그 눈에서 씻기시매"\n\n무서워? 겁내지 마. 예수님 편이면 계시록은 네 승리 이야기야. **1장, 21장, 22장**부터 읽어봐, 제일 힘이 돼! ✨`
  },
  {
    kws: ["disciple","제자","사도"],
    en: `**Disciples = Jesus' 12-man crew who changed the world.** 👑\n\nOrdinary dudes – fishermen, tax collector, zealot. Not perfect, but willing to follow.\n\nList: Peter, Andrew, James, John, Philip, Bartholomew, Matthew, Thomas, James (son of Alphaeus), Simon the Zealot, Judas (son of James), Judas Iscariot (who betrayed Jesus, then Matthias replaced him – Acts 1:26).\n\nWhat they teach us:\n- God uses ordinary people\n- Failure isn't final (Peter denied Jesus but became a leader!)\n- Following Jesus = adventure\n\nRead **Mark 1:16-20** – how Jesus called them, and **Acts 2** – how they changed the world! 🔥`,
    ko: `**제자 = 세상을 바꾼 예수님의 12크루** 👑\n\n어부, 세리, 열심당원 같은 평범한 사람들. 완벽하진 않았지만 따라가기로 했어.\n\n명단: 베드로, 안드레, 야고보, 요한, 빌립, 바돌로매, 마태, 도마, 알패오의 아들 야고보, 열심당원 시몬, 야고보의 아들 유다, 가룟 유다 (배신하고 맛디아로 교체 – 사도행전 1:26)\n\n우리에게 주는 교훈:\n- 하나님은 평범한 사람을 쓰셔\n- 실패가 끝이 아니야 (베드로가 예수님 부인했지만 리더 됐잖아!)\n- 예수님 따라가는 건 모험이야\n\n**마가복음 1:16-20** – 부르신 장면, **사도행전 2장** – 세상 바꾼 장면 읽어봐! 🔥`
  },
  {
    kws: ["why 4 gospels","복음서 왜 4개","복음서 4개"],
    en: `**Why 4 Gospels? Different angles, same Jesus.** 📖\n\nLike 4 friends telling the same amazing story:\n- **Matthew** – Jesus as King (for Jews) 👑\n- **Mark** – Jesus as Servant who acts fast (for Romans) ⚡\n- **Luke** – Jesus as Savior for everyone (for Greeks) 🌍\n- **John** – Jesus as God Himself (for all) 🕊️\n\nTogether they give a full picture. One Gospel would be incomplete!\n\nStart with **Mark** (shortest, action-packed) then **John** (deep, personal). You'll love it! ✨`,
    ko: `**왜 복음서가 4개야? 같은 예수님을 다른 각도에서 보여주려고** 📖\n\n4명의 친구가 같은 대단한 이야기를 하는 거야:\n- **마태복음** – 왕으로 오신 예수님 (유대인에게) 👑\n- **마가복음** – 행동하는 종으로 오신 예수님 (로마인에게) ⚡\n- **누가복음** – 모두를 위한 구주로 오신 예수님 (그리스인에게) 🌍\n- **요한복음** – 하나님 자신으로 오신 예수님 (모두에게) 🕊️\n\n4개가 모여야 완전한 그림이 돼! 하나만으론 부족해!\n\n**마가복음** (제일 짧고 액션 많음)부터 시작해서 **요한복음** (깊고 개인적) 읽어봐, 완전 좋아! ✨`
  },
];

export function generateOfflineAnswer(question: string, historyLength = 0): string {
  const q = question.trim();
  const qLower = q.toLowerCase();
  const ko = isKorean(q);

  // 1. Book specific?
  const book = findBookInQuery(q);
  if (book) {
    const chapters = allBibleData[book] || [];
    const chNum = extractChapter(q);
    const meta = bookMeta[book];
    const ch = chNum ? chapters.find(c => c.num === chNum) : null;
    if (ch && chNum) {
      // specific chapter
      const firstPara = ch.paragraphs?.[0]?.slice(0, 280) || "";
      if (ko) {
        return `**${book} ${chNum}장** ${meta?.emoji || "📖"} – ${meta?.desc || ""}\n\n**제목:** ${ch.title || `${book} ${chNum}장`}\n\n${firstPara}${ch.paragraphs?.length > 1 ? "\n\n" + (ch.paragraphs[1]?.slice(0,220) || "") : ""}\n\n이 장은 ${chapters.length}장 중 하나야. ${chNum}장을 읽으면서 하나님이 뭘 말하고 싶은지 생각해봐! 🙏\n\n👉 앱에서 **${book} ${chNum}장** 본문을 바로 읽어볼 수 있어!`;
      } else {
        return `**${book} ${chNum}** ${meta?.emoji || "📖"} – ${meta?.desc || ""}\n\n**Title:** ${ch.title || `${book} ${chNum}`}\n\n${firstPara}${ch.paragraphs?.length > 1 ? "\n\n" + (ch.paragraphs[1]?.slice(0,220) || "") : ""}\n\nThis is 1 of ${chapters.length} chapters in ${book}. As you read ch ${chNum}, ask: what does this show me about God? 🙏\n\n👉 You can read **${book} ${chNum}** full text in the app!`;
      }
    }
    // whole book
    if (ko) {
      return `**${book}** ${meta?.emoji || "📖"} – ${meta?.desc || ""}\n\n${book}는 총 ${chapters.length}장으로 이루어져 있어. ${chapters.length > 0 ? `1장은 "${chapters[0].title}"로 시작해` : ""}\n\n${meta?.desc}라는 주제를 가지고 있어. 이 책을 읽으면 하나님에 대해 더 알게 될 거야!\n\n추천: **${book} 1장**부터 시작해서 하루에 한 장씩 읽어봐. 5분이면 충분해! 📖✨`;
    } else {
      return `**${book}** ${meta?.emoji || "📖"} – ${meta?.desc || ""}\n\n${book} has ${chapters.length} chapters. ${chapters.length > 0 ? `It starts with "${chapters[0].title}"` : ""}\n\nTheme: ${meta?.desc}. This book will help you know God better!\n\nTip: Start with **${book} 1** and read one chapter a day. 5 mins is enough! 📖✨`;
    }
  }

  // 2. FAQ
  for (const f of FAQ) {
    if (f.kws.some(k => qLower.includes(k.toLowerCase()) || q.includes(k))) {
      return ko || /[가-힣]/.test(q) ? (f.ko) : f.en;
    }
  }

  // 3. General encouragement based on keywords
  if (qLower.includes("pray") || q.includes("기도")) {
    return ko ? `**기도는 하나님과 대화하는 거야** 🙏\n\n어렵게 생각하지 마. 그냥 네 마음 그대로 말하면 돼.\n\n- 마태복음 6:9-13 – 예수님이 가르쳐주신 기도 (주기도문)\n- 빌립보서 4:6-7 – "아무 것도 염려하지 말고..."\n\n오늘 1분 기도로 시작해봐: "하나님, 오늘도 같이 해주세요" 이 한 마디면 충분해! ✨` : `**Prayer is just talking with God** 🙏\n\nYou don't need fancy words. Just be real.\n\n- Matthew 6:9-13 – The Lord's Prayer Jesus taught\n- Philippians 4:6-7 – "Don't worry about anything..."\n\nStart today with 1 minute: "God, be with me today." That's enough! ✨`;
  }

  if (qLower.includes("sad") || qLower.includes("depress") || qLower.includes("힘들") || qLower.includes("우울") || qLower.includes("슬퍼")) {
    return ko ? `힘들구나, 얘기해줘서 고마워. 🫂\n\n**시편 34:18** – "여호와는 마음이 상한 자를 가까이 하시고"\n**이사야 41:10** – "두려워하지 말라 내가 너와 함께 함이라"\n\n네가 지금 느끼는 감정, 하나님도 아셔. 혼자 버티지 말고:\n1. 시편 23편 천천히 읽어봐\n2. 믿을 만한 어른이나 친구에게 얘기해봐\n3. 오늘 5분 산책하면서 기도해봐\n\n넌 혼자가 아니야. 💛` : `I'm sorry you're feeling this way. Thanks for sharing. 🫂\n\n**Psalm 34:18** – "The Lord is close to the brokenhearted"\n**Isaiah 41:10** – "Do not fear, for I am with you"\n\nGod sees what you're feeling. You don't have to carry it alone:\n1. Read Psalm 23 slowly\n2. Talk to a trusted adult or friend\n3. Take a 5-min walk and pray\n\nYou are not alone. 💛`;
  }

  // 4. Default – friendly Bible AI intro + guide
  if (ko) {
    const variants = [
      `좋은 질문이야! 👍 **${q.slice(0,40)}**에 대해 생각해봤구나.\n\n성경은 모든 질문에 대한 답을 가지고 있어. 지금은 오프라인 모드라서 내가 가진 성경 지식으로 답해줄게!\n\n- 궁금한 책이 있으면 책 이름으로 물어봐 (예: "창세기 1장", "요한복음 3장")\n- 주제가 궁금하면 주제로 물어봐 (예: "믿음", "은혜", "기도")\n- 힘든 일이 있으면 그냥 편하게 얘기해줘\n\n하나님은 네 질문을 좋아하셔! **시편 119:105** – "주의 말씀은 내 발에 등이요 내 길에 빛이니이다" ✨\n\n더 깊은 답을 원하면 나중에 온라인 모드에서 다시 물어봐줘! 🙏`,
      `오, **${q.slice(0,30)}** – 멋진 질문이다! 🤔\n\n성경을 읽다 보면 이런 궁금증이 생기는 게 당연해. 난 지금 오프라인으로 너를 돕고 있어.\n\n빠른 가이드:\n📖 책별 요약 원하면 – 책 이름 말해줘\n🙏 신앙 고민이면 – "믿음", "기도", "용서" 같은 단어로 물어봐\n💬 그냥 수다도 좋아 – 힘들 때 얘기해줘\n\n**예레미야 33:3** – "너는 내게 부르짖으라 내가 네게 응답하겠고"\n\n하나님이 네 목소리 듣고 계셔! 💛`,
    ];
    return variants[historyLength % variants.length];
  } else {
    const variantsEn = [
      `Great question! 👍 You asked about **${q.slice(0,40)}**.\n\nThe Bible has wisdom for every question. I'm in offline mode right now, so I'll answer from my Bible knowledge!\n\n- Want a book summary? Just say the book name (e.g., "Genesis 1", "John 3")\n- Curious about a topic? Ask like "faith", "grace", "prayer"\n- Going through something? Just share it\n\nGod loves your questions! **Psalm 119:105** – "Your word is a lamp for my feet, a light on my path." ✨\n\nWant a deeper answer? Ask again when I'm online! 🙏`,
      `Oh, **${q.slice(0,30)}** – awesome question! 🤔\n\nIt's normal to wonder about this when you read the Bible. I'm helping you offline right now.\n\nQuick guide:\n📖 Book summary – say the book name\n🙏 Faith topic – try "faith", "prayer", "forgiveness"\n💬 Just chat – share what's on your heart\n\n**Jeremiah 33:3** – "Call to me and I will answer you"\n\nGod is listening to you! 💛`,
    ];
    return variantsEn[historyLength % variantsEn.length];
  }
}
