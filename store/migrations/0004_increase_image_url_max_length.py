from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_category_description_category_icon_category_image_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='image',
            field=models.URLField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.URLField(blank=True, max_length=2000, null=True),
        ),
    ]
