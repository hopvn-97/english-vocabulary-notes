"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Flashcard } from "@/components/flashcard";
import type { ReviewGrade, Vocabulary, VocabularyStatus } from "@/types/vocabulary";

type ReviewDeckMode = "due" | VocabularyStatus | "all";

const reviewGradeMeta: Record<ReviewGrade, { label: string; helper: string; variant: "default" | "secondary" | "outline" }> = {
  again: {
    label: "Again",
    helper: "Review soon",
    variant: "outline"
  },
  good: {
    label: "Good",
    helper: "Schedule later",
    variant: "default"
  },
  easy: {
    label: "Easy",
    helper: "Longer gap",
    variant: "secondary"
  }
};

function shuffleCards(cards: Vocabulary[]) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled;
}

function getDueTime(vocabulary: Vocabulary) {
  const dueTime = new Date(vocabulary.review_due_at).getTime();
  return Number.isFinite(dueTime) ? dueTime : 0;
}

function sortReviewCards(cards: Vocabulary[]) {
  return [...cards].sort((first, second) => getDueTime(first) - getDueTime(second));
}

function isVocabularyDue(vocabulary: Vocabulary) {
  const dueTime = getDueTime(vocabulary);
  return dueTime === 0 || dueTime <= Date.now();
}

function formatDueDate(value: string) {
  if (!value) {
    return "Now";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Now";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function ReviewPage() {
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [deckMode, setDeckMode] = useState<ReviewDeckMode>("due");
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState("");

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (deckMode === "due") {
        params.set("due", "today");
      } else if (deckMode !== "all") {
        params.set("status", deckMode);
      }

      const response = await fetch(`/api/vocabulary?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load review cards.");
      }

      setItems(sortReviewCards(payload.data));
      setIndex(0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load review cards.");
    } finally {
      setIsLoading(false);
    }
  }, [deckMode]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const current = items[index];

  function shuffleCurrentCards() {
    setItems((value) => shuffleCards(value));
    setIndex(0);
  }

  async function submitReview(grade: ReviewGrade) {
    if (!current) return;

    setIsReviewing(true);
    setError("");

    try {
      const response = await fetch(`/api/vocabulary/${current.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save review.");
      }

      setItems((value) => {
        const updated = payload.data as Vocabulary;
        const remainingItems = value.filter((item) => item.id !== current.id);
        const shouldKeepCard =
          deckMode === "all" ||
          (deckMode === "due" && isVocabularyDue(updated)) ||
          (deckMode !== "due" && updated.status === deckMode);
        const nextItems = shouldKeepCard ? sortReviewCards([...remainingItems, updated]) : remainingItems;

        setIndex((currentIndex) => Math.min(currentIndex, Math.max(0, nextItems.length - 1)));
        return nextItems;
      });
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Failed to save review.");
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Flashcard review</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review due cards, then choose Again, Good, or Easy to schedule the next session.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/vocabulary">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm font-medium sm:w-56">
          Review deck
          <Select value={deckMode} onChange={(event) => setDeckMode(event.target.value as ReviewDeckMode)}>
            <option value="due">Due today</option>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
          </Select>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shuffleCurrentCards} disabled={isLoading || items.length < 2}>
            <Shuffle className="h-4 w-4" />
            Shuffle
          </Button>
          <Button variant="outline" onClick={() => void loadCards()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">Loading cards...</div>
      ) : current ? (
        <>
          <Flashcard key={current.id} vocabulary={current} />
          <div className="grid gap-2 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[auto_1fr] sm:items-center">
            <span className="text-sm font-medium text-muted-foreground">Schedule</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["again", "good", "easy"] as ReviewGrade[]).map((grade) => (
                <Button
                  key={grade}
                  variant={reviewGradeMeta[grade].variant}
                  onClick={() => void submitReview(grade)}
                  disabled={isReviewing}
                  className="h-auto flex-col gap-1 py-3"
                >
                  <span>{reviewGradeMeta[grade].label}</span>
                  <span className="text-xs font-normal opacity-80">{reviewGradeMeta[grade].helper}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm sm:grid-cols-3">
            <span>Reviews: {current.review_count}</span>
            <span>Ease: {current.ease_level}</span>
            <span>Due: {formatDueDate(current.review_due_at)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {index + 1} / {items.length}
            </span>
            <Button onClick={() => setIndex((value) => Math.min(items.length - 1, value + 1))} disabled={index === items.length - 1}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">No cards available for this status.</div>
      )}
    </div>
  );
}
