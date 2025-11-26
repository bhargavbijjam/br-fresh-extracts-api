# accounts/views.py

from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from firebase_admin import auth as firebase_auth
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserProfileSerializer

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# --- 1. CHECK USER VIEW (Fixed) ---
class CheckUserView(APIView):
    """
    Checks if a phone number exists. Handles both +91 and raw numbers.
    """
    permission_classes = [] 

    def post(self, request):
        phone = request.data.get('phone_number')
        if not phone:
            return Response({'error': 'Phone number required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Check exactly as sent
        exists = User.objects.filter(phone_number=phone).exists()
        
        # 2. If not found, check alternatives (Smart Check)
        if not exists:
            if phone.startswith('+91'):
                # Try without country code
                raw_number = phone.replace('+91', '')
                exists = User.objects.filter(phone_number=raw_number).exists()
            else:
                # Try adding country code
                formatted_number = f"+91{phone}"
                exists = User.objects.filter(phone_number=formatted_number).exists()

        return Response({'exists': exists}, status=status.HTTP_200_OK)

# --- 2. PASSWORD LOGIN VIEW ---
class PasswordLoginView(APIView):
    permission_classes = []

    def post(self, request):
        phone = request.data.get('phone_number')
        password = request.data.get('password')

        if not phone or not password:
            return Response({'error': 'Both phone and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Try to find the user (Handle both formats)
            try:
                user = User.objects.get(phone_number=phone)
            except User.DoesNotExist:
                # Try alternate format
                if phone.startswith('+91'):
                    user = User.objects.get(phone_number=phone.replace('+91', ''))
                else:
                    user = User.objects.get(phone_number=f"+91{phone}")

            if user.check_password(password):
                if not user.is_active:
                    return Response({'error': 'Account disabled'}, status=status.HTTP_403_FORBIDDEN)
                
                tokens = get_tokens_for_user(user)
                return Response({
                    'tokens': tokens,
                    'user': {
                        'phone_number': user.phone_number,
                        'name': user.name,
                        'is_profile_complete': user.is_profile_complete
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# --- 3. REGISTER VIEW ---
class FirebaseRegisterView(APIView):
    permission_classes = []

    def post(self, request):
        firebase_token = request.data.get('firebase_token')
        name = request.data.get('name')
        password = request.data.get('password')

        if not firebase_token or not password:
            return Response({'error': 'Token and password required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            phone_number = decoded_token.get('phone_number')

            if not phone_number:
                raise AuthenticationFailed('Invalid Firebase token: No phone found.')

            if User.objects.filter(phone_number=phone_number).exists():
                return Response({'error': 'User already exists.'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create(
                phone_number=phone_number,
                name=name,
                is_profile_complete=True
            )
            user.set_password(password)
            user.save()

            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Account created!',
                'tokens': tokens,
                'user': {
                    'phone_number': user.phone_number,
                    'name': user.name,
                    'is_profile_complete': True
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Reg Error: {e}")
            return Response({'error': 'Registration failed.'}, status=status.HTTP_400_BAD_REQUEST)

# --- 4. RESET PASSWORD VIEW ---
class ResetPasswordView(APIView):
    permission_classes = [] 

    def post(self, request):
        firebase_token = request.data.get('firebase_token')
        new_password = request.data.get('new_password')

        if not firebase_token or not new_password:
            return Response({'error': 'Token and password required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            phone_number = decoded_token.get('phone_number')

            try:
                user = User.objects.get(phone_number=phone_number)
            except User.DoesNotExist:
                raw_number = phone_number.replace('+91', '') 
                user = User.objects.get(phone_number=raw_number)

            user.set_password(new_password)
            user.save()

            return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'Reset failed.'}, status=status.HTTP_400_BAD_REQUEST)

# --- 5. USER PROFILE VIEW ---
class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        serializer.save(is_profile_complete=True)

# --- 6. CHANGE PASSWORD VIEW ---
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'error': 'Wrong old password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated!'}, status=status.HTTP_200_OK)