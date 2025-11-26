#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files (Ignore missing map files to fix Whitenoise error)
python manage.py collectstatic --no-input --ignore *.map

# Run database migrations
python manage.py migrate

# Create OR Update superuser
echo "Running superuser script..."
cat <<EOF | python manage.py shell
import os
from django.contrib.auth import get_user_model

User = get_user_model()
phone = os.environ.get('DJANGO_SUPERUSER_PHONE_NUMBER')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if phone and password:
    try:
        user = User.objects.get(phone_number=phone)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Superuser '{phone}' found. Password and staff status updated.")
    except User.DoesNotExist:
        print(f"Superuser '{phone}' not found. Creating new superuser...")
        User.objects.create_superuser(
            phone_number=phone,
            password=password,
            name='Admin'
        )
        print('Superuser created successfully.')
    except Exception as e:
        print(f"An error occurred: {e}")
else:
    print('Phone number or password environment variables not set. Skipping operation.')
EOF