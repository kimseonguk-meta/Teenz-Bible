// 제자반 챌린지 참가 명단 (39명) — SHA-256 해시만 저장
// 실명 평문은 클라이언트 번들에 포함하지 않음 (개인정보 보호)
// 전화번호·카카오톡 ID는 어떤 경로에도 저장하지 않음 (정책)

export interface RosterEntry {
  no: number;
  hash: string; // 정규화된 한글 실명의 SHA-256
  grade: string;
  cls: string;
}

export const CHALLENGE_ROSTER: RosterEntry[] = [
  { no: 1, hash: "bf574d955e94fc6030df9e8c486b71267518fd305a70329d9b196e48e5e43497", grade: "10", cls: "A" },
  { no: 2, hash: "0d077696fb37c262123cb3f8dcce0c215d0be33ca7c98b568af60c4eb57bdbd5", grade: "10", cls: "A" },
  { no: 3, hash: "68f0d6545c286d09bbc80285e24ba95507fe2fdd93d4bfe094b63d6119d60a7a", grade: "10", cls: "A" },
  { no: 4, hash: "eb3880c1c3f8210970b15c4c741d6e75d9128e6f18dd948226e8f52915e811fb", grade: "10", cls: "B" },
  { no: 5, hash: "d67964539e2451d72b054e5c87446b00008cd10fe4c459d06940db00a48ae1df", grade: "10", cls: "B" },
  { no: 6, hash: "ce52005344b75208dff6e2c028473ddfcf09f5f3db1a24522913aabba9b3a2c3", grade: "10", cls: "C" },
  { no: 7, hash: "9f070ab57ad188baa90d5c9d92da6f2820bdb92d3737f3d7942168d37aa16f4d", grade: "10", cls: "D" },
  { no: 8, hash: "9ebae48f98b5270ffbb215ddecb192fbe95d3c955d883b9cf633413a28848999", grade: "10", cls: "D" },
  { no: 9, hash: "c4846e36e037d81ecf208f7b31f33027f8a4106fe77a283494b1b2c444a026ef", grade: "10", cls: "D" },
  { no: 10, hash: "41cea02409a69488e54773e332e648cd1177f6955bff076813bbaa7a322b67b9", grade: "11", cls: "A" },
  { no: 11, hash: "323a684e74617b9976a9eb5c06ee21ae8566fe7f26e0a29b5704ed3949c77faf", grade: "11", cls: "A" },
  { no: 12, hash: "e081c629c3ad0dbf7ae6a097e83c078bc7de1dea7d052a1b890ab61509952a36", grade: "11", cls: "A" },
  { no: 13, hash: "42ded9b9f90cb79bfac3c7600a23dd020b7f15ac19642b8918d67af28c54d967", grade: "12", cls: "A" },
  { no: 14, hash: "81643428b510e93ded3ed5e87bf67e7bb1fd13989842bc7c1296f4f50ca663d1", grade: "12", cls: "B" },
  { no: 15, hash: "f92575e069e26e3ba21479fe4e36d7c2b858bb9ddc560926d384fa697000225a", grade: "12", cls: "B" },
  { no: 16, hash: "8099ad1f8cbcbcc211b61204be5f3148f4a82b195541a3e63f1396e644059459", grade: "12", cls: "B" },
  { no: 17, hash: "28e2aba87869139d481c34ff29dabd2997726391b3ae862685342e473082f6db", grade: "12", cls: "B" },
  { no: 18, hash: "8e7fe7c13e13af731c6a85d7d3e72aa710519ebedb6a0656a69a290636e1f84e", grade: "12", cls: "B" },
  { no: 19, hash: "6dc7a867667ea1110deb08e0ed4cd76b2ec182f8e977a4980d3edfdf2baf07d5", grade: "12", cls: "B" },
  { no: 20, hash: "a8ebaff44ed96b6f2e1f8cb6cf2aabd8671ca15d8d7264f27a4f619237b02edb", grade: "12", cls: "D" },
  { no: 21, hash: "c4b2b6731bb1395976d71fe9390e580e27538550a006426dff16dd335687f227", grade: "12", cls: "D" },
  { no: 22, hash: "55dc620f4fcdcaf998e06672b749605f01d08e4ffeef91e53eb63f371a3ba6fa", grade: "12", cls: "E" },
  { no: 23, hash: "223e89df80a6d0bb7bd3e800aac1e7891cd0991eb6887cde41a862f55b8fb9ac", grade: "12", cls: "E" },
  { no: 24, hash: "c7c4c94793c62066d3203a5f0605eb7c124bb026602e64347d9fc910cfc98d7c", grade: "12", cls: "E" },
  { no: 25, hash: "4998ef2382866713cd4a1d77ebca42451ed10c256f941685f5499cbe4cbdfb27", grade: "12", cls: "E" },
  { no: 26, hash: "39e3f6ece8d611701e1ad97b1fcaca6fae4d6e6bc3780481c5538b5c5a44a92f", grade: "12", cls: "E" },
  { no: 27, hash: "0d6e0b0351ad02d02961f83bfbe3c5b1abee557a9a78eb29bf3e51fe5fa3c207", grade: "13", cls: "B" },
  { no: 28, hash: "4efc78d47ae6fee201756c1dd1b2582aa8c0ab9af729424c458ca1ab910d0157", grade: "13", cls: "B" },
  { no: 29, hash: "de79aa613d9f5f09413bcb9f85ebcfbdb7d8cbe6839288d3f2308a3c383f5c80", grade: "13", cls: "B" },
  { no: 30, hash: "36e20f6d1d93b0a858f83dce645641d8168abae232d1417351de3de8d20534dd", grade: "13", cls: "B" },
  { no: 31, hash: "6c632a1a8919e492f281c38ae3af44aae73a9d051b63236b67c5cc31f9cf49a3", grade: "13", cls: "B" },
  { no: 32, hash: "1c7bf2b08e6c13ca4933302bb5b390720c495919df2ce1e755e6de2bf589f26b", grade: "13", cls: "B" },
  { no: 33, hash: "6d9fd71cee77ce99bb765ac60762a67f843c9e794731e75e0220e2ee6861e58d", grade: "13", cls: "B" },
  { no: 34, hash: "7cbbebe04f30235972b6f0b05158c05016ee49ad44a53b1fce44e13aeb0bd31e", grade: "13", cls: "C" },
  { no: 35, hash: "41353b39965a5f0250c46e61e08bc4800bee3ae1b5bd0f962099f328a2834ed1", grade: "13", cls: "C" },
  { no: 36, hash: "2c97c3e0bef65f72dd730e7628d517ce4bea7039dcd699cc517da92a87de7a90", grade: "13", cls: "D" },
  { no: 37, hash: "b655ae32eb2c35d87012998c2050eaa9a681ece248df894ad6da6524b6f9a0c1", grade: "13", cls: "D" },
  { no: 38, hash: "690eeda1f4bb77728a041cf4aedbdee923f71b4cf70f952c5fcb951917be8e81", grade: "13", cls: "E" },
  { no: 39, hash: "dea29247356c935db0f2503a60c3d1cc64975289d864b6ffe086d57a66847173", grade: "13", cls: "E" },
];

/** 이름 정규화: 앞뒤 공백 제거 + 모든 공백 제거 */
export function normalizeRosterName(input: string): string {
  return (input || "").trim().replace(/s+/g, "");
}

/**
 * 명단에서 이름 찾기 (비동기 SHA-256 해시 비교)
 * 입력 이름이 명단에 있을 때만 {no, grade, cls} 반환, 이름 평문은 저장하지 않음
 */
export async function findRosterByName(input: string): Promise<RosterEntry | undefined> {
  const norm = normalizeRosterName(input);
  if (!norm) return undefined;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(norm));
  const hash = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return CHALLENGE_ROSTER.find((r) => r.hash === hash);
}
