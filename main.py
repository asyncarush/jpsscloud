import hashlib
from fastapi import FastAPI, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import boto3
from botocore.client import Config
from datetime import datetime
from typing import List
import re
import json

# MinIO Configuration
MINIO_ENDPOINT = "localhost:9000"
ACCESS_KEY = "admin"
SECRET_KEY = "admin123"
ROOT_BUCKET = "media-storage"

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

# MinIO Client
s3_client = boto3.client(
    "s3",
    endpoint_url=f"http://{MINIO_ENDPOINT}",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    region_name="us-east-1"
)

# Ensure root bucket exists
def ensure_root_bucket():
    try:
        s3_client.head_bucket(Bucket=ROOT_BUCKET)
    except s3_client.exceptions.ClientError:
        s3_client.create_bucket(Bucket=ROOT_BUCKET)

@app.on_event("startup")
async def startup_event():
    ensure_root_bucket()

def sanitize_folder_name(user_id: str) -> str:
    sanitized = re.sub(r'[^a-z0-9-]', '-', user_id.lower())
    sanitized = re.sub(r'-{2,}', '-', sanitized)
    sanitized = sanitized.strip('-')
    if len(sanitized) < 3:
        sanitized = f"id-{sanitized}"
    return sanitized

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Header(...)
):
    try:
        user_folder = sanitize_folder_name(user_id)
        object_key = f"{user_folder}/{file.filename}"
        content_type = file.content_type or 'application/octet-stream'

        s3_client.upload_fileobj(
            file.file,
            ROOT_BUCKET,
            object_key,
            ExtraArgs={'ContentType': content_type}
        )

        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': ROOT_BUCKET, 'Key': object_key},
            ExpiresIn=3600
        )

        return {
            "filename": file.filename,
            "url": url,
            "type": content_type,
            "folder": user_folder
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/files/")
async def list_files(
    user_id: str = Header(...)
) -> List[dict]:
    try:
        user_folder = sanitize_folder_name(user_id)

        response = s3_client.list_objects_v2(
            Bucket=ROOT_BUCKET,
            Prefix=f"{user_folder}/"
        )

        files = []
        for obj in response.get('Contents', []):
            head = s3_client.head_object(Bucket=ROOT_BUCKET, Key=obj['Key'])
            content_type = head.get('ContentType', 'application/octet-stream')
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': ROOT_BUCKET, 'Key': obj['Key']},
                ExpiresIn=3600
            )
            filename = obj['Key'].split('/')[-1]

            files.append({
                'id': obj['ETag'].strip('"'),
                'name': filename,
                'size': obj['Size'],
                'type': content_type,
                'preview': url if content_type.startswith('image/') else None,
                'url': url,
                'uploadedAt': obj['LastModified'].isoformat()
            })

        return files
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
async def root():
    return {"message": "Storage server is running"}
