# Push PARADOX to GitHub

Your PARADOX folder is now a Git repo with one commit. Follow these steps to put it on GitHub.

## 1. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **+** (top right) → **New repository**.
3. **Repository name:** e.g. `PARADOX` or `sovereign-life-plan`.
4. Choose **Private** (recommended) or Public.
5. **Do not** check "Add a README" or "Add .gitignore" — the repo should be empty.
6. Click **Create repository**.

## 2. Push from your PC

In PowerShell (or Command Prompt), run these commands. Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and the repo name you chose.

```powershell
cd "c:\Users\RichardWeatherman\OneDrive - Weatherman and Company\Personal\mydocuments\PARADOX"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

git branch -M main

git push -u origin main
```

Example: if your username is `richardleeweatherman` and the repo is `PARADOX`:

```powershell
git remote add origin https://github.com/richardleeweatherman/PARADOX.git
git branch -M main
git push -u origin main
```

When prompted, sign in to GitHub (browser or token). If you use 2FA, use a **Personal Access Token** as the password instead of your account password.

## 3. After the first push

- Your code is on GitHub. You can clone it to another folder (e.g. `C:\dev\PARADOX`) to avoid OneDrive sync issues.
- To push future changes: `git add .` → `git commit -m "your message"` → `git push`.
- The **lifeplan** app lives in the `lifeplan/` folder. To run it: `cd lifeplan` then `npm install` and `npm run dev`. Copy `lifeplan/.env.example` to `lifeplan/.env` and add your `DATABASE_URL` and any other secrets (never commit `.env`).

## Optional: clone to a folder outside OneDrive

To work from a copy that’s not in OneDrive (fewer permission/sync issues):

```powershell
cd C:\dev
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git PARADOX
cd PARADOX\lifeplan
copy .env.example .env
# Edit .env with your DATABASE_URL
npm install
npm run dev
```

Then do your work in `C:\dev\PARADOX` and push from there. OneDrive can stay as a backup of the original folder.
