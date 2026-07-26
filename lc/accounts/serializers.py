from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'phone', 'full_name', 'is_admin', 'is_superuser', 'is_staff']

    def get_is_admin(self, obj):
        return obj.is_admin()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'phone', 'password', 'full_name']

    def create(self, validated_data):
        return CustomUser.objects.create_user(
            username=validated_data['username'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            role='student',
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    identifier = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        attrs = attrs.copy()
        identifier = attrs.get('identifier')
        username_field = self.username_field
        username_value = attrs.get(username_field)

        if isinstance(identifier, str) and identifier.strip() and not username_value:
            attrs[username_field] = identifier.strip()
        elif isinstance(username_value, str):
            attrs[username_field] = username_value.strip()

        return super().validate(attrs)


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'phone',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
