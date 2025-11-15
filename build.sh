#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
echo "Running superuser script..."
cat <<EOF | python manage.py shell
import os
from django.contrib.auth import get_user_model

User = get_user_model()
phone = os.environ.get('DJANGO_SUPERUSER_PHONE_NUMBER')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if phone and password :
    try:
        # Try to find the user
        user = User.objects.get(phone_number=phone)
        
        # If found, update the password
        user.set_password(password)
        user.save()
        print(f"Superuser '{phone}' already exists. Password has been updated.")
        
    except User.DoesNotExist:
        # If not found, create a new one
        print(f"Superuser '{phone}' not found. Creating new superuser...")
        User.objects.create_superuser(
            phone_number=phone,
            password=password,
        )
        print('Superuser created successfully.')
    except Exception as e:
        print(f"An error occurred: {e}")
else:
    print('Superuser environment variables not set. Skipping operation.')
EOF