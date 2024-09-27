import { Pinecone } from "@pinecone-database/pinecone";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import * as hub from "langchain/hub";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { PineconeStore } from "@langchain/pinecone";

// Define the RRF constant (60 is a commonly used value)
const RRF_CONSTANT = 60;

// Extract the logic for RRF re-ranking
function rrfReRanking(resultsPerQuery) {
  const scores = {};

  // Iterate over each query's results, ensuring the resultList is an array
  resultsPerQuery.forEach((resultList, queryIndex) => {
    if (Array.isArray(resultList)) {
      resultList.forEach((doc, rank) => {
        // Calculate the RRF score
        const docId = doc.id;
        const rankScore = 1 / (rank + 1 + RRF_CONSTANT);

        // Accumulate the score
        if (!scores[docId]) {
          scores[docId] = { doc: doc, score: 0 };
        }
        scores[docId].score += rankScore;
      });
    } else {
      console.error(`Expected an array but got: `, resultList);
    }
  });

  // Sort the documents based on their accumulated score
  const sortedDocs = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .map((entry) => ({
      doc: entry.doc, // Original document
      rrfScore: entry.score, // Include RRF score in the result
    }));

  return sortedDocs;
}
// Initialize OpenAI
const model = new AzureChatOpenAI({
  temperature: 0,
  azureOpenAIApiKey: process.env.AZURE_KEY,
  azureOpenAIApiInstanceName: "docsense",
  azureOpenAIApiDeploymentName: process.env.OPENAI_MODEL,
  endpoint: process.env.AZURE_ENDPOINT,
  azureOpenAIApiVersion: "2023-03-15-preview",
});
const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_KEY,
  azureOpenAIApiInstanceName: "docsense",
  azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-3-small",
  azureOpenAIApiVersion: "2023-05-15",
});
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: pineconeIndex,
  maxConcurrency: 5,
  textKey: "pageContent",
});

const fastapiEndpoint = process.env.NEXT_PUBLIC_FASTAPI_ENDPOINT;

// Extract the logic for obtaining vectors
async function getVectors(text) {
  // Get sparse vector
  const sparseResponse = await fetch(
    `${fastapiEndpoint}/generate_sparse_vector`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }
  );

  if (!sparseResponse.ok) {
    throw new Error("Error generating sparse vector");
  }

  const sparseData = await sparseResponse.json();
  const sparseVector = sparseData.sparse_vector;

  // Get dense vector
  const denseResponse = await fetch(`${fastapiEndpoint}/get_dense_vector`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!denseResponse.ok) {
    throw new Error("Error generating dense vector");
  }

  const denseData = await denseResponse.json();
  const denseVector = denseData.dense_vector;

  return { sparseVector: sparseVector[0], denseVector };
}

// Define a function to execute the Pinecone query
async function queryPinecone(vectors, index, filter) {
  const response = await index.query({
    vector: vectors.denseVector,
    sparseVector: vectors.sparseVector,
    topK: 10,
    includeMetadata: true,
    filter: filter,
  });
  if (!response || !response.matches) {
    console.error("Invalid Pinecone response:", response);
    throw new Error(
      "No results found or the response is not in the expected format"
    );
  }

  return response;
}
export async function POST(req) {
  const body = await req.json();
  const { query, category, security_level } = body;

  if (!query) {
    return new Response(JSON.stringify({ error: "Query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (!vectorStore) {
      console.error("Failed to initialize PineconeStore");
    }

    const filter = {};
    if (category) {
      filter.category = {
        $or: [
          { $eq: category[0].toLowerCase() },
          { $eq: category[0].toUpperCase() },
          {
            $eq:
              category[0].charAt(0).toUpperCase() +
              category[0].slice(1).toLowerCase(),
          },
        ],
      };
    }
    if (security_level) {
      filter.security_level = security_level;
    }
    // **Start breaking down the problem**

    // 1. Rewrite the query
    // const rewritePrompt = await hub.pull("langchain-ai/rewrite");
    // const rewrittenQuestionResponse = await model.invoke(
    //   `${rewritePrompt}\n${query}`
    // );
    // const rewrittenQuestion = rewrittenQuestionResponse.content.trim();
    // 2. Step-Back question generator

    // const stepbackQuestionResponse = await model.invoke(
    //   `${stepbackPrompt}\n${query}`
    // );
    // const stepbackQuestion = stepbackQuestionResponse.content.trim();

    // 3. Initialize the MultiQueryRetriever
    const multiQueryRetriever = MultiQueryRetriever.fromLLM({
      retriever: vectorStore.asRetriever(),
      llm: model,
    });

    // Get vectors for the original question, rewritten question, step-back question, and MultiQuery retrieval results
    const originalVectors = await getVectors(query);
    // const rewrittenVectors = await getVectors(rewrittenQuestion);
    // const stepbackVectors = await getVectors(stepbackQuestion);
    // Execute the MultiQueryRetriever
    let multiQueryResults = [];
    try {
      // Apply the filter to the multiQueryRetriever call
      multiQueryResults = await multiQueryRetriever.invoke(query, {
        filter: filter,
      });

      if (!multiQueryResults || multiQueryResults.length === 0) {
        throw new Error("No results from multiQueryRetriever");
      }

      // Apply additional filtering to multiQueryResults
      multiQueryResults = multiQueryResults.filter((result) => {
        // Check category
        if (
          filter.category &&
          !filter.category.$or.some(
            (cat) => result.metadata.category === cat.$eq
          )
        ) {
          return false;
        }
        // Check security_level
        if (
          filter.security_level &&
          result.metadata.security_level !== filter.security_level
        ) {
          return false;
        }
        return true;
      });

      if (multiQueryResults.length === 0) {
        throw new Error("No results after applying filter");
      }
    } catch (error) {
      console.error(
        "Failed to invoke multiQueryRetriever or apply filter:",
        error
      );
    }
    // Add pageContent from multiQueryResults to metadata
    multiQueryResults.forEach((result) => {
      result.metadata.pageContent = result.pageContent;
    });
    // Execute the query to get the context
    const originalResults = await queryPinecone(
      originalVectors,
      pineconeIndex,
      filter
    );
    if (!originalResults?.matches) {
      console.error("Invalid Pinecone response for originalResults:");
    }
    // const rewrittenResults = await queryPinecone(
    //   rewrittenVectors,
    //   pineconeIndex,
    //   filter
    // );
    // const stepbackResults = await queryPinecone(
    //   stepbackVectors,
    //   pineconeIndex,
    //   filter
    // );
    // Extract only the matches array from each query result
    const resultsPerQuery = [
      originalResults.matches || [], // Extract matches array or default to empty array
      // rewrittenResults.matches || [],
      // stepbackResults.matches || [],
      multiQueryResults || [], // For multiQueryResults, it might already be in the correct format
    ];

    // Apply RRF to re-rank the documents
    const rankedResults = rrfReRanking(resultsPerQuery);

    return new Response(JSON.stringify({ results: rankedResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error during query:", error);
    return new Response(JSON.stringify({ error: "Error during query" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
