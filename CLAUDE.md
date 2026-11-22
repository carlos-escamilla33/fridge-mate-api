# FridgeMate API

Express 5 + Postgres (`pg`) backend for the FridgeMate Expo app (sibling repo: `../fridge-mate-app`).
Personal project for one household; not a public product. Favor simple, working code over abstraction.

## Layout
- `server.js` → `app.js` (dotenv, json, morgan, cors) → `src/api.js` mounts routers under `/api`:
  - `/api/auth` (register, login, refresh, forgot/reset/change password)
  - `/api/accounts` (register-profile, me)
  - `/api/profiles` (CRUD on household profiles)
  - `/api/items` (CRUD on fridge items)
- Pattern: `src/routes/*` → `src/controllers/*` → `src/database/models/*` (raw SQL via `pool.query`).
- Auth: `authenticateToken` middleware sets `req.user = { id: account_id, email }`. `req.user.id` is the **account** id, not a profile id.
- Validation: Joi (see `itemsController.js`).
- Schema: `src/database/schema.sql`. Tables: account, profile, item, recipe, notification, activity_log.

## Data shapes
- Profile row: `{ profile_id, account_id, first_name, notifications_enabled, created_at }` (no last_name; it was removed).
- Item row: `{ item_id, account_id, profile_id, food_name, expiration_date (date), ripeness_level (varchar 30), recipe_id, created_at, updated_at }`.
- Item create body (camelCase): `{ profileId, recipeId?, foodName, expirationDate: "YYYY-MM-DD", ripenessLevel }`.

## Conventions
- Errors to the client: `res.status(4xx).json({ message })`. The app's `callApi` shows `message` to the user; avoid bare `res.sendStatus(400)`.
- Secrets live in `.env` (gitignored). `CLAUDE_API_KEY` (Anthropic API key) is set there. Never log it or return it.

## Known issues (not yet fixed)
- `updateProfileName` has an empty `catch`.
- Login issues 30-day access tokens (marked "CHANGE THIS BACK").
- Tests in `tests/` still reference `last_name`.

## In-progress feature
AI photo scanning: `POST /api/items/scan` (src/services/foodScanner.js) and `POST /api/items/bulk`. Spec: `docs/ai-scan-plan.md`.
