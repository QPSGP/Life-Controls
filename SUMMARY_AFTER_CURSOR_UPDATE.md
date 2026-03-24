# Summary — Get Back Up to Speed After Cursor Update

**Use this file after updating Cursor** so you (and the AI) know where the project left off.

---

## 1. What This Project Is

- **PARADOX** = workspace root. It contains:
  - **lifeplan/** = the app: **Sovereign Life Control Tool** (Next.js 14, Prisma, PostgreSQL). Rebuild of legacy members + life plan + UNIVERSA business (documents, grantors, grantees, people).
  - **UNIVERSA/** = legacy reference (forms, tables). Rebuild is done in lifeplan.
- **Repo:** GitHub `QPSGP/Life-Controls` (or Sovereign-Life-Plan). **Deploy:** Push to `main` → GitHub → Vercel auto-deploys.

---

## 2. Where We Left Off (Current State)

The rebuild is **effectively complete** for the scope we chose. BIZLEGAL.VAL and CNTYCLRK were **skipped** (only if you recover rules or add legacy content later).

### Done in Recent Sessions

1. **Link grantor/grantee to Person**  
   - Document edit: optional “Link to person” dropdown for each grantor and grantee.  
   - Schema: `universaPersonId` on `UniversaDocumentGrantor` and `UniversaDocumentGrantee`.

2. **Portal: member view of documents**  
   - Admin assigns a document to a member (dropdown “Portal member” on document edit).  
   - Member sees **read-only** list at `/portal/documents` and detail at `/portal/documents/[id]`.  
   - Schema: `UniversaDocument.memberId` (optional).

3. **Payments (Stripe webhook)**  
   - `checkout.session.completed` → create Payment, update Invoice, set `stripeSubscriptionId` on Subscription when in metadata.  
   - `invoice.paid` → create Payment, update Invoice status, set subscription active.  
   - `invoice.payment_failed` → subscription status `past_due`.  
   - `customer.subscription.deleted` → subscription `canceled`, `canceledAt` set.  
   - Schema: `Subscription.stripeSubscriptionId` (optional, for webhook matching).

4. **Form validation**  
   - Document create/edit: invalid dates → `error=invalid_date` and UI message.  
   - Invoice create: invalid due date → error.  
   - Grantor/grantee add: **name or link to person** required; clear error messages and hints.

5. **Git and deploy**  
   - All of the above was committed and **pushed to `main`**.  
   - Vercel deploys from GitHub on push.

---

## 3. One-Time: Database Schema

If you haven’t applied the latest schema to the **deployment** database yet, run once (with production `DATABASE_URL`):

```bash
cd lifeplan
npx prisma db push
```

This adds: `UniversaDocument.memberId`, `Subscription.stripeSubscriptionId`, and the Member ↔ UniversaDocument relation.

---

## 4. Key Files for Context

| File | Purpose |
|------|--------|
| **REBUILD_CONTEXT.md** (this folder) | Workspace overview; give to AI in a new chat. |
| **lifeplan/docs/REBUILD_CHECKLIST.md** | Single checklist of every piece (member, UNIVERSA, polish) and status. |
| **lifeplan/docs/UNIVERSA_REBUILD_PLAN.md** | Phased plan (data → forms → reports → persons → polish). |
| **lifeplan/docs/SESSION_CONTEXT.md** | Detailed app/session context. |

---

## 5. What to Tell the AI After the Update

Copy-paste or adapt:

- **Quick resume:**  
  *“Read SUMMARY_AFTER_CURSOR_UPDATE.md and REBUILD_CONTEXT.md. I’m back after a Cursor update; the rebuild is in good shape. Help me with [your next task].”*

- **Full context:**  
  *“Read REBUILD_CONTEXT.md and lifeplan/docs/REBUILD_CHECKLIST.md. This is the PARADOX workspace; the app is in lifeplan, deploys via GitHub → Vercel. Get me back up to speed and then [what you want to do].”*

---

## 6. Optional / Not Done

- **BIZLEGAL.VAL** — Skipped unless you recover validation rules.  
- **CNTYCLRK** — Skipped unless you add county clerk legacy content.  
- **Self-serve subscription signup** — Optional; members currently get subscriptions via admin.  
- **Other legacy (FCA, WEATHERM, etc.)** — Not catalogued; add to checklist if you want them in the app.

---

**Later:** Portal **shared nav** (My account, Live PM, My plan when linked, Documents with count, Profile, Sign out). **Coinbase Commerce** crypto webhook at `/api/webhooks/crypto` (HMAC verify, `charge:confirmed`, metadata `invoiceId` / optional `amountCents`). NowPayments still a stub.

*Last summary update: portal nav + Coinbase crypto webhook; see git log on main.*
