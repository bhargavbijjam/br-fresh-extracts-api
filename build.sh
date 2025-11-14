#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
echo "Creating superuser..."
cat <<EOF | python manage.py shell
import os
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()
phone = os.environ.get('DJANGO_SUPERUSER_PHONE_NUMBER')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
name = os.environ.get('DJANGO_SUPERUSER_NAME')

if phone and password and name:
    try:
        if not User.objects.filter(phone_number=phone).exists():
            print('Creating superuser...')
            User.objects.create_superuser(
                phone_number=phone,
                password=password,
                name=name
            )
            print('Superuser created successfully.')
        else:
            print('Superuser already exists. Skipping creation.')
    except IntegrityError:
        print('Superuser already exists (IntegrityError). Skipping creation.')
    except Exception as e:
        print(f"An error occurred: {e}")
else:
    print('Superuser environment variables not set. Skipping creation.')
EOF