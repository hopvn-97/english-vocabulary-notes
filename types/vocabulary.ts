export const VOCABULARY_STATUSES = ["new", "learning", "mastered"] as const;

export type VocabularyStatus = (typeof VOCABULARY_STATUSES)[number];

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
};
