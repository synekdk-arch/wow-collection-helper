# Makefile for WoW Collection Helper
# Simplifies common development and deployment tasks

.PHONY: help install start-backend start-frontend dev stop clean test deploy-check

# Default target - show help
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║         WoW Collection Helper - Development Tasks          ║"
	@echo "╠════════════════════════════════════════════════════════════╣"
	@echo "║ make install        - Install backend dependencies        ║"
	@echo "║ make start-backend  - Start backend server (port 3000)     ║"
	@echo "║ make start-frontend - Open frontend in browser             ║"
	@echo "║ make dev            - Start backend and open frontend      ║"
	@echo "║ make stop           - Stop running backend server          ║"
	@echo "║ make clean          - Remove node_modules and logs         ║"
	@echo "║ make test           - Test backend health endpoint         ║"
	@echo "║ make test-api       - Test API with sample requests        ║"
	@echo "║ make deploy-check   - Verify deployment readiness          ║"
	@echo "║ make deploy         - Full deployment to Render.com        ║"
	@echo "║ make setup          - Initial setup (install + config)     ║"
	@echo "╚════════════════════════════════════════════════════════════╝"

# Install backend dependencies
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ Dependencies installed!"

# Setup environment (first time setup)
setup: install
	@echo "🔧 Checking environment configuration..."
	@if [ ! -f backend/.env ]; then \
		echo "⚠️  No .env file found!"; \
		echo "📝 Creating .env from .env.example..."; \
		cp backend/.env.example backend/.env; \
		echo "⚠️  Please edit backend/.env and add your GEMINI_API_KEY"; \
		echo "   Get your key at: https://ai.google.dev/"; \
	else \
		echo "✅ .env file exists"; \
	fi
	@echo ""
	@echo "✅ Setup complete! Next steps:"
	@echo "   1. Edit backend/.env and add your GEMINI_API_KEY"
	@echo "   2. Run 'make dev' to start the application"

# Start backend server
start-backend:
	@echo "🚀 Starting backend server..."
	@if [ ! -f backend/.env ]; then \
		echo "❌ Error: backend/.env not found!"; \
		echo "   Run 'make setup' first"; \
		exit 1; \
	fi
	cd backend && npm start

# Open frontend in browser
start-frontend:
	@echo "🌐 Opening frontend in browser..."
	@if command -v open > /dev/null; then \
		open frontend/index.html; \
	elif command -v xdg-open > /dev/null; then \
		xdg-open frontend/index.html; \
	else \
		echo "Please open frontend/index.html in your browser manually"; \
	fi

# Start both backend and frontend
dev:
	@echo "🚀 Starting development environment..."
	@echo ""
	@echo "Starting backend server in background..."
	@make start-backend > /dev/null 2>&1 & \
		sleep 3 && \
		echo "✅ Backend running at http://localhost:3000" && \
		echo "💚 Health check: http://localhost:3000/health" && \
		echo "" && \
		make start-frontend

# Stop backend server
stop:
	@echo "🛑 Stopping backend server..."
	@pkill -f "node server.js" || echo "No backend process found"
	@echo "✅ Backend stopped"

# Clean up node_modules and logs
clean:
	@echo "🧹 Cleaning up..."
	rm -rf backend/node_modules
	rm -rf backend/package-lock.json
	find . -name "*.log" -delete
	@echo "✅ Cleanup complete!"

# Test backend health endpoint
test:
	@echo "🔍 Testing backend health endpoint..."
	@if curl -s http://localhost:3000/health > /dev/null; then \
		echo "✅ Backend is running!"; \
		curl -s http://localhost:3000/health | python3 -m json.tool; \
	else \
		echo "❌ Backend is not running or not responding"; \
		echo "   Run 'make start-backend' first"; \
	fi

# Test API with sample WoW item
test-api:
	@echo "🧪 Running API tests..."
	@./test-api.sh

# Check if ready for deployment
deploy-check:
	@echo "📋 Checking deployment readiness..."
	@echo ""
	@echo "Checking required files..."
	@test -f render.yaml && echo "✅ render.yaml exists" || echo "❌ render.yaml missing"
	@test -f backend/.env.example && echo "✅ .env.example exists" || echo "❌ .env.example missing"
	@test -f DEPLOYMENT.md && echo "✅ DEPLOYMENT.md exists" || echo "❌ DEPLOYMENT.md missing"
	@test -f backend/package.json && echo "✅ package.json exists" || echo "❌ package.json missing"
	@echo ""
	@echo "Checking git status..."
	@if git status | grep -q "backend/.env"; then \
		echo "❌ WARNING: .env file is staged for commit!"; \
		echo "   Run: git reset backend/.env"; \
	else \
		echo "✅ .env file not in git"; \
	fi
	@echo ""
	@if [ -f backend/.env ]; then \
		if grep -q "your_gemini_api_key_here" backend/.env; then \
			echo "⚠️  API key not configured in .env"; \
		else \
			echo "✅ API key configured locally"; \
		fi; \
	fi
	@echo ""
	@echo "📝 Before deploying to Render.com:"
	@echo "   1. Push code to GitHub"
	@echo "   2. Set GEMINI_API_KEY in Render Dashboard"
	@echo "   3. See DEPLOYMENT.md for full instructions"

# Quick git status check
git-status:
	@echo "📊 Git Status..."
	@git status --short
	@echo ""
	@if git status | grep -q "backend/.env"; then \
		echo "⚠️  WARNING: .env file detected in git!"; \
	fi

# Install and run in one command
run: install start-backend

# Full reset (clean + install + setup)
reset: clean install setup
	@echo "🔄 Full reset complete!"

# Full deployment to Render.com
deploy:
	@./deploy.sh
