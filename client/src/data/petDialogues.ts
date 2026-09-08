// ============================================================
// PET PERSONALITY DIALOGUES
// Each pet has unique dialogue based on their personality
// ============================================================

import type { PetMood } from "./storeItems";

export interface PetDialogue {
  tap: Record<PetMood, string[]>;       // When user taps the pet
  pageReactions: Record<string, string[]>; // When navigating pages
  idle: Record<PetMood, string[]>;      // Random idle messages
  reading: string[];                     // When user reads a chapter
  quiz: string[];                        // When user completes a quiz
  fed: string[];                         // When pet is fed
  greeting: string[];                    // First appearance / login
}

// Default fallback for pets without specific dialogues
const DEFAULT_DIALOGUE: PetDialogue = {
  tap: {
    happy: ["Let's read together! 📖", "You're doing great! ⭐", "I love being with you! 💕"],
    hungry: ["I'm getting hungry... 🍽️", "Read a chapter to feed me! 📖", "Please don't forget me... 🥺"],
    sad: ["I miss you so much... 😢", "Please come back and read... 💔", "It's been a while... 🥺"],
  },
  pageReactions: {
    "/": ["Home sweet home! 🏠", "What shall we do today?"],
    "/bible": ["Reading time! 📖", "Let's learn something new!"],
    "/leaderboard": ["Let's climb the ranks! 🏆", "We can do it!"],
    "/store": ["Ooh, shiny things! 💎", "Shopping time!"],
    "/profile": ["Looking good! 😎", "Nice stats!"],
  },
  idle: {
    happy: ["🎵 La la la~", "*stretches*", "*looks around* 👀"],
    hungry: ["*stomach growls* 🍽️", "*looks at you hopefully* 🥺"],
    sad: ["*sniffles* 😢", "*curls up* 💤"],
  },
  reading: ["Great reading! 📖✨", "You're so smart! 🧠", "That was fun! 🎉"],
  quiz: ["Big brain time! 🧠", "You nailed it! 💯"],
  fed: ["Yummy! Thank you! 😋", "So full and happy! 🎉"],
  greeting: ["Hey there! Ready to go? 🌟", "Let's have a great day!"],
};

// ─── Individual Pet Dialogues ──────────────────────────────

