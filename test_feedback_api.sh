#!/bin/bash

# Test Feedback API Script

echo "========================================="
echo "  Testing Feedback API"
echo "========================================="
echo ""

# Backend URL
API_URL="http://localhost:5000/api"

# Test 1: Login to get token
echo "1. Testing login to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }')

echo "Login response: ${LOGIN_RESPONSE}"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Failed to get access token"
  echo "Please ensure you have a test user account"
  exit 1
fi

echo "Access token obtained: ${ACCESS_TOKEN:0:20}..."
echo ""

# Test 2: Create feedback
echo "2. Testing create feedback..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/feedback" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "webseries_id": "WS12345678",
    "rating": 5,
    "feedback_text": "This is a test feedback"
  }')

echo "Create feedback response:"
echo "${CREATE_RESPONSE}" | jq '.' 2>/dev/null || echo "${CREATE_RESPONSE}"
echo ""

# Test 3: Get all feedback
echo "3. Testing get all feedback..."
GET_RESPONSE=$(curl -s -X GET "${API_URL}/feedback" \
  -H "Content-Type: application/json")

echo "Get feedback response:"
echo "${GET_RESPONSE}" | jq '.' 2>/dev/null || echo "${GET_RESPONSE}"
echo ""

echo "========================================="
echo "  Testing Complete"
echo "========================================="
