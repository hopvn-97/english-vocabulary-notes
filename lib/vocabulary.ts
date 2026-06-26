import { REVIEW_GRADES, VOCABULARY_STATUSES, type ReviewGrade, type Vocabulary, type VocabularyFilters, type VocabularyInput, type VocabularyStatus } from "@/types/vocabulary";

export const VOCABULARY_COLUMNS = [
  "id",
  "word",
  "meaning_vi",
  "example_en",
  "example_vi",
  "ipa",
  "part_of_speech",
  "tags",
  "status",
  "created_at",
  "updated_at",
  "review_due_at",
  "last_reviewed_at",
  "review_count",
  "ease_level"
] as const;

export function isVocabularyStatus(value: unknown): value is VocabularyStatus {
  return typeof value === "string" && VOCABULARY_STATUSES.includes(value as VocabularyStatus);
}

export function isReviewGrade(value: unknown): value is ReviewGrade {
  return typeof value === "string" && REVIEW_GRADES.includes(value as ReviewGrade);
}

export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

export function normalizeWord(word: string) {
  return word.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findDuplicateVocabulary(items: Vocabulary[], word: string, exceptId?: string) {
  const normalizedWord = normalizeWord(word);

  return items.find((item) => item.id !== exceptId && normalizeWord(item.word) === normalizedWord);
}

function getVocabularySearchText(item: Vocabulary) {
  return [
    item.word,
    item.meaning_vi,
    item.example_en,
    item.example_vi,
    item.ipa,
    item.part_of_speech,
    ...item.tags
  ]
    .join(" ")
    .toLowerCase();
}

function parsePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeEaseLevel(value: unknown) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.min(parsed, 5) : 2;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function rowToVocabulary(row: string[]): Vocabulary {
  return {
    id: row[0] ?? "",
    word: row[1] ?? "",
    meaning_vi: row[2] ?? "",
    example_en: row[3] ?? "",
    example_vi: row[4] ?? "",
    ipa: row[5] ?? "",
    part_of_speech: row[6] ?? "",
    tags: normalizeTags(row[7] ?? ""),
    status: isVocabularyStatus(row[8]) ? row[8] : "new",
    created_at: row[9] ?? "",
    updated_at: row[10] ?? "",
    review_due_at: row[11] ?? row[9] ?? "",
    last_reviewed_at: row[12] ?? "",
    review_count: parsePositiveInteger(row[13], 0),
    ease_level: normalizeEaseLevel(row[14])
  };
}

export function vocabularyToRow(vocabulary: Vocabulary): string[] {
  return [
    vocabulary.id,
    vocabulary.word,
    vocabulary.meaning_vi,
    vocabulary.example_en,
    vocabulary.example_vi,
    vocabulary.ipa,
    vocabulary.part_of_speech,
    vocabulary.tags.join(", "),
    vocabulary.status,
    vocabulary.created_at,
    vocabulary.updated_at,
    vocabulary.review_due_at,
    vocabulary.last_reviewed_at,
    String(vocabulary.review_count),
    String(vocabulary.ease_level)
  ];
}

export function validateVocabularyInput(input: Partial<VocabularyInput>) {
  const errors: Record<string, string> = {};

  if (!input.word?.trim()) {
    errors.word = "English word is required.";
  }

  if (!input.meaning_vi?.trim()) {
    errors.meaning_vi = "Vietnamese meaning is required.";
  }

  if (input.status && !isVocabularyStatus(input.status)) {
    errors.status = "Status must be new, learning, or mastered.";
  }

  return errors;
}

export function buildVocabulary(input: VocabularyInput): Vocabulary {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    word: input.word.trim(),
    meaning_vi: input.meaning_vi.trim(),
    example_en: input.example_en?.trim() ?? "",
    example_vi: input.example_vi?.trim() ?? "",
    ipa: input.ipa?.trim() ?? "",
    part_of_speech: input.part_of_speech?.trim() ?? "",
    tags: normalizeTags(input.tags),
    status: input.status ?? "new",
    created_at: now,
    updated_at: now,
    review_due_at: now,
    last_reviewed_at: "",
    review_count: 0,
    ease_level: 2
  };
}

export function mergeVocabulary(existing: Vocabulary, input: VocabularyInput): Vocabulary {
  return {
    ...existing,
    word: input.word.trim(),
    meaning_vi: input.meaning_vi.trim(),
    example_en: input.example_en?.trim() ?? "",
    example_vi: input.example_vi?.trim() ?? "",
    ipa: input.ipa?.trim() ?? "",
    part_of_speech: input.part_of_speech?.trim() ?? "",
    tags: normalizeTags(input.tags),
    status: input.status ?? "new",
    review_due_at: existing.review_due_at,
    last_reviewed_at: existing.last_reviewed_at,
    review_count: existing.review_count,
    ease_level: existing.ease_level,
    updated_at: new Date().toISOString()
  };
}

export function applyReviewGrade(vocabulary: Vocabulary, grade: ReviewGrade): Vocabulary {
  const now = new Date();
  const nextReviewCount = vocabulary.review_count + 1;
  let nextEaseLevel = vocabulary.ease_level;
  let nextStatus: VocabularyStatus = "learning";
  let intervalDays = 0;

  if (grade === "again") {
    nextEaseLevel = Math.max(1, vocabulary.ease_level - 1);
    nextStatus = "learning";
    intervalDays = 0;
  }

  if (grade === "good") {
    nextEaseLevel = vocabulary.ease_level;
    nextStatus = nextReviewCount >= 3 ? "mastered" : "learning";
    intervalDays = nextReviewCount <= 1 ? 1 : Math.min(30, nextReviewCount * nextEaseLevel);
  }

  if (grade === "easy") {
    nextEaseLevel = Math.min(5, vocabulary.ease_level + 1);
    nextStatus = "mastered";
    intervalDays = Math.min(60, Math.max(4, nextReviewCount * nextEaseLevel * 2));
  }

  const reviewDueAt = intervalDays === 0 ? now : addDays(now, intervalDays);

  return {
    ...vocabulary,
    status: nextStatus,
    review_due_at: reviewDueAt.toISOString(),
    last_reviewed_at: now.toISOString(),
    review_count: nextReviewCount,
    ease_level: nextEaseLevel,
    updated_at: now.toISOString()
  };
}

function isDueToday(item: Vocabulary) {
  if (!item.review_due_at) {
    return true;
  }

  const dueAt = new Date(item.review_due_at).getTime();
  return Number.isFinite(dueAt) ? dueAt <= Date.now() : true;
}

export function filterVocabulary(items: Vocabulary[], filters: VocabularyFilters): Vocabulary[] {
  const search = filters.search?.trim().toLowerCase();
  const partOfSpeech = filters.partOfSpeech?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch = !search || getVocabularySearchText(item).includes(search);
    const matchesPartOfSpeech = !partOfSpeech || item.part_of_speech.toLowerCase() === partOfSpeech;
    const matchesStatus = !filters.status || filters.status === "all" || item.status === filters.status;
    const matchesTag = !tag || item.tags.some((itemTag) => itemTag.toLowerCase() === tag);
    const matchesDue = filters.due !== "today" || isDueToday(item);

    return matchesSearch && matchesPartOfSpeech && matchesStatus && matchesTag && matchesDue;
  });
}
