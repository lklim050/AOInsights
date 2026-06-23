# API Dictionary

This document lists the active backend API endpoints, methods, auth requirements, request bodies, and example responses for the Prisma-backed backend.

---

**Base URL**: `http://<HOST>:<PORT>/`

Mounted routers in `backend-p4/server.js`:

- `/users`
- `/seed`
- `/surveys`
- `/questions`
- `/responses`

## Common Schemas

```json
{
  "UserPublic": {
    "uuid": "string",
    "email": "string",
    "name": "string",
    "role": "HOST | USER | ADMIN",
    "points_bal": 0
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
    "type": "RADIO | CHECKBOX | SELECT | TEXT",
    "options": ["string"]
  },
  "SurveyAnswerItem": {
    "question_id": 1,
    "answer": "string | string[]"
  },
  "SurveyInsight": {
    "id": 1,
    "survey_id": 1,
    "summary": "string",
    "submission_count": 0,
    "createdAt": "ISO-8601 string"
  },
  "Error": {
    "status": "error",
    "msg": "string"
  }
}
```

## Authentication

Use a Bearer token for endpoints guarded by `auth`, `authHost`, or `authAdmin`.

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

## Users

- `GET /users`
  - Auth: `authAdmin`
  - Description: Returns all users for admin use.
  - Response: `200` array of user records with `uuid`, `email`, `name`, `role`, and `points_bal`.

- `PUT /users/register`
  - Auth: none
  - Body:

```json
{
  "email": "string",
  "name": "string",
  "password": "string",
  "role": "HOST | USER | ADMIN"
}
```

- Response: `200` -> `{ "status": "ok", "msg": "user created" }`
- Errors: `400` duplicate email or invalid registration.

- `POST /users/login`
  - Auth: none
  - Body:

```json
{
  "email": "string",
  "password": "string"
}
```

- Response: `200`

```json
{
  "access": "jwt-string",
  "refresh": "jwt-string",
  "uuid": "uuid-string",
  "email": "string",
  "name": "string",
  "role": "HOST | USER | ADMIN",
  "points_bal": 0
}
```

- Errors: `401` not authorised, `400` login failed.

- `POST /users/refresh`
  - Auth: none
  - Body:

```json
{
  "refresh": "jwt-string"
}
```

- Response: `200` -> `{ "access": "jwt-string" }`
- Errors: `400` refresh error.

- `POST /users/logout`
  - Auth: none
  - Response: `200` -> `{ "status": "ok", "msg": "logged out successfully" }`
  - Errors: `400` logout failed.

## Seed

- `PUT /seed`
  - Auth: `authAdmin`
  - Description: Truncates and reseeds users, surveys, questions, and responses.
  - Response: `200` -> `{ "status": "ok", "msg": "Database seeded dynamically with correct local hashes!" }`
  - Errors: `500` -> `{ "status": "error", "msg": "Fail to execute dynamic seed", "details": "string" }`

## Surveys

- `GET /surveys/admin`
  - Auth: `authAdmin`
  - Description: Returns all surveys with creator details for admin use.
  - Response: `200`

```json
{
  "status": "ok",
  "msg": "all surveys fetched successfully",
  "surveys": [
    {
      "id": 1,
      "title": "string",
      "points_reward": 0,
      "is_published": false,
      "created_by": "uuid-string",
      "creator": {
        "uuid": "uuid-string",
        "name": "string",
        "email": "string",
        "role": "HOST | USER | ADMIN"
      }
    }
  ]
}
```

- `GET /surveys`
  - Auth: `auth`
  - Description: Returns surveys created by the authenticated user.
  - Response: `200`

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

- Errors: `404` user not found, `500` failed to fetch surveys.

- `GET /surveys/public`
  - Auth: `auth`
  - Description: Returns all published surveys with host name and per-user attempt status.
  - Response: `200`

```json
{
  "status": "ok",
  "count": 1,
  "surveys": [
    {
      "id": 1,
      "title": "string",
      "points_reward": 0,
      "creator": { "name": "string" },
      "responses": [],
      "isAttempted": false
    }
  ]
}
```

