"""
Script to clear old application data and insert fresh data with real timestamps
"""

from myapi.models import Application, User

print("=" * 60)
print("CLEARING OLD APPLICATION DATA")
print("=" * 60)

user = User.objects.first()

if user:
    count = Application.objects.filter(user=user).count()
    if count > 0:
        Application.objects.filter(user=user).delete()
        print(f"✅ Deleted {count} old applications for {user.email}")
    else:
        print(f"No existing applications found for {user.email}")
else:
    print("❌ No users found!")

print("=" * 60)
print("\nNow run: python manage.py insert_sample_data")
print("=" * 60)
