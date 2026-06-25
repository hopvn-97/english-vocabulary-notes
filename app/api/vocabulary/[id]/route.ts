import { NextResponse } from "next/server";
import { getVocabularies, updateVocabulary, deleteVocabulary } from "@/lib/google-sheets";
import { mergeVocabulary, validateVocabularyInput } from "@/lib/vocabulary";
import type { VocabularyInput } from "@/types/vocabulary";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message }, { status });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as VocabularyInput;
    const errors = validateVocabularyInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    }

    const existing = (await getVocabularies()).find((item) => item.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Vocabulary not found." }, { status: 404 });
    }

    const updated = mergeVocabulary(existing, body);
    await updateVocabulary(id, updated);

    return NextResponse.json({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteVocabulary(id);

    if (!deleted) {
      return NextResponse.json({ error: "Vocabulary not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
