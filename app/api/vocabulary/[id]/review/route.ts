import { NextResponse } from "next/server";
import { getVocabularies, updateVocabulary } from "@/lib/google-sheets";
import { applyReviewGrade, isReviewGrade } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { grade?: unknown };

    if (!isReviewGrade(body.grade)) {
      return NextResponse.json({ error: "Review grade must be again, good, or easy." }, { status: 400 });
    }

    const existing = (await getVocabularies()).find((item) => item.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Vocabulary not found." }, { status: 404 });
    }

    const updated = applyReviewGrade(existing, body.grade);
    await updateVocabulary(id, updated);

    return NextResponse.json({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
