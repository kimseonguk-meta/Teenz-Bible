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

// Helper to get the normal/default sprite (for store cards)
export function getPetDefaultSprite(petId: string): string | null {
  const sprites = petSprites[petId];
  if (!sprites) return null;
  return sprites.normal;
}
