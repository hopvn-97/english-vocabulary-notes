"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { Vocabulary } from "@/types/vocabulary";

export function Flashcard({ vocabulary }: { vocabulary: Vocabulary }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsFlipped((value) => !value)}
      className="min-h-[320px] w-full rounded-lg border bg-card p-6 text-left shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={vocabulary.status} />
          <span className="text-xs font-medium text-muted-foreground">{isFlipped ? "Meaning" : "Prompt"}</span>
        </div>

        {isFlipped ? (
          <div className="space-y-4">
            <p className="text-2xl font-semibold">{vocabulary.meaning_vi}</p>
            {vocabulary.example_vi ? <p className="text-base leading-7 text-muted-foreground">{vocabulary.example_vi}</p> : null}
            {vocabulary.example_en ? <p className="rounded-md bg-muted p-3 text-sm leading-6">{vocabulary.example_en}</p> : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-4xl font-bold tracking-normal">{vocabulary.word}</p>
            {vocabulary.ipa ? <p className="text-lg text-muted-foreground">{vocabulary.ipa}</p> : null}
            {vocabulary.part_of_speech ? <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">{vocabulary.part_of_speech}</p> : null}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{vocabulary.tags.join(", ") || "No tags"}</span>
          <span className="inline-flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Flip
          </span>
        </div>
      </div>
    </button>
  );
}
