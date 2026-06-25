"use client";

import { BookOpen, CheckCircle2, Clock3, Sparkles, Tags } from "lucide-react";
import type { Vocabulary } from "@/types/vocabulary";

type VocabularyStatsProps = {
  items: Vocabulary[];
};

export function VocabularyStats({ items }: VocabularyStatsProps) {
  const statusCounts = items.reduce(
    (counts, item) => {
      counts[item.status] += 1;
      return counts;
    },
    { new: 0, learning: 0, mastered: 0 }
  );

  const topTags = Object.entries(
    items.reduce<Record<string, number>>((counts, item) => {
      item.tags.forEach((tag) => {
        counts[tag] = (counts[tag] ?? 0) + 1;
      });
      return counts;
    }, {})
  )
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 5);

  const stats = [
    { label: "Total", value: items.length, icon: BookOpen, className: "text-primary" },
    { label: "New", value: statusCounts.new, icon: Sparkles, className: "text-sky-700" },
    { label: "Learning", value: statusCounts.learning, icon: Clock3, className: "text-amber-700" },
    { label: "Mastered", value: statusCounts.mastered, icon: CheckCircle2, className: "text-emerald-700" }
  ];

  return (
    <section className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <Icon className={`h-4 w-4 ${stat.className}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-normal">{stat.value}</p>
          </div>
        );
      })}

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">Top tags</span>
          <Tags className="h-4 w-4 text-accent" />
        </div>
        <div className="mt-3 flex min-h-9 flex-wrap gap-2">
          {topTags.length ? (
            topTags.map(([tag, count]) => (
              <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {tag} · {count}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No tags yet</span>
          )}
        </div>
      </div>
    </section>
  );
}
