# Running Scripts When the Project Is on OneDrive

If this folder lives in **Microsoft OneDrive** (e.g. `OneDrive - ...\mydocuments\PARADOX\lifeplan`), you may see errors or blocks when running scripts (`npm install`, `npm run dev`, `npx prisma`, etc.). OneDrive can interfere with:

- Long paths and sync locks
- Script execution and `node_modules` behavior
- Build tools and file watchers

## Recommended approach: develop off OneDrive

**Use a local folder for development** (not inside OneDrive), and keep OneDrive for backup/sync of important files only.

1. **Copy or clone the project to a local path**, for example:
   - `C:\dev\sovereign-life-plan`
   - `C:\Users\<You>\Projects\sovereign-life-plan`
   - Or any folder **outside** your OneDrive directory.

2. **Develop and run everything from that local folder:**
   ```bash
   cd C:\dev\sovereign-life-plan
   npm install
   npx prisma generate
   npm run dev
   ```

3. **Use GitHub as the main backup and deployment source:**
   - Push from the local folder to GitHub.
   - Connect GitHub to Vercel for hosting.
   - OneDrive is then optional for this project; the “source of truth” is the repo.

4. **If you want to keep a copy on OneDrive**, sync only selected files (e.g. docs, plan) or do an occasional manual copy from your local dev folder to the OneDrive folder—avoid running `npm`/scripts from inside OneDrive.

## If you must stay on OneDrive

- Check **Windows execution policy** (e.g. run PowerShell as Administrator and try `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`). This may allow some scripts but does not fix OneDrive sync/lock issues.
- Excluding `node_modules` and `.next` from OneDrive sync can reduce problems but is not always reliable.
- For a permanent fix, Microsoft would need to change how OneDrive handles long paths, locking, and script execution in synced folders. You can request or search for that in:
  - **OneDrive support / feedback:** [OneDrive Help](https://support.microsoft.com/onedrive)
  - **UserVoice / Feedback Hub:** e.g. “OneDrive allow running npm/scripts in synced dev folders”

**Bottom line:** For reliable script and build behavior, develop from a **local folder** and use **GitHub + Vercel** for backup and deployment.
