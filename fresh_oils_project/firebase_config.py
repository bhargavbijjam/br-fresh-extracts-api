# fresh_oils_project/firebase_config.py
import os
import firebase_admin
from firebase_admin import credentials

# Get the path to the secret file from the environment variable
# Render set this for us when we uploaded the file
key_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')

if key_path:
    try:
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
else:
    print("FIREBASE_SERVICE_ACCOUNT_KEY_PATH not set. Firebase Admin not initialized.")