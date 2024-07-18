# Generated by Django 5.0.6 on 2024-07-18 08:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0018_remove_attachment_card'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='file',
            field=models.FileField(upload_to='uploads/'),
        ),
        migrations.RemoveField(
            model_name='card',
            name='attachments',
        ),
        migrations.RemoveField(
            model_name='card',
            name='labels',
        ),
        migrations.AddField(
            model_name='attachment',
            name='card',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='task.card'),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Document',
        ),
    ]
