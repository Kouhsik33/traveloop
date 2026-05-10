# Traveloop Backend

Node.js + Express + TypeScript + Prisma backend for Traveloop.

The API exposes `GET /health` and versioned routes under `/api/v1`.

## Stack

- Runtime: Node.js 20+
- API: Express + TypeScript
- Database: PostgreSQL via Prisma
- Auth: JWT stored in an HttpOnly cookie named `token`
- Validation: Zod
- Testing: Jest + Supertest
- Logging: Winston + Morgan

## Environment

Copy `.env.example` to `.env` and fill the values.

```powershell
cp .env.example .env
```

For Neon, `DATABASE_URL` should use SSL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

Required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="minimum-32-character-random-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"
```

Optional or feature-specific variables:

```env
GEMINI_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="..."
```

Do not commit `.env`. It is already ignored by `.gitignore`.

## Local Setup

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Development server:

```powershell
npm run dev
```

Production-style local run:

```powershell
npm run build
npm start
```

## Prisma

Development migration:

```powershell
npm run prisma:migrate
```

Production migration:

```powershell
npm run prisma:deploy
```

Seed data:

```powershell
npm run prisma:seed
```

Current seed data contains starter cities and activities for local testing. The playbook target is larger: 50+ cities and 200+ activities.

## Testing

Build check:

```powershell
npm run build
```

Automated API contract tests:

```powershell
npm test
```

Run tests serially if you want cleaner output:

```powershell
npm test -- --runInBand
```

Manual API testing:

1. Install the VS Code REST Client extension.
2. Start the backend with `npm run dev`.
3. Open `api-tests.http`.
4. Run requests from top to bottom.

Before manual API testing against Neon:

```powershell
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The manual file creates a user, logs in, stores the auth cookie in the REST Client session, then tests protected routes.

## Auth And Cookies

- JWT is stored in an HttpOnly cookie named `token`.
- Local development cookie uses `SameSite=Lax`.
- Production cookie uses `SameSite=None; Secure`.
- Frontend requests must include credentials.

Frontend example:

```ts
fetch(`${API_URL}/api/v1/auth/me`, {
  credentials: 'include'
});
```

CORS is configured with:

```ts
origin: process.env.FRONTEND_URL
credentials: true
```

State-changing requests are protected by an origin guard. Requests such as `POST`, `PUT`, and `DELETE` must come from `FRONTEND_URL`.

## API Response Format

Single resource:

```json
{
  "data": {},
  "meta": null
}
```

List resource:

```json
{
  "data": [],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

Error:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": null
}
```

Deletes return `204 No Content`.

## API Catalog

Base URL:

```text
http://localhost:3000/api/v1
```

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Create user and set auth cookie |
| `POST` | `/api/v1/auth/login` | No | Login and set auth cookie |
| `POST` | `/api/v1/auth/logout` | Yes | Clear auth cookie |
| `GET` | `/api/v1/auth/me` | Yes | Return current user |
| `POST` | `/api/v1/auth/forgot-password` | No | Generate password reset OTP |
| `POST` | `/api/v1/auth/reset-password` | No | Reset password with OTP |

Register body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "Test User",
  "travelerProfile": "solo"
}
```

Login body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Reset password body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### Cities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cities` | No | List/search cities |
| `GET` | `/api/v1/cities/:id` | No | Get city with activities |

Query params:

```text
q, country, region, costIndex, page, limit
```

Example:

```text
GET /api/v1/cities?q=delhi&page=1&limit=20
```

### Activities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/activities` | No | List/search activities |
| `GET` | `/api/v1/activities/:id` | No | Get activity detail |
| `POST` | `/api/v1/trips/:id/stops/:stopId/activities` | Yes | Assign activity to stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId/activities/:saId` | Yes | Remove activity from stop |

Activity query params:

```text
cityId, category, maxCost, tripType, q, page, limit
```

Assign activity body:

```json
{
  "activityId": "uuid",
  "scheduledTime": "14:30",
  "actualCostUsd": 25
}
```

Only `activityId` is required.

### Trips

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips` | Yes | List owned trips |
| `POST` | `/api/v1/trips` | Yes | Create trip |
| `GET` | `/api/v1/trips/:id` | Yes | Get owned trip detail |
| `PUT` | `/api/v1/trips/:id` | Yes | Update owned trip |
| `DELETE` | `/api/v1/trips/:id` | Yes | Soft delete owned trip |
| `PUT` | `/api/v1/trips/:id/publish` | Yes | Publish/unpublish trip |
| `GET` | `/api/v1/trips/:id/budget` | Yes | Get budget summary |

Trip list query params:

```text
status, sort, search, page, limit
```

Create trip body:

```json
{
  "title": "Rajasthan Loop",
  "description": "Optional description",
  "coverPhotoUrl": "https://example.com/photo.jpg",
  "startDate": "2026-06-01",
  "endDate": "2026-06-05",
  "tripType": "solo",
  "budgetCapUsd": 500,
  "vibe": "comfort"
}
```

Required fields:

```text
title, startDate, endDate, tripType
```

Publish body:

```json
{
  "isPublic": true
}
```

### Stops

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips/:id/stops` | Yes | List stops for a trip |
| `POST` | `/api/v1/trips/:id/stops` | Yes | Add stop |
| `PUT` | `/api/v1/trips/:id/stops/:stopId` | Yes | Update stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId` | Yes | Delete stop |
| `PUT` | `/api/v1/trips/:id/stops/reorder` | Yes | Reorder stops |

Create stop body:

```json
{
  "cityId": "uuid",
  "orderIndex": 0,
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-03",
  "notes": "Optional notes",
  "accommodationName": "Hotel name",
  "accommodationCost": 120
}
```

Required fields:

```text
cityId, orderIndex, arrivalDate, departureDate
```

Reorder body:

```json
{
  "stopOrders": [
    {
      "id": "uuid",
      "orderIndex": 0
    }
  ]
}
```

### Public

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/trips/:slug` | No | Get public trip |

## Implemented Status

Implemented:

- Auth
- Trips
- Stops
- Cities
- Activities
- Public trip sharing
- Budget aggregation
- Cookie auth and origin guard
- Jest/Supertest route contract tests
- Manual `.http` API test file

Pending from the implementation playbook:

- AI module
- Media/Cloudinary signature module
- Notes module
- Packing module
- OpenAPI/Swagger docs at `/api/v1/docs`
- Full real-database integration tests for every `400/401/403/404` path
- Larger seed data target: 50+ cities and 200+ activities
- Health response with DB status and uptime

## Production Notes

- Use Neon or another hosted PostgreSQL database; do not use `localhost` in production.
- Keep `sslmode=require` in the Neon database URL.
- Run production migrations with `npm run prisma:deploy`.
- Use HTTPS in production so secure cookies work.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Rotate secrets if they were shared publicly or committed accidentally.
