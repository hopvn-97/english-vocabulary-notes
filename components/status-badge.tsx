import { cn } from "@/lib/utils";
import type { VocabularyStatus } from "@/types/vocabulary";

const statusClassName: Record<VocabularyStatus, string> = {
  new: "bg-sky-100 text-sky-800 border-sky-200",
  learning: "bg-amber-100 text-amber-900 border-amber-200",
  mastered: "bg-emerald-100 text-emerald-800 border-emerald-200"
};

export function StatusBadge({ status }: { status: VocabularyStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold capitalize", statusClassName[status])}>
      {status}
    </span>
  );
}