- Errors: `404` user not found, `500` failed to fetch published surveys.

- `PUT /surveys`
  - Auth: `authHost`
  - Body:

```json
{
  "title": "string",
  "points_reward": 50,
  "is_published": false
}
```

- Response: `200` -> `{ "status": "ok", "msg": "survey created successfully", "survey": Survey }`
- Errors: `404` user not found, `400` duplicate title, `500` fail to create survey.

- `PATCH /surveys/:surveyId`
  - Auth: `authHost`
  - Body:

```json
{
  "title": "string",
  "points_reward": 50,
  "is_published": true
}
```

- Response: `200` -> `{ "status": "ok", "message": "update successfully", "content": Survey }`
- Errors: `404` user/survey not found, `403` not owner, `400` duplicate title, `500` fail to update survey.

- `DELETE /surveys/:surveyId`
  - Auth: `authHost`
  - Response: `200` -> `{ "status": "ok", "msg": "entry deleted" }`
  - Errors: `404` user/survey not found, `403` not owner, `500` fail to delete.

- `POST /surveys/:surveyId`
  - Auth: `auth`
  - Description: Returns a single survey with populated questions and the authenticated user’s `survey_response` if one exists.
  - Response: `200`

```json
{
  "status": "ok",
  "msg": "entry found",
  "survey": {
    "id": 1,
    "title": "string",
    "points_reward": 0,
    "is_published": true,
    "created_by": "uuid-string",
    "questions": [
      {
        "id": 1,
        "survey_id": 1,
        "question_text": "string",
        "type": "RADIO | CHECKBOX | SELECT | TEXT",
        "options": ["string"]
      }
    ]
  },
  "survey_response": {
    "id": 1,
    "user_id": "uuid-string",
    "survey_id": 1,
    "answers_payload": [
      {
        "question_id": 1,
        "answer": "string"
      }
    ],
    "status": "completed",
    "ai_fraud_notes": null
  }
}
```

- Errors: `404` user/survey not found, `500` fail to find.

- `GET /surveys/:surveyId/results`
  - Auth: `authHost`
  - Description: Aggregated results for a host-owned survey.
  - Response: `200`

```json
{
  "status": "ok",
  "survey_title": "string",
  "total_submissions": 0,
  "results": {
    "<question_id>": {
      "question_text": "string",
      "type": "RADIO | CHECKBOX | SELECT | TEXT",
      "counts": { "option": 0 },
      "total_selections_counted": 0,
      "text_responses": ["string"]
    }
  }
}
```

- Errors: `404` survey not found, `403` unauthorised access to results, `500` fail to compile results.

- `POST /surveys/:surveyId/insights`
  - Auth: `authHost`
  - Description: Generates or reuses AI-backed survey insights for a host-owned survey.
  - Response: `200`

```json
{
  "status": "ok",
  "msg": "Fetch data successfully using AI model gemini-3.1-flash-lite",
  "aiModel": "gemini-3.1-flash-lite",
  "insights": {
    "id": 1,
    "survey_id": 1,
    "summary": "markdown text",
    "submission_count": 12,
    "createdAt": "ISO-8601 string"
  },
  "last_created_at": "ISO-8601 string"
}
```

- Low-response fallback: when total submissions are below 5, the endpoint returns `200` with `msg`, `aiModel: "Looking for AI..."`, `insights` set to the previous insight or `[]`, and `last_created_at: ""`.
- Errors: `404` survey not found, `403` unauthorised access, `500` fail to generate insights.

- `PATCH /surveys/:surveyId/toggle`
  - Auth: `authAdmin`
  - Description: Admin-only publish toggle. Unpublishing also deletes survey responses and AI insights.
  - Body:

```json
{
  "is_published": true
}
```

- Response: `200` -> `{ "status": "ok", "msg": "success", "input": true, "role": "ADMIN" }`
- Errors: `404` user/survey not found, `500` invalid toggle input or toggle failure.

