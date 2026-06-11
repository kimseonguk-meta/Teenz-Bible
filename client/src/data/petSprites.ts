// Pet character sprite mapping - Modern KakaoTalk style
// Each pet has 8 expressions: normal, excited, sleepy, love, angry, dance, peek, cool

export type PetExpression = 'normal' | 'excited' | 'sleepy' | 'love' | 'angry' | 'dance' | 'peek' | 'cool';

export type PetSpriteSet = Record<PetExpression, string>;

export const petSprites: Record<string, PetSpriteSet> = {
  cat: {
    normal: '/manus-storage/pet_cat_normal_77e4f248.png',
    excited: '/manus-storage/pet_cat_excited_9e55c700.png',
    sleepy: '/manus-storage/pet_cat_sleepy_9f3e78b4.png',
    love: '/manus-storage/pet_cat_love_56dea44b.png',
    angry: '/manus-storage/pet_cat_angry_f56633b5.png',
    dance: '/manus-storage/pet_cat_dance_f322fa4d.png',
    peek: '/manus-storage/pet_cat_peek_0286fbd1.png',
    cool: '/manus-storage/pet_cat_cool_1ecdd418.png',
  },
  puppy: {
    normal: '/manus-storage/pet_puppy_normal_941fb598.png',
    excited: '/manus-storage/pet_puppy_excited_f8584fbb.png',
    sleepy: '/manus-storage/pet_puppy_sleepy_322d8581.png',
    love: '/manus-storage/pet_puppy_love_ced2611d.png',
    angry: '/manus-storage/pet_puppy_angry_fe330abc.png',
    dance: '/manus-storage/pet_puppy_dance_3aa4eabe.png',
    peek: '/manus-storage/pet_puppy_peek_0e4cb980.png',
    cool: '/manus-storage/pet_puppy_cool_b1446e38.png',
  },
  lamb: {
    normal: '/manus-storage/pet_lamb_normal_0f215d3b.png',
    excited: '/manus-storage/pet_lamb_excited_7505e732.png',
    sleepy: '/manus-storage/pet_lamb_sleepy_8492007a.png',
    love: '/manus-storage/pet_lamb_love_707b472a.png',
    angry: '/manus-storage/pet_lamb_angry_3a112d5f.png',
    dance: '/manus-storage/pet_lamb_dance_4a216f12.png',
    peek: '/manus-storage/pet_lamb_peek_8053889c.png',
    cool: '/manus-storage/pet_lamb_cool_a982d4f2.png',
  },
  lion: {
    normal: '/manus-storage/pet_lion_normal_72e367e3.png',
    excited: '/manus-storage/pet_lion_excited_75a9e154.png',
    sleepy: '/manus-storage/pet_lion_sleepy_4ee12529.png',
    love: '/manus-storage/pet_lion_love_25bc96ae.png',
    angry: '/manus-storage/pet_lion_angry_500dba3d.png',
    dance: '/manus-storage/pet_lion_dance_2bdf8928.png',
    peek: '/manus-storage/pet_lion_peek_c4662ec5.png',
    cool: '/manus-storage/pet_lion_cool_025352cd.png',
  },
  owl: {
    normal: '/manus-storage/pet_owl_normal_454cf237.png',
    excited: '/manus-storage/pet_owl_excited_d5000085.png',
    sleepy: '/manus-storage/pet_owl_sleepy_7cc385f9.png',
    love: '/manus-storage/pet_owl_love_a551fb38.png',
    angry: '/manus-storage/pet_owl_angry_233858c9.png',
    dance: '/manus-storage/pet_owl_dance_b4051bb9.png',
    peek: '/manus-storage/pet_owl_peek_8d08d7cc.png',
    cool: '/manus-storage/pet_owl_cool_34948067.png',
  },
  dove: {
    normal: '/manus-storage/pet_dove_normal_4b88d335.png',
    excited: '/manus-storage/pet_dove_excited_172a757b.png',
    sleepy: '/manus-storage/pet_dove_sleepy_4c7943fa.png',
    love: '/manus-storage/pet_dove_love_91384b29.png',
    angry: '/manus-storage/pet_dove_angry_25f2376b.png',
    dance: '/manus-storage/pet_dove_dance_25a4c4bc.png',
    peek: '/manus-storage/pet_dove_peek_03265223.png',
    cool: '/manus-storage/pet_dove_cool_862cced6.png',
  },
  eagle: {
    normal: '/manus-storage/pet_eagle_normal_b803365a.png',
    excited: '/manus-storage/pet_eagle_excited_28d6be7e.png',
    sleepy: '/manus-storage/pet_eagle_sleepy_a348f701.png',
    love: '/manus-storage/pet_eagle_love_8553f6d9.png',
    angry: '/manus-storage/pet_eagle_angry_6e8eda09.png',
    dance: '/manus-storage/pet_eagle_dance_54836c37.png',
    peek: '/manus-storage/pet_eagle_peek_9fa815f9.png',
    cool: '/manus-storage/pet_eagle_cool_7dedddca.png',
  },
  fox: {
    normal: '/manus-storage/pet_fox_normal_5638632e.png',
    excited: '/manus-storage/pet_fox_excited_f30f5e7b.png',
    sleepy: '/manus-storage/pet_fox_sleepy_e43bf1ad.png',
    love: '/manus-storage/pet_fox_love_46e974b3.png',
    angry: '/manus-storage/pet_fox_angry_17dc49b7.png',
    dance: '/manus-storage/pet_fox_dance_cdab76d9.png',
    peek: '/manus-storage/pet_fox_peek_ea2bc025.png',
    cool: '/manus-storage/pet_fox_cool_fb052f47.png',
  },
  bear: {
    normal: '/manus-storage/pet_bear_normal_f534298a.png',
    excited: '/manus-storage/pet_bear_excited_5c38d9ab.png',
    sleepy: '/manus-storage/pet_bear_sleepy_89b6431e.png',
    love: '/manus-storage/pet_bear_love_443c3c8a.png',
    angry: '/manus-storage/pet_bear_angry_99938cbf.png',
    dance: '/manus-storage/pet_bear_dance_5b9b57bc.png',
    peek: '/manus-storage/pet_bear_peek_8b58ce26.png',
    cool: '/manus-storage/pet_bear_cool_48af8666.png',
  },
  bunny: {
    normal: '/manus-storage/pet_bunny_normal_02aeee2c.png',
    excited: '/manus-storage/pet_bunny_excited_512504f9.png',
    sleepy: '/manus-storage/pet_bunny_sleepy_b182d5e2.png',
    love: '/manus-storage/pet_bunny_love_83b42147.png',
    angry: '/manus-storage/pet_bunny_angry_48d52f96.png',
    dance: '/manus-storage/pet_bunny_dance_4e2ca712.png',
    peek: '/manus-storage/pet_bunny_peek_6d69aa41.png',
    cool: '/manus-storage/pet_bunny_cool_cb03fab7.png',
  },
  whale: {
    normal: '/manus-storage/pet_whale_normal_539899a5.png',
    excited: '/manus-storage/pet_whale_excited_9f9c6975.png',
    sleepy: '/manus-storage/pet_whale_sleepy_1cb53250.png',
    love: '/manus-storage/pet_whale_love_cbdb49ec.png',
    angry: '/manus-storage/pet_whale_angry_35734137.png',
    dance: '/manus-storage/pet_whale_dance_600d1728.png',
    peek: '/manus-storage/pet_whale_peek_c029205e.png',
    cool: '/manus-storage/pet_whale_cool_4416d9b8.png',
  },
  butterfly: {
    normal: '/manus-storage/pet_butterfly_normal_1ea85f2c.png',
    excited: '/manus-storage/pet_butterfly_excited_15758742.png',
    sleepy: '/manus-storage/pet_butterfly_sleepy_76c50b17.png',
    love: '/manus-storage/pet_butterfly_love_3ffe3d33.png',
    angry: '/manus-storage/pet_butterfly_angry_529ddfbc.png',
    dance: '/manus-storage/pet_butterfly_dance_86318447.png',
    peek: '/manus-storage/pet_butterfly_peek_d162fc2c.png',
    cool: '/manus-storage/pet_butterfly_cool_674771dd.png',
  },
  dragon: {
    normal: '/manus-storage/pet_dragon_normal_10064209.png',
    excited: '/manus-storage/pet_dragon_excited_c0d7fc64.png',
    sleepy: '/manus-storage/pet_dragon_sleepy_921f13b6.png',
    love: '/manus-storage/pet_dragon_love_88f49d12.png',
    angry: '/manus-storage/pet_dragon_angry_4d14b6e3.png',
    dance: '/manus-storage/pet_dragon_dance_cef4e362.png',
    peek: '/manus-storage/pet_dragon_peek_62e85f5a.png',
    cool: '/manus-storage/pet_dragon_cool_0ced4e51.png',
  },
  unicorn: {
    normal: '/manus-storage/pet_unicorn_normal_7a3144b5.png',
    excited: '/manus-storage/pet_unicorn_excited_676c3665.png',
    sleepy: '/manus-storage/pet_unicorn_sleepy_020fddc1.png',
    love: '/manus-storage/pet_unicorn_love_4b9a50ba.png',
    angry: '/manus-storage/pet_unicorn_angry_ee124206.png',
    dance: '/manus-storage/pet_unicorn_dance_d1a1b4e2.png',
    peek: '/manus-storage/pet_unicorn_peek_e0141cc7.png',
    cool: '/manus-storage/pet_unicorn_cool_008b07a7.png',
  },
};

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