const PET_DIALOGUES: Record<string, PetDialogue> = {
  pet_cat: {
    tap: {
      happy: ["Purrrr~ 😸 You're the best!", "Meow! Let's read something fun~", "*nuzzles your hand* 🐾", "I'm feline great today! 😹"],
      hungry: ["Meow... feed me with chapters... 🐱", "*paws at you* I'm starving~", "A hungry cat is a grumpy cat... 😾"],
      sad: ["*sad meow* ...where did you go? 😿", "I've been napping alone... 💤", "*curls into a ball* miss you... 🐱"],
    },
    pageReactions: {
      "/": ["*purrs* Home is where the naps are~ 🏠", "Meow! Welcome back, hooman! 😸"],
      "/bible": ["*perks ears up* Story time! I love stories~ 📖", "Meow! Read to me! 😸"],
      "/leaderboard": ["*swishes tail* We're the top cats! 🏆", "Purrfect scores only! 😼"],
      "/store": ["*eyes go wide* Shiny things!! 💎✨", "Can I have a treat? Meow~ 🎁"],
      "/profile": ["*preens* Looking purrfect! 😸", "That's my hooman! So cool~ ✨"],
    },
    idle: {
      happy: ["*chases invisible bug* 🐛", "*purrs contentedly* 😸", "*kneads the air* 🐾", "*flicks tail happily*"],
      hungry: ["*stares at you intensely* 👁️", "*meows pitifully* 😿", "*knocks things off table* 🫣"],
      sad: ["*hides under blanket* 😿", "...mew... 💤", "*stares out window* 🪟"],
    },
    reading: ["Purrrr! That was a great chapter! 📚", "Meow! My hooman is so smart! 🧠", "*kneads happily* More stories! 😸"],
    quiz: ["*tail swishes excitedly* You got it! 🎯", "Purrfect score, hooman! 💯😸"],
    fed: ["*PURRRRRR* SO GOOD! 😻", "Meow! Best meal ever! 🐟", "*happy zoomies* 🏃‍♂️💨"],
    greeting: ["*stretches and yawns* Oh! You're here! 😸", "Meow~ Ready for adventures? 🐾"],
  },

  pet_puppy: {
    tap: {
      happy: ["WOOF WOOF! I love you!! 🐕", "*tail wagging intensifies* 💕", "You're my favorite human EVER! 🎉", "*jumps up and down* Play? PLAY?! 🎾"],
      hungry: ["*whimpers* Hungry puppy... 🥺", "*brings you the leash* Walk? Food? 🐕", "Woof... my tummy is rumbly... 🍖"],
      sad: ["*puts head on paws* ...woof... 😢", "*sad puppy eyes* Where were you? 🥺", "*whines softly* I waited so long... 💔"],
    },
    pageReactions: {
      "/": ["HOME!! MY FAVORITE PLACE!! 🏠🎉", "*runs in circles* WE'RE HOME! WOOF! 🐕"],
      "/bible": ["*sits attentively* I'm ready to learn! 📖🐕", "WOOF! Bible time is BEST time! 🎉"],
      "/leaderboard": ["*barks excitedly* WE'RE WINNING! 🏆🐕", "Good boy points!! WOOF! 💪"],
      "/store": ["*sniffs everything* What's this?! And THIS?! 💎🐕", "TREATS?! WHERE?! 🎁🐕"],
      "/profile": ["That's MY human! The BEST human! 😍", "*proud bark* Look at us! WOOF! 🌟"],
    },
    idle: {
      happy: ["*chases own tail* 🌀", "*pants happily* 😛", "*brings you a stick* 🪵", "*rolls over for belly rubs* 🐕"],
      hungry: ["*drools a little* 🤤", "*stares at food bowl* 🥣", "*does the puppy head tilt* 🐕"],
      sad: ["*lies by the door waiting* 🚪", "*soft whimper* 😢", "*hugs toy* 🧸"],
    },
    reading: ["WOOF!! You read it!! GOOD HUMAN! 🎉🐕", "*happy zoomies* THAT WAS AMAZING! 🏃", "More more more!! WOOF! 📚"],
    quiz: ["*BARK BARK* YOU'RE SO SMART! 🧠🐕", "GOOD HUMAN! BEST HUMAN! 💯🎉"],
    fed: ["*WOOF WOOF WOOF* FOOD!! THANK YOU!! 🍖😍", "*scarfs it down* MORE?! 🐕", "*licks your face* BEST DAY EVER! 😛"],
    greeting: ["*TACKLES YOU* YOU'RE BACK!! WOOF!! 🐕💕", "*tail helicopter* I MISSED YOU SO MUCH! 🎉"],
  },

  pet_lamb: {
    tap: {
      happy: ["Baa~ 🐑 So peaceful today~", "*soft bleat* I feel so blessed~ ☁️", "The Lord is my shepherd~ 🌿", "*nuzzles gently* Baa~ 💕"],
      hungry: ["Baa... need green pastures... 🌱", "*nibbles on nothing* Hungry lamb... 🐑", "Lead me to still waters? 💧"],
      sad: ["*quiet baa* ...I feel lost... 😢🐑", "*shivers* Where's the flock? 🥺", "Baa... come find me... 💔"],
    },
    pageReactions: {
      "/": ["Baa~ Home is where peace is~ 🏠☁️", "*settles down contentedly* 🐑"],
      "/bible": ["Baa! The Good Shepherd's stories! 📖🐑", "*ears perk up* I love these words~ ✨"],
      "/leaderboard": ["Baa~ We're all winners in God's flock! 🏆", "*gentle bleat* So proud of you~ 🌟"],
      "/store": ["Baa~ Everything is so pretty~ 💎", "*looks around peacefully* 🐑"],
      "/profile": ["*happy bleat* That's my shepherd! 😊", "Baa~ You're doing so well~ ☁️"],
    },
    idle: {
      happy: ["*grazes peacefully* 🌿", "*baa softly* ☁️", "*frolics in meadow* 🌸", "*counts other sheep* 1...2...3... 💤"],
      hungry: ["*looks for grass* 🌱", "*soft baa* 🐑", "*follows you closely* 🥺"],
      sad: ["*lies down quietly* 💤", "*baa...* 😢", "*looks up at sky* ☁️"],
    },
    reading: ["Baa! What a beautiful chapter! 📖☁️", "*happy frolicking* The Word is good! 🌿", "Baa~ My heart is full~ 💕"],
    quiz: ["Baa! You're so wise! 🧠☁️", "*joyful bleat* Amazing! 🌟"],
    fed: ["Baa~ Thank you, shepherd! 🌿💕", "*munches happily* Green pastures! 🐑", "*content sigh* So blessed~ ☁️"],
    greeting: ["Baa~ Good morning, shepherd! ☀️🐑", "*trots over happily* Ready for today! 🌿"],
  },

  pet_lion: {
    tap: {
      happy: ["ROAR! 🦁 We are STRONG!", "*flexes* No fear! God is with us! 💪", "Be bold like Daniel! 🔥", "*proud roar* You're a warrior! ⚔️"],
      hungry: ["*low growl* A lion needs fuel... 🥩", "Even kings need to eat... 🦁", "*yawns showing teeth* Feed me, warrior! 😤"],
      sad: ["*quiet roar* ...even lions get lonely... 😢", "*lies with head on paws* 🦁", "The pride misses you... 💔"],
    },
    pageReactions: {
      "/": ["ROAR! Our kingdom! 🏠🦁", "*surveys territory* All is well! 👑"],
      "/bible": ["*intense focus* The Word is our SWORD! ⚔️📖", "ROAR! Let's learn to be BRAVE! 🦁"],
      "/leaderboard": ["*ROAR* WE DOMINATE! 🏆🦁", "King of the jungle, king of the board! 👑"],
      "/store": ["*inspects items regally* Only the finest! 💎👑", "A lion deserves the best! 🦁"],
      "/profile": ["*proud roar* Look at this warrior! 💪🦁", "Strength and honor! ⚔️"],
    },
    idle: {
      happy: ["*majestic mane flip* 🦁", "*roars at the sky* 🌅", "*sharpens claws* Ready for battle! ⚔️", "*sunbathes regally* 👑"],
      hungry: ["*prowls restlessly* 🦁", "*low growl* 😤", "*eyes narrow* 👁️"],
      sad: ["*quiet rumble* 🦁", "*stares into distance* 🌅", "*lies still* 💤"],
    },
    reading: ["ROAR! THAT WAS POWERFUL! 📖🔥", "*pounds chest* We grow STRONGER! 💪", "The Word makes us FEARLESS! 🦁⚔️"],
    quiz: ["*TRIUMPHANT ROAR* VICTORY! 🏆🦁", "A true warrior's mind! 🧠💪"],
    fed: ["*satisfied roar* A feast fit for a king! 👑🥩", "ROAR! Now I'm unstoppable! 🦁💪", "*licks chops* Excellent! 😤"],
    greeting: ["*MIGHTY ROAR* The warrior returns! 🦁⚔️", "Rise and conquer, champion! 👑🔥"],
  },

  pet_owl: {
    tap: {
      happy: ["Hoo hoo~ 🦉 Wisdom comes from above~", "*adjusts spectacles* Fascinating! 🧐", "Knowledge is a treasure, dear one~ 📚", "*wise nod* You're learning well~ 🌟"],
      hungry: ["Hoo... my mind needs nourishment... 🦉", "*ruffles feathers* A bit peckish... 🍽️", "Even scholars must eat... 📖🍽️"],
      sad: ["Hoo... *droops* The library is empty without you... 😢", "*quiet hoot* Knowledge fades without practice... 📚", "Hoo... come study with me... 🥺"],
    },
    pageReactions: {
      "/": ["Hoo~ The nest of knowledge! 🏠🦉", "*perches wisely* A good base for learning~"],
      "/bible": ["Hoo HOO! 🦉 The greatest textbook! 📖", "*eyes light up* So much wisdom here! 🧠✨"],
      "/leaderboard": ["Hoo~ Intelligence has its rewards! 🏆🦉", "*nods approvingly* Scholarly achievements! 📊"],
      "/store": ["Hoo~ Invest in wisdom, not just things~ 💎🦉", "*examines items carefully* Interesting... 🧐"],
      "/profile": ["*wise hoot* A fine scholar indeed! 🎓🦉", "Hoo~ Your progress is impressive! 📈"],
    },
    idle: {
      happy: ["*reads tiny book* 📖🦉", "*rotates head 180°* 🔄", "*polishes spectacles* 🧐", "*hoots a lullaby* 🎵"],
      hungry: ["*taps talon impatiently* 🦉", "*stares philosophically* 🤔", "*yawns* Hoo... 😴"],
      sad: ["*tucks head under wing* 🦉", "*quiet hoot* 😢", "*stares at moon* 🌙"],
    },
    reading: ["Hoo HOO! Excellent scholarship! 📖🦉", "*nods wisely* The wisdom grows! 🧠", "Fascinating passage! Let me ponder... 🤔✨"],
    quiz: ["*proud hoot* A brilliant mind! 🧠🦉", "Hoo! Solomon would be proud! 💯📚"],
    fed: ["Hoo~ Brain food! Delightful! 🦉🍽️", "*happy hoot* Now I can think clearly! 🧠", "*ruffles feathers contentedly* 📚"],
    greeting: ["Hoo~ The student returns! 🦉📖", "*wise blink* Ready for today's lessons? 🎓"],
  },

  pet_dove: {
    tap: {
      happy: ["Coo~ 🕊️ Peace be with you~", "*gentle flutter* The Spirit is here~ ✨", "Shalom~ 💕 You are loved~", "*soft coo* Grace upon grace~ 🌿"],
      hungry: ["Coo... *ruffles feathers* Need an olive branch... 🫒", "*gentle coo* A little sustenance? 🕊️", "Even peace needs nourishment... 💧"],
      sad: ["*quiet coo* ...the world feels heavy... 😢🕊️", "*droops wings* Where is the peace? 💔", "Coo... bring back the light... 🌅"],
    },
    pageReactions: {
      "/": ["Coo~ A peaceful home~ 🏠🕊️", "*settles on shoulder* Peace be here~ ✨"],
      "/bible": ["*joyful flutter* The Word brings peace! 📖🕊️", "Coo~ The Spirit speaks through these words~ ✨"],
      "/leaderboard": ["Coo~ Every soul is precious, not just the top~ 🕊️", "*gentle coo* Well done, peacemaker~ 🌟"],
      "/store": ["*coos softly* Choose with a peaceful heart~ 💎🕊️", "Coo~ Simple joys are best~ ✨"],
      "/profile": ["*lands gently* You carry peace within~ 🕊️💕", "Coo~ A beautiful spirit~ ✨"],
    },
    idle: {
      happy: ["*preens feathers* 🕊️", "*coos a hymn* 🎵", "*glides gracefully* ✨", "*olive branch in beak* 🫒"],
      hungry: ["*flutters weakly* 🕊️", "*soft coo* 💧", "*looks for seeds* 🌾"],
      sad: ["*tucks under wing* 🕊️", "*silent prayer* 🙏", "*gazes at sky* ☁️"],
    },
    reading: ["Coo~ The Spirit rejoices! 📖🕊️✨", "*joyful flutter* Beautiful truth! 💕", "Peace fills the heart through His Word~ 🌿"],
    quiz: ["*happy coo* Wisdom and peace! 🧠🕊️", "Coo~ The truth sets us free! 💯✨"],
    fed: ["Coo~ Thank you, gentle soul~ 🕊️💕", "*peaceful flutter* Blessed provision~ ✨", "*coos gratefully* 🫒"],
    greeting: ["*descends gently* Peace to you today~ 🕊️✨", "Coo~ The Spirit greets you~ 💕"],
  },

  pet_eagle: {
    tap: {
      happy: ["*SCREECH* 🦅 We SOAR today!", "Those who wait on the Lord shall mount up! 💪", "*spreads wings wide* The sky is ours! ☁️", "Isaiah 40:31! Let's FLY! 🦅🔥"],
      hungry: ["*ruffles feathers* Need fuel to fly... 🦅", "*sharp gaze* A hunter needs energy... 👁️", "Can't soar on empty... ⛽"],
      sad: ["*perches quietly* ...wings feel heavy... 😢🦅", "*looks at ground* Can't fly today... 💔", "*tucked wings* ...waiting for strength... 🥺"],
    },
    pageReactions: {
      "/": ["*lands majestically* The eagle has landed! 🦅🏠", "*surveys from above* All clear! 👁️"],
      "/bible": ["*SCREECH* The Word gives us WINGS! 📖🦅", "*soars excitedly* Time to rise UP! ⬆️"],
      "/leaderboard": ["*circles above* We're at the TOP! 🏆🦅", "*victory screech* HIGHER! 🔝"],
      "/store": ["*sharp eyes* Only the finest for an eagle! 💎🦅", "*inspects from above* Interesting finds! 👁️"],
      "/profile": ["*proud screech* A true soarer! 🦅💪", "*spreads wings* Majestic! ✨"],
    },
    idle: {
      happy: ["*soars in thermals* 🦅☁️", "*preens flight feathers* ✨", "*screeches at the sun* ☀️", "*dives and pulls up* WHEEE! 🎢"],
      hungry: ["*scans for prey* 👁️", "*ruffles impatiently* 🦅", "*perches stoically* 🏔️"],
      sad: ["*hunches on branch* 🦅", "*stares at horizon* 🌅", "*quiet* ..."],
    },
    reading: ["*VICTORY SCREECH* POWERFUL WORD! 📖🦅🔥", "*soars high* We're RISING! ⬆️💪", "The Word lifts us HIGHER! 🦅✨"],
    quiz: ["*SCREECH* EAGLE-EYED ACCURACY! 🎯🦅", "*triumphant flight* UNSTOPPABLE! 💯🔥"],
    fed: ["*grateful screech* Fuel for FLIGHT! 🦅⛽", "*spreads wings* NOW I can soar! ☁️💪", "*happy screech* EXCELLENT! 🔥"],
    greeting: ["*SWOOPS IN* The eagle has arrived! 🦅🔥", "*majestic landing* Ready to SOAR! ☁️💪"],
  },

  pet_fox: {
    tap: {
      happy: ["Hehe~ 🦊 What's the plan today?", "*sly grin* I know a shortcut~ 😏", "*playful yip* Catch me if you can! 🏃", "The clever fox always finds a way~ ✨"],
      hungry: ["*sniffs around* Something smells good... 🦊", "*cunning eyes* I could really use a snack... 🍇", "A hungry fox is a crafty fox... 😏"],
      sad: ["*curls up* ...even foxes get lonely... 😢🦊", "*quiet whimper* The den is cold alone... 💔", "*hides face in tail* ...miss you... 🥺"],
    },
    pageReactions: {
      "/": ["*sneaks in* Home base! 🏠🦊", "*yips* The fox den! Cozy~ 😏"],
      "/bible": ["*perks ears* Ooh, secrets to discover! 📖🦊", "Hehe~ Hidden wisdom! I love puzzles~ 🧩"],
      "/leaderboard": ["*sly grin* Outsmarted them all! 🏆🦊", "Hehe~ The clever fox wins! 😏✨"],
      "/store": ["*eyes sparkle* Ooh, treasures! 💎🦊", "*sniffs everything* What deals can I find? 😏"],
      "/profile": ["*admires reflection* Looking foxy! 🦊✨", "Hehe~ Clever AND cute! 😏"],
    },
    idle: {
      happy: ["*chases butterflies* 🦋🦊", "*does a sneaky dance* 💃", "*yips playfully* 🎵", "*hides and peeks out* 👀"],
      hungry: ["*sniffs the air* 🦊", "*plots something* 😏", "*paces cleverly* 🤔"],
      sad: ["*curls into a ball* 🦊", "*quiet yip* 😢", "*wraps tail around self* 💤"],
    },
    reading: ["Hehe~ Clever knowledge! 📖🦊", "*excited yip* I love learning tricks! 🧠", "The fox grows wiser! 😏✨"],
    quiz: ["*sly grin* Too easy for a fox! 🎯🦊", "Hehe~ Outsmarted it! 💯😏"],
    fed: ["*happy yips* Delicious! 🦊🍇", "*does a happy spin* Thank you! ✨", "Hehe~ The fox is satisfied! 😏💕"],
    greeting: ["*pops out of nowhere* Surprise! 🦊✨", "*sly wave* Miss me? Hehe~ 😏"],
  },

  pet_bear: {
    tap: {
      happy: ["*ROAR* 🐻 Strong and steady!", "*flexes* Like Samson! 💪🐻", "*bear hug* You're awesome! 🤗", "Nothing can stop us! 🐻🔥"],
      hungry: ["*rumble* Need honey... 🍯🐻", "*sniffs* Where's the food? 🥩", "A bear's gotta eat... 🐻😤"],
      sad: ["*heavy sigh* ...hibernation mode... 😢🐻", "*lies down* The cave is lonely... 💔", "*grumbles sadly* ...come back... 🥺"],
    },
    pageReactions: {
      "/": ["*lumbers in* The bear cave! 🏠🐻", "*settles down* Home sweet den! 🍯"],
      "/bible": ["*sits up attentively* Story time! 📖🐻", "*excited rumble* Let's get STRONG! 💪"],
      "/leaderboard": ["*ROAR* We're the MIGHTIEST! 🏆🐻", "*pounds chest* UNSTOPPABLE! 💪🔥"],
      "/store": ["*sniffs items* Hmm, interesting... 💎🐻", "*examines carefully* Only the strongest gear! 💪"],
      "/profile": ["*proud rumble* That's one mighty warrior! 🐻💪", "*nods* Strength and faith! ⚔️"],
    },
    idle: {
      happy: ["*scratches back on tree* 🌲🐻", "*eats honey* 🍯", "*does bear stretches* 💪", "*happy rumble* 🐻"],
      hungry: ["*searches for berries* 🫐", "*grumbles* 🐻", "*sniffs the air* 👃"],
      sad: ["*curls up in cave* 🐻", "*heavy breathing* 💤", "*stares at paws* 🐾"],
    },
    reading: ["*ROAR* THAT MADE ME STRONGER! 📖🐻💪", "*pounds ground* POWERFUL WORDS! 🔥", "The bear grows MIGHTIER! 🐻⚔️"],
    quiz: ["*TRIUMPHANT ROAR* BEAR BRAIN! 🧠🐻", "*chest pound* NAILED IT! 💯💪"],
    fed: ["*HAPPY ROAR* HONEY!! 🍯🐻😍", "*devours everything* MORE! 🐻", "*satisfied rumble* Now THAT'S a meal! 💪"],
    greeting: ["*emerges from cave* GOOD MORNING! 🐻☀️", "*big stretch* Ready to be MIGHTY! 💪🔥"],
  },

  pet_bunny: {
    tap: {
      happy: ["*hop hop* 🐰 Hi hi hi!", "*wiggles nose* You're so nice! 💕", "*binkies* I'm so happy! 🎉🐰", "*soft thump* Love you! 💕"],
      hungry: ["*nibbles on nothing* Need carrots... 🥕🐰", "*twitches nose* Hungry bunny... 🥺", "*hops slowly* No energy... 🐰"],
      sad: ["*hides in burrow* ...scared... 😢🐰", "*ears droop* ...lonely bunny... 💔", "*quiet thump* ...come back... 🥺"],
    },
    pageReactions: {
      "/": ["*hop hop hop* Home burrow! 🏠🐰", "*binkies* Safe and cozy! 💕"],
      "/bible": ["*perks ears WAY up* Story time!! 📖🐰", "*excited hops* Read read read! 🎉"],
      "/leaderboard": ["*happy thump* We did it! 🏆🐰", "*binkies* Hop to the top! 🔝"],
      "/store": ["*wiggles nose* So many things! 💎🐰", "*hops around excitedly* Ooh! Ooh! 🎁"],
      "/profile": ["*nose twitch* That's us! 🐰💕", "*happy hop* So cute! ✨"],
    },
    idle: {
      happy: ["*binkies around* 🐰🎉", "*grooms ears* ✨", "*hops in circles* 🌀", "*thumps happily* 💕"],
      hungry: ["*nibbles on air* 🐰", "*nose twitch* 🥕", "*sits very still* 👀"],
      sad: ["*hides behind you* 🐰", "*tiny thump* 😢", "*ears flat* 💤"],
    },
    reading: ["*BINKY BINKY* That was AMAZING! 📖🐰🎉", "*happy thumps* More stories! 💕", "*hops excitedly* So good! ✨"],
    quiz: ["*excited binkies* SMART BUNNY! 🧠🐰", "*thump thump* We did it! 💯🎉"],
    fed: ["*MUNCH MUNCH* Carrots!! 🥕🐰😍", "*happy binkies* Thank you! 🎉", "*wiggles nose* Yummy! 💕"],
    greeting: ["*HOP HOP HOP* You're here!! 🐰💕", "*binkies* GOOD MORNING! 🎉✨"],
  },

  pet_whale: {
    tap: {
      happy: ["*SPLASH* 🐳 The ocean is vast, like God's love!", "*spouts water* 💦 Feeling great!", "Jonah learned a big lesson in here! 📖🐳", "*whale song* 🎵 Life is beautiful~"],
      hungry: ["*bubbles* Need some krill... 🐳💧", "*slow swim* Running on empty... 🫧", "Even whales need to refuel... 🐳"],
      sad: ["*sinks deeper* ...the deep is lonely... 😢🐳", "*quiet song* ...miss the surface... 💔", "*drifts* ...come swim with me... 🥺"],
    },
    pageReactions: {
      "/": ["*surfaces* 🐳 Home waters! 🏠💧", "*happy splash* Back to the reef! 🌊"],
      "/bible": ["*SPLASH* 🐳 Jonah's story is my FAVORITE! 📖", "*excited bubbles* Dive into the Word! 🌊"],
      "/leaderboard": ["*breaches* 🐳 Making WAVES! 🏆🌊", "*whale song* We're the biggest! 💪"],
      "/store": ["*curious bubbles* Ooh, ocean treasures! 💎🐳", "*spouts* Shiny like pearls! 🫧✨"],
      "/profile": ["*proud breach* 🐳 What a journey! 🌊", "*whale song* Magnificent! 🎵"],
    },
    idle: {
      happy: ["*whale song echoes* 🎵🐳", "*blows bubbles* 🫧", "*does a flip* 🐳🌊", "*spouts rainbow* 🌈💦"],
      hungry: ["*slow bubbles* 🫧", "*drifts quietly* 🐳", "*searches the deep* 👁️"],
      sad: ["*sinks to bottom* 🐳", "*quiet song* 🎵😢", "*drifts alone* 🌊"],
    },
    reading: ["*MASSIVE BREACH* INCREDIBLE! 📖🐳🌊", "*whale song of joy* 🎵✨", "*SPLASH* The Word is DEEP! 🌊🐳"],
    quiz: ["*TRIUMPHANT BREACH* WHALE BRAIN! 🧠🐳", "*happy spout* 💦 NAILED IT! 💯"],
    fed: ["*HAPPY SPLASH* KRILL FEAST! 🐳😍", "*joyful whale song* 🎵💕", "*spouts gratefully* Thank you! 💦"],
    greeting: ["*BREACHES MAGNIFICENTLY* 🐳🌊 Good morning!", "*whale song* 🎵 Ready for an ocean of wisdom! 📖"],
  },

  pet_butterfly: {
    tap: {
      happy: ["*flutter flutter* 🦋 New life is beautiful!", "*lands on your nose* Hehe~ ✨", "Transformed by grace! 💕🦋", "*dances in the air* Life is a gift! 🌸"],
      hungry: ["*flutters weakly* Need nectar... 🌺🦋", "*lands tiredly* A flower, please... 💧", "*folds wings* So tired... 🦋"],
      sad: ["*sits still* ...remember when I was a caterpillar? 😢🦋", "*droops wings* ...the garden is empty... 💔", "*quiet flutter* ...miss the sunshine... 🥺"],
    },
    pageReactions: {
      "/": ["*flutters in* 🦋 The garden of home! 🏠🌸", "*lands gently* Beautiful place~ ✨"],
      "/bible": ["*excited flutter* 🦋 Words of transformation! 📖", "*dances* The Word makes us NEW! 🌸✨"],
      "/leaderboard": ["*graceful flight* 🦋 Rising like a butterfly! 🏆", "*flutter* Beauty in progress! 🌟"],
      "/store": ["*lands on items* 🦋 So colorful! 💎🌸", "*flutters excitedly* Pretty things! ✨"],
      "/profile": ["*admires* 🦋 Look how you've transformed! ✨", "*gentle flutter* Beautiful growth! 🌸"],
    },
    idle: {
      happy: ["*dances between flowers* 🌸🦋", "*sunbathes on a leaf* ☀️", "*does figure-eights* ✨", "*lands on a flower* 🌺"],
      hungry: ["*searches for nectar* 🌺", "*rests on leaf* 🍃", "*slow flutter* 🦋"],
      sad: ["*folds wings* 🦋", "*sits in shadow* 🌑", "*quiet* ..."],
    },
    reading: ["*JOYFUL DANCE* 🦋✨ Transformed by the Word! 📖", "*flutter flutter* So beautiful! 🌸", "*spirals upward* NEW LIFE! 🦋💕"],
    quiz: ["*happy dance* 🦋 Metamorphosis of the mind! 🧠", "*flutter* Beautiful answers! 💯✨"],
    fed: ["*lands on flower* 🌺 Sweet nectar! 🦋💕", "*happy flutter* Thank you! ✨", "*dances gratefully* 🌸"],
    greeting: ["*emerges from cocoon* 🦋 A new day, a new me! ✨", "*graceful entrance* Good morning, beautiful! 🌸"],
  },

  pet_dragon: {
    tap: {
      happy: ["*BREATHES FIRE* 🐉🔥 WE ARE LEGENDARY!", "*roars* Nothing can defeat us! ⚔️🐉", "*spreads wings* BEHOLD! 🔥✨", "The dragon guards the faithful! 🐉💪"],
      hungry: ["*smoke from nostrils* Need... treasure... 🐉💎", "*growls* A dragon must feast... 🔥", "*restless* The hoard needs filling... 🐉"],
      sad: ["*curls around treasure* ...lonely at the top... 😢🐉", "*dim fire* ...the flame fades alone... 💔", "*quiet growl* ...come back, rider... 🥺"],
    },
    pageReactions: {
      "/": ["*LANDS WITH EARTHQUAKE* 🐉 The lair! 🏠🔥", "*breathes fire at ceiling* HOME! 🐉"],
      "/bible": ["*ROAR* 🐉 Ancient scrolls of POWER! 📖🔥", "*eyes glow* LEGENDARY wisdom! ⚔️"],
      "/leaderboard": ["*BREATHES FIRE* 🐉🔥 WE REIGN SUPREME! 🏆", "*triumphant roar* LEGENDS ONLY! 👑"],
      "/store": ["*hoards everything* 🐉💎 MINE! ALL MINE! 🔥", "*inspects treasure* Only LEGENDARY items! 👑"],
      "/profile": ["*PROUD ROAR* 🐉 A LEGENDARY warrior! ⚔️🔥", "*breathes fire* MAGNIFICENT! 👑"],
    },
    idle: {
      happy: ["*breathes tiny fire rings* 🔥🐉", "*polishes scales* ✨", "*flies in circles* 🐉☁️", "*guards treasure* 💎"],
      hungry: ["*smoke puffs* 🐉💨", "*scratches ground* 🔥", "*growls lowly* 😤"],
      sad: ["*dim glow* 🐉", "*curls up tight* 💤", "*stares at empty hoard* 💎😢"],
    },
    reading: ["*BREATHES FIRE IN EXCITEMENT* 🐉🔥📖 LEGENDARY CHAPTER!", "*ROAR* THE POWER OF THE WORD! ⚔️", "*flies triumphantly* EPIC! 🐉✨"],
    quiz: ["*FIRE BREATH* 🔥 DRAGON INTELLECT! 🧠🐉", "*ROAR* LEGENDARY SCORE! 💯👑"],
    fed: ["*HAPPY FIRE BURST* 🔥🐉 A FEAST! 😍", "*roars gratefully* EXCELLENT TRIBUTE! 👑", "*breathes rainbow fire* 🌈🔥"],
    greeting: ["*ERUPTS FROM VOLCANO* 🌋🐉 THE DRAGON AWAKENS! 🔥", "*LEGENDARY ENTRANCE* Ready to CONQUER! ⚔️👑"],
  },

  pet_unicorn: {
    tap: {
      happy: ["*sparkles* 🦄✨ Pure magic today!", "*rainbow mane flows* You're special! 🌈", "*horn glows* Blessed and beautiful! 💫", "*prances* Joy joy joy! 🦄💕"],
      hungry: ["*horn dims* Need rainbow berries... 🌈🦄", "*soft neigh* A little magic fuel? ✨", "*stands still* Even unicorns need care... 🦄"],
      sad: ["*rainbow fades* ...the magic feels dim... 😢🦄", "*lies down* ...where's the sparkle? 💔", "*quiet neigh* ...I need you... 🥺"],
    },
    pageReactions: {
      "/": ["*PRANCES IN* 🦄✨ The enchanted home! 🏠🌈", "*horn sparkles* Magic is everywhere! 💫"],
      "/bible": ["*HORN GLOWS BRIGHT* 🦄📖 Holy words! ✨", "*rainbow appears* The PUREST wisdom! 🌈"],
      "/leaderboard": ["*sparkle trail* 🦄✨ Magical achievements! 🏆", "*prances proudly* Pure excellence! 🌈💫"],
      "/store": ["*horn illuminates items* 🦄💎 Enchanted treasures! ✨", "*sparkles everywhere* SO MAGICAL! 🌈"],
      "/profile": ["*rainbow aura* 🦄 A truly magical soul! ✨💕", "*prances* Pure and majestic! 🌈"],
    },
    idle: {
      happy: ["*leaves sparkle trail* ✨🦄", "*rainbow appears overhead* 🌈", "*prances gracefully* 💫", "*horn pulses with light* ✨"],
      hungry: ["*dim sparkles* 🦄", "*slow trot* ✨", "*horn flickers* 💫"],
      sad: ["*lies in moonlight* 🌙🦄", "*no sparkles* 😢", "*quiet* ..."],
    },
    reading: ["*RAINBOW EXPLOSION* 🌈🦄 MAGICAL CHAPTER! 📖✨", "*horn blazes* PURE WISDOM! 💫", "*sparkle storm* ENCHANTING! 🦄🌟"],
    quiz: ["*SPARKLE BURST* 🦄✨ MAGICAL MIND! 🧠🌈", "*rainbow victory* PURE GENIUS! 💯💫"],
    fed: ["*SPARKLES EVERYWHERE* ✨🦄 Rainbow berries! 🌈😍", "*happy prance* MAGICAL meal! 💫", "*horn glows bright* Thank you! ✨💕"],
    greeting: ["*GALLOPS IN WITH RAINBOW* 🦄🌈 Good morning, magical one! ✨", "*sparkle entrance* Ready for enchantment! 💫🌟"],
  },
};

// ─── Export function to get dialogue for a pet ──────────────

export function getPetDialogue(petId: string): PetDialogue {
  return PET_DIALOGUES[petId] || DEFAULT_DIALOGUE;
}

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
