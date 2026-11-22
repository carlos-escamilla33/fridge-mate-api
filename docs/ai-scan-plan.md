# AI Food Scanning: Backend Spec

Goal: the user photographs groceries / the inside of the fridge, Claude identifies the food items,
the user reviews and edits the list in the app, then saves them all at once.

**Before writing any Claude API code, load the `claude-api` skill** and follow it for the SDK,
model, structured output and error-handling details. Don't write SDK calls from memory.

## Flow
1. App resizes the photo (longest side ~1568px, JPEG ~0.7) and sends it base64 to `POST /api/items/scan`.
2. Backend sends the image to Claude, gets back a structured list of detected items, returns it. **Nothing is saved.**
3. App shows a review screen; user edits/removes/adds.
4. App sends the confirmed list to `POST /api/items/bulk`, which saves them in one transaction.

## 1. `POST /api/items/scan`
- Auth: `authenticateToken`.
- Body: `{ image: "<base64, no data: prefix>", mediaType: "image/jpeg" | "image/png" | "image/webp" }`.
- Body size: the global `express.json()` limit is 100kb, which is too small. Give this route its own
  parser, e.g. `express.json({ limit: "10mb" })`, mounted before the handler.
- Validate with Joi: image required, mediaType in the allowed list.
- Claude call:
  - SDK: `@anthropic-ai/sdk` (add it to dependencies). Key comes from `ANTHROPIC_API_KEY` in `.env`.
  - Model: `claude-opus-5-5`, effort `low` (simple recognition task; keeps it fast and cheap). Include the server-side refusal fallback the skill recommends for this model.
  - Use structured outputs (JSON schema) so the response is always parseable. Schema:
    ```
    { items: [ {
        foodName: string,             // short, human name: "Whole milk", "Strawberries"
        quantity: integer >= 1,
        estimatedExpirationDate: "YYYY-MM-DD",  // best guess from typical shelf life, counted from today
        ripenessLevel: string,        // short, <= 30 chars: "fresh", "ripe", "overripe", "n/a"
        confidence: "high" | "medium" | "low"
    } ] }
    ```
  - Prompt: pass today's date; ask for only food/drink items actually visible; packaged items use the
    product type, not the brand alone; estimate expiry from typical refrigerated shelf life; empty list if none.
- Response: `200 { items: [...] }`.
- Errors (all JSON `{ message }`):
  - Claude auth error (bad/revoked key) → 503 `"AI scanning is unavailable right now."` and log the real error server-side.
  - Rate limit / overloaded → 503 `"AI scanning is busy, try again in a moment."`
  - Refusal stop reason or unparseable output → 422 `"Couldn't read that photo. Try another angle."`
  - Use the SDK's typed error classes, not string matching.

## 2. `POST /api/items/bulk`
- Auth: `authenticateToken`.
- Body: `{ profileId, items: [ { foodName, expirationDate, ripenessLevel, quantity? } ] }` (1-50 items).
- Validate with Joi, reusing the rules from `itemSchema` in `itemsController.js`.
- Verify `profileId` belongs to `req.user.id` (403 otherwise).
- Insert all in one transaction (see `createAccount` in `accountModel.js` for the BEGIN/COMMIT/ROLLBACK pattern).
  There's no quantity column: insert `quantity` copies of the row, or add a `quantity` column. Ask the user which.
- Response: `201 { message, items: [...] }`.

## Route order
In `itemsRouter.js`, register `/scan` and `/bulk` **before** `/:id` so they aren't caught by it.

## Done when
- Both routes work end-to-end with a real fridge photo (test with curl + a JWT from `/api/auth/login`).
- A bad API key gives the 503 message, not a crash.
- No API key or image data shows up in logs.

## App side (separate repo, after the backend is done)
`expo-image-picker` + `expo-image-manipulator`, a Scan button, a review screen, and calling `/bulk`.
