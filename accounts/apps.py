# accounts/apps.py

import os
from django.apps import AppConfig
import firebase_admin
from firebase_admin import credentials

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # This method runs exactly once when Django starts
        
        # Check if Firebase is already running to avoid errors
        if not firebase_admin._apps:
            # Get the path to the secret file from Render's environment variable
            key_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')
            
            if key_path:
                try:
                    cred = credentials.Certificate(key_path)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase Admin SDK initialized successfully!")
                except Exception as e:
                    print(f"❌ Error initializing Firebase: {e}")
            else:
                print("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY_PATH not found. Firebase skipped (okay for local dev if not using Firebase).")