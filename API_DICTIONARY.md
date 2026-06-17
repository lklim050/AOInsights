# API Dictionary

This document lists the backend API endpoints, methods, required auth, request bodies, and example responses for the Prisma-backed backend.

---

**Base URL**: `http://<HOST>:<PORT>/`

The running server mounts these routers in `backend-p4/server.js`:

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
    "type": "TEXT | RADIO | CHECKBOX | SELECT",
    "options": ["string"]
  },
  "SurveyAnswerItem": {
    "question_id": 1,
    "answer": "string | string[]"
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
  - Description: Get all users for admin use.
  - Response: `200` array of users with `points_bal` included.

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
  - Description: Truncate and reseed users, surveys, questions, and responses.
  - Response: `200` -> `{ "status": "ok", "msg": "Database seeded dynamically with correct local hashes!" }`
  - Errors: `500` -> `{ "status": "error", "msg": "Fail to execute dynamic seed", "details": "string" }`

## Surveys

- `GET /surveys/test`
  - Auth: none
  - Description: Returns all surveys as a raw array.
  - Response: `200` -> `Survey[]`

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
  - Description: Returns all published surveys with host name and `isAttempted` status.
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
        "type": "TEXT | RADIO | CHECKBOX | SELECT",
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

- Errors: `404` user/survey not found, `403` unpublished survey blocked for non-hosts, `500` fail to find.

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
      "type": "TEXT | RADIO | CHECKBOX | SELECT",
      "counts": { "option": 0 },
      "total_selections_counted": 0,
      "text_responses": ["string"]
    }
  }
}
```

- Errors: `404` survey not found, `403` unauthorised access to results, `500` fail to compile results.

## Questions

- `PUT /questions`
  - Auth: `authHost`
  - Description: Create a question for a host-owned unpublished survey.
  - Body:

```json
{
  "survey_id": 1,
  "question_text": "string",
  "type": "TEXT | RADIO | CHECKBOX | SELECT",
  "options": ["string"]
}
```

- Response: `201` -> `{ "status": "ok", "msg": "Question created successfully", "question": Question }`
- Errors: `404` survey not found, `403` not owner, `400` live survey or duplicate question, `500` fail to create question.

- `GET /questions/survey/:surveyId`
  - Auth: `authHost`
  - Description: Get all questions for a host-owned survey.
  - Response: `200` -> `{ "status": "ok", "count": 0, "questions": Question[] }`
  - Errors: `404` survey not found, `403` not owner, `400` live survey guard, `500` fail to fetch questions.

- `PATCH /questions/:questionId`
  - Auth: `authHost`
  - Body:

```json
{
  "question_text": "string",
  "type": "TEXT | RADIO | CHECKBOX | SELECT",
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
        "type": "TEXT | RADIO | CHECKBOX | SELECT",
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

## Legacy Reference Routers

The repository also contains legacy `ref/*` router files for reference, but `backend-p4/server.js` does not mount them.

- `ref/auth`
- `ref/appts`
- `ref/roles`

These files are useful for compatibility notes only and should not be treated as active routes in the current server.
