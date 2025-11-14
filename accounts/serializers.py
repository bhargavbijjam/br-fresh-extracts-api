from rest_framework import serializers

class SendOTPSerializer(serializers.Serializer):
    """
    Serializer to validate the input for sending an OTP.
    """
    phone_number = serializers.CharField(max_length=15)

    # We're just using this to define the input, 
    # so no create() or update() methods are needed.


class VerifyOTPSerializer(serializers.Serializer):
    """
    Serializer to validate the input for verifying an OTP.
    """
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=4)