# Connect This Folder to Your GitHub Repo (Sovereign-Life-Plan)

You created a GitHub project named **Sovereign-Life-Plan**. Here’s how to connect this folder to it so Cursor (and the AI) work with that repo.

---

## Option A: This folder is already your project (e.g. lifeplan on OneDrive)

If you’re opening **this** folder in Cursor (the OneDrive lifeplan folder):

1. **Open a terminal in Cursor** (Terminal → New Terminal).

2. **Initialize Git** (if this folder isn’t a Git repo yet):
   ```bash
   git init
   ```

3. **Add your GitHub repo as the remote** (replace `YOUR_USERNAME` with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Sovereign-Life-Plan.git
   ```
   If you use SSH:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/Sovereign-Life-Plan.git
   ```

4. **Add, commit, and push** (if the repo is empty on GitHub):
   ```bash
   git add .
   git commit -m "Initial commit: Sovereign Life Plan"
   git branch -M main
   git push -u origin main
   ```
   If GitHub already has a README or other files, you may need to pull first:
   ```bash
   git pull origin main --allow-unrelated-histories
   git push -u origin main
   ```

After this, this folder is **connected** to Sovereign-Life-Plan. When you push, code goes to that repo. Cursor is “connected” because you have this folder open.

---

## Option B: You want to work from a local clone (not OneDrive)

1. **Clone your repo** to a folder outside OneDrive (e.g. `C:\dev`):
   ```bash
   cd C:\dev
   git clone https://github.com/YOUR_USERNAME/Sovereign-Life-Plan.git
   ```

2. If the repo is **empty**, copy the contents of your lifeplan folder into the clone, then:
   ```bash
   cd Sovereign-Life-Plan
   git add .
   git commit -m "Initial commit: Sovereign Life Plan"
   git push -u origin main
   ```

3. **Open the cloned folder in Cursor** (File → Open Folder → `C:\dev\Sovereign-Life-Plan`).

Now Cursor is working with the clone that’s connected to Sovereign-Life-Plan. Use OneDrive only for backup (e.g. copying this folder there).

---

## After connecting

- **Cursor** is “connected” to Sovereign-Life-Plan when you have the folder that has `git remote` pointing at `github.com/.../Sovereign-Life-Plan` open.
- **Push** your work: `git add .` → `git commit -m "message"` → `git push`.
- **Vercel:** In vercel.com, import the repo **Sovereign-Life-Plan** and add env vars so the app builds and runs from GitHub.

Replace `YOUR_USERNAME` with your actual GitHub username in the URLs above.
