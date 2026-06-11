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

// Helper to get the normal/default sprite (for store cards)
export function getPetDefaultSprite(petId: string): string | null {
  const sprites = petSprites[petId];
  if (!sprites) return null;
  return sprites.normal;
}
