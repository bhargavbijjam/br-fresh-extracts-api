# store/views.py

from django.db.models import Sum
from rest_framework.generics import ListAPIView,ListCreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Product,Order
from .serializers import ProductSerializer, OrderSerializer, CreateOrderSerializer

class ProductListView(ListAPIView):
    """
    A read-only API endpoint that lists all in-stock products.
    This is what your homepage will use.
    """

    # We only want to show products that are in stock
    queryset = Product.objects.filter(in_stock=True)

    # Tell this view to use the serializer we just created
    serializer_class = ProductSerializer

    # For now, anyone can view the products
    permission_classes = [AllowAny]

class OrderListCreateView(ListCreateAPIView):
    """
    A single endpoint for:
    GET: Listing the user's past orders ("My Orders")
    POST: Creating a new order ("Place Order")
    """
    # This is the magic! This endpoint requires a valid JWT token.
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        # Use a different serializer for POST vs GET
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        # This ensures users can ONLY see their *own* orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Pass the request (which contains the user) 
        # to the serializer's create method
        serializer.save(user=self.request.user)

class AdminAnalyticsView(APIView):
    """
    Returns business metrics for the Admin Dashboard.
    Only accessible by Staff/Superusers.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Calculate Totals
        total_orders = Order.objects.count()
        
        # Sum the 'total_amount' column (handle None if no orders exist)
        revenue_data = Order.objects.aggregate(Sum('total_amount'))
        total_revenue = revenue_data['total_amount__sum'] or 0
        
        # Count orders by status
        pending_orders = Order.objects.filter(status='Pending').count()
        completed_orders = Order.objects.filter(status='Delivered').count()

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
        })