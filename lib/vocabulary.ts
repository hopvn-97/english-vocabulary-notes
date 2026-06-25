import { VOCABULARY_STATUSES, type Vocabulary, type VocabularyFilters, type VocabularyInput, type VocabularyStatus } from "@/types/vocabulary";

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
  "updated_at"
] as const;

export function isVocabularyStatus(value: unknown): value is VocabularyStatus {
  return typeof value === "string" && VOCABULARY_STATUSES.includes(value as VocabularyStatus);
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
    updated_at: row[10] ?? ""
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
    vocabulary.updated_at
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
    updated_at: now
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
    updated_at: new Date().toISOString()
  };
}

export function filterVocabulary(items: Vocabulary[], filters: VocabularyFilters): Vocabulary[] {
  const search = filters.search?.trim().toLowerCase();
  const partOfSpeech = filters.partOfSpeech?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch = !search || item.word.toLowerCase().includes(search);
    const matchesPartOfSpeech = !partOfSpeech || item.part_of_speech.toLowerCase() === partOfSpeech;
    const matchesStatus = !filters.status || filters.status === "all" || item.status === filters.status;
    const matchesTag = !tag || item.tags.some((itemTag) => itemTag.toLowerCase() === tag);

    return matchesSearch && matchesPartOfSpeech && matchesStatus && matchesTag;
  });
}
