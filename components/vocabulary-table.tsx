"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { Vocabulary } from "@/types/vocabulary";

type VocabularyTableProps = {
  items: Vocabulary[];
  isLoading?: boolean;
  onEdit: (item: Vocabulary) => void;
  onDelete: (item: Vocabulary) => void;
};

export function VocabularyTable({ items, isLoading = false, onEdit, onDelete }: VocabularyTableProps) {
  if (isLoading) {
    return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading vocabulary...</div>;
  }

  if (items.length === 0) {
    return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No vocabulary matched the current filters.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Word</th>
              <th className="px-4 py-3">Meaning</th>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="font-semibold">{item.word}</div>
                  {item.ipa ? <div className="text-xs text-muted-foreground">{item.ipa}</div> : null}
                  {item.example_en ? <div className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{item.example_en}</div> : null}
                </td>
                <td className="px-4 py-4">{item.meaning_vi}</td>
                <td className="px-4 py-4">{item.part_of_speech || "-"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.length ? item.tags.map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs">{tag}</span>) : "-"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(item)} aria-label={`Edit ${item.word}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(item)} aria-label={`Delete ${item.word}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {items.map((item) => (
          <article key={item.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.word}</h3>
                {item.ipa ? <p className="text-xs text-muted-foreground">{item.ipa}</p> : null}
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-sm">{item.meaning_vi}</p>
            {item.example_en ? <p className="text-sm leading-6 text-muted-foreground">{item.example_en}</p> : null}
            <div className="flex flex-wrap gap-1">
              {item.part_of_speech ? <span className="rounded-md bg-muted px-2 py-1 text-xs">{item.part_of_speech}</span> : null}
              {item.tags.map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs">{tag}</span>)}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
