def configure_s3_storage(env, installed_apps, storages):
    """Switch default file storage to S3 when AWS bucket is configured."""
    bucket_name = env('AWS_STORAGE_BUCKET_NAME', default='')
    use_s3 = env.bool('USE_S3', default=False) or bool(bucket_name)

    if not use_s3 or not bucket_name:
        return False

    if 'storages' not in installed_apps:
        staticfiles_index = installed_apps.index('django.contrib.staticfiles')
        installed_apps.insert(staticfiles_index + 1, 'storages')

    region = env('AWS_S3_REGION_NAME', default='eu-central-1')
    custom_domain = env('AWS_S3_CUSTOM_DOMAIN', default='')

    aws_settings = {
        'AWS_ACCESS_KEY_ID': env('AWS_ACCESS_KEY_ID'),
        'AWS_SECRET_ACCESS_KEY': env('AWS_SECRET_ACCESS_KEY'),
        'AWS_STORAGE_BUCKET_NAME': bucket_name,
        'AWS_S3_REGION_NAME': region,
        'AWS_S3_SIGNATURE_VERSION': 's3v4',
        'AWS_DEFAULT_ACL': None,
        'AWS_S3_FILE_OVERWRITE': False,
        'AWS_QUERYSTRING_AUTH': env.bool('AWS_S3_QUERYSTRING_AUTH', default=False),
        'AWS_S3_OBJECT_PARAMETERS': {
            'CacheControl': 'max-age=86400',
        },
    }

    if custom_domain:
        aws_settings['AWS_S3_CUSTOM_DOMAIN'] = custom_domain

    storages['default'] = {
        'BACKEND': 'storages.backends.s3.S3Storage',
        'OPTIONS': {
            'access_key': env('AWS_ACCESS_KEY_ID'),
            'secret_key': env('AWS_SECRET_ACCESS_KEY'),
            'bucket_name': bucket_name,
            'region_name': region,
            'default_acl': None,
            'file_overwrite': False,
            'querystring_auth': aws_settings['AWS_QUERYSTRING_AUTH'],
            **({'custom_domain': custom_domain} if custom_domain else {}),
        },
    }

    return aws_settings
