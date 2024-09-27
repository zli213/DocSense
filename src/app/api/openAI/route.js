import { AzureOpenAI } from "openai";

// Ensure these environment variables are set
const apiKey = process.env.AZURE_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const deployment = process.env.OPENAI_MODEL;

if (!apiKey || !endpoint || !deployment) {
  throw new Error("Missing required environment variables.");
}

const client = new AzureOpenAI({
  apiKey, // Pass the API key directly here
  endpoint,
  deployment,
  apiVersion: "2024-07-01-preview", // Ensure this matches your API version
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ];

    const events = await client.chat.completions.create({
      stream: true,
      messages,
      max_tokens: 1000, // Adjust this as needed
      temperature: 0, // Lower temperature to make the model less creative
      top_p: 0.95, // Limit the output to the top 95% of likelihood
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const event of events) {
            for (const choice of event.choices) {
              const delta = choice.delta?.content;
              if (delta !== undefined) {
                controller.enqueue(encoder.encode(delta));
              }
            }
          }
          controller.close();
        },
      })
    );
  } catch (error) {
    console.error("Error processing OpenAI request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
