# Deployment Instructions — AOInsights

## Overview

This document provides instructions for deploying AOInsights to a production environment. It covers the necessary steps to prepare the application, configure the servers, and ensure the deployment is successful.

| Layer    | Platform | Purpose                                |
| -------- | -------- | -------------------------------------- |
| Frontend | Netlify  | Hosts the Angular application          |
| Backend  | Render   | Hosts the Node.js / Express API server |
| Database | Supabase | Manages the PostgreSQL database        |

> **Recommended order:** Supabase first → Render second → Netlify last.
> The backend needs the database URL before it can run, and the frontend needs the backend URL before it can be configured.

---

## Part 1 — Supabase (Database)

### Prerequisites

- Supabase account at [supabase.com](https://supabase.com)
- Prisma ORM set up locally
- pgAdmin4 installed (for local data migration)

---

### Step 1 — Create Supabase Project

1. Log in to [supabase.com](https://supabase.com) and click **New Project**
2. Fill in:
   - **Project name:** `aoinsights`
   - **Database password:** generate a strong password and **save it securely** — you will need it later
   - **Region:** Southeast Asia (Singapore) `ap-southeast-1`
3. Click **Create new project** — wait ~2 minutes for provisioning
4. Once ready, **Status** on the Project Overview should show **Healthy**

---

### Step 2 — Get Your Connection String

1. From the Supabase dashboard, click **Connect** (top right)
2. Select **Session** pooler mode

> **Why Session pooler?**
>
> - Direct connection uses IPv6 by default — incompatible with most free-tier hosting providers
> - Transaction pooler can hang indefinitely with Prisma migrations
> - Session pooler behaves like a direct connection and is most compatible with Prisma

3. Copy the connection string — it looks like:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

> **Note:** The host `aws-1-ap-southeast-1.pooler.supabase.com` may differ depending on your Supabase project region.

> **Special characters in password:** Supabase generates strong passwords that may contain special characters. If your connection fails with a URL parsing error, URL encode the special characters:
> | Character | Encoded |
> |---|---|
> | `@` | `%40` |
> | `#` | `%23` |
> | `!` | `%21` |
> | `$` | `%24` |

---

### Step 3 — Update Your `.env`

In `backend-p4/`, update your `.env` file:

```bash
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

Keep your local connection string commented out for easy switching:

```bash
# Local development (comment out when deploying)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/your_local_db"
```

> **Important:** Never commit `.env` to GitHub. Ensure it is listed in `.gitignore`.

---

### Step 4 — Sync Schema to Supabase

Push your `schema.prisma` directly to Supabase:

```bash
cd backend-p4
npx prisma db push
```

This reads your `schema.prisma` and creates all tables in Supabase to match exactly — no migration history required.

Verify tables were created:

- Go to Supabase dashboard → **Table Editor**
- All tables from `schema.prisma` should now appear

> **Note:** `prisma db push` is suitable for development and portfolio deployments where the database is fresh.
> For production with existing data, use `prisma migrate deploy` with versioned migration files for auditability.

---

### Step 5 — Migrate Existing Local Data (via pgAdmin4)

If you have existing data in your local PostgreSQL that you want to carry over to Supabase, follow these steps.

#### 5a — Export data from local PostgreSQL

1. Open **pgAdmin4**
2. Expand **Servers → PostgreSQL → Databases**
3. Right click your AOInsights local database → **Backup...**
4. Configure the backup:
   - **Filename:** `aoinsights_backup.sql`
   - **Format:** `Plain`
   - Under the **Dump options** tab:
     - ✅ **Only data** — schema already exists in Supabase from Step 4
     - ✅ **Use INSERT commands** — more compatible for restoring across servers
5. Click **Backup**

#### 5b — Register Supabase as a server in pgAdmin4

1. In pgAdmin4, right click **Servers** → **Register → Server**
2. Under the **General** tab:
   - **Name:** `Supabase AOInsights`
3. Under the **Connection** tab, fill in:
   - **Host:** `aws-1-ap-southeast-1.pooler.supabase.com`
   - **Port:** `5432`
   - **Maintenance database:** `postgres`
   - **Username:** `postgres.[your-project-ref]`
   - **Password:** your Supabase database password
4. Click **Save**

> **Note:** The host may differ depending on your Supabase project region. Always copy the host from the Connect screen in your Supabase dashboard.

#### 5c — Restore data to Supabase

1. Expand your newly registered Supabase server in pgAdmin4
2. Right click the `postgres` database → **Restore...**
3. Select your `aoinsights_backup.sql` file
4. Click **Restore**

Verify the data:

- Go to Supabase dashboard → **Table Editor**
- Click each table — rows should match your local database

---

### Step 6 — Revert to Local Development (Optional)

To switch back to your local PostgreSQL, update `.env`:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/your_local_db"
```

No other changes are needed — Prisma reads `DATABASE_URL` at runtime.

---

### Troubleshooting — Supabase

| Error                            | Cause                                       | Fix                                             |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `P1013: scheme not recognized`   | Special characters in password              | URL encode special characters in `DATABASE_URL` |
| Migration hangs indefinitely     | Transaction pooler incompatible with Prisma | Switch to Session pooler (port 5432)            |
| Tables not appearing in Supabase | Schema out of sync with migrations          | Use `npx prisma db push` instead                |
| Connection refused               | Direct connection uses IPv6                 | Use Session pooler instead of Direct            |

### Connection Mode Reference

| Mode               | Port | Recommended for                                 |
| ------------------ | ---- | ----------------------------------------------- |
| Direct             | 5432 | IPv6 networks only — avoid on free tier hosting |
| Transaction pooler | 6543 | Short-lived queries — can hang with Prisma      |
| Session pooler     | 5432 | ✅ Prisma migrations and deployments            |

---

## Part 2 — Render (Backend)

### Overview

Render hosts your Node.js / Express backend server. It deploys directly from your GitHub monorepo — no dedicated backend repo required. The **Root Directory** setting tells Render to only look at `backend-p4/`.

> **Why monorepo over a dedicated backend repo?**
> Render's Root Directory setting handles monorepos natively. For a single-developer portfolio project, splitting into a dedicated repo adds maintenance overhead (two repos, two sets of commits) with no real benefit. A dedicated repo makes sense for larger teams with separate deployment schedules or CI/CD pipelines per service.

---

### Prerequisites

Before deploying, verify these two things locally:

**1. `server.js` uses `process.env.PORT`**

Render assigns its own port dynamically — hardcoding `3000` will cause the service to crash.

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**2. `package.json` has a `start` script using `node` — not `nodemon`**

Nodemon watches for file changes which don't exist in a production container. Always use `node` directly for production.

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

---

### Step 1 — Sign up and connect GitHub

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account when prompted
3. Grant Render access to your repositories

---

### Step 2 — Create a Web Service

1. From the Render dashboard, click **New** → **Web Service**
2. Select **Build and deploy from a Git repository** → click **Next**
3. Find your AOInsights repo → click **Connect**

---

### Step 3 — Configure the service

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| **Name**           | `aoinsights-backend`                 |
| **Region**         | Singapore (Southeast Asia)           |
| **Branch**         | `main`                               |
| **Root Directory** | `backend-p4`                         |
| **Runtime**        | `Node`                               |
| **Build Command**  | `npm install && npx prisma generate` |
| **Start Command**  | `node src/server.js`                 |
| **Instance Type**  | Free                                 |

> **Why `npx prisma generate` in the build command?**
> Render's server doesn't have your Prisma client pre-generated. This regenerates it from your `schema.prisma` during every deploy, ensuring the client matches your current schema.

> **Why not `nodemon` as the start command?**
> Nodemon is a development tool that watches for file changes and restarts the server. In a production container there are no file changes — nodemon adds overhead and can cause unexpected restarts. Always use `node` directly in production.

---

### Step 4 — Add environment variables

Click **Add Environment Variable** and add these one by one:

| Key              | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | Your Supabase session pooler connection string               |
| `JWT_SECRET`     | Your JWT secret key                                          |
| `GEMINI_API_KEY` | Your Google Gemini API key                                   |
| `NODE_ENV`       | `production`                                                 |
| `FRONTEND_URL`   | `https://your-app.netlify.app` (update after Netlify deploy) |

> **Important:** Never hardcode secrets in your code. Render injects these as environment variables at runtime, the same way your local `.env` works.

---

### Step 5 — Deploy

1. Click **Create Web Service**
2. Render starts building — watch the live logs for errors
3. Wait for `==> Your service is live 🎉`
4. Your backend URL will be: `https://aoinsights-backend.onrender.com`

---

### Step 6 — Update CORS in your Express backend

Once you have your Netlify frontend URL, update your CORS config in `server.js` to allow requests from it:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
  }),
);
```

Commit and push to `main` — Render auto-deploys on every push.

---

### Free Tier Limitations

Render's free tier provides 500MB RAM and 0.1 CPU. After **15 minutes of inactivity** the server spins down — the first request after sleep takes 30–60 seconds to wake up, causing your Angular app to appear to hang.

**Fix — use a free uptime monitor:**

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add an HTTP monitor pointing to your Render backend URL
3. Set the check interval to every **10 minutes**
4. The server stays warm and cold starts are eliminated

---

### Important — Which DATABASE_URL to use on Render

Use the **Session pooler** connection string with port `5432` — not Transaction pooler (`6543`):

```dotenv
# ✅ Correct — Session pooler
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ❌ Wrong — Transaction pooler, causes "Can't reach database server" error
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

