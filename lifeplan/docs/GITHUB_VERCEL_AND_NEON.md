# GitHub ↔ Vercel (Auto Deploy) + Using Your Existing Neon

## 1. Do GitHub and Vercel “talk”?

**Yes.** You connect them **once**; after that, every push to GitHub can automatically deploy to Vercel. You don’t deploy “by hand” each time.

---

## 2. Connect GitHub to Vercel (one-time setup)

### Step A: Log in to Vercel with GitHub

1. Go to **[vercel.com](https://vercel.com)**.
2. Click **Sign Up** or **Log In**.
3. Choose **Continue with GitHub**.
4. Authorize Vercel. (Vercel will be able to see your repos and trigger builds.)

That’s the only “connection” step. After this, Vercel and GitHub are linked for your account.

### Step B: Import your repo (creates the “auto deploy” link)

1. On Vercel, click **Add New…** → **Project**.
2. You’ll see a list of your **GitHub** repositories (because you logged in with GitHub).
3. Find **Sovereign-Life-Plan** (or **QPSGP/Sovereign-Life-Plan**).
   - If you don’t see it: click **Adjust GitHub App Permissions** and grant Vercel access to the org/account that owns the repo.
4. Click **Import** next to Sovereign-Life-Plan.
5. On the next screen:
   - Leave **Framework** as **Next.js**.
   - Add your **Environment Variables** (e.g. `DATABASE_URL`, `AUTH_SECRET`).  
     See [VERCEL_DEPLOY_STEPS.md](./VERCEL_DEPLOY_STEPS.md) for the list.
6. Click **Deploy**.

From now on:

- **When you push to GitHub** (e.g. `git push origin main`) → Vercel sees the push and **runs a new build and deploy**.
- You don’t need to “send” the code to Vercel manually; GitHub and Vercel handle it.

**Summary:** GitHub and Vercel talk through the “Log in with GitHub” + “Import Project” flow. One connection, then automatic deploys on push.

---

## 3. Neon: do you need a new database or can Neon “share”?

You **don’t** use the same database for two different apps (that would mix data). You **can** use the same **Neon account** and either:

- **Option A (recommended):** Same Neon **project**, **new database** for Sovereign-Life-Plan, or  
- **Option B:** New Neon **project** for Sovereign-Life-Plan.

So: **Neon doesn’t “share” one database between apps**, but you **can** keep using your existing Neon account and add one more database (or project) for Sovereign-Life-Plan.

### Option A: New database in your existing Neon project

1. Log in at **[neon.tech](https://neon.tech)** and open the **same project** you use for the other app.
2. In that project, **create a new database** (e.g. name it `sovereign_life_plan` or `slp`).
   - In Neon: **Project** → **Databases** (or similar) → **Create database**.
3. Open the new database and copy its **connection string** (connection string is per database).
4. In **Vercel** → your Sovereign-Life-Plan project → **Settings** → **Environment Variables**:
   - Add **`DATABASE_URL`** with this **new** connection string.
5. Redeploy the app.

Result: one Neon project, two databases (one for the other app, one for Sovereign-Life-Plan). No need to create a whole new Neon account.

### Option B: New Neon project for Sovereign-Life-Plan

1. In Neon, click **New Project** and create a project (e.g. “Sovereign-Life-Plan”).
2. Use the default database (or create one) and copy its **connection string**.
3. In Vercel, set **`DATABASE_URL`** to this connection string and redeploy.

Result: two separate Neon projects (clean separation; still same Neon account).

### Blob store

Neon’s **Blob store** is per project (or per database, depending on how Neon exposes it). For Sovereign-Life-Plan you typically want:

- Either a **separate** blob store (e.g. in the new database or new project you created for Sovereign-Life-Plan), or  
- A separate **Vercel Blob** or **S3** bucket for Sovereign-Life-Plan.

So: **reuse the Neon account**, add a **new database (or new project)** for Sovereign-Life-Plan, and use a **dedicated blob storage** for this app (Neon blob in the new DB/project, or Vercel Blob, etc.). No need to “share” the existing blob with the other project.

---

## 4. Quick checklist

| Step | What to do |
|------|------------|
| 1 | Vercel: **Log in with GitHub** (one-time). |
| 2 | Vercel: **Add New → Project** → **Import** **Sovereign-Life-Plan** from GitHub. |
| 3 | Add **Environment Variables** (e.g. `DATABASE_URL`, `AUTH_SECRET`), then **Deploy**. |
| 4 | Neon: In your **existing** Neon project, **create a new database** for Sovereign-Life-Plan (or create a new Neon project). |
| 5 | Copy that database’s **connection string** → Vercel **Settings → Environment Variables** → **`DATABASE_URL`** → **Redeploy**. |

After that, **every push to the repo on GitHub will trigger a new deploy on Vercel**; no extra steps needed.
