# 📤 GitHub Setup Guide

Follow these steps to push your Pokemon Trainer App to GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `PokemonApp` (or your preferred name)
   - **Description**: "A React Native mobile app for Pokemon trainers"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

## Step 2: Prepare Your Local Repository

### Check Git Status
```bash
cd PokemonApp
git status
```

### Add All Files
```bash
git add .
```

### Commit Your Changes
```bash
git commit -m "Initial commit: Pokemon Trainer App with authentication and UI improvements"
```

## Step 3: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/PokemonApp.git
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/PokemonApp.git
```

### Verify Remote
```bash
git remote -v
```

## Step 4: Push to GitHub

### Push to Main Branch
```bash
git branch -M main
git push -u origin main
```

If you encounter authentication issues, you may need to use a Personal Access Token (PAT):
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Use the token as your password when pushing

## Step 5: Verify Upload

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files uploaded

## 🔒 Important Security Notes

### Files Already Excluded (in .gitignore)
✅ `node_modules/` - Dependencies (too large)
✅ `google-services.json` - Firebase config (sensitive)
✅ `GoogleService-Info.plist` - iOS Firebase config (sensitive)
✅ `*.keystore` - Android signing keys (sensitive)
✅ `build/` - Build artifacts
✅ `.env` - Environment variables (if you create one)

### What Gets Pushed
✅ Source code (`src/` folder)
✅ Configuration files
✅ Documentation files
✅ Package.json and dependencies list
✅ Android and iOS project structure (without builds)

## 📝 Future Updates

After making changes to your code:

```bash
# Check what changed
git status

# Add specific files
git add src/screens/LoginScreen.js

# Or add all changes
git add .

# Commit with a descriptive message
git commit -m "Fix: Keyboard not opening on input tap"

# Push to GitHub
git push
```

## 🌿 Working with Branches

### Create a New Feature Branch
```bash
git checkout -b feature/new-pokemon-list
```

### Switch Between Branches
```bash
git checkout main
git checkout feature/new-pokemon-list
```

### Merge Feature to Main
```bash
git checkout main
git merge feature/new-pokemon-list
git push
```

## 🔄 Keeping Your Fork Updated

If you forked this project:

```bash
# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/PokemonApp.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git checkout main
git merge upstream/main
git push
```

## 🆘 Common Issues

### Issue: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/PokemonApp.git
```

### Issue: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: Large files rejected
```bash
# Check file sizes
git ls-files -s | awk '{print $4, $2}' | sort -n -r | head -20

# Remove large file from git history
git rm --cached path/to/large/file
git commit -m "Remove large file"
```

## 📋 Recommended Commit Message Format

```
Type: Brief description

- Detail 1
- Detail 2

Examples:
- "Feat: Add Pokemon catching animation"
- "Fix: Resolve keyboard issue on Android"
- "Style: Update login screen gradient colors"
- "Docs: Update README with setup instructions"
- "Refactor: Simplify authentication logic"
```

## 🎉 You're Done!

Your Pokemon Trainer App is now on GitHub! Share the link with others:
```
https://github.com/YOUR_USERNAME/PokemonApp
```

## 📱 Next Steps

Consider adding:
- GitHub Actions for CI/CD
- Issue templates
- Pull request templates
- Contributing guidelines
- Code of conduct
- Changelog

Happy coding! 🚀
