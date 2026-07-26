from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from courses.models import Course
from groups.models import StudyGroup


class Command(BaseCommand):
    help = 'Seed sample courses and study groups for dashboard.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding courses and groups...'))

        mentors = [
            "Xabibullo Mamadaliyev",
            "Sarvar Sadullayev",
            "Akobir Xoshimov",
            "Shohruh O'rozov",
        ]

        groups = [
            {
                'name': 'BIMUZ-LIRA_1.1',
                'course_title': 'LIRA-binolarning hisobiy yechimi',
                'days': 'Chorshanba - Shanba',
                'time': '09:00',
                'start_date': '2026-07-05',
                'end_date': '2026-07-08',
                'max_students': 6,
                'current_students': 0,
                'price': 2450000,
                'lessons_count': 24,
                'mentor': 'Xabibullo Mamadaliyev',
                'status': 'active',
                'course_hint': 'LIRA',
            },
            {
                'name': 'BIMUZ-LIRA_1.0',
                'course_title': 'LIRA-binolarning hisobiy yechimi',
                'days': 'Seshanba - Juma',
                'time': '09:00',
                'start_date': '2026-07-03',
                'end_date': '2026-07-07',
                'max_students': 6,
                'current_students': 0,
                'price': 2450000,
                'lessons_count': 24,
                'mentor': 'Xabibullo Mamadaliyev',
                'status': 'active',
                'course_hint': 'LIRA',
            },
            {
                'name': 'BIMUz-2.1_KJ',
                'course_title': 'Revit - Qurilish konstruksiyalarini loyihalash',
                'days': 'Shanba - Yakshanba',
                'time': '14:00',
                'start_date': '2026-07-02',
                'end_date': '2026-07-05',
                'max_students': 8,
                'current_students': 0,
                'price': 7500000,
                'lessons_count': 24,
                'mentor': 'Sarvar Sadullayev',
                'status': 'active',
                'course_hint': 'Qurilish konstruksiyalari',
            },
            {
                'name': 'BIMUZ-2.1_AR',
                'course_title': 'Revit - Arxitektura loyihalash',
                'days': 'Shanba - Yakshanba',
                'time': '10:00',
                'start_date': '2026-07-02',
                'end_date': '2026-07-05',
                'max_students': 8,
                'current_students': 1,
                'price': 7500000,
                'lessons_count': 24,
                'mentor': 'Sarvar Sadullayev',
                'status': 'active',
                'course_hint': 'Arxitektura',
            },
            {
                'name': 'FZTH-VK',
                'course_title': 'Muhandislik VK',
                'days': 'Juma - Shanba',
                'time': '19:00',
                'start_date': '2026-07-01',
                'end_date': '2026-09-11',
                'max_students': 8,
                'current_students': 1,
                'price': 5940000,
                'lessons_count': 48,
                'mentor': 'Sarvar Sadullayev',
                'status': 'inactive',
                'course_hint': 'VK',
            },
            {
                'name': 'FZTH-OV',
                'course_title': 'Muhandislik OV',
                'days': 'Dushanba',
                'time': '19:00',
                'start_date': '2026-07-01',
                'end_date': '2027-02-22',
                'max_students': 8,
                'current_students': 2,
                'price': 5940000,
                'lessons_count': 48,
                'mentor': 'Sarvar Sadullayev',
                'status': 'inactive',
                'course_hint': 'OV',
            },
            {
                'name': 'FZTH-KJ',
                'course_title': 'Konstruksiya',
                'days': 'Payshanba - Shanba',
                'time': '19:00',
                'start_date': '2026-07-01',
                'end_date': '2026-08-08',
                'max_students': 8,
                'current_students': 6,
                'price': 5940000,
                'lessons_count': 48,
                'mentor': 'Sarvar Sadullayev',
                'status': 'active',
                'course_hint': 'Konstruksiya',
            },
            {
                'name': 'FZTH-AR',
                'course_title': 'Arxitektura',
                'days': 'Seshanba - Juma',
                'time': '19:00',
                'start_date': '2026-07-01',
                'end_date': '2026-08-07',
                'max_students': 10,
                'current_students': 4,
                'price': 5940000,
                'lessons_count': 48,
                'mentor': 'Sarvar Sadullayev',
                'status': 'active',
                'course_hint': 'Arxitektura',
            },
            {
                'name': 'BIMUZ-2.0_OV',
                'course_title': 'Revit - Isitish, Ventilyatsiya va Konditsioner tizimlarini loyihalash',
                'days': 'Dushanba - Chorshanba - Juma',
                'time': '19:00',
                'start_date': '2026-04-01',
                'end_date': '2026-07-01',
                'max_students': 6,
                'current_students': 6,
                'price': 6630000,
                'lessons_count': 36,
                'mentor': 'Akobir Xoshimov',
                'status': 'active',
                'course_hint': 'Ventilyatsiya',
            },
            {
                'name': 'BIMUZ-2.0_KJ',
                'course_title': 'Revit - Qurilish konstruksiyalarini loyihalash',
                'days': 'Seshanba - Payshanba - Shanba',
                'time': '19:00',
                'start_date': '2026-03-26',
                'end_date': '2026-06-26',
                'max_students': 6,
                'current_students': 3,
                'price': 6037500,
                'lessons_count': 36,
                'mentor': 'Sarvar Sadullayev',
                'status': 'active',
                'course_hint': 'Qurilish konstruksiyalari',
            },
            {
                'name': 'BIMUZ-2.0_AR',
                'course_title': 'Revit - Arxitektura loyihalash',
                'days': 'Dushanba - Chorshanba - Juma',
                'time': '19:00',
                'start_date': '2026-03-11',
                'end_date': '2026-06-11',
                'max_students': 6,
                'current_students': 4,
                'price': 5087500,
                'lessons_count': 30,
                'mentor': "Shohruh O'rozov",
                'status': 'active',
                'course_hint': 'Arxitektura',
            },
        ]

        User = get_user_model()

        created_courses = 0
        for item in groups:
            _, created = Course.objects.get_or_create(
                title=item['course_title'],
                defaults={
                    'description': f"{item['course_title']} kursi",
                    'price': item['price'],
                    'price_formatted': f"{item['price']:,} so'm".replace(',', '.'),
                },
            )
            if created:
                created_courses += 1

        created_mentors = 0
        for full_name in mentors:
            username = full_name.lower().replace("'", '').replace(' ', '.')
            mentor, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'full_name': full_name,
                    'role': 'teacher',
                    'is_active': True,
                },
            )
            if created:
                mentor.set_unusable_password()
                mentor.save(update_fields=['password'])
                created_mentors += 1

        created_groups = 0
        updated_groups = 0
        for item in groups:
            mentor_username = item['mentor'].lower().replace("'", '').replace(' ', '.')
            mentor = User.objects.filter(username=mentor_username).first()
            course = Course.objects.filter(title=item['course_title']).first()
            if course is None:
                course = Course.objects.filter(title__icontains=item['course_hint']).first()
            if course is None:
                self.stdout.write(self.style.WARNING(f"Skipping group {item['name']}: no course found"))
                continue

            defaults = {
                'mentor': mentor,
                'course': course,
                'days': item['days'],
                'time': datetime.strptime(item['time'], '%H:%M').time(),
                'start_date': datetime.strptime(item['start_date'], '%Y-%m-%d').date(),
                'end_date': datetime.strptime(item['end_date'], '%Y-%m-%d').date(),
                'max_students': item['max_students'],
                'current_students': item['current_students'],
                'price': item['price'],
                'lessons_count': item['lessons_count'],
                'status': item['status'],
            }

            _, created = StudyGroup.objects.update_or_create(
                name=item['name'],
                defaults=defaults,
            )
            if created:
                created_groups += 1
            else:
                updated_groups += 1

        self.stdout.write(self.style.SUCCESS(f'Courses created: {created_courses}'))
        self.stdout.write(self.style.SUCCESS(f'Mentors created: {created_mentors}'))
        self.stdout.write(self.style.SUCCESS(f'Groups created: {created_groups}, updated: {updated_groups}'))
