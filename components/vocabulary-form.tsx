"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vocabulary, VocabularyInput, VocabularyStatus } from "@/types/vocabulary";

const emptyForm: VocabularyInput = {
  word: "",
  meaning_vi: "",
  example_en: "",
  example_vi: "",
  ipa: "",
  part_of_speech: "",
  tags: [],
  status: "new"
};

type VocabularyFormProps = {
  initialValue?: Vocabulary | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (value: VocabularyInput) => Promise<void>;
};

export function VocabularyForm({ initialValue, isSubmitting = false, onCancel, onSubmit }: VocabularyFormProps) {
  const [form, setForm] = useState<VocabularyInput>(emptyForm);
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    if (initialValue) {
      setForm({
        word: initialValue.word,
        meaning_vi: initialValue.meaning_vi,
        example_en: initialValue.example_en,
        example_vi: initialValue.example_vi,
        ipa: initialValue.ipa,
        part_of_speech: initialValue.part_of_speech,
        tags: initialValue.tags,
        status: initialValue.status
      });
      setTagText(initialValue.tags.join(", "));
      return;
    }

    setForm(emptyForm);
    setTagText("");
  }, [initialValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...form,
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean)
    });

    if (!initialValue) {
      setForm(emptyForm);
      setTagText("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{initialValue ? "Edit vocabulary" : "Add vocabulary"}</h2>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} aria-label="Cancel editing">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Word
          <Input value={form.word} onChange={(event) => setForm({ ...form, word: event.target.value })} placeholder="resilient" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Vietnamese meaning
          <Input value={form.meaning_vi} onChange={(event) => setForm({ ...form, meaning_vi: event.target.value })} placeholder="kiên cường" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          IPA
          <Input value={form.ipa} onChange={(event) => setForm({ ...form, ipa: event.target.value })} placeholder="/rɪˈzɪliənt/" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Part of speech
          <Input value={form.part_of_speech} onChange={(event) => setForm({ ...form, part_of_speech: event.target.value })} placeholder="adjective" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Status
          <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as VocabularyStatus })}>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Tags
          <Input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="ielts, work, speaking" />
        </label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Example in English
          <Textarea value={form.example_en} onChange={(event) => setForm({ ...form, example_en: event.target.value })} placeholder="She stayed resilient during the difficult project." />
        </label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Example in Vietnamese
          <Textarea value={form.example_vi} onChange={(event) => setForm({ ...form, example_vi: event.target.value })} placeholder="Cô ấy vẫn kiên cường trong dự án khó khăn." />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
