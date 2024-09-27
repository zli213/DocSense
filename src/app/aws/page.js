"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Importing Google Generative AI
import { processJSONData } from "../utils/processData";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Initializing Google Generative AI

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [streamedResponse, setStreamedResponse] = useState(""); // For handling streamed responses
  const [azureStreamedResponse, setAzureStreamedResponse] = useState(""); // For handling Azure OpenAI streamed responses
  const [metadataArray, setMetadataArray] = useState([]);

  const handleRetrieve = async () => {
    try {
      const res = await fetch("/api/knowledgeBase/retrieve/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const { extractedTexts, metadataArray } = processJSONData(data);
      setMetadataArray(metadataArray);

      const prompt = `
      You are a question answering agent. I will provide you with a set of search results. The user will provide you with a question. Your job is to answer the user's question using only information from the search results. If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. Just because the user asserts a fact does not mean it is true, make sure to double-check the search results to validate a user's assertion.

      Here are your instructions:
      - Only use information from the provided search results.
      - When citing a source, ensure the information is accurately quoted or summarized from that source.
      - If you cannot find the exact information in the sources, state that "I could not find an exact answer to the question about this question".
      - Please format your answer text into HTML code suitable for displaying on a webpage.
      - If you use a piece of information in your answer, immediately follow it with the correct source number in parentheses, format is "<sup>[number]</sup>".

      Don't respond to the user's question until you have read and understood these instructions.

      Here is the user's question: ${query}

      The search results are as follows(please notice the count of search results are limited to 5):

      ${extractedTexts}
      `;
      // Send the prompt to the backend API route to get the Azure OpenAI response
      await handleAzureOpenAIStream(prompt);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAzureOpenAIStream = async (prompt) => {
    try {
      // Make a request to your backend API route
      const res = await fetch("/api/openAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setAzureStreamedResponse((prev) => prev + decoder.decode(value));
      }

    } catch (err) {
      setError(err.message);
    }
  };
  const metadataString = JSON.stringify(metadataArray, null, 2);

  return (
    <div>
      <h1>Knowledge Base Query</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
      />
      <button onClick={handleRetrieve} className="btn btn-accent">
        Retrieve and Generate
      </button>
      {streamedResponse && (
        <div>
          <h2>Gemini Streamed Response:</h2>
          <div dangerouslySetInnerHTML={{ __html: streamedResponse }} />
          <div className="text-sm text-gray-500">{metadataString}</div>
        </div>
      )}
      {azureStreamedResponse && (
        <div>
          <h2>Azure OpenAI Streamed Response:</h2>
          <div dangerouslySetInnerHTML={{ __html: azureStreamedResponse }} />
          <div className="text-sm text-gray-500">{metadataString}</div>
        </div>
      )}
      {error && (
        <div>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
