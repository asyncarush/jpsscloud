from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import boto3
from botocore.client import Config
from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel

# MinIO Configuration
MINIO_ENDPOINT = "localhost:9000"  # No http:// prefix for boto3
ACCESS_KEY = "admin"
SECRET_KEY = "admin123"
BUCKET_NAME = "media-storage"

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
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
    config=Config(signature_version="s3v4"),
    region_name="us-east-1"  # Default MinIO region
)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Upload file to MinIO
        content_type = file.content_type or 'application/octet-stream'
        s3_client.upload_fileobj(
            file.file,
            BUCKET_NAME,
            file.filename,
            ExtraArgs={'ContentType': content_type}
        )
        
        # Generate presigned URL
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': file.filename},
            ExpiresIn=3600  # URL expires in 1 hour
        )
        
        return {
            "filename": file.filename,
            "url": url,
            "type": content_type
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/files/")
async def list_files() -> List[dict]:
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        files = []
        
        for obj in response.get('Contents', []):
            # Get file metadata
            head = s3_client.head_object(Bucket=BUCKET_NAME, Key=obj['Key'])
            content_type = head.get('ContentType', 'application/octet-stream')
            
            # Generate presigned URL for viewing
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': obj['Key']
                },
                ExpiresIn=3600  # URL expires in 1 hour
            )
            
            files.append({
                'id': obj['ETag'].strip('"'),
                'name': obj['Key'],
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

# Run server using: uvicorn main:app --reload --host 0.0.0.0 --port 8000
