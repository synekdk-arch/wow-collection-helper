#!/bin/bash
# Full Deployment Script for Render.com
# This script prepares and deploys the WoW Collection Helper

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          WoW Collection Helper - Full Deployment           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Security Check
echo "🔒 Step 1: Security Check"
echo "─────────────────────────"
if git status | grep -q "backend/.env"; then
    echo -e "${RED}❌ ERROR: .env file is in git!${NC}"
    echo "   Removing from staging..."
    git reset backend/.env
    echo -e "${GREEN}✅ .env removed from git${NC}"
fi

if [ -f backend/.env ]; then
    echo -e "${GREEN}✅ Local .env exists${NC}"
else
    echo -e "${RED}❌ WARNING: No local .env file${NC}"
fi
echo ""

# Step 2: Install Dependencies
echo "📦 Step 2: Install Dependencies"
echo "─────────────────────────────"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Run Tests
echo "🧪 Step 3: Testing Application"
echo "─────────────────────────────"
echo "Starting backend server for testing..."
cd backend && npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Test health endpoint
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null
echo ""

# Step 4: Git Status
echo "📊 Step 4: Git Status"
echo "───────────────────────"
git status --short
echo ""

# Step 5: Commit Changes
echo "💾 Step 5: Commit Changes"
echo "────────────────────────"
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Deploy: Add Render.com configuration with secure API key handling"
fi

git add .
git status --short
echo ""
read -p "Commit these changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${YELLOW}⚠️  Commit cancelled${NC}"
    exit 0
fi
echo ""

# Step 6: Push to GitHub
echo "🚀 Step 6: Push to GitHub"
echo "────────────────────────"
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
read -p "Push to origin/$CURRENT_BRANCH? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin $CURRENT_BRANCH
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Push cancelled${NC}"
    exit 0
fi
echo ""

# Step 7: Deployment Instructions
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🎉 Ready for Render.com Deployment!           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Go to: https://dashboard.render.com/"
echo "2. Click: 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository: kozuchowskihubert/wow-collection"
echo "4. Select branch: $CURRENT_BRANCH"
echo "5. Render will detect render.yaml automatically"
echo ""
echo "⚠️  CRITICAL - Environment Variables:"
echo "   After deployment starts, go to backend service:"
echo "   → Environment tab"
echo "   → Add: GEMINI_API_KEY = AIzaSyBRcr6obdfZhsY5z_J0ekquljcxpvOjy6s"
echo "   → Save Changes"
echo ""
echo "6. Wait for deployment to complete"
echo "7. Copy your backend URL (e.g., https://wow-collection-backend.onrender.com)"
echo "8. Update frontend/script.js with the backend URL"
echo "9. Commit and push the frontend update"
echo ""
echo "📖 Full documentation: DEPLOYMENT.md"
echo "🔒 Security guide: SECURITY.md"
echo "⚡ Quick reference: QUICK_REFERENCE.md"
echo ""
echo "✅ Deployment preparation complete!"
