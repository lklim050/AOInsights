# API Dictionary

This document lists the backend API endpoints, methods, required auth, request bodies, and example responses.

---

**Base URL**: (assumed) `http://<HOST>:<PORT>/` — routers are mounted under their names in `src/routers`.

**Auth / Users**

- **GET /**: `/users`
  - Auth: `authAdmin`
  - Description: Get all users (admin only)
  - Response: 200 JSON array of users [{ uuid, email, name, role }]

- **PUT /register**: `/users/register`
  - Auth: none
  - Body: { email, name, password, role? }
  - Response: { status: "ok", msg: "user created" }

- **POST /login**: `/users/login`
  - Auth: none
  - Body: { email, password }
  - Response: { access, refresh, uuid, email, role }

- **POST /refresh**: `/users/refresh`
  - Auth: none (requires refresh token in body)
  - Body: { refresh }
  - Response: { access }

- **POST /logout**: `/users/logout`
  - Auth: none (clears cookie)
  - Response: { status: "ok", msg: "logged out successfully" }

Note: There is also a reference auth router at `ref/auth` with analogous endpoints mounted under its base path (e.g., `/ref/auth/users`, `/ref/auth/register`, `/ref/auth/login`, `/ref/auth/refresh`).

**Seed**

- **PUT /**: `/seed`
  - Auth: `authAdmin`
  - Description: Wipe & populate the database with seed data
  - Response: { status: "ok", msg: "Database seeded successfully" }

**Surveys**

- **GET /test**: `/surveys/test`
  - Auth: none
  - Description: Returns all surveys (internal/test)
  - Response: 200 array of survey objects

- **GET /**: `/surveys`
  - Auth: `auth`
  - Description: Get surveys created by authenticated user
  - Response: { status: "ok", user, surveys }

- **GET /public**: `/surveys/public`
  - Auth: `auth`
  - Description: Get published surveys (summary fields)
  - Response: { status: "ok", count, surveys }

- **PUT /**: `/surveys`
  - Auth: `authHost` (host role required)
  - Body: { title, points_reward?, is_published? }
  - Response: { status: "ok", msg: "survey created successfully", survey }

- **PATCH /:surveyId**: `/surveys/:surveyId`
  - Auth: `authHost`
  - Body: { title?, points_reward?, is_published? }
  - Description: Host must own survey; prevents duplicate title
  - Response: { status: "ok", message, content }

- **DELETE /:surveyId**: `/surveys/:surveyId`
  - Auth: `authHost`
  - Description: Host must own survey; deletes question children
  - Response: { status: "ok", msg: "entry deleted" }

- **POST /:surveyId**: `/surveys/:surveyId`
  - Auth: `auth`
  - Description: Get a single survey including questions
  - Response: { status: "ok", msg: "entry found", show: survey }

- **GET /:surveyId/results**: `/surveys/:surveyId/results`
  - Auth: `authHost`
  - Description: Returns aggregated results for host-owned survey
  - Response: { status: "ok", survey_title, total_submissions, results }

**Questions**

- **PUT /**: `/questions`
  - Auth: `authHost`
  - Body: { survey_id, question_text, type, options? }
  - Types: `TEXT` (options null), `RADIO`, `CHECKBOX`, `SELECT` (options array)
  - Response: 201 { status: "ok", msg: "Question created successfully", question }

- **GET /survey/:surveyId**: `/questions/survey/:surveyId`
  - Auth: `authHost`
  - Description: Get questions for host's survey
  - Response: { status: "ok", count, questions }

- **PATCH /:questionId**: `/questions/:questionId`
  - Auth: `authHost`
  - Body: { question_text?, type?, options? }
  - Response: { status: "ok", msg: "Question updated successfully", question }

- **DELETE /:questionId**: `/questions/:questionId`
  - Auth: `authHost`
  - Response: { status: "ok", msg: "Question deleted successfully" }

**Responses (Survey submissions)**

- **PUT /submit**: `/responses/submit`
  - Auth: `auth`
  - Body: {
    survey_id: number,
    answers_payload: [ { question_id: number, answer: string | [string] } ]
    }
  - Behavior: Validates published survey; prevents double submission; stores response and increments user points in a transaction
  - Success Response (201):
    { status: "ok", msg: "Survey submitted successfully! Points credited.", reward_points, new_total_balance, response_id }

**Ref: Appointments & Roles**

- **GET /appts/seed**: `/ref/appts/appts/seed`
  - Auth: none
  - Description: Seed example appts (uses legacy Mongo model)

- **GET /appts**: `/ref/appts/appts`
  - Description: Read all appts for `:userId` router param

- **PUT /appts**: `/ref/appts/appts`
  - Body: appt payload (title, type, date, time, ...)

- **POST /appts/:apptId**: `/ref/appts/appts/:apptId`
  - Description: Get single appt by id

- **PATCH /appts/:apptId**: `/ref/appts/appts/:apptId`

- **DELETE /appts/:apptId**: `/ref/appts/appts/:apptId`

- **GET /**: `/ref/roles`
  - Description: Returns list of role strings

**Notes & Examples**

- Survey creation example body:

```json
{
  "title": "City Transit Feedback",
  "points_reward": 50,
  "is_published": false
}
```

- Question creation example body:

```json
{
  "survey_id": 1,
  "question_text": "Which MRT line?",
  "type": "SELECT",
  "options": ["East-West Line", "North-South Line"]
}
```

- Submit survey example payload:

```json
{
  "survey_id": 1,
  "answers_payload": [
    { "question_id": 1, "answer": "East-West Line" },
    { "question_id": 4, "answer": "I prefer earlier trains" },
    { "question_id": 3, "answer": ["Grab Poles", "Priority Seats"] }
  ]
}
```

---

## Authentication Header Examples

Use Bearer tokens for endpoints guarded by `auth`, `authHost`, or `authAdmin`.

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Example cURL (protected endpoint):

```bash
curl -X GET http://localhost:3000/surveys \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

Refresh token flow:

```bash
curl -X POST http://localhost:3000/users/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<REFRESH_TOKEN>"}'
```

## Status Codes and Schemas

### Reusable Schemas

```json
{
  "UserPublic": {
    "uuid": "string",
    "email": "string",
    "name": "string",
    "role": "ADMIN | HOST | USER"
  },
  "Survey": {
    "id": 1,
    "title": "string",
    "points_reward": 0,
    "is_published": false,
    "created_by": "uuid-string"
  },
  "Question": {
    "id": 1,
    "survey_id": 1,
    "question_text": "string",
    "type": "TEXT | RADIO | CHECKBOX | SELECT",
    "options": ["string"]
  },
  "SurveyAnswerItem": {
    "question_id": 1,
    "answer": "string OR string[]"
  },
  "Error": {
    "status": "error",
    "msg": "string"
  }
}
```

### Users (`/users`)

- `GET /users`
  - Auth: `authAdmin`
  - Success: `200` -> `UserPublic[]`
  - Errors: `400` -> `Error`

- `PUT /users/register`
  - Auth: none
  - Body schema:

```json
{
  "email": "string",
  "name": "string (optional)",
  "password": "string",
  "role": "string (optional)"
}
```

- Success: `200` -> `{ "status": "ok", "msg": "user created" }`
- Errors: `400` -> duplicate email / invalid registration

- `POST /users/login`
  - Auth: none
  - Body schema: `{ "email": "string", "password": "string" }`
  - Success: `200`

```json
{
  "access": "jwt-string",
  "refresh": "jwt-string",
  "uuid": "uuid-string",
  "email": "string",
  "role": "ADMIN | HOST | USER"
}
```

- Errors: `401` not authorised, `400` login failed

- `POST /users/refresh`
  - Auth: none
  - Body schema: `{ "refresh": "jwt-string" }`
  - Success: `200` -> `{ "access": "jwt-string" }`
  - Errors: `400` refresh error

- `POST /users/logout`
  - Auth: none
  - Success: `200` -> `{ "status": "ok", "msg": "logged out successfully" }`
  - Errors: `400` logout failed

### Seed (`/seed`)

- `PUT /seed`
  - Auth: `authAdmin`
  - Success: `201` -> `{ "status": "ok", "msg": "Database seeded successfully via endpoint" }`
  - Errors: `500` -> `{ "status": "error", "msg": "Failed to seed database through endpoint", "details": "string" }`

### Surveys (`/surveys`)

- `GET /surveys/test`
  - Auth: none
  - Success: `200` -> `Survey[]`
  - Errors: `500`

- `GET /surveys`
  - Auth: `auth`
  - Success: `200`

```json
{
  "status": "ok",
  "user": "string",
  "surveys": [
    {
      "id": 1,
      "title": "string",
      "points_reward": 0,
      "is_published": false,
      "created_by": "uuid-string"
    }
  ]
}
```

- Errors: `404` user not found, `500`

- `GET /surveys/public`
  - Auth: `auth`
  - Success: `200`

```json
{
  "status": "ok",
  "count": 1,
  "surveys": [
    {
      "id": 1,
      "title": "string",
      "points_reward": 0,
      "creator": { "name": "string" }
    }
  ]
}
```

- Errors: `404` user not found, `500`

- `PUT /surveys`
  - Auth: `authHost`
  - Body schema: `{ "title": "string", "points_reward": "number (optional)", "is_published": "boolean (optional)" }`
  - Success: `200` -> `{ "status": "ok", "msg": "survey created successfully", "survey": Survey }`
  - Errors: `404` user not found, `400` duplicate title, `500`

- `PATCH /surveys/:surveyId`
  - Auth: `authHost`
  - Body schema: `{ "title?": "string", "points_reward?": "number", "is_published?": "boolean" }`
  - Success: `200` -> `{ "status": "ok", "message": "update successfully", "content": Survey }`
  - Errors: `404` user/survey not found, `403` not owner, `400` duplicate title, `500`

- `DELETE /surveys/:surveyId`
  - Auth: `authHost`
  - Success: `200` -> `{ "status": "ok", "msg": "entry deleted" }`
  - Errors: `404` user/survey not found, `403` not owner, `500`

- `POST /surveys/:surveyId`
  - Auth: `auth`
  - Success: `200` -> `{ "status": "ok", "msg": "entry found", "show": Survey + questions[] }`
  - Errors: `404` user/survey not found, `403` unpublished survey blocked for non-host, `500`

- `GET /surveys/:surveyId/results`
  - Auth: `authHost`
  - Success: `200`

```json
{
  "status": "ok",
  "survey_title": "string",
  "total_submissions": 0,
  "results": {
    "<question_id>": {
      "question_text": "string",
      "type": "TEXT | RADIO | CHECKBOX | SELECT",
      "counts": { "option": 0 },
      "total_selections_counted": 0,
      "text_responses": ["string"]
    }
  }
}
```

- Errors: `404` survey not found, `403` not owner, `500`

### Questions (`/questions`)

- `PUT /questions`
  - Auth: `authHost`
  - Body schema:

```json
{
  "survey_id": 1,
  "question_text": "string",
  "type": "TEXT | RADIO | CHECKBOX | SELECT",
  "options": ["string"]
}
```

- Success: `201` -> `{ "status": "ok", "msg": "Question created successfully", "question": Question }`
- Errors: `404` survey not found, `403` not owner, `400` live survey or duplicate question, `500`

- `GET /questions/survey/:surveyId`
  - Auth: `authHost`
  - Success: `200` -> `{ "status": "ok", "count": 0, "questions": Question[] }`
  - Errors: `404` survey not found, `403` not owner, `400` live survey guard, `500`

- `PATCH /questions/:questionId`
  - Auth: `authHost`
  - Body schema: `{ "question_text?": "string", "type?": "enum", "options?": "string[]" }`
  - Success: `200` -> `{ "status": "ok", "msg": "Question updated successfully", "question": Question }`
  - Errors: `404` question/survey not found, `403` not owner, `400` live survey guard, `500`

- `DELETE /questions/:questionId`
  - Auth: `authHost`
  - Success: `200` -> `{ "status": "ok", "msg": "Question deleted successfully" }`
  - Errors: `404` question/survey not found, `403` not owner, `400` live survey guard, `500`

### Responses (`/responses`)

- `PUT /responses/submit`
  - Auth: `auth`
  - Body schema:

```json
{
  "survey_id": 1,
  "answers_payload": [
    { "question_id": 1, "answer": "single string" },
    { "question_id": 2, "answer": ["multi", "select"] }
  ]
}
```

- Success: `201`

```json
{
  "status": "ok",
  "msg": "Survey submitted successfully! Points credited.",
  "reward_points": 0,
  "new_total_balance": 0,
  "response_id": 1
}
```

- Errors: `401` user not logged in, `404` survey not found, `400` unpublished survey or duplicate submission, `500`

### Reference Routers (Legacy)

- `/ref/auth/*`, `/ref/appts/*`, `/ref/roles`
  - These routes use legacy Mongo-based controllers/models and may differ in schema from Prisma-backed routes.
  - Keep them documented as compatibility/reference endpoints.
