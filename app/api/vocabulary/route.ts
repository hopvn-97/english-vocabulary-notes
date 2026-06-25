import { NextResponse } from "next/server";
import { appendVocabulary, getVocabularies } from "@/lib/google-sheets";
import { buildVocabulary, filterVocabulary, findDuplicateVocabulary, validateVocabularyInput } from "@/lib/vocabulary";
import type { VocabularyFilters, VocabularyInput, VocabularyStatus } from "@/types/vocabulary";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: VocabularyFilters = {
      search: searchParams.get("search") ?? undefined,
      partOfSpeech: searchParams.get("part_of_speech") ?? undefined,
      status: (searchParams.get("status") as VocabularyStatus | "all" | null) ?? undefined,
      tag: searchParams.get("tag") ?? undefined
    };

    const vocabularies = await getVocabularies();
    return NextResponse.json({ data: filterVocabulary(vocabularies, filters) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VocabularyInput;
    const errors = validateVocabularyInput(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    }

    const vocabularies = await getVocabularies();
    const duplicate = findDuplicateVocabulary(vocabularies, body.word);

    if (duplicate) {
      return NextResponse.json(
        {
          error: `The word "${duplicate.word}" already exists.`,
          errors: { word: "This word already exists." }
        },
        { status: 409 }
      );
    }

    const vocabulary = buildVocabulary(body);
    await appendVocabulary(vocabulary);

    return NextResponse.json({ data: vocabulary }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
