import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
const modelArn = process.env.MODEL_ARN;

const client = new BedrockAgentRuntimeClient({
  region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

let sessionId;

export async function POST(req, res) {
  try {
    const body = await req.json();
    const { query } = body;

    const input = {
      sessionId: sessionId || undefined,
      input: {
        text: query,
      },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId: knowledgeBaseId,
          modelArn: modelArn,
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5, // Increase the number of results
              overrideSearchType: "SEMANTIC", // Switch to SEMANTIC for potentially better relevance
            },
          },
          generationConfiguration: {
            promptTemplate: {
              textPromptTemplate: `
              You are a question answering agent. I will provide you with a set of search results. The user will provide you with a question. Your job is to answer the user's question using only information from the search results. If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.
              Please Please format your answer text into HTML code suitable for displaying on a webpage, with the following requirements:

                Use <h2> tags for titles.
                Use <li> tags for each concept point, wrapped in a <ul> tag.
                Use <p> tags for paragraphs.
                Use <strong> tags to emphasize important content where appropriate.
                Add the classes list-disc list-inside to the <ul> tags.
                Apply appropriate Tailwind CSS classes to the paragraphs and headings to ensure good typography.
              $search_results$
              
              $output_format_instructions$
            `,
            },
            inferenceConfig: {
              textInferenceConfig: {
                temperature: 0, // Moderately creative
                topP: 1, // Diverse, but within reason
                maxTokens: 2048, // Limit the length of the generated output
              },
            },
          },
        },
      },
    };

    const command = new RetrieveAndGenerateCommand(input);
    const response = await client.send(command);

    // Prepare the final response payload
    const result = {
      generatedText: response.output.text,
      citations: response.citations.map((citation) => ({
        references: citation.retrievedReferences.map((ref) => ({
          content: ref.content.text,
          location: ref.location,
          metadata: ref.metadata,
        })),
      })),
    };

    // Return the response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);

    // Return the error response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
