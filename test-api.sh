#!/bin/bash
# Test script for WoW Collection Helper API

API_URL="http://localhost:3000/api/guide"

echo "🧪 Testing WoW Collection Helper API"
echo "======================================"
echo ""

echo "📡 Test 1: Mount with Wowhead URL (Invincible's Reins)"
echo "Request:"
echo "POST $API_URL"
echo '{"type":"mount","input":"https://www.wowhead.com/item=50818/invincibles-reins"}'
echo ""
echo "Response:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"type":"mount","input":"https://www.wowhead.com/item=50818/invincibles-reins"}' \
  2>/dev/null | python3 -m json.tool

echo ""
echo "======================================"
echo ""

echo "📡 Test 2: Mount with name only (Invincible)"
echo "Request:"
echo "POST $API_URL"
echo '{"type":"mount","input":"Invincible"}'
echo ""
echo "Response:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"type":"mount","input":"Invincible"}' \
  2>/dev/null | python3 -m json.tool

echo ""
echo "======================================"
echo ""

echo "📡 Test 3: Health Check"
echo "Request: GET http://localhost:3000/health"
echo ""
echo "Response:"
curl -s http://localhost:3000/health | python3 -m json.tool

echo ""
echo "======================================"
echo "✅ Tests complete!"
