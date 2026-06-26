"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { QuickAddVocabulary } from "@/components/quick-add-vocabulary";
import { VocabularyStats } from "@/components/vocabulary-stats";
import { VocabularyForm } from "@/components/vocabulary-form";
import { VocabularyTable } from "@/components/vocabulary-table";
import type { Vocabulary, VocabularyInput } from "@/types/vocabulary";

export default function VocabularyPage() {
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [allItems, setAllItems] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Vocabulary | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    part_of_speech: "",
    status: "all",
    tag: ""
  });

  const partsOfSpeech = useMemo(() => Array.from(new Set(allItems.map((item) => item.part_of_speech).filter(Boolean))).sort(), [allItems]);
  const tags = useMemo(() => Array.from(new Set(allItems.flatMap((item) => item.tags))).sort(), [allItems]);
  const hasActiveFilters = Boolean(filters.search.trim() || filters.part_of_speech || filters.tag || filters.status !== "all");
  const tableItems = useMemo(() => {
    if (hasActiveFilters) {
      return items;
    }

    return [...allItems]
      .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
      .slice(0, 3);
  }, [allItems, hasActiveFilters, items]);

  const loadVocabulary = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
      });

      const [response, allResponse] = await Promise.all([
        fetch(`/api/vocabulary?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/vocabulary", { cache: "no-store" })
      ]);
      const payload = await response.json();
      const allPayload = await allResponse.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load vocabulary.");
      }

      if (!allResponse.ok) {
        throw new Error(allPayload.error ?? "Failed to load vocabulary stats.");
      }

      setItems(payload.data);
      setAllItems(allPayload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load vocabulary.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadVocabulary();
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [loadVocabulary]);

  async function saveVocabulary(value: VocabularyInput) {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(editing ? `/api/vocabulary/${editing.id}` : "/api/vocabulary", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save vocabulary.");
      }

      setEditing(null);
      setShowForm(true);
      await loadVocabulary();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save vocabulary.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteItem(item: Vocabulary) {
    const confirmed = window.confirm(`Delete "${item.word}"?`);
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/vocabulary/${item.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete vocabulary.");
      }

      await loadVocabulary();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete vocabulary.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Vocabulary</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage words stored in the Google Sheet tab named vocabularies.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadVocabulary()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => { setEditing(null); setShowForm((value) => !value); }}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <section className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr]">
        <label className="relative grid gap-2 text-sm font-medium">
          Search
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search word, meaning, example, tag" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Part of speech
          <Select value={filters.part_of_speech} onChange={(event) => setFilters({ ...filters, part_of_speech: event.target.value })}>
            <option value="">All</option>
            {partsOfSpeech.map((part) => <option key={part} value={part}>{part}</option>)}
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Status
          <Select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Tag
          <Select value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })}>
            <option value="">All</option>
            {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </Select>
        </label>
      </section>

      <VocabularyTable items={tableItems} isLoading={isLoading} onEdit={setEditing} onDelete={deleteItem} />

      <QuickAddVocabulary isSubmitting={isSubmitting} onSubmit={saveVocabulary} />

      {showForm || editing ? (
        <VocabularyForm
          initialValue={editing}
          isSubmitting={isSubmitting}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={saveVocabulary}
        />
      ) : null}

      <VocabularyStats items={allItems} />
    </div>
  );
}
