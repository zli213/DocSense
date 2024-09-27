# app.py
import concurrent.futures
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks, Header, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from pinecone import Pinecone
from pinecone_text.sparse import BM25Encoder
import requests
from langchain_unstructured import UnstructuredLoader
import asyncpg
import hmac
import hashlib
import time
import boto3
import asyncio
import sys
import json
from datetime import datetime
import pickle
from urllib.parse import urlparse

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
else:
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)
# Initialize FastAPI application
app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow sources, assuming Next.js is running on port 3000
    allow_origins=[os.getenv('NextJs_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Asynchronous database connection function


async def get_db():
    # Get DATABASE_URL
    database_url = os.getenv('DATABASE_URL01')
    print(os.getenv('DATABASE_URL01'))

    # Parse the URL
    result = urlparse(database_url)

    # Extract necessary information
    user = result.username
    password = result.password
    database = result.path.lstrip('/')
    host = result.hostname
    port = result.port

    # Connect to the database
    conn = await asyncpg.connect(
        user=user,
        password=password,
        database=database,
        host=host,
        port=port,
        ssl='require'  # Ensure SSL connection
    )
    return conn
# Define data models


class FileInfo(BaseModel):
    url: str
    hash: str
    s3uri: str
    bucket: str
    key: str
    etag: str


class Question(BaseModel):
    text: str


# Define the directory and ensure it exists
bm25_model_dir = "./FastAPI"
os.makedirs(bm25_model_dir, exist_ok=True)

# Define the file path for saving the BM25 model
bm25_model_file = os.path.join(bm25_model_dir, "bm25_model.pkl")

# Function to save the BM25 model


def save_bm25_model(bm25_model):
    with open(bm25_model_file, "wb") as f:
        pickle.dump(bm25_model, f)
    print(f"BM25 model saved to {bm25_model_file}")


# Initialize environment variables
openai_api_key = os.getenv('AZURE_OPENAI_API_KEY')
azure_openai_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
azure_openai_deployment_name = "gpt-4o-mini"
print("azure_openai_deployment_name is what:", azure_openai_deployment_name)
os.environ["OPENAI_API_VERSION"] = "2024-07-18"
pinecone_api_key = os.getenv('PINECONE_API_KEY')
pinecone_index_name = os.getenv('PINECONE_INDEX')
lambda_secret_key = os.getenv('LAMBDA_SECRET_KEY')
# Define topic tags and sub tags
topic_tags = ["medical", "it", "hr", "support", "legal", "financial"]
sub_tags = ["note", "meeting minutes", "research paper", "notice", "contract",
            "attendance record", "invoice", "order", "tax document", "textbook", "guidelines", "manual"]
security_levels = ["G0", "G1", "S0", "S1", "S2", "S3"]

# Initialize Pinecone client
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index(pinecone_index_name)

# Initialize Azure OpenAI embeddings model
embeddings_model = AzureOpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=openai_api_key,
    azure_endpoint=azure_openai_endpoint,
    openai_api_version="2023-05-15"
)

# Initialize Azure OpenAI chat model
llm = AzureChatOpenAI(
    azure_deployment=azure_openai_deployment_name,
    api_key=openai_api_key,
    api_version="2023-03-15-preview",
    azure_endpoint=azure_openai_endpoint,
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

# Initialize BM25 encoder
bm25 = BM25Encoder()
print("BM25Encoder initialized successfully.")


def extract_security_level(path_parts):
    security_level = "G0"
    for part in path_parts:
        if part in security_levels:
            return part
        elif part in topic_tags:
            security_level = "G1"
    return security_level


def generate_summary_and_classify(documents, file_info, security_level):
    combined_text = "\n\n".join([doc.page_content for doc in documents])
    messages = [
        ("system", "You are an expert assistant specialized in document classification and summarization."),
        ("human",
         f"Please summarize the following text in no more than 150 words. Additionally, based on the content, identify the most appropriate topic tag from the following: {', '.join(topic_tags)}, and the most appropriate sub tag from the following: {', '.join(sub_tags)}. Here is the text: {combined_text}")
    ]
    response = llm.invoke(messages)
    response_text = response.content.strip()
    response_lines = response_text.split("\n")
    summary = "\n".join(response_lines[:-2]).strip()
    classified_topic_tag = response_lines[-2].replace(
        "**Topic Tag:**", "").strip()
    classified_sub_tag = response_lines[-1].replace("**Sub Tag:**", "").strip()

    for doc in documents:
        doc.metadata['summary'] = summary
        doc.metadata['category'] = classified_topic_tag
        doc.metadata['tag'] = classified_sub_tag
        doc.metadata['source'] = file_info.s3uri
        doc.metadata['security_level'] = security_level
        doc.metadata['pageContent'] = doc.page_content

    return documents


async def generate_dense_vector(text):
    return embeddings_model.embed_query(text)

# Function to load the BM25 model (if it exists)


def load_bm25_model():
    if os.path.exists(bm25_model_file):
        with open(bm25_model_file, "rb") as f:
            bm25_model = pickle.load(f)
        print(f"BM25 model loaded from {bm25_model_file}")
        return bm25_model
    else:
        print("BM25 model file does not exist.")
        return None


@app.post("/generate_sparse_vector")
async def generate_sparse_vector(question: Question):
    bm25 = load_bm25_model()
    if bm25 is None:
        raise HTTPException(
            status_code=500, detail="BM25 model not found. Please update the index first.")

    sparse_vector = bm25.encode_documents([question.text])
    return {"sparse_vector": sparse_vector}

# Security validation function


async def verify_lambda_request(x_lambda_signature: str = Header(None), x_lambda_timestamp: str = Header(None)):
    if not x_lambda_signature or not x_lambda_timestamp:
        raise HTTPException(
            status_code=401, detail="Missing signature or timestamp")

    # Check if the timestamp is within 5 minutes
    current_time = int(time.time())
    request_time = int(x_lambda_timestamp)
    if abs(current_time - request_time) > 300:
        raise HTTPException(status_code=401, detail="Request expired")

    # Validate signature
    message = f"{x_lambda_timestamp}"
    expected_signature = hmac.new(
        lambda_secret_key.encode(), message.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(x_lambda_signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True

# Execute the synchronous operation of UnstructuredLoader in a thread pool


def sync_loader(temp_file_path):
    try:
        loader = UnstructuredLoader(
            temp_file_path,
            chunking_strategy="basic",
            max_characters=1000,
            new_after_n_chars=800,
            include_metadata=True,
            include_page_breaks=True,
            include_orig_elements=True
        )
        logging.info("Loader initialized. Now loading documents...")
        documents = loader.load()
        logging.info(f"Documents loaded successfully: {len(documents)}")
        return documents
    except Exception as e:
        print(f"Error initializing loader: {str(e)}")
        logging.error(f"Error initializing loader: {str(e)}", exc_info=True)
        return None


@app.post("/process_file")
async def process_file(file_info: FileInfo, background_tasks: BackgroundTasks, verified: bool = Depends(verify_lambda_request)):
    if not file_info.url or not file_info.hash:
        raise HTTPException(status_code=400, detail="Missing required fields")
    documents = None
    try:
        conn = await get_db()
        print("Database connection successful")

        # Decode key
        from urllib.parse import unquote
        decoded_key = unquote(file_info.key)

        # Get file content using AWS SDK
        s3 = boto3.client('s3')
        print("Attempting to get object from S3...")
        try:
            response = s3.get_object(Bucket=file_info.bucket, Key=decoded_key)
            print("S3 get_object successful")
            # Correctly read file content
            file_content = response['Body'].read()
        except Exception as e:
            print(f"Error in s3.get_object: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error accessing S3: {str(e)}")

        # If the file content is empty, return an error
        if not file_content:
            raise HTTPException(
                status_code=500, detail="File content is empty")
        # Create a temporary file
        temp_file_path = f"/tmp/{file_info.key.split('/')[-1]}"
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        print(f"File downloaded to: {temp_file_path}")
        # Extract security level
        path_parts = decoded_key.split('/')
        security_level = extract_security_level(path_parts)
        print(f"Security level: {security_level}")
        # Asynchronous call to the synchronous UnstructuredLoader operation
        loop = asyncio.get_event_loop()
        print(f"Starting to load documents...")
        try:
            print("Starting to load documents...")
            with concurrent.futures.ThreadPoolExecutor() as executor:
                # Call the synchronous loader and log the start operation
                print("Submitting sync_loader to executor.")

                # Use await to capture possible exceptions and print errors

                documents = await loop.run_in_executor(executor, sync_loader, temp_file_path)

                if documents is None or len(documents) == 0:
                    raise HTTPException(
                        status_code=500, detail="Error initializing loader")
                else:
                    print(f"Documents loaded successfully: {len(documents)}")
                # **Train BM25 model first**
                print(f"Starting to train BM25 model...")
                bm25.fit([doc.page_content for doc in documents])
                print(f"BM25 model training completed")
                # Save the trained BM25 model
                save_bm25_model(bm25)
                # Process documents
                documents = generate_summary_and_classify(
                    documents, file_info, security_level)

                # Generate vectors and upload to Pinecone
                vector_data = []
                for chunk in documents:
                    dense_vector = await generate_dense_vector(chunk.page_content)
                    sparse_vector = bm25.encode_documents(chunk.page_content)
                    vector_data.append({
                        'id': file_info.hash + chunk.metadata['element_id'],
                        'values': dense_vector,
                        'sparse_values': sparse_vector,
                        'metadata': chunk.metadata
                    })
                    try:
                        await conn.execute(
                            'INSERT INTO "Document" ("vectorId","metaData","updatedAt") VALUES ($1, $2, $3)',
                            file_info.hash +
                            chunk.metadata['element_id'], json.dumps(
                                chunk.metadata), datetime.now()
                        )
                    except Exception as e:
                        print(f"Database insertion failed: {str(e)}")

                index.upsert(vectors=vector_data)
                print("Pinecone upload completed")

                # Delete the downloaded file
                os.remove(temp_file_path)
                print(f"File deleted: {temp_file_path}")
                return JSONResponse(content={"message": "File processed successfully"}, status_code=200)
        except Exception as e:
            # Catch all exceptions and log detailed information
            print("An error occurred while processing the file: %s", e)
            print(
                "An error occurred while processing the file: %s", e, exc_info=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()
        print("Database connection closed")

# Periodically train BM25 encoder and update Pinecone index


@app.post("/update_index")
async def update_index():
    conn = await get_db()
    try:
        # Get all documents from the documents table
        documents = await conn.fetch("SELECT * FROM documents")

        # Train BM25 model
        bm25.fit([json.loads(doc['metadata'])['page_content']
                 for doc in documents])  # Assuming metadata has page_content
        # Save the trained BM25 model
        save_bm25_model(bm25)

        vector_data = []
        for doc in documents:
            # Extract metadata from the database and convert back to dictionary format
            metadata = json.loads(doc['metadata'])

            # Generate dense and sparse vectors
            dense_vector = await generate_dense_vector(metadata['page_content'])
            sparse_vector = bm25.encode_documents(metadata['page_content'])

            # Build vector data
            vector_data.append({
                'id': doc['id'],
                'values': dense_vector,
                'sparse_values': sparse_vector,
                'metadata': metadata  # 保留 metadata 字典格式
            })

        # Upload vectors to Pinecone
        index.upsert(vectors=vector_data)

        # Return custom response, including status code 200
        return JSONResponse(status_code=200, content={"message": "Index updated successfully"})

    except Exception as e:
        # Catch exception and return 500 error code
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        await conn.close()
        print("Database connection closed")

# Add a route to encode a document with BM25 model and return the result


@app.post("/get_dense_vector")
async def get_dense_vector(question: Question):
    # Access the document field
    dense_vector = await generate_dense_vector(question.text)
    return {"dense_vector": dense_vector}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
