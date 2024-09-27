// apiService.js
/**
 * Handles the retrieval and generation of information based on a given query.
 *
 * @param {string} query - The search query to retrieve and generate information for.
 * @returns {Promise<Object>} An object containing the retrieved data or an error message.
 *
 * Usage example:
 * const result = await handleRetrieveAndGenerate("What is artificial intelligence?");
 * if (result.data) {
 *   console.log("Retrieved data:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleRetrieveAndGenerate = async (query) => {
  try {
    const res = await fetch("/api/knowledgeBase/retrieveAndGenerate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the summarization of a conversation history with a new question.
 *
 * @param {Array} conversationHistory - An array of previous conversation messages.
 * @param {string} newQuestion - The new question to be summarized with the conversation history.
 * @returns {Promise<Object>} An object containing the summarized data or an error message.
 *
 * Usage example:
 * const result = await handleSummarize(
 *   [
 *     { role: "user", content: "What is the capital of France?" },
 *     { role: "assistant", content: "The capital of France is Paris." }
 *   ],
 *   "Can you tell me more about Paris?"
 * );
 * if (result.data) {
 *   console.log("Summarized data:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */

export const handleSummarize = async (conversationHistory, newQuestion) => {
  try {
    const res = await fetch("/api/generate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationHistory, newQuestion }),
    });
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the retrieval of search logs for a user.
 *
 * @param {string} userId - The ID of the user to retrieve search logs for.
 * @returns {Promise<Object>} An object containing the search logs or an error message.
 *
 * Usage example:
 * const result = await handleSearchLogs("user123");
 * if (result.data) {
 *   console.log("Search logs:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */

export const handleSearchLogs = async (userId, currentLogs) => {
  // If there is already log data in Redux, use that data directly
  if (currentLogs && currentLogs.length > 0) {
    return { data: currentLogs, error: null };
  }

  // Otherwise pull logs from the backend
  try {
    const res = await fetch(`/api/userSearchingHistory?userId=${userId}`);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the creation of a new search log for a user.
 *
 * @param {string} userId - The ID of the user to create a search log for.
 * @param {string} searchQueryTitle - The title of the search query.
 * @param {string} searchContent - The content of the search query.
 * @returns {Promise<Object>} An object containing the created search log or an error message.
 *
 * Usage example:
 * const result = await handleCreateLog("user123", "What is AI?", "AI is a technology that allows machines to learn and make decisions.");
 * if (result.data) {
 *   console.log("Created search log:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */

export const handleCreateLog = async (
  userId,
  searchQueryTitle,
  searchContent
) => {
  try {
    const res = await fetch(`/api/userSearchingHistory?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchQueryTitle, searchContent }),
    });
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the update of an existing search log for a user.
 *
 * @param {string} userId - The ID of the user to update the search log for.
 * @param {string} id - The ID of the search log to update.
 * @param {string} searchQueryTitle - The new title of the search query.
 * @param {string} searchContent - The new content of the search query.
 * @returns {Promise<Object>} An object containing the updated search log or an error message.
 *
 * Usage example:
 * const result = await handleUpdateLog("user123", "log123", "What is AI?", "AI is a technology that allows machines to learn and make decisions.");
 * if (result.data) {
 *   console.log("Updated search log:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleUpdateLog = async (
  userId,
  id,
  searchQueryTitle,
  searchContent
) => {
  try {
    const res = await fetch(`/api/userSearchingHistory?userId=${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, searchQueryTitle, searchContent }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    console.error("Error updating search log:", err);
    return { data: null, error: err.message };
  }
};

/**
 * Handles the deletion of a search log for a user.
 *
 * @param {string} userId - The ID of the user to delete the search log for.
 * @param {string} id - The ID of the search log to delete.
 * @returns {Promise<Object>} An object containing the deleted search log or an error message.
 *
 * Usage example:
 * const result = await handleDeleteLog("user123", "log123");
 * if (result.data) {
 *   console.log("Deleted search log:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleDeleteLog = async (userId, id) => {
  try {
    const res = await fetch(`/api/userSearchingHistory?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the deletion of all search logs for a user.
 *
 * @param {string} userId - The ID of the user to delete all search logs for.
 * @returns {Promise<Object>} An object containing the deleted search logs or an error message.
 *
 * Usage example:
 * const result = await handleClearLogs("user123");
 * if (result.data) {
 *   console.log("Deleted all search logs:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleClearLogs = async (userId) => {
  try {
    const res = await fetch(`/api/userSearchingHistory?userId=${userId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Handles the streaming of data from an OpenAI API request.
 *
 * @param {string} prompt - The prompt to send to the OpenAI API.
 * @param {function} onStreamUpdate - A callback function to handle the streamed data.
 * @returns {Promise<Object>} An object containing the final result or an error message.
 *
 * Usage example:
 * const result = await handleAzureOpenAIStream("What is AI?", (data) => {
 *   console.log("Streamed data:", data);
 * });
 * if (result.data) {
 *   console.log("Final result:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleAzureOpenAIStream = async (prompt, onStreamUpdate) => {
  try {
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
      const decodedValue = decoder.decode(value);
      result += decodedValue;
      onStreamUpdate(decodedValue); // Call the callback function with the new data chunk
    }

    return { data: result, error: null }; // Return the final result
  } catch (err) {
    return { data: null, error: err.message }; // Return the error
  }
};

/**
 * Filter metadata array based on user roles and folder permissions
 * @param {Array} metadataArray - The metadata array to be filtered
 * @param {Array} folders - Array of folders the user has permission to access
 * @param {Object} userRoleData - User role data
 * @returns {Array} - Filtered metadata array
 *
 * Usage example:
 * const result = await handleFilterMetadata(
 *   [
 *     { location: { s3Location: { uri: "s3://folder1/file1.txt" } } },
 *     { location: { s3Location: { uri: "s3://folder2/file2.txt" } } }
 *   ],
 *   ["folder1", "folder2"],
 *   { accessCode: "G0", accessCode: "G1" }
 * );
 * console.log(result);
 * [
 *   { location: { s3Location: { uri: "s3://folder1/file1.txt" } } },
 *   { location: { s3Location: { uri: "s3://folder2/file2.txt" } } }
 * ]
 */
export function filterMetadata(metadataArray, folders, userRoleData) {
  return metadataArray.filter((item) => {
    const s3Url = item.doc.metadata.source;
    const roleTypes = userRoleData;

    // Check if the file is in an allowed folder
    const isInFolders = s3Url.includes(folders);
    // Check if it meets the role type requirements
    const hasMatchingRoleType = roleTypes.some((roleType) => {
      if (roleType.accessCode === "G0") {
        return s3Url.includes(roleType.accessCode);
      } else {
        return s3Url.includes(roleType.accessCode) && isInFolders;
      }
    });
    if (hasMatchingRoleType) {
      return item;
    }
  });
}

/**
 * Process JSON data and extract relevant information
 * @param {Array} data - The JSON data to process
 * @param {Object} userRoleData - User role data
 * @param {Array} folders - Array of folders the user has permission to access
 * @returns {Object} - Object containing extracted texts and filtered metadata array
 *
 * Usage example:
 * const result = await handleProcessJSONData(
 *   [
 *     { results: [
 *       { score: 0.5, content: { text: "This is a test document." } },
 *       { score: 0.4, content: { text: "This is another test document." } }
 *     ] }
 *   ],
 *   { accessCode: "G0", accessCode: "G1" },
 *   ["folder1", "folder2"]
 * );
 * if (result.extractedTexts) {
 *   console.log("Extracted texts:", result.extractedTexts);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */

export function processJSONData(data, userRoleData, folders) {
  // Step 1: Normalize scores if any score is greater than 1
  const normalizeScores = (results) => {
    const scores = results.map((item) => item.rrfScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return results.map((item) => ({
      ...item,
      rrfScore:
        0.2 + 0.7 * ((item.rrfScore - minScore) / (maxScore - minScore)), // Normalizing to [0, 1] range
    }));
  };

  // Normalize the scores before any further processing
  const normalizedResults = normalizeScores(data.results);
  // Step 2: Initialize array to store metadata and filter scores
  const metadataArray = [];
  normalizedResults.forEach((result, index) => {
    // Check if the "score" value is greater than 0.5 after normalization
    if (result.doc.metadata.source.includes("xlsx")) {
      const metadataWithIndex = { ...result, sequenceNumber: index + 1 };
      metadataArray.push(metadataWithIndex);
    } else if (result.rrfScore > 0.4) {
      const metadataWithIndex = { ...result, sequenceNumber: index + 1 };
      metadataArray.push(metadataWithIndex);
    }
  });
  // Step 3: Filter the metadata array using the filterMetadata function
  const filteredMetadataArray = filterMetadata(
    metadataArray,
    folders,
    userRoleData
  );

  // Step 4: Generate extractedTexts based on filtered metadata
  const extractedTexts = filteredMetadataArray.map((item, index) => {
    return `<answer>Source${index + 1}
    ------------------------------
    ${item.doc.metadata.pageContent}</answer>
    ------------------------------
    `;
  });

  // Step 5: Join the extracted texts into a single string
  const extractedTextsString = extractedTexts.join("\n");
  // Step 6: Return the extracted texts and filtered metadata array
  return {
    extractedTexts: extractedTextsString,
    metadataArray: filteredMetadataArray,
  };
}

/**
 * Retrieve information from the knowledge base and prepare a prompt for the LLM
 * @param {string} query - The user's query
 * @param {Array} folders - Array of folders the user has permission to access
 * @param {Object} userRoleData - User role data
 * @returns {Object} - Object containing the prompt and metadata array
 *
 * Usage example:
 * const result = await handleRetrieve("What is AI?", ["folder1", "folder2"], { accessCode: "G0", accessCode: "G1" });
 * if (result.prompt) {
 *   console.log("Prompt:", result.prompt);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleRetrieve = async (query, folders = [], userRoleData) => {
  try {
    const data = await handleQuery(query, folders, null);
    const { extractedTexts, metadataArray } = processJSONData(
      data,
      userRoleData,
      folders
    );
    // const prompt = `
    // You are a question answering agent. I will provide you with a set of search results. The user will provide you with a question. Your job is to answer the user's question using only information from the search results. If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. Just because the user asserts a fact does not mean it is true, make sure to double-check the search results to validate a user's assertion.

    // Here are your instructions:
    // - Only use information from the provided search results.
    // - When citing a source, ensure the information is accurately quoted or summarized from that source.
    // - If you cannot find the exact information in the sources, state that "I could not find an exact answer to the question about this question".
    // - Please format your answer text into HTML code suitable for displaying on a webpage, only generate the necessary content such as <p>, <div>, and relevant tags. Avoid generating the full HTML structure like <!DOCTYPE html>, <html>, <head> or <body>.
    // - If you use a piece of information in your answer, you must immediately follow it with the correct source number in parentheses, format is <sup>[number]</sup>", don't output "(source number) or (number)" .

    // Don't respond to the user's question until you have read and understood these instructions. Your answer should not contain any bullet points and only summary the contents and be paragraphs.

    // Here is the user's question: ${query}

    // The search results are as follows(please notice the count of search results are limited to 5):

    // ${extractedTexts}

    // `;
    const prompt = `
    You are a question answering agent using only provided search results. Answer the user's question based solely on these results. If the information isn't available, state that you couldn't find an exact answer. Verify user assertions against the search results.

    Instructions:
    - Use only information from the provided search results.
    - Accurately summarize when citing sources.
    - If exact information is unavailable, state: "I could not find an exact answer to this question".
    - Format your answer in HTML (only necessary tags like <p>, <div>). Exclude full HTML structure and do not use <ul>, <li> or <br>.
    - Cite sources immediately after using information, format: <sup>[number]</sup>

    Don't respond until you've understood these instructions. Answer should only has no more than 3 paragraphs without bullet points.

    User's question: ${query}

    Search results:
    ${extractedTexts}
`;

    return { prompt, metadataArray };
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Fetch document information from the server
 * @param {string} s3link - The S3 link of the document
 * @returns {Promise<Object>} - Object containing the document information or null if failed
 *
 * Usage example:
 * const result = await fetchDocumentInfo("s3://folder1/file1.txt");
 * if (result) {
 *   console.log("Document info:", result);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const fetchDocumentInfo = async (s3link) => {
  try {
    const response = await fetch(
      `/api/documents/getByS3link?s3link=${encodeURIComponent(s3link)}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.error);
      return null;
    }

    const document = await response.json();
    return document;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return null;
  }
};

/**
 * Fetch user roles and permissions from the server
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - Object containing the user roles and permissions or null if failed
 *
 * Usage example:
 * const result = await fetchUserRoleAndPermissions("user123");
 * if (result) {
 *   console.log("User roles and permissions:", result);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const fetchUserRoleAndPermissions = async (userId) => {
  if (!userId) {
    console.error("User ID is undefined");
    return null;
  }

  try {
    const response = await fetch(`/api/account/${userId}/roles`);
    if (!response.ok) {
      throw new Error("Failed to retrieve user roles and permissions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user roles and permissions:", error);
    return null;
  }
};

/**
 * Fetch department information from the server
 * @param {string} departmentId - The ID of the department
 * @returns {Promise<Object>} - Object containing the department information or null if failed
 *
 * Usage example:
 * const result = await fetchDepartmentInfo("department123");
 * if (result) {
 *   console.log("Department info:", result);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const fetchDepartmentInfo = async (departmentId) => {
  if (!departmentId) {
    console.error("Department ID is undefined");
    return null;
  }

  try {
    const response = await fetch(`/api/department?id=${departmentId}`);
    if (!response.ok) {
      throw new Error("Failed to retrieve department information");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching department information:", error);
    return null;
  }
};
/**
 * Hanle querry from the server
 * @param {string} query - The query to be sent to the server
 * @param {string} category - The category of the query
 * @param {string} security_level - The security level of the query
 * @returns {Promise<Object>} - Object containing the query result or null if failed
 *
 * Usage example:
 * const result = await handleQuery("What is AI?", "Technology", "Public");
 * if (result) {
 *   console.log("Query result:", result);
 * } else {
 *   console.error("Error:", result.error);
 * }
 */
export const handleQuery = async (query, category, security_level) => {
  try {
    const response = await fetch("/api/knowledgeBase/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        category: category || null,
        security_level: security_level || null,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.error);
      return { error: errorData.error };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error querying the knowledge base:", error);
    return { error: error.message };
  }
};

/**
 * Generate follow-up questions based on the user's query
 * @param {string} query - The user's query
 * @returns {Promise<Object>} - Object containing the follow-up questions or null if failed
 *
 * Usage example:
 * const result = await generateFollowUpQuestions("What is AI?");
 * if (result) {
 *   console.log("Follow-up questions:", result);
 * } else {
 *   console.error("Error:", result.error);
 */
export const generateFollowUpQuestions = async (query) => {
  try {
    const response = await fetch("/api/openAI/follow-ups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    return { error: error.message };
  }
};
