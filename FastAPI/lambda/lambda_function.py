import boto3
import os
import hashlib
import requests
import time
import hmac
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize S3 client
s3 = boto3.client('s3')

# Get the FastAPI endpoint URL and secret key from environment variables
FASTAPI_ENDPOINT = os.getenv('FASTAPI_ENDPOINT')
LAMBDA_SECRET_KEY = os.getenv('LAMBDA_SECRET_KEY')


def lambda_handler(event, context):
    # Parse S3 event to get bucket name and object key
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    file_key = event['Records'][0]['s3']['object']['key']
    # Handle special characters in the file name
    file_key = file_key.replace("+", " ")
    etag = event['Records'][0]['s3']['object']['eTag'].strip(
        '"')  # Remove quotes from eTag

    print(f"Bucket: {bucket_name}, File Key: {file_key}")

    # Generate a presigned URL for the S3 object
    try:
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': file_key},
            ExpiresIn=3600  # URL expires in 1 hour
        )
        print(f"Presigned URL generated: {presigned_url}")
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        raise

    # Generate hash value based on the filename
    filename = os.path.basename(file_key)
    hash_value = hashlib.md5(filename.encode()).hexdigest()

    # Construct the S3 URI
    s3_uri = f"s3://{bucket_name}/{file_key}"

    # Prepare the file info for FastAPI
    file_info = {
        "url": presigned_url,
        "hash": hash_value,
        "s3uri": s3_uri,
        "bucket": bucket_name,
        "key": file_key,
        "etag": etag
    }
    print("Request data being sent to FastAPI:",
          json.dumps(file_info, indent=2))
    # Generate signature for FastAPI request
    timestamp = str(int(time.time()))
    message = timestamp
    signature = hmac.new(LAMBDA_SECRET_KEY.encode(),
                         message.encode(), hashlib.sha256).hexdigest()

    # Prepare headers for FastAPI request
    headers = {
        "Content-Type": "application/json",
        "X-Lambda-Signature": signature,
        "X-Lambda-Timestamp": timestamp
    }

    # Send request to FastAPI
    try:
        response = requests.post(
            FASTAPI_ENDPOINT, json=file_info, headers=headers)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.content}")

        # Raise an exception for bad status codes
        response.raise_for_status()

        print(f"FastAPI response: {response.json()}")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error occurred: {e}")
        print(f"Response content on error: {response.content}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending request to FastAPI: {e}")
        raise

    return {
        'statusCode': 200,
        'body': json.dumps(response.json())
    }
