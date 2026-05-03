@echo off
echo ========================================
echo GitHub Authentication Setup for web1atisanat/lhkmd01.git
echo ========================================
echo.
echo You need to authenticate with an account that has access to:
echo https://github.com/web1atisanat/lhkmd01.git
echo.
echo OPTION 1: Use GitHub CLI (Recommended)
echo --------------------------------------
echo 1. Run: gh auth login
echo 2. Choose GitHub.com
echo 3. Choose HTTPS
echo 4. Authenticate in browser
echo 5. Select the account with access to web1atisanat/lhkmd01.git
echo.
echo OPTION 2: Use Personal Access Token
echo ------------------------------------
echo 1. Go to: https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Give it 'repo' permissions
echo 4. Copy the token
echo 5. When git asks for password, paste the token
echo.
echo OPTION 3: Use SSH (Advanced)
echo ---------------------------
echo 1. Set up SSH key: ssh-keygen -t ed25519 -C "your-email@example.com"
echo 2. Add to GitHub: https://github.com/settings/keys
echo 3. Change remote: git remote set-url origin git@github.com:web1atisanat/lhkmd01.git
echo.
echo After authentication, run:
echo git push -u origin main
echo.
pause