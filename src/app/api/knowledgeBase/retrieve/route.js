import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;

const client = new BedrockAgentRuntimeClient({
  region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export async function POST(req) {
  const body = await req.json();
  const { query, folders } = body;

  if (!query) {
    return new Response(JSON.stringify({ error: "Query is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const input = {
    knowledgeBaseId: knowledgeBaseId,
    retrievalQuery: {
      text: query,
    },
    retrievalConfiguration: {
      vectorSearchConfiguration: {
        numberOfResults: 10,
        overrideSearchType: "SEMANTIC",
      },
    },
  };

  try {
    const command = new RetrieveCommand(input);
    const response = await client.send(command);
    return new Response(
      JSON.stringify({
        results: response.retrievalResults,
        nextToken: response.nextToken,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
