# Generated by Django 5.0.4 on 2024-06-02 19:46

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeapp", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="recipestep",
            name="is_completed",
            field=models.BooleanField(default=False),
        ),
    ]
