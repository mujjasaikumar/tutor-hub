#!/usr/bin/env python3
"""
Complete Password Change Modal Flow Test
"""

import requests
import json

BACKEND_URL = "https://tutorhub-3.preview.emergentagent.com/api"

def test_complete_flow():
    print("🚀 Testing Complete Password Change Modal Flow")
    print("=" * 60)
    
    # Step 1: Login with original password
    print("\n1️⃣ Testing initial login with must_change_password=true")
    login_data = {
        "email": "student@test.com",
        "password": "NewPassword123"  # Using the new password from previous test
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print("❌ Initial login failed, resetting password...")
        # Reset password back to original for testing
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from passlib.context import CryptContext
        
        async def reset_password():
            client = AsyncIOMotorClient('mongodb://localhost:27017')
            db = client['tutorhub_db']
            pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
            hashed_password = pwd_context.hash('Student@123')
            
            await db.users.update_one(
                {'email': 'student@test.com'},
                {'$set': {'password': hashed_password, 'must_change_password': True}}
            )
            client.close()
        
        asyncio.run(reset_password())
        
        # Try login again
        login_data["password"] = "Student@123"
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        must_change = data.get("must_change_password", False)
        token = data["access_token"]
        
        print(f"✅ Login successful")
        print(f"   must_change_password: {must_change}")
        print(f"   user_id: {data['user']['id']}")
        
        if not must_change:
            print("⚠️  Warning: must_change_password is False, but should be True for this test")
    else:
        print(f"❌ Login failed: {response.status_code}")
        try:
            print(f"   Error: {response.json()}")
        except:
            print(f"   Raw: {response.text}")
        return False
    
    # Step 2: Change password
    print("\n2️⃣ Testing password change")
    change_data = {
        "old_password": "Student@123",
        "new_password": "NewPassword123"
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/change-password",
        json=change_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Password change successful: {data['message']}")
    else:
        print(f"❌ Password change failed: {response.status_code}")
        try:
            print(f"   Error: {response.json()}")
        except:
            print(f"   Raw: {response.text}")
        return False
    
    # Step 3: Login with new password
    print("\n3️⃣ Testing login with new password")
    login_data = {
        "email": "student@test.com",
        "password": "NewPassword123"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        must_change = data.get("must_change_password", None)
        
        print(f"✅ Login with new password successful")
        print(f"   must_change_password: {must_change}")
        
        if must_change == False:
            print("✅ must_change_password correctly set to False after password change")
        else:
            print(f"❌ must_change_password should be False, got: {must_change}")
            return False
    else:
        print(f"❌ Login with new password failed: {response.status_code}")
        try:
            print(f"   Error: {response.json()}")
        except:
            print(f"   Raw: {response.text}")
        return False
    
    # Step 4: Test invalid old password
    print("\n4️⃣ Testing password change with invalid old password")
    change_data = {
        "old_password": "WrongPassword123",
        "new_password": "AnotherPassword123"
    }
    
    response = requests.post(
        f"{BACKEND_URL}/auth/change-password",
        json=change_data,
        headers={"Authorization": f"Bearer {data['access_token']}"}
    )
    
    if response.status_code == 400:
        error_data = response.json()
        error_msg = error_data.get("detail", "")
        print(f"✅ Correctly rejected invalid old password")
        print(f"   Error message: {error_msg}")
    else:
        print(f"❌ Should have rejected invalid old password, got: {response.status_code}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED! Password change modal flow is working correctly.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    test_complete_flow()