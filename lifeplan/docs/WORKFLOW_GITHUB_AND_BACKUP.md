# Workflow: GitHub as Primary, OneDrive as Backup

Use **GitHub** as the main place for the project. Your computer does **not** need to run the app (no `npm run dev`, no heavy builds). **OneDrive** is only for backing up files.

---

## 1. GitHub = source of truth and where the app runs

- **Code lives on GitHub** (repo: e.g. `sovereign-life-plan`).
- **Vercel** is connected to that repo and runs the app in the cloud. Every push to `main` can auto-deploy. You never run the app on your machine.
- You can **edit in Cursor** by opening the repo (clone to a small local folder if needed—see below) and then **push to GitHub**. Cursor only needs to edit files and run Git; it does not need to run `npm install` or `npm run dev`.

---

## 2. OneDrive = backup only

- Use your existing **OneDrive folder** as a **backup** of the project files.
- Options:
  - **Option A:** Periodically copy or download the repo (e.g. “Download ZIP” from GitHub) into a folder on OneDrive (e.g. `OneDrive\...\PARADOX\lifeplan-backup`). No Git, no scripts—just files.
  - **Option B:** If the project already lives on OneDrive, keep it there as a backup copy. Do **not** run `npm` or any scripts in that folder. When you make changes elsewhere (e.g. on GitHub or in a local clone), copy updated files back to OneDrive when you want a backup.
- OneDrive is **not** used for running or deploying the app.

---

## 3. What you do on your computer (lightweight)

- **Option A — Prefer editing in Cursor:**
  1. Clone the repo from GitHub to a **local folder outside OneDrive** (e.g. `C:\dev\sovereign-life-plan`). Clone only; you don’t have to run `npm install` or `npm run dev`.
  2. Open that folder in Cursor. Edit files and commit + push to GitHub. Your machine only does editing and Git; Vercel does the rest.
  3. When you want a backup, copy the folder (or key files) to OneDrive, or download the repo from GitHub and save the ZIP to OneDrive.

- **Option B — Prefer editing on the web:**
  1. Edit files directly on **GitHub** (click a file → Edit → commit). Or use **GitHub Codespaces** (cloud dev environment) if you want to run the app in the browser without using your computer’s resources.
  2. For backup: use “Download ZIP” from the GitHub repo page and save it to OneDrive.

---

## 4. Summary

| Where        | Purpose |
|-------------|---------|
| **GitHub**  | Main code, history, and trigger for deployment. Edits (in Cursor or on GitHub) get pushed here. |
| **Vercel**  | Runs and hosts the app; connects to GitHub. No need to run the project on your PC. |
| **OneDrive**| Backup of project files only. No scripts, no `npm`. Copy or download from GitHub when you want a snapshot. |
| **Your PC** | Optional: lightweight clone for editing in Cursor + Git push. No need to run the app locally. |

If your computer freezes, your work is safe on GitHub (and in any backup you’ve copied to OneDrive). You can clone the repo again from GitHub and continue.
