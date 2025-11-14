# store/admin.py

from django.contrib import admin
from .models import Category, Product, Order, OrderItem

# This lets you edit OrderItems from the Order admin page
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0 # Don't show extra blank forms
    readonly_fields = ('product', 'quantity', 'price_at_time')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('user', 'total_amount', 'payment_mode') # Make them uneditable

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'in_stock')
    list_filter = ('category', 'in_stock')
    search_fields = ('name', 'description')

# Register the other simple models
admin.site.register(Category)