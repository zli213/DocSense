# DocSense - A Document Search Engine powered by AI

DocSense is a document search engine that uses LLMs and RAG (Retrieval Augmented Generation) to provide users with the most relevant information. The project is built using Next.js, FastApi, Langchain and Pinecone. The project is currently in development and is not yet ready for production. All documents are stored in an AWS S3 bucket which mimics a real-world cloud storage service. This project support RBAC (Role Based Access Control) and allows users to search for documents based on their roles.
Rigth now, documents are upload in the S3 bucket and then using a lambda function to trigger the FastAPI to index the document in the Pinecone index. The search is done using the Pinecone API and the results are displayed in the frontend. We will supprt users to upload documents directly to the FastAPI and then index them in the Pinecone index in the future.

<p align="center">
    <img src="./public/FiveForcePoster.png" alt="DocSense" width="100%">
</p>

## Getting Started

### Database Connection

1. Use PostgreSQL as the database;
2. In .env file, add the following lines:

```bash
DATABASE_URL="postgresql://[username]:[yourpassword]@localhost:[port]/DocSense?schema=public"

```

3. Install Prisma to the project;
4. Add cheatsheet to the project;

### Configuration

1. Create a `.env` file and add the following environment variables:

   ```bash
   DATABASE_URL="postgresql://[username]:[yourpassword]@localhost:[port]/DocSense?schema=public"
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   NEXTAUTH_SECRET=your_nextauth_secret
   GEMINI_API_KEY=your_gemini_api_key
   AZURE_ENDPOINT=your_azure_endpoint
   AZURE_KEY=your_azure_key
   OPENAI_MODEL=your_openai_model
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index
   PINECONE_ENVIRONMENT=your_pinecone_environment
   LANGCHAIN_API_KEY=your_langchain_api_key
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_CALLBACKS_BACKGROUND=true
   ```
2. Set Azure OpenAIApi Instance Name is "docsense".
3. Set S3 bucket name is "documentsearch". The bucket has a folder structure as shown below:
<p align="center">
    <img src="./public/s3bucket/s3bucket_1st_tier.png" alt="s3_bucket" width="100%">
</p>
Inside each folder, there is a second folder structure as shown below:
<p align="center">
    <img src="./public/s3bucket/s3bucket_2nd_tier.png" alt="s3_bucket_2nd" width="100%">
</p>
Inside each department folder, there are folder structures as shown below:
<p align="center">
    <img src="./public/s3bucket/s3bucket_3rd_tier.png" alt="s3_bucket_3rd" width="100%">
</p>
The s3 bucket permission is setted as shown below:
<p align="center">
    <img src="./public/s3bucket/s3_permission.png" alt="s3_bucket_permission" width="100%">
</p>
### Running the Service

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Then, navigate to the `FASTAPI` directory and run the FastAPI server, see more details in the `FASTAPI` [README.md](./FastAPI/README.md).
