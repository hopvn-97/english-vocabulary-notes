"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Flashcard } from "@/components/flashcard";
import { VOCABULARY_STATUSES, type Vocabulary, type VocabularyStatus } from "@/types/vocabulary";

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

export default function ReviewPage() {
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("learning");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);

      const response = await fetch(`/api/vocabulary?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load review cards.");
      }

      setItems(payload.data);
      setIndex(0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load review cards.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const current = items[index];

  function shuffleCurrentCards() {
    setItems((value) => shuffleCards(value));
    setIndex(0);
  }

  async function updateCurrentStatus(nextStatus: VocabularyStatus) {
    if (!current || current.status === nextStatus) return;

    setIsUpdatingStatus(true);
    setError("");

    try {
      const response = await fetch(`/api/vocabulary/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: current.word,
          meaning_vi: current.meaning_vi,
          example_en: current.example_en,
          example_vi: current.example_vi,
          ipa: current.ipa,
          part_of_speech: current.part_of_speech,
          tags: current.tags,
          status: nextStatus
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update status.");
      }

      setItems((value) => {
        const updatedItems = value.map((item) => (item.id === current.id ? payload.data : item));
        const filteredItems = status === "all" || nextStatus === status ? updatedItems : updatedItems.filter((item) => item.id !== current.id);

        setIndex((currentIndex) => Math.min(currentIndex, Math.max(0, filteredItems.length - 1)));
        return filteredItems;
      });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Flashcard review</h1>
          <p className="mt-2 text-sm text-muted-foreground">Click the card to flip between prompt and meaning.</p>
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
          Review status
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
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
            <span className="text-sm font-medium text-muted-foreground">Mark as</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {VOCABULARY_STATUSES.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  variant={current.status === nextStatus ? "default" : "outline"}
                  onClick={() => void updateCurrentStatus(nextStatus)}
                  disabled={isUpdatingStatus}
                  className="capitalize"
                >
                  {nextStatus}
                </Button>
              ))}
            </div>
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
