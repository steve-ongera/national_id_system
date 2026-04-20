from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import KenyanUser, IDApplication, ApplicationHistory
from django.utils import timezone


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = KenyanUser
        fields = [
            'id_number', 'birth_certificate_no', 'first_name', 'last_name',
            'other_names', 'date_of_birth', 'place_of_birth', 'gender',
            'phone_number', 'email', 'postal_address', 'postal_code',
            'county_of_residence', 'sub_county', 'ward', 'village',
            'house_number', 'nearest_landmark', 'passport_photo',
            'birth_certificate_upload', 'password', 'confirm_password'
        ]
    
    def validate_id_number(self, value):
        if KenyanUser.objects.filter(id_number=value).exists():
            raise serializers.ValidationError("ID Number already registered")
        return value
    
    def validate_birth_certificate_no(self, value):
        if KenyanUser.objects.filter(birth_certificate_no=value).exists():
            raise serializers.ValidationError("Birth Certificate Number already registered")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = KenyanUser(**validated_data)
        user.set_password(password)
        user.has_applied_for_id = True
        user.application_date = timezone.now()
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    id_number = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(id_number=data['id_number'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid ID Number or Password")
        return {'user': user}

class UserProfileSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = KenyanUser
        fields = [
            'id', 'id_number', 'first_name', 'last_name', 'other_names',
            'full_name', 'date_of_birth', 'age', 'place_of_birth', 'gender',
            'phone_number', 'email', 'postal_address', 'postal_code',
            'county_of_residence', 'sub_county', 'ward', 'village',
            'house_number', 'nearest_landmark', 'has_applied_for_id',
            'application_date', 'application_status', 'is_verified',
            'rejection_reason', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class IDApplicationSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)
    
    class Meta:
        model = IDApplication
        fields = '__all__'
        read_only_fields = ['application_number', 'created_at', 'updated_at']

class ApplicationHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ApplicationHistory
        fields = '__all__'