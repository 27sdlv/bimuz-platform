import boto3
import environ
from pathlib import Path

env = environ.Env()
environ.Env.read_env('.env')

print("Access Key:", env('AWS_ACCESS_KEY_ID'))
print("Bucket:", env('AWS_STORAGE_BUCKET_NAME'))
print("Region:", env('AWS_S3_REGION_NAME'))

s3 = boto3.client(
    's3',
    aws_access_key_id=env('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=env('AWS_SECRET_ACCESS_KEY'),
    region_name=env('AWS_S3_REGION_NAME')
)

try:
    response = s3.head_bucket(Bucket=env('AWS_STORAGE_BUCKET_NAME'))
    print("SUCCESS: Bucket exists and you have permission to access it.")
except Exception as e:
    print(f"ERROR accessing bucket: {e}")
    
try:
    response = s3.list_objects_v2(Bucket=env('AWS_STORAGE_BUCKET_NAME'), MaxKeys=1)
    print("SUCCESS: Can list objects.")
except Exception as e:
    print(f"ERROR listing objects: {e}")