> **Why the port matters here:**
> During local development, Transaction pooler (`6543`) may have been used as a workaround for machines that don't support IPv6. However Render's servers support IPv6, and more importantly Prisma requires a persistent connection which Session pooler (`5432`) provides. Transaction pooler is designed for short-lived queries and causes Prisma to fail to reach the database.

---

### Connection Architecture Reference

Understanding which connection string to use at each stage:

| Stage                      | From           | To               | Port             | Reason                                   |
| -------------------------- | -------------- | ---------------- | ---------------- | ---------------------------------------- |
| Local dev                  | Your laptop    | Local PostgreSQL | `5432`           | Direct, same machine                     |
| Local → Supabase migration | Your laptop    | Supabase         | `5432` (Session) | IPv4-only machine, Prisma compatible     |
| Render → Supabase          | Render servers | Supabase         | `5432` (Session) | Prisma compatible, persistent connection |
| Browser → Render           | User / Netlify | Render           | `443` (HTTPS)    | Standard web traffic                     |

---

### Troubleshooting — Render

| Error                                    | Cause                                                     | Fix                                                       |
| ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `Can't reach database server`            | Wrong pooler port (`6543`) in `DATABASE_URL`              | Switch to Session pooler port `5432`                      |
| Service crashes immediately after deploy | `start` script missing or wrong entry file                | Check `package.json` start script points to correct file  |
| `Cannot find module @prisma/client`      | Prisma client not generated                               | Add `npx prisma generate` to build command                |
| CORS error from frontend                 | Origin not whitelisted                                    | Add `FRONTEND_URL` env var and update `cors()` config     |
| 30–60s response on first request         | Free tier cold start                                      | Set up UptimeRobot to ping every 10 minutes               |
| Environment variables not found          | `.env` not committed (correct) but vars not set in Render | Add all vars manually in Render dashboard Environment tab |

