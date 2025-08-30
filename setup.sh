#!/bin/bash

echo "🚀 Setting up Task Manager App..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one with your Supabase configuration:"
    echo "   SUPABASE_URL=your-supabase-project-url"
    echo "   SUPABASE_ANON_KEY=your-supabase-anon-key"
    echo ""
    echo "📖 See config_template.txt for more details"
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create your Supabase project if you haven't already"
echo "2. Run the SQL script from create_table.sql in your Supabase SQL editor"
echo "3. Configure your .env file with Supabase credentials"
echo "4. Run: python3 app.py"
echo ""
echo "🌐 The app will be available at http://localhost:5000"
