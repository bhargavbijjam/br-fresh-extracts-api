# accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
import random
from django.core.cache import cache
from .serializers import SendOTPSerializer, VerifyOTPSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SendOTPView(APIView):
    """
    Takes a phone number, generates a 4-digit OTP,
    stores it, and (for now) prints it to the console.
    """
    permission_classes = [] 
    
    serializer_class = SendOTPSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        phone_number = serializer.validated_data['phone_number']
        otp = str(random.randint(1000, 9999))
        cache.set(phone_number, otp, timeout=300) 
        print(f"--- OTP for {phone_number} is: {otp} ---")
        
        return Response({'message': 'OTP sent successfully.'}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    Takes a phone number and OTP.
    If they match, logs in or creates a user and returns tokens.
    """
    permission_classes = []
    
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone_number = serializer.validated_data['phone_number']
        otp_received = serializer.validated_data['otp']
        otp_stored = cache.get(phone_number)
        
        if otp_stored != otp_received:
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = CustomUser.objects.get_or_create(
            phone_number=phone_number,
            defaults={'name': 'New User'}
        )
        
        cache.delete(phone_number)
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Login successful!',
            'tokens': tokens,
            'user': {
                'phone_number': user.phone_number,
                'name': user.name,
            }
        }, status=status.HTTP_200_OK)