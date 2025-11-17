from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    # This shows the columns in the user list
    list_display = ('phone_number', 'name', 'is_staff', 'is_active')

    # This adds a search box
    search_fields = ('phone_number', 'name')

    # This adds filters on the right side
    list_filter = ('is_staff', 'is_active')