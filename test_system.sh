#!/bin/bash

echo "🧪 Authenticai AI Prevention Coach - System Test"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n📊 1. Backend Health Check"
echo "-------------------------"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/health)
HTTP_CODE="${HEALTH_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "503" ]; then
    test_result 0 "Backend server is responding (HTTP $HTTP_CODE)"
else
    test_result 1 "Backend server not responding (HTTP $HTTP_CODE)"
fi

echo -e "\n🔐 2. Authentication Tests"
echo "-------------------------"

# Test user registration
echo "Testing user registration..."
REG_RESPONSE=$(curl -s -w "%{http_code}" -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@example.com\",\"password\":\"testpass123\"}")
REG_HTTP_CODE="${REG_RESPONSE: -3}"
test_result $([ "$REG_HTTP_CODE" = "200" ] && echo 0 || echo 1) "User registration (HTTP $REG_HTTP_CODE)"

# Test user login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser2@example.com","password":"testpassword123"}')
LOGIN_HTTP_CODE="${LOGIN_RESPONSE: -3}"
test_result $([ "$LOGIN_HTTP_CODE" = "200" ] && echo 0 || echo 1) "User login (HTTP $LOGIN_HTTP_CODE)"

if [ "$LOGIN_HTTP_CODE" = "200" ]; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
    
    # Test protected endpoint
    echo "Testing protected endpoint..."
    ME_RESPONSE=$(curl -s -w "%{http_code}" -X GET "http://localhost:8000/api/v1/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    ME_HTTP_CODE="${ME_RESPONSE: -3}"
    test_result $([ "$ME_HTTP_CODE" = "200" ] && echo 0 || echo 1) "Protected endpoint access (HTTP $ME_HTTP_CODE)"
fi

echo -e "\n💾 3. Database Connectivity"
echo "-------------------------"
DB_RESPONSE=$(curl -s -w "%{http_code}" "https://mvzedizusolvyzqddevm.supabase.co/rest/v1/users?select=count" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12emVkaXp1c29sdnl6cWRkZXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI0MjExNCwiZXhwIjoyMDczODE4MTE0fQ.aToKkCYiFiPXepI9aEB4IgP5TgjqEXr8vzVdnJ6-WXk" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12emVkaXp1c29sdnl6cWRkZXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI0MjExNCwiZXhwIjoyMDczODE4MTE0fQ.aToKkCYiFiPXepI9aEB4IgP5TgjqEXr8vzVdnJ6-WXk")
DB_HTTP_CODE="${DB_RESPONSE: -3}"
test_result $([ "$DB_HTTP_CODE" = "200" ] && echo 0 || echo 1) "Supabase database connection (HTTP $DB_HTTP_CODE)"

echo -e "\n🌐 4. Frontend Build Test"
echo "------------------------"
cd frontend
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    test_result 0 "Frontend build successful"
else
    test_result 1 "Frontend build failed"
    echo "Build error details:"
    echo "$BUILD_OUTPUT" | tail -10
fi
cd ..

echo -e "\n🔌 5. External Services"
echo "----------------------"

# Test Redis (optional)
if command -v redis-cli &> /dev/null; then
    redis-cli ping &> /dev/null
    test_result $? "Redis connection"
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: Redis CLI not available"
fi

# Test OpenAI API (if key is set)
if [ ! -z "$OPENAI_API_KEY" ] && [ "$OPENAI_API_KEY" != "your_openai_api_key" ]; then
    OPENAI_RESPONSE=$(curl -s -w "%{http_code}" "https://api.openai.com/v1/models" \
      -H "Authorization: Bearer $OPENAI_API_KEY")
    OPENAI_HTTP_CODE="${OPENAI_RESPONSE: -3}"
    test_result $([ "$OPENAI_HTTP_CODE" = "200" ] && echo 0 || echo 1) "OpenAI API connection (HTTP $OPENAI_HTTP_CODE)"
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: OpenAI API key not configured"
fi

echo -e "\n📋 Test Summary"
echo "==============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All critical systems are working!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Check the details above.${NC}"
    exit 1
fi
