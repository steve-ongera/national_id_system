"""
Custom management command to seed initial data for the National ID System
Usage: python manage.py seed_data
"""

import random
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from core.models import KenyanUser, IDApplication, ApplicationHistory

class Command(BaseCommand):
    help = 'Seeds the database with initial data for National ID System'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of test users to create (default: 10)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()
        
        num_users = options['users']
        self.stdout.write(self.style.SUCCESS(f'Seeding {num_users} users...'))
        
        # Create admin user
        self.create_admin_user()
        
        # Create test users with different application statuses
        self.create_test_users(num_users)
        
        # Create specific test scenarios
        self.create_specific_test_scenarios()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))

    def clear_data(self):
        """Clear existing data from the database"""
        self.stdout.write('Clearing existing data...')
        ApplicationHistory.objects.all().delete()
        IDApplication.objects.all().delete()
        KenyanUser.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Data cleared successfully!'))

    def create_admin_user(self):
        """Create superuser/admin account"""
        
        # Check if admin already exists
        if KenyanUser.objects.filter(id_number='12345678').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return
        
        try:
            admin = KenyanUser.objects.create_user(
                id_number='12345678',
                password='admin123',
                birth_certificate_no='1234567890',
                first_name='Admin',
                last_name='User',
                other_names='System',
                date_of_birth=datetime.date(1985, 1, 1),
                place_of_birth='Nairobi',
                gender='M',
                phone_number='0712345678',
                email='admin@nid.go.ke',
                postal_address='P.O. Box 12345',
                postal_code='00100',
                county_of_residence='Nairobi',
                sub_county='Nairobi Central',
                ward='CBD',
                village='Town',
                house_number='123',
                nearest_landmark='Huduma Centre',
                is_active=True,
                is_staff=True,
                is_superuser=True,
                is_verified=True,
                has_applied_for_id=True,
                application_status='APPROVED'
            )
            
            # Create ID application for admin
            self.create_id_application(admin, 'APPROVED')
            
            self.stdout.write(self.style.SUCCESS(f'Admin user created: ID: 12345678, Password: admin123'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin user: {str(e)}'))

    def create_test_users(self, num_users):
        """Create test users with various application statuses"""
        
        first_names = ['James', 'Mary', 'John', 'Grace', 'David', 'Esther', 'Paul', 'Sarah', 'Peter', 'Ruth', 
                       'Joseph', 'Elizabeth', 'Daniel', 'Catherine', 'Samuel', 'Ann', 'George', 'Jane', 'Michael', 'Lucy']
        
        last_names = ['Mwangi', 'Otieno', 'Okoth', 'Njeri', 'Wanjiku', 'Mutua', 'Kipchoge', 'Kariuki', 
                     'Omondi', 'Chebet', 'Maina', 'Achieng', 'Kamau', 'Atieno', 'Njuguna', 'Akinyi']
        
        counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 
                   'Uasin Gishu', 'Meru', 'Kilifi', 'Kakamega', 'Bungoma', 'Busia', 'Turkana']
        
        sub_counties = ['Central', 'East', 'North', 'South', 'West', 'Town', 'Rural', 'Urban']
        
        wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E']
        
        statuses = ['PENDING', 'VERIFIED', 'PROCESSING', 'APPROVED', 'REJECTED', 'READY', 'COLLECTED']
        status_weights = [0.3, 0.15, 0.15, 0.15, 0.1, 0.1, 0.05]  # Probability distribution
        
        created_count = 0
        attempted = 0
        
        while created_count < num_users and attempted < num_users * 2:  # Avoid infinite loop
            attempted += 1
            
            # Generate unique ID number (8 digits)
            id_number = str(random.randint(10000000, 99999999))
            if KenyanUser.objects.filter(id_number=id_number).exists():
                continue
            
            # Generate unique birth certificate number (10 digits)
            birth_cert_no = str(random.randint(1000000000, 9999999999))
            if KenyanUser.objects.filter(birth_certificate_no=birth_cert_no).exists():
                continue
            
            # Random user data
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            gender = random.choice(['M', 'F'])
            
            # Generate date of birth (age between 18 and 65)
            years_ago = random.randint(18, 65)
            date_of_birth = datetime.date.today() - datetime.timedelta(days=years_ago*365)
            date_of_birth = date_of_birth - datetime.timedelta(days=random.randint(0, 364))
            
            # Phone number (starts with 07)
            phone_number = f"07{random.randint(10000000, 99999999)}"
            
            # Email
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@example.com"
            
            # Determine if user has applied for ID
            has_applied = random.choice([True, False])
            
            # If has applied, choose status based on weights
            if has_applied:
                application_status = random.choices(statuses, weights=status_weights)[0]
                application_date = timezone.now() - datetime.timedelta(days=random.randint(1, 90))
                is_verified = application_status in ['VERIFIED', 'PROCESSING', 'APPROVED', 'READY', 'COLLECTED']
            else:
                application_status = 'PENDING'
                application_date = None
                is_verified = False
            
            try:
                # Create user using create_user method
                user = KenyanUser.objects.create_user(
                    id_number=id_number,
                    password=birth_cert_no,  # Password is birth certificate number
                    birth_certificate_no=birth_cert_no,
                    first_name=first_name,
                    last_name=last_name,
                    other_names=random.choice(['', 'Mwanaisha', 'Wanjiru', 'Odhiambo']),
                    date_of_birth=date_of_birth,
                    place_of_birth=random.choice(counties),
                    gender=gender,
                    phone_number=phone_number,
                    email=email,
                    postal_address=f'P.O. Box {random.randint(100, 9999)}',
                    postal_code=random.choice(['00100', '00200', '80100', '40100']),
                    county_of_residence=random.choice(counties),
                    sub_county=random.choice(sub_counties),
                    ward=random.choice(wards),
                    village=f'Village {random.randint(1, 50)}',
                    house_number=str(random.randint(1, 500)),
                    nearest_landmark=random.choice(['Market', 'School', 'Church', 'Hospital', 'Police Station']),
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                    is_verified=is_verified,
                    has_applied_for_id=has_applied,
                    application_date=application_date,
                    application_status=application_status,
                )
                
                # Add rejection reason if status is REJECTED
                if application_status == 'REJECTED':
                    rejection_reasons = [
                        'Invalid birth certificate number',
                        'Incomplete documentation',
                        'Age verification failed',
                        'Discrepancy in personal information',
                        'Missing passport photo',
                        'Invalid phone number provided',
                        'Address verification failed'
                    ]
                    user.rejection_reason = random.choice(rejection_reasons)
                    user.save()
                
                # Create ID application if user has applied
                if has_applied:
                    application = self.create_id_application(user, application_status)
                    
                    # Create history entries
                    self.create_application_history(application, user, application_status)
                
                created_count += 1
                
                # Print progress
                if created_count % 5 == 0:
                    self.stdout.write(f'Created {created_count} users...')
                    
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Skipped user {id_number}: {str(e)}'))
                continue
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} test users'))
    
    def create_id_application(self, user, status):
        """Create ID application for a user"""
        
        # Check if application already exists
        if IDApplication.objects.filter(user=user).exists():
            return IDApplication.objects.get(user=user)
        
        marital_statuses = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
        marital_weights = [0.6, 0.3, 0.05, 0.05]
        
        occupations = ['Student', 'Teacher', 'Engineer', 'Doctor', 'Business', 'Farmer', 'Unemployed', 'Driver', 'Nurse', 'Accountant']
        
        application = IDApplication.objects.create(
            user=user,
            parents_name=f"{random.choice(['John', 'Peter', 'James', 'David', 'Michael'])} {user.last_name} & "
                        f"{random.choice(['Mary', 'Jane', 'Ann', 'Sarah', 'Elizabeth'])} {user.last_name}",
            marital_status=random.choices(marital_statuses, weights=marital_weights)[0],
            occupation=random.choice(occupations),
            employer_name=random.choice(['Government', 'Private Company', 'Self Employed', 'NGO', 'Not Employed']),
            is_declaration_signed=True,
            declaration_date=user.application_date if user.application_date else timezone.now()
        )
        
        # Set status if different from default
        if status != 'PENDING':
            application.status = status
            application.save()
        
        return application
    
    def create_application_history(self, application, user, final_status):
        """Create history entries for application status changes"""
        
        # Status flow based on final status
        status_flow = {
            'PENDING': ['PENDING'],
            'VERIFIED': ['PENDING', 'VERIFIED'],
            'PROCESSING': ['PENDING', 'VERIFIED', 'PROCESSING'],
            'APPROVED': ['PENDING', 'VERIFIED', 'PROCESSING', 'APPROVED'],
            'REJECTED': ['PENDING', 'REJECTED'],
            'READY': ['PENDING', 'VERIFIED', 'PROCESSING', 'APPROVED', 'READY'],
            'COLLECTED': ['PENDING', 'VERIFIED', 'PROCESSING', 'APPROVED', 'READY', 'COLLECTED']
        }
        
        comments = {
            'PENDING': 'Application submitted successfully',
            'VERIFIED': 'Documents verified by registration officer',
            'PROCESSING': 'Application is being processed',
            'APPROVED': 'Application has been approved',
            'REJECTED': 'Application rejected due to discrepancies',
            'READY': 'ID card is ready for collection',
            'COLLECTED': 'ID card collected by applicant'
        }
        
        flow = status_flow.get(final_status, ['PENDING'])
        
        for i, status in enumerate(flow):
            # Create timestamp with progression
            timestamp = application.created_at + datetime.timedelta(days=i * random.randint(1, 5))
            
            ApplicationHistory.objects.create(
                application=application,
                status=status,
                comment=comments.get(status, f'Status updated to {status}'),
                changed_by=user if i == 0 else None,  # First change by user, rest by system/admin
                changed_at=timestamp
            )
    
    def create_specific_test_scenarios(self):
        """Create specific test scenarios for edge cases"""
        
        # 1. User with incomplete application (hasn't applied yet)
        if not KenyanUser.objects.filter(id_number='99999999').exists():
            try:
                incomplete_user = KenyanUser.objects.create_user(
                    id_number='99999999',
                    password='9999999999',
                    birth_certificate_no='9999999999',
                    first_name='Test',
                    last_name='Incomplete',
                    other_names='User',
                    date_of_birth=datetime.date(2000, 1, 1),
                    place_of_birth='Nairobi',
                    gender='M',
                    phone_number='0712345678',
                    email='incomplete@example.com',
                    county_of_residence='Nairobi',
                    sub_county='Central',
                    ward='CBD',
                    has_applied_for_id=False,
                    application_status='PENDING'
                )
                self.stdout.write(self.style.SUCCESS('Created test user: Incomplete application (ID: 99999999)'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not create incomplete user: {str(e)}'))
        
        # 2. User with rejected application
        if not KenyanUser.objects.filter(id_number='88888888').exists():
            try:
                rejected_user = KenyanUser.objects.create_user(
                    id_number='88888888',
                    password='8888888888',
                    birth_certificate_no='8888888888',
                    first_name='Test',
                    last_name='Rejected',
                    other_names='User',
                    date_of_birth=datetime.date(2002, 5, 15),
                    place_of_birth='Mombasa',
                    gender='F',
                    phone_number='0723456789',
                    email='rejected@example.com',
                    county_of_residence='Mombasa',
                    sub_county='Mvita',
                    ward='Tononoka',
                    has_applied_for_id=True,
                    application_date=timezone.now() - datetime.timedelta(days=30),
                    application_status='REJECTED',
                    rejection_reason='Age verification failed - Birth certificate does not match records'
                )
                
                application = self.create_id_application(rejected_user, 'REJECTED')
                self.create_application_history(application, rejected_user, 'REJECTED')
                self.stdout.write(self.style.SUCCESS('Created test user: Rejected application (ID: 88888888)'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not create rejected user: {str(e)}'))
        
        # 3. User with approved and ready for collection
        if not KenyanUser.objects.filter(id_number='77777777').exists():
            try:
                ready_user = KenyanUser.objects.create_user(
                    id_number='77777777',
                    password='7777777777',
                    birth_certificate_no='7777777777',
                    first_name='Test',
                    last_name='Ready',
                    other_names='User',
                    date_of_birth=datetime.date(1998, 10, 20),
                    place_of_birth='Kisumu',
                    gender='M',
                    phone_number='0734567890',
                    email='ready@example.com',
                    county_of_residence='Kisumu',
                    sub_county='Kisumu Central',
                    ward='Milimani',
                    has_applied_for_id=True,
                    application_date=timezone.now() - datetime.timedelta(days=45),
                    application_status='READY',
                    is_verified=True
                )
                
                application = self.create_id_application(ready_user, 'READY')
                self.create_application_history(application, ready_user, 'READY')
                self.stdout.write(self.style.SUCCESS('Created test user: Ready for collection (ID: 77777777)'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not create ready user: {str(e)}'))
        
        # 4. User with collected ID
        if not KenyanUser.objects.filter(id_number='66666666').exists():
            try:
                collected_user = KenyanUser.objects.create_user(
                    id_number='66666666',
                    password='6666666666',
                    birth_certificate_no='6666666666',
                    first_name='Test',
                    last_name='Collected',
                    other_names='User',
                    date_of_birth=datetime.date(1995, 3, 10),
                    place_of_birth='Nakuru',
                    gender='F',
                    phone_number='0745678901',
                    email='collected@example.com',
                    county_of_residence='Nakuru',
                    sub_county='Nakuru East',
                    ward='Kaptembwo',
                    has_applied_for_id=True,
                    application_date=timezone.now() - datetime.timedelta(days=60),
                    application_status='COLLECTED',
                    is_verified=True
                )
                
                application = self.create_id_application(collected_user, 'COLLECTED')
                self.create_application_history(application, collected_user, 'COLLECTED')
                self.stdout.write(self.style.SUCCESS('Created test user: ID Collected (ID: 66666666)'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not create collected user: {str(e)}'))