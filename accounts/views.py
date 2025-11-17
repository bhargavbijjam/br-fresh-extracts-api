# accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
import random
from django.core.cache import cache
import os
from twilio.rest import Client
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from .serializers import UserProfileSerializer
from .serializers import SendOTPSerializer, VerifyOTPSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SendOTPView(APIView):
    permission_classes = [] 
    serializer_class = SendOTPSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone_number = serializer.validated_data['phone_number']

        # 1. Generate OTP
        otp = str(random.randint(1000, 9999))

        # 2. Save OTP to cache for 5 minutes
        cache.set(phone_number, otp, timeout=300) 

        # --- 3. SEND OTP WITH TWILIO ---
        try:
            # Get Twilio credentials from environment
            account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
            auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
            from_number = os.environ.get('TWILIO_FROM_NUMBER')

            if not all([account_sid, auth_token, from_number]):
                print("--- TWILIO ENV VARS NOT SET. PRINTING OTP ---")
                print(f"--- OTP for {phone_number} is: {otp} ---")
            else:
                client = Client(account_sid, auth_token)

                # IMPORTANT: Add the country code (e.g., +91 for India)
                # if it's not already on the phone number.
                to_number = f"+91{phone_number}" 

                message = client.messages.create(
                    body=f"Your BR Fresh Extracts OTP is: {otp}",
                    from_=from_number,
                    to=to_number
                )
                print(f"OTP sent to {to_number} (SID: {message.sid})")

        except Exception as e:
            print(f"Error sending SMS: {e}")
            # Don't crash, just print OTP for testing
            print(f"--- OTP for {phone_number} is: {otp} ---")
        # -------------------------------

        return Response({'message': 'OTP sent successfully.'}, status=status.HTTP_200_OK)

class UserProfileView(RetrieveUpdateAPIView):
    """
    A protected view for getting and updating the
    logged-in user's profile (name and address).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        # Returns the user object for the logged-in user
        return self.request.user

    def perform_update(self, serializer):
        # When they update, we mark their profile as complete
        serializer.save(is_profile_complete=True)
        
class VerifyOTPView(APIView):
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
            defaults={'name': ''}
        )

        cache.delete(phone_number)
        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Login successful!',
            'tokens': tokens,
            'user': {
                'phone_number': user.phone_number,
                'name': user.name,
                'is_profile_complete': user.is_profile_complete,
            }
        }, status=status.HTTP_200_OK)