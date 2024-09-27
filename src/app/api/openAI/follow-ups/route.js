import { AzureChatOpenAI } from "@langchain/openai";
import { z } from "zod"; // If you're using Zod for schema validation

// Setup the AzureChatOpenAI client with the necessary parameters
const client = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_KEY,
  azureOpenAIApiInstanceName: "docsense",
  azureOpenAIApiDeploymentName: process.env.OPENAI_MODEL,
  endpoint: process.env.AZURE_ENDPOINT,
  azureOpenAIApiVersion: "2023-03-15-preview",
});

// Define a Zod schema for the expected structured output
const followUpQuestionsSchema = z.object({
  questions: z.array(z.string()),
});

// Utilize .withStructuredOutput() to enforce the schema
const structuredClient = client.withStructuredOutput(followUpQuestionsSchema);

export async function POST(req) {
  const { query } = await req.json();
  const prompt = `
  Based on the user's query, generate five related questions that the user might ask.
  input: ${query}
  output:
  {
    questions: [
      "Question 1",
      "Question 2",
      "Question 3",
      "Question 4",
      "Question 5"
    ]
  }
  `;
  const response = await structuredClient.invoke(prompt);
  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
}
