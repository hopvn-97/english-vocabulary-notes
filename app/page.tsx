import Link from "next/link";
import { BookOpen, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <section className="space-y-5 py-8 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">English workspace</p>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">
            Vocabulary notes that stay synced with Google Sheets.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Add words, examples, IPA, tags, and learning status from a responsive app while Google Sheets remains the source of truth.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/vocabulary">
              <BookOpen className="h-4 w-4" />
              Open vocabulary
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/review">
              <Layers3 className="h-4 w-4" />
              Start review
            </Link>
          </Button>
        </div>
      </section>
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-3">
          {["Add a new expression", "Filter by status and tags", "Flip flashcards for recall"].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-md border bg-background p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
