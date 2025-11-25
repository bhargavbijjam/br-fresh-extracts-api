# accounts/views.py

from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView # <-- Added back
from rest_framework.permissions import IsAuthenticated # <-- Added back
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from firebase_admin import auth as firebase_auth
from rest_framework.exceptions import AuthenticationFailed

# Import your serializers (make sure UserProfileSerializer is in serializers.py)
from .serializers import UserProfileSerializer 

User = get_user_model()

# Helper to generate tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# --- 1. CHECK USER VIEW ---
class CheckUserView(APIView):
    """
    Checks if a phone number already exists in our database.
    """
    permission_classes = [] # Public endpoint

    def post(self, request):
        phone = request.data.get('phone_number')
        if not phone:
            return Response({'error': 'Phone number required'}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(phone_number=phone).exists()
        return Response({'exists': exists}, status=status.HTTP_200_OK)


# --- 2. PASSWORD LOGIN VIEW ---
class PasswordLoginView(APIView):
    """
    Standard login using Phone Number and Password.
    """
    permission_classes = []

    def post(self, request):
        phone = request.data.get('phone_number')
        password = request.data.get('password')

        if not phone or not password:
            return Response({'error': 'Both phone and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(phone_number=phone)
            
            # Check the password
            if user.check_password(password):
                if not user.is_active:
                    return Response({'error': 'Account disabled'}, status=status.HTTP_403_FORBIDDEN)
                
                tokens = get_tokens_for_user(user)
                return Response({
                    'tokens': tokens,
                    'user': {
                        'phone_number': user.phone_number,
                        'name': user.name,
                        # We assume profile is complete if they have a password
                        'is_profile_complete': True 
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# --- 3. REGISTER VIEW (With Firebase Verification) ---
class FirebaseRegisterView(APIView):
    """
    Verifies Firebase Token (proof of phone ownership),
    then creates a new user with Name and Password.
    """
    permission_classes = []

    def post(self, request):
        firebase_token = request.data.get('firebase_token')
        name = request.data.get('name')
        password = request.data.get('password')

        if not firebase_token or not password:
            return Response({'error': 'Token and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # A. Verify the token with Google
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            phone_number = decoded_token.get('phone_number')

            if not phone_number:
                raise AuthenticationFailed('Invalid Firebase token: No phone found.')

            # B. Check if user already exists (Safety check)
            if User.objects.filter(phone_number=phone_number).exists():
                return Response({'error': 'User already exists. Please login.'}, status=status.HTTP_400_BAD_REQUEST)

            # C. Create the user
            user = User.objects.create(
                phone_number=phone_number,
                name=name,
                is_profile_complete=True # Since they just filled it out
            )
            
            # D. Set the password (hashes it securely)
            user.set_password(password)
            user.save()

            # E. Generate Tokens
            tokens = get_tokens_for_user(user)

            return Response({
                'message': 'Account created successfully!',
                'tokens': tokens,
                'user': {
                    'phone_number': user.phone_number,
                    'name': user.name,
                    'is_profile_complete': True
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Registration Error: {e}")
            return Response({'error': 'Invalid token or registration failed.'}, status=status.HTTP_400_BAD_REQUEST)


# --- 4. USER PROFILE VIEW (RESTORED) ---
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