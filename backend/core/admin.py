from django.contrib import admin
from .models import KenyanUser, IDApplication, ApplicationHistory

@admin.register(KenyanUser)
class KenyanUserAdmin(admin.ModelAdmin):
    list_display = ['id_number', 'get_full_name', 'application_status', 'is_verified', 'created_at']
    list_filter = ['application_status', 'is_verified', 'gender', 'county_of_residence']
    search_fields = ['id_number', 'first_name', 'last_name', 'birth_certificate_no']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(IDApplication)
class IDApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'user', 'created_at']
    search_fields = ['application_number', 'user__id_number']

@admin.register(ApplicationHistory)
class ApplicationHistoryAdmin(admin.ModelAdmin):
    list_display = ['application', 'status', 'changed_at']
    list_filter = ['status']