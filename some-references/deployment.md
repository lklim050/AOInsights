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

> Coming soon

---

## Part 3 — Netlify (Frontend)

> Coming soon
