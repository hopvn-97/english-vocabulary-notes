# English Vocabulary Notes

A production-ready MVP vocabulary note app built with Next.js App Router, TypeScript, TailwindCSS, shadcn/ui-style components, and Google Sheets as the database.

## Features

- Google Sheet tab `vocabularies` as the source of truth.
- Server-only Google Sheets API access through Next.js route handlers.
- Vocabulary CRUD: add, list, edit, and delete.
- Search by English word.
- Filters for part of speech, status, and tag.
- Flashcard review page.
- Responsive desktop and mobile UI.

## Google Sheet Schema

Create a sheet tab named `vocabularies` with these columns in row 1:

```text
id, word, meaning_vi, example_en, example_vi, ipa, part_of_speech, tags, status, created_at, updated_at
```

The app will also validate and write this header when it can access the tab.

## Google Cloud Service Account Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable the **Google Sheets API** for that project.
4. Go to **IAM & Admin** → **Service Accounts**.
5. Create a service account.
6. Open the service account, go to **Keys**, and create a JSON key.
7. From the downloaded JSON file, copy:
   - `client_email`
   - `private_key`

## Google Sheet Sharing

1. Open the target Google Sheet.
2. Copy the spreadsheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

3. Click **Share**.
4. Share the sheet with the service account `client_email`.
5. Give it **Editor** access so the app can create, update, and delete rows.

## Local Environment

Create `.env.local`:

```bash
GOOGLE_CLIENT_EMAIL=service-account-name@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id
```

Keep the private key quoted. Newlines can stay escaped as `\n`; the app converts them before authenticating.

## Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel Environment Variables

In the Vercel project dashboard, add:

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`

Use the same values as local development. Make sure `GOOGLE_PRIVATE_KEY` includes the full private key.

## Deploy to Vercel

```bash
npm install
npm run build
vercel deploy
```

For production:

```bash
vercel deploy --prod
```

## Folder Structure

```text
app/
  page.tsx
  vocabulary/
    page.tsx
  review/
    page.tsx
  api/
    vocabulary/
      route.ts
    vocabulary/[id]/
      route.ts
components/
  vocabulary-form.tsx
  vocabulary-table.tsx
  flashcard.tsx
  status-badge.tsx
lib/
  google-sheets.ts
  vocabulary.ts
types/
  vocabulary.ts
```

## Notes

- Google credentials are only read inside server route handlers and `lib/google-sheets.ts`.
- No credential value is sent to the browser.
- `status` must be one of `new`, `learning`, or `mastered`.
