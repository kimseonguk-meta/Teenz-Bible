// Bible quiz data covering all 66 books (1189 chapters total)
// Format: { "BookName_ChapterNum": { q: question, a: correct answer, w: [3 wrong answers], ref: verse reference } }

import quizzesEn from "./chapterQuizzes.json";
import quizzesKo from "./chapterQuizzesKo.json";

export interface QuizEntry {
  q: string;
  a: string;
  w: string[];
  ref?: string;
}

export const chapterQuizzes: Record<string, QuizEntry> = quizzesEn as Record<string, QuizEntry>;
export const chapterQuizzesKo: Record<string, QuizEntry> = quizzesKo as Record<string, QuizEntry>;

/**
 * Get quiz for a specific book and chapter
 * @param book - Book name e.g. "Matthew"
 * @param chapterNum - Chapter number e.g. 5
 * @param lang - Language "en" or "ko"
 * @returns QuizEntry or null if no quiz exists
 */
export function getQuiz(book: string, chapterNum: number, lang: "en" | "ko" = "en"): QuizEntry | null {
  const key = `${book}_${chapterNum}`;
  const source = lang === "ko" ? chapterQuizzesKo : chapterQuizzes;
  return source[key] || null;
}

/**
 * Get shuffled options for a quiz entry
 * @returns { options: string[], correctIndex: number }
 */
export function getShuffledOptions(quiz: QuizEntry): { options: string[]; correctIndex: number } {
  const options = [quiz.a, ...quiz.w];
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correctIndex: options.indexOf(quiz.a) };
}

/**
 * Check if a quiz exists for a given book and chapter
 */
export function hasQuiz(book: string, chapterNum: number): boolean {
  return `${book}_${chapterNum}` in chapterQuizzes;
}
