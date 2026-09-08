import allBibleDataJson from "./allBibleData.json";

export interface Chapter {
  num: number;
  title: string;
  paragraphs: string[];
  verseRanges?: (string | null)[];
}

export type BibleData = Record<string, Chapter[]>;

export const allBibleData: BibleData = allBibleDataJson as BibleData;

// NT books (first 27)
export const ntBooks = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude",
  "Revelation"
];

// OT books (remaining 39)
export const otBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

// OT Categories
export const otCategories: Record<string, string[]> = {
  "Law": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  "History": ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"],
  "Poetry": ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"],
  "Major Prophets": ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
  "Minor Prophets": ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]
};

// NT Categories
export const ntCategories: Record<string, string[]> = {
  "Gospels": ["Matthew", "Mark", "Luke", "John"],
  "History": ["Acts"],
  "Paul's Letters": ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"],
  "General Letters": ["Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude"],
  "Prophecy": ["Revelation"]
};