## Questions

- `PUT /questions`
  - Auth: `authHost`
  - Description: Creates a question for a host-owned unpublished survey.
  - Body:

```json
{
  "survey_id": 1,
  "question_text": "string",
  "type": "RADIO | CHECKBOX | SELECT | TEXT",
  "options": ["string"]
}
```

- Response: `201` -> `{ "status": "ok", "msg": "Question created successfully", "question": Question }`
- Errors: `404` survey not found, `403` not owner, `400` live survey or duplicate question, `500` fail to create question.

- `GET /questions/survey/:surveyId`
  - Auth: `authHost`
  - Description: Returns all questions for a host-owned survey.
  - Response: `200` -> `{ "status": "ok", "count": 0, "questions": Question[] }`
  - Errors: `404` survey not found, `403` not owner, `400` live survey guard, `500` fail to fetch questions.

- `PATCH /questions/:questionId`
  - Auth: `authHost`
  - Body:

```json
{
  "question_text": "string",
  "type": "RADIO | CHECKBOX | SELECT | TEXT",
  "options": ["string"]
}
```

- Response: `200` -> `{ "status": "ok", "msg": "Question updated successfully", "question": Question }`
- Errors: `404` question not found, `403` not owner, `400` live survey guard, `500` fail to update question.

- `DELETE /questions/:questionId`
  - Auth: `authHost`
  - Response: `200` -> `{ "status": "ok", "msg": "Question deleted successfully" }`
  - Errors: `404` question not found, `403` not owner, `400` live survey guard, `500` fail to delete question.

## Responses

- `GET /responses`
  - Auth: `auth`
  - Description: Returns all survey responses submitted by the authenticated user.
  - Response: `201`

```json
{
  "status": "ok",
  "msg": "Responses fetched successfully",
  "responses_count": 1,
  "responses": [
    {
      "id": 1,
      "user_id": "uuid-string",
      "survey_id": 1,
      "answers_payload": [],
      "status": "completed",
      "ai_fraud_notes": null
    }
  ]
}
```

- Errors: `401` user not found, `500` failed to fetch responses.

- `POST /responses/survey/:surveyId`
  - Auth: `auth`
  - Description: Returns the survey, its questions, and the authenticated user’s submitted response if one exists.
  - Response: `201`

```json
{
  "status": "ok",
  "msg": "Survey ID 1 fetched successfully",
  "survey": {
    "id": 1,
    "title": "string",
    "questions": [
      {
        "id": 1,
        "survey_id": 1,
        "question_text": "string",
        "type": "RADIO | CHECKBOX | SELECT | TEXT",
        "options": ["string"]
      }
    ],
    "survey_response": {
      "id": 1,
      "user_id": "uuid-string",
      "survey_id": 1,
      "answers_payload": [
        {
          "question_id": 1,
          "answer": "string"
        }
      ],
      "status": "completed",
      "ai_fraud_notes": null
    }
  }
}
```

- Errors: `401` user not found or login, `404` survey not found, `500` fail to submit survey response.

- `PUT /responses/submit`
  - Auth: `auth`
  - Description: Submits answers, prevents duplicate submissions, and credits points in a transaction.
  - Body:

```json
{
  "survey_id": 1,
  "answers_payload": [
    { "question_id": 1, "answer": "single string" },
    { "question_id": 2, "answer": ["multi", "select"] }
  ]
}
```

- Response: `201`

```json
{
  "status": "ok",
  "msg": "Survey submitted successfully! Points credited.",
  "reward_points": 0,
  "new_total_balance": 0,
  "response_id": 1,
  "show": null
}
```

- Errors: `401` user not logged in, `404` survey not found, `400` unpublished survey or duplicate submission, `500` fail to submit survey response.

## Not Mounted

- `src/controllers/roles.js` exists, but `backend-p4/server.js` does not mount a `/roles` router. There is no active public API route for roles in the current server.
