from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator
from django.utils import timezone

class KenyanUserManager(BaseUserManager):
    def create_user(self, id_number, password=None, **extra_fields):
        if not id_number:
            raise ValueError('ID Number is required')
        
        # Validate ID number format (8 digits)
        if not id_number.isdigit() or len(id_number) != 8:
            raise ValueError('ID Number must be 8 digits')
        
        user = self.model(id_number=id_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, id_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('has_applied_for_id', True)
        
        return self.create_user(id_number, password, **extra_fields)

class KenyanUser(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    COUNTY_CHOICES = [
        ('Nairobi', 'Nairobi'), ('Mombasa', 'Mombasa'), ('Kisumu', 'Kisumu'),
        ('Nakuru', 'Nakuru'), ('Kiambu', 'Kiambu'), ('Machakos', 'Machakos'),
        # Add all 47 counties
    ]
    
    id_number = models.CharField(
        max_length=8,
        unique=True,
        validators=[
            RegexValidator(r'^\d{8}$', 'ID Number must be 8 digits'),
        ],
        verbose_name='ID Number'
    )
    
    birth_certificate_no = models.CharField(
        max_length=10,
        unique=True,
        validators=[
            RegexValidator(r'^\d{10}$', 'Birth Certificate Number must be 10 digits'),
        ],
        verbose_name='Birth Certificate Number'
    )
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    other_names = models.CharField(max_length=100, blank=True)
    
    date_of_birth = models.DateField()
    place_of_birth = models.CharField(max_length=200)
    
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # Contact Information
    phone_number = models.CharField(
        max_length=12,
        validators=[
            RegexValidator(r'^07\d{8}$', 'Phone number must start with 07 and be 10 digits'),
        ]
    )
    email = models.EmailField(blank=True)
    postal_address = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    
    # Location Details
    county_of_residence = models.CharField(max_length=50, choices=COUNTY_CHOICES)
    sub_county = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    village = models.CharField(max_length=100, blank=True)
    
    # Physical Address
    house_number = models.CharField(max_length=50, blank=True)
    nearest_landmark = models.CharField(max_length=200, blank=True)
    
    # Documents
    passport_photo = models.ImageField(upload_to='passport_photos/', null=True, blank=True)
    birth_certificate_upload = models.FileField(upload_to='birth_certificates/', null=True, blank=True)
    
    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    has_applied_for_id = models.BooleanField(default=False)
    
    # Application tracking
    application_date = models.DateTimeField(null=True, blank=True)
    application_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('VERIFIED', 'Verified'),
            ('PROCESSING', 'Processing'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('READY', 'Ready for Collection'),
            ('COLLECTED', 'Collected'),
        ],
        default='PENDING'
    )
    
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'id_number'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'date_of_birth', 'birth_certificate_no']
    
    objects = KenyanUserManager()
    
    class Meta:
        verbose_name = 'Kenyan User'
        verbose_name_plural = 'Kenyan Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.id_number} - {self.first_name} {self.last_name}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        return self.first_name
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

class IDApplication(models.Model):
    user = models.OneToOneField(KenyanUser, on_delete=models.CASCADE, related_name='id_application')
    application_number = models.CharField(max_length=20, unique=True)
    
    # Additional application details
    parents_name = models.CharField(max_length=200)
    marital_status = models.CharField(
        max_length=20,
        choices=[
            ('SINGLE', 'Single'),
            ('MARRIED', 'Married'),
            ('DIVORCED', 'Divorced'),
            ('WIDOWED', 'Widowed'),
        ]
    )
    
    occupation = models.CharField(max_length=100, blank=True)
    employer_name = models.CharField(max_length=200, blank=True)
    
    # Declaration
    is_declaration_signed = models.BooleanField(default=False)
    declaration_date = models.DateTimeField(null=True, blank=True)
    
    # Processing
    processed_by = models.ForeignKey(
        'KenyanUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_applications'
    )
    processed_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Application {self.application_number} - {self.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.application_number:
            import random
            import datetime
            year = datetime.datetime.now().year
            random_num = random.randint(10000, 99999)
            self.application_number = f"ID/{year}/{random_num}"
        super().save(*args, **kwargs)

class ApplicationHistory(models.Model):
    application = models.ForeignKey(IDApplication, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=20)
    comment = models.TextField(blank=True)
    changed_by = models.ForeignKey(KenyanUser, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Application Histories'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.application.application_number} - {self.status}"