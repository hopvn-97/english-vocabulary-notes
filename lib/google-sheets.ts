import { google } from "googleapis";
import { VOCABULARY_COLUMNS, rowToVocabulary, vocabularyToRow } from "@/lib/vocabulary";
import type { Vocabulary } from "@/types/vocabulary";

const SHEET_NAME = "vocabularies";
const DATA_RANGE = `${SHEET_NAME}!A:O`;
const HEADER_RANGE = `${SHEET_NAME}!A1:O1`;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPrivateKey() {
  return requiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: requiredEnv("GOOGLE_CLIENT_EMAIL"),
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

export async function ensureVocabularyHeader() {
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: HEADER_RANGE
  });

  const header = response.data.values?.[0] ?? [];

  if (VOCABULARY_COLUMNS.some((column, index) => header[index] !== column)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: HEADER_RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [Array.from(VOCABULARY_COLUMNS)]
      }
    });
  }
}

export async function getVocabularies(): Promise<Vocabulary[]> {
  await ensureVocabularyHeader();
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: requiredEnv("GOOGLE_SHEET_ID"),
    range: DATA_RANGE
  });

  const rows = response.data.values ?? [];
  return rows.slice(1).filter((row) => row[0]).map((row) => rowToVocabulary(row as string[]));
}

export async function appendVocabulary(vocabulary: Vocabulary) {
  await ensureVocabularyHeader();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: requiredEnv("GOOGLE_SHEET_ID"),
    range: DATA_RANGE,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [vocabularyToRow(vocabulary)]
    }
  });

  return vocabulary;
}

export async function updateVocabulary(id: string, vocabulary: Vocabulary) {
  const rows = await getVocabularies();
  const index = rows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const rowNumber = index + 2;
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: requiredEnv("GOOGLE_SHEET_ID"),
    range: `${SHEET_NAME}!A${rowNumber}:O${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [vocabularyToRow(vocabulary)]
    }
  });

  return vocabulary;
}

export async function deleteVocabulary(id: string) {
  const rows = await getVocabularies();
  const index = rows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  const rowIndex = index + 1;
  const sheets = getSheetsClient();
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === SHEET_NAME);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    throw new Error(`Sheet tab "${SHEET_NAME}" was not found.`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }
      ]
    }
  });

  return true;
}
