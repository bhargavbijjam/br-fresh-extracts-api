from django.urls import path
from . import views

urlpatterns = [
    # This is our first user-facing API endpoint
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('orders/', views.OrderListCreateView.as_view(), name='order-list-create'),
]