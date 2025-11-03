#!/usr/bin/env python3
"""
Backend API Testing for TutorHub Password Change Modal Flow
Tests the complete password change workflow for students with must_change_password flag
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://tutorhub-3.preview.emergentagent.com/api"
TEST_STUDENT_EMAIL = "student@test.com"
TEST_STUDENT_PASSWORD = "Student@123"
TEST_STUDENT_NAME = "Test Student"
NEW_PASSWORD = "NewPassword123"

class TutorHubTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if self.access_token:
            default_headers["Authorization"] = f"Bearer {self.access_token}"
        
        if headers:
            default_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=default_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=default_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=default_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=default_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_api_health(self):
        """Test if API is accessible"""
        print("\n=== Testing API Health ===")
        response = self.make_request("GET", "/")
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result(
                    "API Health Check", 
                    True, 
                    f"API is running: {data.get('message', 'OK')}"
                )
                return True
            except:
                self.log_result("API Health Check", False, "Invalid JSON response")
                return False
        else:
            self.log_result(
                "API Health Check", 
                False, 
                f"API not accessible. Status: {response.status_code if response else 'No response'}"
            )
            return False
    
    def setup_test_student(self):
        """Setup or verify test student exists with must_change_password=true"""
        print("\n=== Setting Up Test Student ===")
        
        # First try to login to see if student exists
        login_data = {
            "email": TEST_STUDENT_EMAIL,
            "password": TEST_STUDENT_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            # Student exists, check if must_change_password is true
            must_change = data.get("must_change_password", False)
            
            if must_change:
                self.log_result(
                    "Test Student Setup", 
                    True, 
                    "Test student exists with must_change_password=true"
                )
                return True
            else:
                # Student exists but doesn't have must_change_password flag
                # We need to create a new student or update existing one
                self.log_result(
                    "Test Student Setup", 
                    False, 
                    "Student exists but must_change_password is false",
                    {"must_change_password": must_change}
                )
                return False
        
        # Student doesn't exist, try to create one
        # First we need admin access to create a student
        # For testing purposes, we'll try to signup as the student directly
        signup_data = {
            "email": TEST_STUDENT_EMAIL,
            "password": TEST_STUDENT_PASSWORD,
            "name": TEST_STUDENT_NAME,
            "role": "student",
            "must_change_password": True
        }
        
        response = self.make_request("POST", "/auth/signup", signup_data)
        
        if response and response.status_code == 200:
            self.log_result(
                "Test Student Setup", 
                True, 
                "Test student created successfully"
            )
            return True
        else:
            error_msg = "Failed to create test student"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    error_msg = f"HTTP {response.status_code}"
            
            self.log_result(
                "Test Student Setup", 
                False, 
                error_msg,
                {"status_code": response.status_code if response else None}
            )
            return False
    
    def test_login_with_must_change_password(self):
        """Test login returns must_change_password flag"""
        print("\n=== Testing Login Response ===")
        
        login_data = {
            "email": TEST_STUDENT_EMAIL,
            "password": TEST_STUDENT_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if not response:
            self.log_result("Login Test", False, "No response from login endpoint")
            return False
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", f"HTTP {response.status_code}")
            except:
                error_msg = f"HTTP {response.status_code}"
            
            self.log_result("Login Test", False, f"Login failed: {error_msg}")
            return False
        
        try:
            data = response.json()
            
            # Check required fields
            required_fields = ["access_token", "token_type", "user"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result(
                    "Login Response Structure", 
                    False, 
                    f"Missing required fields: {missing_fields}",
                    {"response": data}
                )
                return False
            
            # Check must_change_password field
            must_change = data.get("must_change_password")
            if must_change is None:
                self.log_result(
                    "Login must_change_password Field", 
                    False, 
                    "must_change_password field missing from response",
                    {"response": data}
                )
                return False
            
            if must_change != True:
                self.log_result(
                    "Login must_change_password Value", 
                    False, 
                    f"must_change_password should be true, got: {must_change}",
                    {"must_change_password": must_change}
                )
                return False
            
            # Store token for subsequent requests
            self.access_token = data["access_token"]
            
            self.log_result(
                "Login Test", 
                True, 
                "Login successful with must_change_password=true",
                {
                    "user_id": data["user"].get("id"),
                    "user_role": data["user"].get("role"),
                    "must_change_password": must_change
                }
            )
            return True
            
        except json.JSONDecodeError:
            self.log_result("Login Test", False, "Invalid JSON response from login")
            return False
    
    def test_change_password_success(self):
        """Test successful password change"""
        print("\n=== Testing Password Change (Success) ===")
        
        if not self.access_token:
            self.log_result("Password Change Test", False, "No access token available")
            return False
        
        change_data = {
            "old_password": TEST_STUDENT_PASSWORD,
            "new_password": NEW_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/change-password", change_data)
        
        if not response:
            self.log_result("Password Change Test", False, "No response from change-password endpoint")
            return False
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", f"HTTP {response.status_code}")
            except:
                error_msg = f"HTTP {response.status_code}"
            
            self.log_result("Password Change Test", False, f"Password change failed: {error_msg}")
            return False
        
        try:
            data = response.json()
            message = data.get("message", "")
            
            if "success" in message.lower():
                self.log_result(
                    "Password Change Test", 
                    True, 
                    "Password changed successfully",
                    {"response": data}
                )
                return True
            else:
                self.log_result(
                    "Password Change Test", 
                    False, 
                    f"Unexpected response message: {message}",
                    {"response": data}
                )
                return False
                
        except json.JSONDecodeError:
            self.log_result("Password Change Test", False, "Invalid JSON response")
            return False
    
    def test_login_after_password_change(self):
        """Test login with new password and verify must_change_password is false"""
        print("\n=== Testing Login After Password Change ===")
        
        # Clear token to test fresh login
        self.access_token = None
        
        login_data = {
            "email": TEST_STUDENT_EMAIL,
            "password": NEW_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if not response:
            self.log_result("Login After Password Change", False, "No response from login endpoint")
            return False
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", f"HTTP {response.status_code}")
            except:
                error_msg = f"HTTP {response.status_code}"
            
            self.log_result("Login After Password Change", False, f"Login with new password failed: {error_msg}")
            return False
        
        try:
            data = response.json()
            must_change = data.get("must_change_password")
            
            if must_change is None:
                self.log_result(
                    "Login After Password Change", 
                    False, 
                    "must_change_password field missing from response"
                )
                return False
            
            if must_change != False:
                self.log_result(
                    "Login After Password Change", 
                    False, 
                    f"must_change_password should be false after password change, got: {must_change}",
                    {"must_change_password": must_change}
                )
                return False
            
            self.log_result(
                "Login After Password Change", 
                True, 
                "Login successful with new password, must_change_password=false",
                {"must_change_password": must_change}
            )
            return True
            
        except json.JSONDecodeError:
            self.log_result("Login After Password Change", False, "Invalid JSON response")
            return False
    
    def test_change_password_invalid_old_password(self):
        """Test password change with invalid old password"""
        print("\n=== Testing Password Change (Invalid Old Password) ===")
        
        # Login again to get fresh token
        login_data = {
            "email": TEST_STUDENT_EMAIL,
            "password": NEW_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
        else:
            self.log_result("Setup for Invalid Password Test", False, "Could not login to get token")
            return False
        
        # Try to change password with wrong old password
        change_data = {
            "old_password": "WrongPassword123",
            "new_password": "AnotherNewPassword123"
        }
        
        response = self.make_request("POST", "/auth/change-password", change_data)
        
        if not response:
            self.log_result("Invalid Old Password Test", False, "No response from change-password endpoint")
            return False
        
        # Should return 400 Bad Request
        if response.status_code == 400:
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", "")
                
                if "invalid" in error_msg.lower() and "old" in error_msg.lower():
                    self.log_result(
                        "Invalid Old Password Test", 
                        True, 
                        "Correctly rejected invalid old password",
                        {"error_message": error_msg}
                    )
                    return True
                else:
                    self.log_result(
                        "Invalid Old Password Test", 
                        False, 
                        f"Wrong error message for invalid old password: {error_msg}"
                    )
                    return False
                    
            except json.JSONDecodeError:
                self.log_result("Invalid Old Password Test", False, "Invalid JSON error response")
                return False
        else:
            self.log_result(
                "Invalid Old Password Test", 
                False, 
                f"Expected 400 status code, got: {response.status_code}"
            )
            return False
    
    def run_all_tests(self):
        """Run all password change modal tests"""
        print("🚀 Starting TutorHub Password Change Modal Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_api_health,
            self.setup_test_student,
            self.test_login_with_must_change_password,
            self.test_change_password_success,
            self.test_login_after_password_change,
            self.test_change_password_invalid_old_password
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                failed += 1
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details'] and "FAIL" in result['status']:
                print(f"   └─ {result['details']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = TutorHubTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)