from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import KenyanUser, IDApplication, ApplicationHistory
from .serializers import (
    UserRegistrationSerializer, LoginSerializer, UserProfileSerializer,
    IDApplicationSerializer, ApplicationHistorySerializer
)

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Application submitted successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return KenyanUser.objects.all()
        return KenyanUser.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def application_status(self, request):
        return Response({
            'has_applied': request.user.has_applied_for_id,
            'application_date': request.user.application_date,
            'status': request.user.application_status,
            'rejection_reason': request.user.rejection_reason,
            'is_verified': request.user.is_verified
        })

class IDApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = IDApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return IDApplication.objects.all()
        return IDApplication.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def submit_application(self, request):
        if request.user.has_applied_for_id:
            return Response({'error': 'You have already applied for ID'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save(user=request.user)
            request.user.has_applied_for_id = True
            request.user.application_date = timezone.now()
            request.user.save()
            
            # Create history entry
            ApplicationHistory.objects.create(
                application=application,
                status='PENDING',
                comment='Application submitted',
                changed_by=request.user
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        application = self.get_object()
        new_status = request.data.get('status')
        comment = request.data.get('comment', '')
        
        if new_status:
            application.status = new_status
            application.save()
            
            # Update user's application status
            user = application.user
            user.application_status = new_status
            if new_status == 'REJECTED':
                user.rejection_reason = comment
            user.save()
            
            # Create history entry
            ApplicationHistory.objects.create(
                application=application,
                status=new_status,
                comment=comment,
                changed_by=request.user
            )
            
            return Response({'message': f'Status updated to {new_status}'})
        
        return Response({'error': 'Status is required'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        application = self.get_object()
        history = application.history.all()
        serializer = ApplicationHistorySerializer(history, many=True)
        return Response(serializer.data)