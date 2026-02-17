# Steps: Deploy Sovereign-Life-Plan to Vercel

Connect your GitHub repo **[QPSGP/Sovereign-Life-Plan](https://github.com/QPSGP/Sovereign-Life-Plan)** to Vercel so the app builds and runs in the cloud.

---

## 1. Sign in to Vercel

1. Go to **[vercel.com](https://vercel.com)**.
2. Click **Sign Up** or **Log In**.
3. Choose **Continue with GitHub** and authorize Vercel to access your GitHub account.

---

## 2. Import the repository

1. On the Vercel dashboard, click **Add New…** → **Project** (or **Import Project**).
2. You should see a list of your GitHub repos. Find **Sovereign-Life-Plan** (or **QPSGP/Sovereign-Life-Plan**).
3. Click **Import** next to it.
4. On the import screen:
   - **Project Name:** Leave as `Sovereign-Life-Plan` (or change if you like).
   - **Framework Preset:** Vercel should detect **Next.js**. If not, choose **Next.js**.
   - **Root Directory:** Leave as `./` (project root).
   - **Build Command:** Leave default (`next build`).
   - **Output Directory:** Leave default (`.next`).
   - **Install Command:** Leave default (`npm install`).
5. **Do not deploy yet.** Click **Environment Variables** (or expand it) so you can add them in the next step.

---

## 3. Add environment variables

Before the first deploy, add at least these. You can add more later.

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your Postgres connection string | From Vercel Postgres, Neon, or Supabase. Must start with `postgresql://` and end with `?sslmode=require` for serverless. |
| `AUTH_SECRET` | A long random string | Generate with: [generate-secret.vercel.app](https://generate-secret.vercel.app/32) or `openssl rand -base64 32`. |

**Optional (add when you’re ready for payments):**

| Name | Value |
|------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (after you create a webhook in Stripe; see step 5) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://sovereign-life-plan.vercel.app` |

**How to enter them in Vercel:**

- For each variable: **Key** = name (e.g. `DATABASE_URL`), **Value** = your secret.
- You can choose **Production**, **Preview**, and/or **Development**; for now, **Production** is enough.
- Click **Add** (or **Save**) after each one.

---

## 4. Deploy

1. Click **Deploy** (or **Deploy Project**).
2. Vercel will clone the repo, run `npm install` and `npm run build`. The first deploy may take 1–2 minutes.
3. When it finishes, you’ll see a **Congratulations** screen and a URL like:
   - **https://sovereign-life-plan-xxxx.vercel.app**
4. Open that URL. You should see the Sovereign Life Plan home page. The health check is:  
   **https://your-app-url.vercel.app/api/health**

---

## 5. (Optional) Set up a database

The app needs a Postgres database. Easiest options:

**Option A — Vercel Postgres**

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database** → **Postgres**.
3. Create the database; Vercel will add `POSTGRES_URL` (or similar) to your env. If it’s named differently, copy the connection string and add it as **`DATABASE_URL`** in **Settings → Environment Variables**.
4. Redeploy (Deployments → … → Redeploy) so the app uses the new variable.

**Option B — Neon (free tier)**

1. Go to **[neon.tech](https://neon.tech)** and create an account and a project.
2. Copy the **connection string** from the dashboard.
3. In Vercel: **Settings → Environment Variables** → add **`DATABASE_URL`** with that string. Add `?sslmode=require` at the end if it’s not there.
4. Redeploy.

**After the database is set:**

- In your repo we use **Prisma**. Vercel runs `npm run build`, which uses `prisma generate`. To apply the schema to the new database, you either:
  - Run **once** from a machine that can run Node: `npx prisma db push` (with `DATABASE_URL` in `.env`), or  
  - Add a **build script** that runs `prisma generate` (already part of Next.js build if Prisma is set up). Pushing the schema (e.g. `prisma db push`) still needs to be done once from your side or via a script.

---

## 6. (Optional) Stripe webhook for payments

When you’re ready to accept payments:

1. In **[Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)**, click **Add endpoint**.
2. **Endpoint URL:** `https://your-vercel-app-url.vercel.app/api/webhooks/stripe`  
   (use the real URL from step 4).
3. **Events to send:** Choose at least `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
4. Create the endpoint; Stripe shows **Signing secret** (`whsec_...`).
5. In Vercel: **Settings → Environment Variables** → add **`STRIPE_WEBHOOK_SECRET`** with that value.
6. Redeploy.

---

## 7. Later: custom domain (optional)

1. In Vercel: open your project → **Settings → Domains**.
2. Add your domain and follow the DNS instructions Vercel shows.
3. Update **`NEXT_PUBLIC_APP_URL`** (and any Stripe/crypto webhook URLs) to use the new domain.

---

## Quick reference

| Step | Action |
|------|--------|
| 1 | Log in to Vercel with GitHub |
| 2 | Import **QPSGP/Sovereign-Life-Plan** as a new project |
| 3 | Add **DATABASE_URL** and **AUTH_SECRET** (and optional Stripe/APP_URL) |
| 4 | Deploy and open the given URL |
| 5 | Create a Postgres DB (Vercel or Neon) and set **DATABASE_URL**; run `prisma db push` once |
| 6 | (Optional) Add Stripe webhook and **STRIPE_WEBHOOK_SECRET** |

Your app will rebuild and deploy automatically whenever you **push to the `main` branch** on GitHub.
