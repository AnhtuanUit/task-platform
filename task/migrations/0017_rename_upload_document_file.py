# Generated by Django 5.0.6 on 2024-07-18 04:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0016_document_alter_attachment_file'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='upload',
            new_name='file',
        ),
    ]
