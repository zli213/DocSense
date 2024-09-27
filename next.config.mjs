import dotenv from "dotenv";
dotenv.config();
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    KNOWLEDGE_BASE_ID: process.env.knowledgeBaseId,
    MODEL_ARN: process.env.modelArn,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    AZURE_ENDPOINT: process.env.AZURE_ENDPOINT,
    AZURE_KEY: process.env.AZURE_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    FASTAPI_ENDPOINT: process.env.NEXT_PUBLIC_FASTAPI_ENDPOINT,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    LANGCHAIN_CALLBACKS_BACKGROUND: "true",
    DATABASE_URL: process.env.DATABASE_URL,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,
  },
};

export default nextConfig;
