"use client";
import React, { useState, useEffect } from "react";
import { handleQuery } from "../utils/apiService";
export default function QueryTestPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [securityLevel, setSecurityLevel] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    const resultData = await handleQuery(query, category, securityLevel);
    setResults(resultData);
    if (resultData.error) {
      setError(resultData.error);
    } else {
      setResults(resultData);
    }
  };
  useEffect(() => {
    //console.log("results", results);
  }, [results]);
  return (
    <div>
      <h1>Test Hybrid Search</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Query:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Security Level:</label>
          <input
            type="text"
            value={securityLevel}
            onChange={(e) => setSecurityLevel(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>Results</h2>
      {results.results && results.results.length > 0 ? (
        <ul>
          {results.results.map((result) => (
            <li key={result.id}>
              <strong>ID:</strong> {result.id} <br />
              <strong>Score:</strong> {result.score || "N/A"} <br />
              <strong>Metadata:</strong>{" "}
              {result.metadata
                ? JSON.stringify(result.metadata)
                : "No metadata available"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}
