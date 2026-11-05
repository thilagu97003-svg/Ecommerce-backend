import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command

def run():
    try:
        print("Migrating database...")
        call_command('migrate')
        print("Loading products fixture...")
        call_command('loaddata', 'products.json')
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == '__main__':
    run()