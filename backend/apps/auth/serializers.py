from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def _create_user(self, validated_data, role=1):
    password = validated_data.pop("password")
    user = User(**validated_data, is_active=True)
    user.set_password(password)
    user.save()
    return user


def _validate_user(attrs):
    email = attrs.get("email")

    if not email:
        raise serializers.ValidationError("Email is required.")

    if email:
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": ("User with this email already exists.")}
            )
    return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name"]



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "password",
        )
        extra_kwargs = {
            "email": {"validators": []},
        }

    def validate(self, attrs):
        return _validate_user(attrs)

    def create(self, validated_data):
        user = _create_user(self, validated_data, role=2)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
