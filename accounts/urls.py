# accounts/urls.py

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('check-user/', views.CheckUserView.as_view(), name='check-user'),
    path('login/', views.PasswordLoginView.as_view(), name='password-login'),
    path('register/', views.FirebaseRegisterView.as_view(), name='firebase-register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
]