#!/bin/bash

echo "🚀 Task Manager Pro - Deployment Setup"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat << EOF > .gitignore
# Environment variables
.env

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
        echo "✅ Created .gitignore"
    fi
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Prepare app for deployment

- Add production configurations
- Add WSGI entry point
- Update requirements with gunicorn
- Add deployment configs for Vercel, Railway, Render
- Create comprehensive deployment guide"
fi

echo ""
echo "🎉 Your app is ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push to GitHub: git remote add origin <your-repo-url>"
echo "2. git push -u origin main"
echo "3. Choose a hosting platform:"
echo "   - Vercel (recommended): https://vercel.com"
echo "   - Railway: https://railway.app"  
echo "   - Render: https://render.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔑 Don't forget to set environment variables:"
echo "   SUPABASE_URL=https://pvjmmevbtgpxzwyeifhk.supabase.co"
echo "   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""
