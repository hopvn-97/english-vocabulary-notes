export const VOCABULARY_STATUSES = ["new", "learning", "mastered"] as const;
export const REVIEW_GRADES = ["again", "good", "easy"] as const;

export type VocabularyStatus = (typeof VOCABULARY_STATUSES)[number];
export type ReviewGrade = (typeof REVIEW_GRADES)[number];

export type Vocabulary = {
  id: string;
  word: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  ipa: string;
  part_of_speech: string;
  tags: string[];
  status: VocabularyStatus;
  created_at: string;
  updated_at: string;
  review_due_at: string;
  last_reviewed_at: string;
  review_count: number;
  ease_level: number;
};

export type VocabularyInput = {
  word: string;
  meaning_vi: string;
  example_en?: string;
  example_vi?: string;
  ipa?: string;
  part_of_speech?: string;
  tags?: string[];
  status?: VocabularyStatus;
};

export type VocabularyFilters = {
  search?: string;
  partOfSpeech?: string;
  status?: VocabularyStatus | "all";
  tag?: string;
  due?: "today";
};
