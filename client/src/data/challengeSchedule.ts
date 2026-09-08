// 제자반 성경읽기 챌린지 70일 일정 (2026-09-07 ~ 2026-11-15)
// 출처: NO MATTER WHAT 성경읽기 챌린지 일정표
// book: allBibleData / chapterQuizzesKo 키와 동일한 영문명

export interface ChallengeDay {
  day: number; // 1-70
  date: string; // YYYY-MM-DD (Asia/Singapore 기준)
  book: string; // 영문 book 키 (Matthew, Mark, Luke, John, Romans)
  bookKo: string; // 한글명
  chapters: number[]; // 해당 일차의 장 목록
  labelKo: string; // "마태복음 1–2장" 표시용
}

export const CHALLENGE_ID = "jezaban2026";
export const CHALLENGE_START = "2026-09-07";
export const CHALLENGE_END = "2026-11-15";
export const CHALLENGE_DAYS = 70;

const D = (day: number, date: string, book: string, bookKo: string, chapters: number[]): ChallengeDay => ({
  day,
  date,
  book,
  bookKo,
  chapters,
  labelKo: `${bookKo} ${chapters.length > 1 ? `${chapters[0]}–${chapters[chapters.length - 1]}` : chapters[0]}장`,
});

export const CHALLENGE_SCHEDULE: ChallengeDay[] = [
  D(1, "2026-09-07", "Matthew", "마태복음", [1, 2]),
  D(2, "2026-09-08", "Matthew", "마태복음", [3, 4]),
  D(3, "2026-09-09", "Matthew", "마태복음", [5]),
  D(4, "2026-09-10", "Matthew", "마태복음", [6]),
  D(5, "2026-09-11", "Matthew", "마태복음", [7]),
  D(6, "2026-09-12", "Matthew", "마태복음", [8, 9]),
  D(7, "2026-09-13", "Matthew", "마태복음", [10, 11]),
  D(8, "2026-09-14", "Matthew", "마태복음", [12, 13]),
  D(9, "2026-09-15", "Matthew", "마태복음", [14, 15]),
  D(10, "2026-09-16", "Matthew", "마태복음", [16]),
  D(11, "2026-09-17", "Matthew", "마태복음", [17, 18]),
  D(12, "2026-09-18", "Matthew", "마태복음", [19, 20]),
  D(13, "2026-09-19", "Matthew", "마태복음", [21]),
  D(14, "2026-09-20", "Matthew", "마태복음", [22]),
  D(15, "2026-09-21", "Matthew", "마태복음", [23]),
  D(16, "2026-09-22", "Matthew", "마태복음", [24]),
  D(17, "2026-09-23", "Matthew", "마태복음", [25]),
  D(18, "2026-09-24", "Matthew", "마태복음", [26]),
  D(19, "2026-09-25", "Matthew", "마태복음", [27, 28]),
  D(20, "2026-09-26", "Mark", "마가복음", [1, 2]),
  D(21, "2026-09-27", "Mark", "마가복음", [3, 4]),
  D(22, "2026-09-28", "Mark", "마가복음", [5, 6]),
  D(23, "2026-09-29", "Mark", "마가복음", [7, 8]),
  D(24, "2026-09-30", "Mark", "마가복음", [9]),
  D(25, "2026-10-01", "Mark", "마가복음", [10]),
  D(26, "2026-10-02", "Mark", "마가복음", [11]),
  D(27, "2026-10-03", "Mark", "마가복음", [12]),
  D(28, "2026-10-04", "Mark", "마가복음", [13]),
  D(29, "2026-10-05", "Mark", "마가복음", [14]),
  D(30, "2026-10-06", "Mark", "마가복음", [15]),
  D(31, "2026-10-07", "Mark", "마가복음", [16]),
  D(32, "2026-10-08", "Luke", "누가복음", [1, 2]),
  D(33, "2026-10-09", "Luke", "누가복음", [3, 4]),
  D(34, "2026-10-10", "Luke", "누가복음", [5, 6]),
  D(35, "2026-10-11", "Luke", "누가복음", [7, 8]),
  D(36, "2026-10-12", "Luke", "누가복음", [9]),
  D(37, "2026-10-13", "Luke", "누가복음", [10]),
  D(38, "2026-10-14", "Luke", "누가복음", [11]),
  D(39, "2026-10-15", "Luke", "누가복음", [12]),
  D(40, "2026-10-16", "Luke", "누가복음", [13]),
  D(41, "2026-10-17", "Luke", "누가복음", [14]),
  D(42, "2026-10-18", "Luke", "누가복음", [15]),
  D(43, "2026-10-19", "Luke", "누가복음", [16]),
  D(44, "2026-10-20", "Luke", "누가복음", [17]),
  D(45, "2026-10-21", "Luke", "누가복음", [18]),
  D(46, "2026-10-22", "Luke", "누가복음", [19]),
  D(47, "2026-10-23", "Luke", "누가복음", [20]),
  D(48, "2026-10-24", "Luke", "누가복음", [21]),
  D(49, "2026-10-25", "Luke", "누가복음", [22]),
  D(50, "2026-10-26", "Luke", "누가복음", [23, 24]),
  D(51, "2026-10-27", "John", "요한복음", [1, 2]),
  D(52, "2026-10-28", "John", "요한복음", [3, 4]),
  D(53, "2026-10-29", "John", "요한복음", [5, 6]),
  D(54, "2026-10-30", "John", "요한복음", [7, 8]),
  D(55, "2026-10-31", "John", "요한복음", [9, 10]),
  D(56, "2026-11-01", "John", "요한복음", [11]),
  D(57, "2026-11-02", "John", "요한복음", [12, 13]),
  D(58, "2026-11-03", "John", "요한복음", [14]),
  D(59, "2026-11-04", "John", "요한복음", [15, 16]),
  D(60, "2026-11-05", "John", "요한복음", [17, 18]),
  D(61, "2026-11-06", "John", "요한복음", [19, 20, 21]),
  D(62, "2026-11-07", "Romans", "로마서", [1, 2]),
  D(63, "2026-11-08", "Romans", "로마서", [3, 4]),
  D(64, "2026-11-09", "Romans", "로마서", [5, 6]),
  D(65, "2026-11-10", "Romans", "로마서", [7, 8]),
  D(66, "2026-11-11", "Romans", "로마서", [9, 10]),
  D(67, "2026-11-12", "Romans", "로마서", [11, 12]),
  D(68, "2026-11-13", "Romans", "로마서", [13, 14]),
  D(69, "2026-11-14", "Romans", "로마서", [15]),
  D(70, "2026-11-15", "Romans", "로마서", [16]),
];

// 날짜(YYYY-MM-DD) → 일차
const DATE_TO_DAY = new Map(CHALLENGE_SCHEDULE.map((d) => [d.date, d]));

export function getChallengeDay(dateKey: string): ChallengeDay | undefined {
  return DATE_TO_DAY.get(dateKey);
}

/** Singapore 날짜 키 (YYYY-MM-DD) */
export function sgDateKey(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts; // en-CA → YYYY-MM-DD
}

/** 챕터 키: 퀴즈/본문 데이터 공용 (예: Matthew_1) */
export function chapterKey(book: string, chapter: number): string {
  return `${book}_${chapter}`;
}
