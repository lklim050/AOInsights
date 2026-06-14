# Refined Agile User Stories & Technical Specifications

---

## 1. The Host Persona (Business & Admin Dashboard)

### Story 1 — Dynamic Survey Creation

- **User Story:** As a Host, I want to create customized surveys containing a mix of Multiple-Choice Questions (MCQs) and Open-Ended Text fields, assigning a specific points value to the completion of each survey.

- **Technical Implementation:** The Angular frontend should use Reactive Forms (`FormArray`) to allow hosts to dynamically add, edit, or remove questions before publishing them to the PostgreSQL database.

### Story 2 — AI Response Integrity & Automated Escrow

- **User Story:** As a Host, I want incoming user submissions to be automatically screened for fraud and text quality so that I do not spend marketing budget on fake data.

- **Technical Implementation:** The Express backend will intercept text submissions, route them through OpenAI's JSON Schema mode to check for gibberish/copy-pasting, and automatically mark the submission status as `approved` or `flagged` in PostgreSQL. Points are only credited if approved.

### Story 3 — AI Text Summarization & Sentiment Analytics

- **User Story:** As a Host, I want a data analytics dashboard that displays visual metric charts for MCQ data and uses AI to extract key themes and word frequencies from free-text feedback.

- **Technical Implementation:** For MCQs, write SQL `GROUP BY` aggregates to feed frontend charts. For open text, the backend should send an aggregated array of text answers to OpenAI and receive a structured JSON object containing `summary`, `topKeywords[]`, and a `sentimentScore`.

### Story 4 — Public Publishing (Stretch Goal)

- **User Story:** As a Host, I want to toggle a survey's visibility to "Public" or post community news articles so that the platform's public audience can view aggregated data insights or research trends.

---

## 2. The User Persona (Respondent & Rewards Dashboard)

### Story 1 — Personalized Feed & Discovery

- **User Story:** As a User, I want to log in and see a personalized dashboard feed displaying active, uncompleted surveys with their respective point values, alongside a search bar to look up historical or public host articles.

- **Technical Implementation:** Use TanStack Query for Angular (`injectQuery`) to fetch and cache available surveys for a snappy experience.

### Story 2 — Preventing Double-Submissions

- **User Story:** As a User, I want to complete surveys through a clean step-by-step UI wizard, knowing that my progress is securely submitted.

- **Technical Implementation:** Enforce a composite unique constraint (`user_id`, `survey_id`) in PostgreSQL to ensure a user cannot submit the same survey multiple times.

### Story 3 — Points Ledger & Voucher Redemption (Stretch Goal)

- **User Story:** As a User, I want to track my total earned points balance and browse a digital rewards catalogue where I can exchange my points balance for shopping or dining vouchers.

- **Technical Implementation:** Use PostgreSQL transactions (`BEGIN` / `COMMIT`) on the Express backend when a user redeems a voucher to atomically deduct points and generate voucher codes.

---

## Database Architecture Mapping (Prisma + PostgreSQL)

The canonical database definition lives in [backend-p4/prisma/schema.prisma](backend-p4/prisma/schema.prisma). The mapping below reflects the actual Prisma models used by the backend:

```
  ┌────────────────────────────┐            ┌────────────────────────────┐            ┌────────────────────────────┐
  │           users            │            │          surveys           │            │         questions          │
  ├────────────────────────────┤            ├────────────────────────────┤            ├────────────────────────────┤
  │ uuid : STRING (PK)         │◄───────────┼│ created_by : STRING (FK)   │            │ survey_id : INT (FK) ─────┼┐
  │ email : STRING (UNIQUE)    │ creator    ││ id : INT (PK)             │            │ question_text : TEXT       ││
  │ name : STRING              │            ││ title : STRING             │            │ type : QuestionType        ││
  │ password : STRING          │            ││ points_reward : INT        │            │ options : JSON?            ││
  │ role : Role                │            ││ is_published : BOOLEAN     │            └────────────────────────────┘│
  │ points_bal : INT           │            │└─────────────┬──────────────┘                                        │
  └─────────────┬──────────────┘            │              │                                                       │
                │                            │              ▼                                                       │
                │                            │     ┌────────────────────────────┐                                   │
                │                            └────►│     survey_responses        │                                   │
                │                                  ├────────────────────────────┤                                   │
                └─────────────────────────────────►│ id : INT (PK)              │                                   │
                           (user_id)               │ user_id : STRING (FK)      │                                   │
                                                   │ survey_id : INT (FK)       │◄──────────────────────────────────┘
                                                   │ answers_payload : JSON     │
                                                   │ status : STRING            │
                                                   │ ai_fraud_notes : TEXT?     │
                                                   └────────────────────────────┘
                                            [CONSTRAINT: UNIQUE(user_id, survey_id)]
```

---

## Prisma Model Summary

- `User` maps to `users`
- `Survey` maps to `surveys`
- `Question` maps to `questions`
- `SurveyResponse` maps to `survey_responses`
- `Role` is an enum: `HOST`, `USER`, `ADMIN`
- `QuestionType` is an enum: `RADIO`, `CHECKBOX`, `SELECT`, `TEXT`

The Prisma schema is the source of truth for column types, defaults, foreign keys, cascade behavior, and the unique compound key on survey responses.

## Equivalent PostgreSQL Shape

```sql
CREATE TABLE users (
    uuid UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    points_bal INT NOT NULL DEFAULT 0
);

CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    points_reward INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    question_text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    options JSONB DEFAULT NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    survey_id INT NOT NULL,
    answers_payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ai_fraud_notes TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_survey UNIQUE (user_id, survey_id)
);
```
