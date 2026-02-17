# Work from GitHub — OneDrive as backup only

Use **GitHub** as the main place for PARADOX. Work in a **local clone outside OneDrive**; push and pull from GitHub. OneDrive is only a backup (optional).

---

## One-time: get the repo onto GitHub

### 1. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **+** (top right) → **New repository**.
3. **Repository name:** e.g. `PARADOX` or `sovereign-life-plan`.
4. Choose **Private** (recommended) or Public.
5. **Do not** check "Add a README" or "Add .gitignore" — leave the repo empty.
6. Click **Create repository**.

### 2. One-time push from your current PARADOX folder (OneDrive)

In PowerShell, run (use your real GitHub username and repo name):

```powershell
cd "c:\Users\RichardWeatherman\OneDrive - Weatherman and Company\Personal\mydocuments\PARADOX"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Example: `https://github.com/richardleeweatherman/PARADOX.git`

When prompted, sign in to GitHub. If you use 2FA, use a **Personal Access Token** as the password.

After this, GitHub has the full project. You don’t need to work from the OneDrive folder again.

---

## Normal workflow: work from a clone (not OneDrive)

Clone the repo to a folder **outside OneDrive** and use that as your only working copy. Open this folder in Cursor and do all edits here; push/pull with GitHub.

### 1. Clone to a local folder (e.g. C:\dev\PARADOX)

```powershell
mkdir C:\dev
cd C:\dev
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git PARADOX
```

### 2. Set up the lifeplan app in the clone

```powershell
cd C:\dev\PARADOX\lifeplan
copy .env.example .env
```

Edit `lifeplan\.env` and add your `DATABASE_URL` and any other secrets (same values as in your OneDrive copy). Then:

```powershell
npm install
npm run dev
```

### 3. Open the clone in Cursor

- **File → Open Folder** → choose `C:\dev\PARADOX`.
- From now on, do all work in this folder. Commit and push to GitHub; ignore the OneDrive PARADOX folder for day-to-day work.

### 4. Daily commands (run from C:\dev\PARADOX)

- Save changes and push to GitHub:
  ```powershell
  cd C:\dev\PARADOX
  git add .
  git commit -m "Describe what you did"
  git push
  ```
- Get latest from GitHub (e.g. from another machine or after fixing something on the site):
  ```powershell
  cd C:\dev\PARADOX
  git pull
  ```

---

## OneDrive = backup only

- **Option A:** Don’t use the OneDrive PARADOX folder for development. Your real project is `C:\dev\PARADOX` and GitHub. OneDrive is just an old copy.
- **Option B:** Occasionally copy `C:\dev\PARADOX` into OneDrive (e.g. to `mydocuments\PARADOX_backup`) if you want an extra backup. Don’t run Git or the app from inside OneDrive.

GitHub is the source of truth; the clone in `C:\dev\PARADOX` is where you work. OneDrive is only for backup.
