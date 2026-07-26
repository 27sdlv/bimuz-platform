from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lc', '0008_alter_customuser_managers_lesson_homework_task'),
        ('accounts', '0001_initial'),
        ('courses', '0001_initial'),
        ('groups', '0001_initial'),
        ('homework', '0001_initial'),
        ('progress', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.DeleteModel(name='LessonWatchProgress'),
                migrations.DeleteModel(name='Homework'),
                migrations.DeleteModel(name='UserProgress'),
                migrations.DeleteModel(name='Enrollment'),
                migrations.DeleteModel(name='Lesson'),
                migrations.DeleteModel(name='StudyGroup'),
                migrations.DeleteModel(name='Course'),
                migrations.DeleteModel(name='CustomUser'),
            ],
        ),
    ]
