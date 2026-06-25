"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VocabularyInput } from "@/types/vocabulary";

type QuickAddVocabularyProps = {
  isSubmitting?: boolean;
  onSubmit: (value: VocabularyInput) => Promise<boolean | void>;
};

export function QuickAddVocabulary({ isSubmitting = false, onSubmit }: QuickAddVocabularyProps) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({
      word,
      meaning_vi: meaning,
      status: "new"
    });

    if (saved !== false) {
      setWord("");
      setMeaning("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="grid gap-2 text-sm font-medium">
        Quick word
        <Input value={word} onChange={(event) => setWord(event.target.value)} placeholder="mitigate" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Meaning VI
        <Input value={meaning} onChange={(event) => setMeaning(event.target.value)} placeholder="giảm thiểu" required />
      </label>
      <Button type="submit" disabled={isSubmitting} className="md:w-32">
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  );
}
