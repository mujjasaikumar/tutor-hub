#!/usr/bin/env python3
"""
Simple test to debug connection issues
"""

import requests
import json

BACKEND_URL = "https://tutorhub-3.preview.emergentagent.com/api"

def test_simple_login():
    print("Testing simple login...")
    
    login_data = {
        "email": "student@test.com",
        "password": "Student@123"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"Response: {json.dumps(data, indent=2)}")
            return data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception during login: {e}")
        return None

def test_change_password(token):
    if not token:
        print("❌ No token available for password change test")
        return False
        
    print("\nTesting password change...")
    
    change_data = {
        "old_password": "Student@123",
        "new_password": "NewPassword123"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/change-password",
            json=change_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Password change successful!")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Password change failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during password change: {e}")
        return False

if __name__ == "__main__":
    # Test API health first
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"API Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"API Health check failed: {e}")
    
    # Test login
    token = test_simple_login()
    
    # Test password change
    test_change_password(token)