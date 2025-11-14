#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
echo "Creating/Updating superuser..."
cat <<EOF | python manage.py shell
import os
from django.contrib.auth import get_user_model

User = get_user_model()
phone = os.environ.get('DJANGO_SUPERUSER_PHONE_NUMBER')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
name = os.environ.get('DJANGO_SUPERUSER_NAME')

if phone and password and name:
    try:
        user = User.objects.get(phone_number=phone)
        user.set_password(password)
        user.save()
        print(f"Superuser '{phone}' already existed. Password has been updated.")
    except User.DoesNotExist:
        print(f"Superuser '{phone}' not found. Creating new superuser...")
        User.objects.create_superuser(
            phone_number=phone,
            password=password,
            name=name
        )
        print('Superuser created successfully.')
    except Exception as e:
        print(f"An error occurred: {e}")
else:
    print('Superuser environment variables not set. Skipping operation.')
EOF