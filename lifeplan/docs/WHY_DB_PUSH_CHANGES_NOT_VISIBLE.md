# Why don’t I see changes after “DB push” from Git?

Two separate things have to be up to date: **the database** and **the deployed app**.

---

## 1. Database (tables) — “DB push and seed” workflow

The GitHub Action **checks out the branch you choose** (e.g. `main`) and runs `prisma db push` using the **schema in that branch**.

- If the **UNIVERSA models** (and any other new schema) are **not in the code on that branch**, the workflow will only push the old schema → **no new tables**.
- So: **commit and push your schema (and code) first**, then run **“DB push and seed”** on that same branch. The workflow will then push the latest schema, including `universa_documents`, `universa_document_grantors`, `universa_document_grantees`, etc.

**Check:** After a successful run, in the workflow log you should see Prisma applying changes. If the run used an old checkout (e.g. before you pushed), run the workflow again after pushing.

---

## 2. Deployed app (Vercel) — new pages / “Documents” link

Running **“DB push and seed” does not deploy the app**. Vercel only deploys when:

- You **push a new commit** to the connected branch, or  
- You **click “Redeploy”** in the Vercel dashboard for the latest deployment.

So even if the database has the new tables, the **live site** can still be serving **old code** without the Documents pages or API routes.

**Fix:** Push a commit that includes the new admin documents code (or any change) so Vercel builds and deploys again. Or in Vercel: Deployments → … → Redeploy.

---

## Checklist

1. **Commit and push** all changes (schema + admin documents pages + APIs) to your default branch (e.g. `main`).
2. Run **“DB push and seed”** in GitHub Actions on that branch so the DB gets the new tables.
3. **Trigger a new deployment**: push a commit, or in Vercel use Redeploy.
4. Open the app (e.g. `/admin` → **Documents**). You should see the new link and pages.

---

## If you’re testing locally

After pulling the latest code:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Use the same `DATABASE_URL` as production (e.g. from Vercel) if you want to see the same data; otherwise a local `.env` with a different DB is fine for UI testing.
