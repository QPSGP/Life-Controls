# Run DB push and seed (without using your PC)

Your `DATABASE_URL` is set in **Vercel**, not on your machine. Use GitHub Actions to create/update tables and (optionally) seed plans.

**Two separate things:** (1) **Vercel deployment** = when you push code to GitHub, Vercel builds and deploys the app. (2) **DB push and seed** = this workflow only updates the database (tables + seed). Running the workflow does **not** trigger a new Vercel deployment. To get a new deployment, push a commit or click Redeploy in the Vercel dashboard.

---

## Run the workflow again (e.g. after schema changes)

When you add new columns or tables, run the workflow so the database is updated.

**Run it once.** You do not need to click "Run workflow" twice. The message **"This workflow has a workflow_dispatch trigger"** is normal — it just means the workflow runs only when you start it manually.

1. Open: **https://github.com/QPSGP/Sovereign-Life-Plan/actions**
2. In the **left sidebar**, click **“DB push and seed”**.
3. On the right, click the **“Run workflow”** button—it sits **above the list of past runs** on the right (no yellow box).
4. Leave the branch as **main** (or your default branch), then click the green **“Run workflow”** button.
5. Wait until the run appears at the top and shows a **green checkmark** (about 1–2 minutes).  
   - If it fails (red X), open the run, click the **“db”** job, and check the log for errors.

**If you don't see "Run workflow":** (1) **Log in to GitHub**—the button only appears when you're signed in (you can be on the repo but logged out). (2) Click **"DB push and seed"** in the left sidebar—the button appears **above the list of past runs** on the right. (3) You need write access to the repo; otherwise an admin must run it.

After it succeeds, your database has the latest schema (e.g. the `passwordHash` column on `members`). You do **not** need to add secrets again if `DATABASE_URL` is already set.

---

## First-time setup: Add `DATABASE_URL` to GitHub secrets

1. Open your repo: **https://github.com/QPSGP/Sovereign-Life-Plan**
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name:** `DATABASE_URL`
5. **Value:** Paste the **raw** connection string only. It must start with `postgresql://` or `postgres://` (example: `postgresql://user:pass@host.vercel-storage.com/db?sslmode=require`). Do **not** wrap it in quotes or add spaces. Get it from Vercel (Storage → your Postgres DB → connection string) or Neon/Supabase.
6. Click **Add secret**

## 2. Run the workflow

1. In the repo, open the **Actions** tab
2. Click **DB push and seed** in the left sidebar
3. Click **Run workflow** (use default branch, e.g. `main`) → **Run workflow**
4. Wait for the job to finish (green check). It runs `prisma db push` then `prisma db seed`.

## 3. Open the app

- Open your **Vercel** deployment URL (e.g. `https://sovereign-life-plan-xxx.vercel.app`)
- **/** — home page
- **/admin** — dashboard; subscription plans and members will show (plans after seed, members when you add them)

You only need to run this workflow once per database (or when you change the schema and want to push again).
