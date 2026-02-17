# PARADOX workspace — rebuild context

**When you open the PARADOX folder in Cursor, start here.** Give this file to the AI in a new chat so it knows what to do.

---

## What this workspace is

- **PARADOX** is the root folder. It contains:
  - **lifeplan/** — The app we are building: **Sovereign Life Plan** (Next.js 14, Prisma, PostgreSQL). This is the *in-progress* rebuild of part of the legacy system (members, subscriptions, life plan, invoices, communications, etc.). Repo: QPSGP/Sovereign-Life-Plan, deploys on Vercel.
  - **UNIVERSA/** — The *full* legacy project (business logic, forms, and more) that we want to rebuild. It is the main reference for the complete system; lifeplan is only one part of it.
  - Other legacy folders (cube, FCA, OFFICE, WEATHERM, etc.) may also be relevant.

## Goal

- Rebuild the **full** system, mainly for **business**, with **forms** and everything else in UNIVERSA (and related legacy), not just what is already in lifeplan.
- Use **UNIVERSA** as the primary source to analyze and plan: what’s in it, how it maps to the new app, and what to build next.

## What to do in a new chat (when PARADOX is the open folder)

1. **Restore context**  
   Ask the AI to read this file:  
   *"Read REBUILD_CONTEXT.md to get context."*

2. **Analyze UNIVERSA**  
   Then ask it to analyze the UNIVERSA folder and summarize what’s there (forms, tables, scripts, business logic, etc.):  
   *"Analyze the UNIVERSA folder and summarize its structure and main features."*

3. **Plan the rebuild**  
   Ask for a rebuild plan that:  
   - Maps UNIVERSA (and any other legacy) to the existing lifeplan app and to new modules.  
   - Prioritizes business and forms.  
   - Suggests phases (e.g. data model first, then forms, then reports).

## Lifeplan context (for the AI)

- Detailed project context is in **lifeplan/docs/SESSION_CONTEXT.md**.
- How tables work: **lifeplan/docs/HOW_TABLES_FUNCTION.md**.
- To work on the Next.js app, open or refer to the **lifeplan** subfolder; the repo and deployment are for lifeplan.

---

**TL;DR for the user:** In a new chat with the PARADOX folder open, say:  
**"Read REBUILD_CONTEXT.md and then analyze the UNIVERSA folder."**  
That gives the AI the context and directs it to start from UNIVERSA.