---

## Part 3 — Netlify (Frontend)

### Overview

Netlify hosts your Angular frontend as static files served via a global CDN. It deploys directly from your GitHub monorepo using the **Base directory** setting to point to the Angular project folder. Unlike Render, Netlify has no spin down issue — static files are always available instantly.

---

### Prerequisites — prepare these before pushing to Netlify

**1. Create `_redirects` file**

Without this file, any page refresh on a non-root route (e.g. `/home`, `/dashboard`) returns a 404. Netlify doesn't know about Angular's client-side routing without it.

Create `src/_redirects` with this single line:

```
/* /index.html 200
```

Then register it in `angular.json` assets so Angular includes it in the build output:

```json
"assets": [
  "src/favicon.svg",
  "src/assets",
  "src/_redirects"
]
```

**2. Create `src/environments/environment.prod.ts`**

Angular uses `fileReplacements` in `angular.json` to swap environment files at build time. Create the production environment file:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://aoinsights-backend.onrender.com",
};
```

Update existing `src/environments/environment.ts` for local dev:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:5001",
};
```

**3. Add `fileReplacements` to `angular.json`**

Under `configurations` → `production`, add:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

This tells Angular to automatically swap environment files during `ng build` — no manual URL switching needed.

**4. Update budget limits in `angular.json`**

Angular's default budget limits are conservative and will cause the Netlify build to fail if exceeded. Update the `budgets` section under `configurations` → `production`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "600kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "4kb",
    "maximumError": "8kb"
  }
]
```

> **Why this is needed:** `ng serve` (local dev) skips budget enforcement. Netlify runs `ng build` which strictly enforces these limits. The build fails with exit code 2 if any budget error threshold is exceeded.

**5. Use `environment.apiUrl` in all services**

Ensure no services hardcode `localhost`. Use `baseUrl` referencing the environment file:

```typescript
import { environment } from '../../environments/environment';

private baseUrl = environment.apiUrl;

