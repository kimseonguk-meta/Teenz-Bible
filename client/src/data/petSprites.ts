// Pet character sprite mapping - Modern KakaoTalk style
// Each pet has 8 expressions: normal, excited, sleepy, love, angry, dance, peek, cool

export type PetExpression = 'normal' | 'excited' | 'sleepy' | 'love' | 'angry' | 'dance' | 'peek' | 'cool';

export type PetSpriteSet = Record<PetExpression, string>;

const PETS = ['cat', 'puppy', 'lamb', 'lion', 'owl', 'dove', 'eagle', 'fox', 'bear', 'bunny', 'whale', 'butterfly', 'dragon', 'unicorn'] as const;
const EXPRESSIONS: PetExpression[] = ['normal', 'excited', 'sleepy', 'love', 'angry', 'dance', 'peek', 'cool'];

// Generate sprite paths dynamically: /pet-sprites/{pet}_{expression}.webp
export const petSprites: Record<string, PetSpriteSet> = Object.fromEntries(
  PETS.map(pet => [
    pet,
    Object.fromEntries(
      EXPRESSIONS.map(expr => [expr, `/pet-sprites/${pet}_${expr}.webp`])
    ) as PetSpriteSet,
  ])
);

// Helper to get sprite URL for a pet and expression
export function getPetSprite(petId: string, expression: PetExpression): string | null {
  const sprites = petSprites[petId];
  if (!sprites) return null;
  return sprites[expression] || sprites.normal;
}

// Luna-style portrait card art for store cards / profile (8 pets)
// High-quality illustrated portraits; lamb reuses the Luna brand icon.
const PET_CARD_ART: Record<string, string> = {
  cat: '/art-assets/pets/pet-cat.webp',
  puppy: '/art-assets/pets/pet-puppy.webp',
  lamb: '/art-assets/pets/pet-lamb.webp',
  lion: '/art-assets/pets/pet-lion.webp',
  owl: '/art-assets/pets/pet-owl.webp',
  dove: '/art-assets/pets/pet-dove.webp',
  eagle: '/art-assets/pets/pet-eagle.webp',
  fox: '/art-assets/pets/pet-fox.webp',
};

// Helper to get the Luna-style card art for a pet (store cards, profile equipped pet)
export function getPetCardArt(petId: string): string | null {
  return PET_CARD_ART[petId] || null;
}

// Luna-style expression portraits for the store preview modal (8 pets x 4 expressions)
// Same character as the card art, with excited/love/sleepy/cool faces.
const PET_EXPRESSION_ART: Record<string, Partial<Record<PetExpression, string>>> = {
  cat: {
    excited: '/art-assets/pets/pet-cat-excited.webp',
    love: '/art-assets/pets/pet-cat-love.webp',
    sleepy: '/art-assets/pets/pet-cat-sleepy.webp',
    cool: '/art-assets/pets/pet-cat-cool.webp',
    angry: '/art-assets/pets/pet-cat-angry.webp',
    dance: '/art-assets/pets/pet-cat-dance.webp',
  },
  puppy: {
    excited: '/art-assets/pets/pet-puppy-excited.webp',
    love: '/art-assets/pets/pet-puppy-love.webp',
    sleepy: '/art-assets/pets/pet-puppy-sleepy.webp',
    cool: '/art-assets/pets/pet-puppy-cool.webp',
    angry: '/art-assets/pets/pet-puppy-angry.webp',
    dance: '/art-assets/pets/pet-puppy-dance.webp',
  },
  lamb: {
    excited: '/art-assets/pets/pet-lamb-excited.webp',
    love: '/art-assets/pets/pet-lamb-love.webp',
    sleepy: '/art-assets/pets/pet-lamb-sleepy.webp',
    cool: '/art-assets/pets/pet-lamb-cool.webp',
    angry: '/art-assets/pets/pet-lamb-angry.webp',
    dance: '/art-assets/pets/pet-lamb-dance.webp',
  },
  lion: {
    excited: '/art-assets/pets/pet-lion-excited.webp',
    love: '/art-assets/pets/pet-lion-love.webp',
    sleepy: '/art-assets/pets/pet-lion-sleepy.webp',
    cool: '/art-assets/pets/pet-lion-cool.webp',
    angry: '/art-assets/pets/pet-lion-angry.webp',
    dance: '/art-assets/pets/pet-lion-dance.webp',
  },
  owl: {
    excited: '/art-assets/pets/pet-owl-excited.webp',
    love: '/art-assets/pets/pet-owl-love.webp',
    sleepy: '/art-assets/pets/pet-owl-sleepy.webp',
    cool: '/art-assets/pets/pet-owl-cool.webp',
    angry: '/art-assets/pets/pet-owl-angry.webp',
    dance: '/art-assets/pets/pet-owl-dance.webp',
  },
  dove: {
    excited: '/art-assets/pets/pet-dove-excited.webp',
    love: '/art-assets/pets/pet-dove-love.webp',
    sleepy: '/art-assets/pets/pet-dove-sleepy.webp',
    cool: '/art-assets/pets/pet-dove-cool.webp',
    angry: '/art-assets/pets/pet-dove-angry.webp',
    dance: '/art-assets/pets/pet-dove-dance.webp',
  },
  eagle: {
    excited: '/art-assets/pets/pet-eagle-excited.webp',
    love: '/art-assets/pets/pet-eagle-love.webp',
    sleepy: '/art-assets/pets/pet-eagle-sleepy.webp',
    cool: '/art-assets/pets/pet-eagle-cool.webp',
    angry: '/art-assets/pets/pet-eagle-angry.webp',
    dance: '/art-assets/pets/pet-eagle-dance.webp',
  },
  fox: {
    excited: '/art-assets/pets/pet-fox-excited.webp',
    love: '/art-assets/pets/pet-fox-love.webp',
    sleepy: '/art-assets/pets/pet-fox-sleepy.webp',
    cool: '/art-assets/pets/pet-fox-cool.webp',
    angry: '/art-assets/pets/pet-fox-angry.webp',
    dance: '/art-assets/pets/pet-fox-dance.webp',
  },
};

// Helper to get the Luna-style expression portrait (store preview modal, FloatingPet).
// 'normal' maps to the Luna card art. Falls back to the legacy Kakao-style sprite
// when no Luna art exists (other pets).
export function getPetExpressionArt(petId: string, expression: PetExpression): string | null {
  if (expression === 'normal') {
    const cardArt = getPetCardArt(petId);
    if (cardArt) return cardArt;
  }
  const lunaArt = PET_EXPRESSION_ART[petId]?.[expression];
  if (lunaArt) return lunaArt;
  return getPetSprite(petId, expression);
}

// Helper to get the normal/default sprite (for store cards)
export function getPetDefaultSprite(petId: string): string | null {
  const sprites = petSprites[petId];
  if (!sprites) return null;
  return sprites.normal;
}