// Then use baseUrl in all HTTP calls
this.http.get(`${this.baseUrl}/api/surveys`)
```

Verify no hardcoded localhost exists:

```bash
grep -r "localhost" src/app/
```

---

### Step 1 — Sign up and connect GitHub

1. Go to [netlify.com](https://netlify.com) and sign up
2. Connect your GitHub account when prompted

---

### Step 2 — Create a new site

1. From Netlify dashboard click **Add new site**
2. Select **Import an existing project**
3. Click **GitHub**
4. Find and select your AOInsights repo

---

### Step 3 — Configure build settings

Netlify auto-detects Angular but since your project is in a subfolder, verify these settings manually:

| Field                 | Value                                              |
| --------------------- | -------------------------------------------------- |
| **Base directory**    | `frontend-p4/angular-app`                          |
| **Build command**     | `ng build`                                         |
| **Publish directory** | `frontend-p4/angular-app/dist/angular-app/browser` |

> **Why `dist/angular-app/browser`?** Angular 17 with esbuild outputs to a `browser/` subfolder inside `dist/`. Pointing to `dist/angular-app` without `/browser` results in a blank page.

> **No environment variables needed in Netlify dashboard.** Angular bakes `environment.prod.ts` values into the JS bundle at build time — unlike Node.js which reads `.env` at runtime. The Netlify environment variables tab can be left empty.

---

### Step 4 — Deploy

1. Click **Deploy site**
2. Watch the build logs — takes 2–4 minutes
3. Look for `Site is live` 🎉
4. Netlify gives you a URL like `https://aoinsights.netlify.app`

---

### Step 5 — Update CORS on Render

Now that you have your Netlify URL, go to **Render dashboard → Environment tab** and add:

```
FRONTEND_URL = https://aoinsights.netlify.app
```

This allows your Express backend to accept requests from your deployed frontend. Without this, all API calls from Netlify are blocked by CORS policy.

Also update your Express `server.js` if not already done:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
  }),
);
```

Commit and push — Render auto-redeploys and applies the new CORS origin.

---

### How build minutes work

| Action                                  | Burns Netlify build minutes?        |
| --------------------------------------- | ----------------------------------- |
| `ng build` on your local machine        | ❌ No — runs on your machine        |
| `ng serve` / `npm run dev` locally      | ❌ No — dev server, no build output |
| Pushing to GitHub → Netlify auto-builds | ✅ Yes — ~2-4 minutes per deploy    |

Free tier allowance: **300 build minutes/month** (~100 deploys). Always test with `ng build` locally first to catch errors before pushing.

---

### Conserving Build Minutes — Ignore Backend Changes

Since Netlify and Render are both connected to the same monorepo, every push to `main` triggers both platforms regardless of which files changed. This wastes Netlify build minutes when you only changed backend files.

**Fix — create `netlify.toml` in your repo root:**

```toml
[build]
  base = "frontend-p4/angular-app"
  command = "ng build"
  publish = "dist/angular-app/browser"
  ignore = "git diff --quiet HEAD^ HEAD -- frontend-p4/"
```

> **Note:** `ignore` must be a direct property of `[build]` — not a nested `[build.ignore]` block. Netlify will fail to parse the config if structured incorrectly.

> **How it works:** The `ignore` command tells Netlify to check if any files inside `frontend-p4/` changed since the last commit. If nothing changed there, Netlify skips the build entirely — no build minutes burned.

| Push contains           | Netlify builds? | Render deploys?                |
| ----------------------- | --------------- | ------------------------------ |
| Frontend changes only   | ✅ Yes          | ✅ Yes (wasteful but harmless) |
| Backend changes only    | ❌ Skipped      | ✅ Yes                         |
| Both frontend + backend | ✅ Yes          | ✅ Yes                         |

**Similarly for Render — ignore frontend changes:**

In Render dashboard → your service → **Settings** → **Ignored Paths**, add:

```
frontend-p4/**
```

This prevents Render from redeploying when you push frontend-only changes.

---

### Troubleshooting — Netlify

| Error                                     | Cause                                               | Fix                                                                           |
| ----------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Build fails with exit code 2              | CSS or bundle budget limits exceeded                | Increase `budgets` limits in `angular.json`                                   |
| Blank page after deploy                   | Wrong publish directory                             | Change to `dist/angular-app/browser`                                          |
| 404 on page refresh                       | Missing `_redirects` file                           | Add `_redirects` to `src/` and register in `angular.json` assets              |
| CORS error on login/API calls             | Render still has `localhost:4200` as allowed origin | Add `FRONTEND_URL` env var in Render and update `cors()` config               |
| `environment.prod.ts` not found           | File not created before push                        | Create file and add `fileReplacements` to `angular.json`                      |
| API calls hitting localhost in production | Services hardcoding localhost                       | Replace with `environment.apiUrl` and ensure `fileReplacements` is configured |
