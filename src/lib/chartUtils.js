// import { AzureChatOpenAI } from "@langchain/openai";
// import { JsonOutputParser } from "@langchain/core/output_parsers";
// import { z } from "zod";

// // Set up AzureChatOpenAI client
// const client = new AzureChatOpenAI({
//   azureOpenAIApiKey: process.env.AZURE_KEY,
//   azureOpenAIApiInstanceName: "docsense",
//   azureOpenAIApiDeploymentName: process.env.OPENAI_MODEL,
//   endpoint: process.env.AZURE_ENDPOINT,
//   azureOpenAIApiVersion: "2023-03-15-preview",
// });

// // Define Zod schema to validate structured output
// const chartDataSchema = z.object({
//   data: z.array(z.record(z.any())), // Every element in the array is an object
// });

// // Use JsonOutputParser to parse structured output
// const parser = new JsonOutputParser(chartDataSchema);

// // Define function to analyze data and recommend charts
// const analyzeDataForCharts = async (query, excelData) => {
//   // Format data as string
//   // console.log("excelData:", excelData);
//   const formattedData = JSON.stringify(excelData);
//   // console.log("formattedData:", formattedData);

//   // Modify prompt to ensure only table content is included
//   const prompt = `
//   You are an intelligent data analysis assistant. Your task is to analyze the user's query and extract the key words.
//   Based on the key words, filter the provided data and return rows that meet the criteria.

//   **Critical Instructions:**

//   - **Your output must be a valid JSON object containing only the following key:**
//     - \`data\`: an array of objects. **This field is mandatory and must not be omitted. Include ALL relevant data entries without exception.**

//   - **Do not include any additional text or explanations outside of the JSON object.**

//   - **Ensure that if the query includes references to quantities, categories, time periods, or any other logical conditions, you should check that the output data aligns with common sense and real-world logic.**
//     - **For example:**
//       - If the query specifies a time period, ensure the output covers the full range expected for that period (e.g., months should have the appropriate number of days, and years should reflect whether they are leap years).
//       - If the query involves counting objects or events, the totals should be logical given the context (e.g., a person cannot work 30 hours in a single day).
//       - If the query involves categories or statuses, ensure that the output reflects reasonable distributions (e.g., an employee cannot be both "Present" and "Absent" on the same day).

//   **Input Data:**

//   \`\`\`json
//   ${query}
//   ${formattedData}
//   \`\`\`

//   **Comprehensive Analysis Steps:**

//   1. **Thoroughly examine all input data at least 3 times**, ensuring no relevant information is overlooked.
//   2. **Carefully consider the user's query** to understand the specific data requirements.
//   3. **Apply logical reasoning to ensure that the data follows real-world expectations**:
//       - **Time-based data**: Ensure the completeness of date ranges (e.g., every day in a given month is included, leap years are handled properly).
//       - **Quantity-based data**: Ensure that totals, counts, and sums are reasonable (e.g., a person cannot work more than 24 hours in a day).
//       - **Category-based data**: Ensure categories or statuses are mutually exclusive and logically consistent (e.g., no contradictions like being both present and absent on the same day).
//       - **Range-based data**: Ensure ranges make sense (e.g., numerical values like temperature or hours worked should fall within reasonable bounds).

//   4. **Create a comprehensive array of JavaScript objects**, including ALL entries that meet the query criteria, no matter how numerous.

//   **Expected Output Format (in JSON):**

//   \`\`\`json
//   {
//     "data": [
//       { "column1": "value1", "column2": "value2", ... },
//       ...
//     ]
//   }
//   \`\`\`

//   **Critical Reminders:**

//   - **Ensure ALL relevant data is included. Do not omit any entries that meet the criteria.**
//   - **Apply real-world logic checks to ensure that the output data is consistent with common sense and natural expectations.**
//   - **Double-check that no headers are included in the 'data' array. Only include the actual data values.**
//   - **Verify that the output is a valid JSON object before finalizing.**

//   **Reflection Check**:
//   - **Before finalizing the output, reflect on the results:**
//     - Is the data consistent with logical, real-world expectations?
//     - Are there any anomalies or contradictions that could indicate an error in filtering (e.g., a person working too many hours in a day, or data missing from expected date ranges)?
//     - Are all quantities, counts, and sums reasonable given the context?
//     - If any data seems illogical, revisit the filtering process and ensure everything aligns with reality.
//   `;

//   try {
//     // Call model, get raw output
//     const rawResponse = await client.invoke(prompt);
//     // console.log("Raw response:", rawResponse);

//     // Extract and remove ```json``` tags from the raw response
//     const jsonContent = rawResponse.content.replace(/```json|```/g, "").trim();
//     // console.log("Cleaned JSON content:", jsonContent);

//     // Use JsonOutputParser to parse structured output
//     const structuredResponse = await parser.parse(jsonContent);
//     // console.log("Structured response", structuredResponse);

//     // Return results that conform to the defined Zod schema
//     return await performSecondaryAnalysis(structuredResponse, query);
//   } catch (error) {
//     console.error("Failed to analyze data: ", error);
//     throw error;
//   }
// };

// export { analyzeDataForCharts };
// const performSecondaryAnalysis = async (structuredResponse, query) => {
//   const data = structuredResponse.data;

//   // Dynamically detect data types
//   const dataTypes = detectDataTypes(data);
//   // console.log("Detected data types:", dataTypes);

//   // Analysis results object
//   const analysisResults = {};

//   // Count total entries in the first column (first field)
//   const firstField = Object.keys(data[0])[0]; // Get the name of the first field
//   const totalEntries = data.length;
//   analysisResults[firstField] = { totalEntries };

//   // Perform analysis on each field
//   Object.keys(dataTypes).forEach((key) => {
//     switch (dataTypes[key]) {
//       case "string":
//         const uniqueValues = getUniqueValues(data, key);
//         const valueCounts = countUniqueValues(data, key);
//         analysisResults[key] = {
//           uniqueValues,
//           valueCounts,
//           multipleStates: uniqueValues.length > 1 ? true : false, // Determine if there are multiple states
//         };
//         break;
//       case "number":
//         analysisResults[key] = calculateNumericStats(data, key); // Numeric field statistics
//         break;
//       case "date":
//         analysisResults[key] = { dateRange: getDateRange(data, key) }; // Date range analysis
//         break;
//     }
//   });

//   // If there is a date field, group by date and aggregate numeric fields
//   const dateField = Object.keys(dataTypes).find(
//     (key) => dataTypes[key] === "date"
//   );
//   if (dateField) {
//     const numericFields = Object.keys(dataTypes).filter(
//       (key) => dataTypes[key] === "number"
//     );
//     numericFields.forEach((numericField) => {
//       analysisResults[`${dateField}_grouped_${numericField}`] =
//         groupByAndAggregate(data, dateField, numericField);
//     });
//   }

//   // Include query information
//   analysisResults.query = query;

//   // Build a new prompt to pass to LLM to recommend chart type
//   return await recommendChartType(data, dataTypes, analysisResults);
// };

// // Recommend chart type
// const recommendChartType = async (data, dataTypes, analysisResults) => {
//   const prompt = `
// You are an intelligent data analysis assistant. Your task is to analyze the provided data and user query, then recommend the most suitable chart type for visualization and output the chart data.

// **Input Data Sample (first 5 rows):**
// ${JSON.stringify(data.slice(0, 5), null, 2)}

// **Data Types:**
// ${JSON.stringify(dataTypes, null, 2)}

// **Analysis Results:**
// ${JSON.stringify(analysisResults, null, 2)}

// **User Query:**
// ${JSON.stringify(analysisResults.query, null, 2)}

// Based on the above data, data types, analysis results and user query, please recommend the most suitable chart type for visualizing this data. Consider the following factors:

// 1. The nature of the data (time series, categorical, numerical, etc.)
// 2. The number of unique values for each field
// 3. The presence of date fields and their range
// 4. The distribution and statistics of numerical fields

// In your response, please include:
// 1. The recommended chart type:bar,line,pie
// 2. Any additional data transformations or aggregations that might be necessary for the chosen chart type
// 3. The chart data in JSON format, including the chart title, x-axis label, y-axis label, and the chart data
//   **Output Format:**
//   {
//     "chartType": "bar",
//     "dataTransformations": {
//       "xAxis": "date",
//       "yAxis": "value",
//       "aggregation": "sum"
//     },
//     "chartData": {
//       "title": "Sales by Date",
//       "xAxisLabel": "Date",
//       "yAxisLabel": "Sales",
//       "data": [
//         { "date": "2023-01-01", "sales": 100 },
//         { "date": "2023-01-02", "sales": 150 },
//         { "date": "2023-01-03", "sales": 200 }
//       ]
//     }
//   }
//   **Important**: Ensure that the response is valid JSON. Do not include any extra text, headers, or explanations.`;

//   try {
//     // Call LLM to recommend chart type
//     const response = await client.invoke(prompt);

//     // Debug: Output raw response content
//     // console.log("Raw LLM Response:", response.content);

//     // Check if the response is a valid JSON
//     const cleanedResponse = response.content.trim();
//     if (!cleanedResponse.startsWith("{") && !cleanedResponse.endsWith("}")) {
//       throw new Error("LLM response is not a valid JSON object");
//     }

//     // Try to parse JSON
//     const jsonResponse = JSON.parse(cleanedResponse);
//     // console.log("Parsed JSON Response:", jsonResponse);

//     // Return recommended chart type and data
//     return jsonResponse;
//   } catch (error) {
//     console.error("Failed to recommend chart type:", error);
//     throw error;
//   }
// };
// const detectDataTypes = (data) => {
//   const dataTypes = {};

//   if (data.length === 0) return dataTypes;

//   Object.keys(data[0]).forEach((key) => {
//     const sampleValue = data[0][key];
//     if (typeof sampleValue === "string") {
//       // Check if it is a date
//       const date = Date.parse(sampleValue);
//       if (!isNaN(date)) {
//         dataTypes[key] = "date";
//       } else {
//         dataTypes[key] = "string";
//       }
//     } else if (typeof sampleValue === "number") {
//       dataTypes[key] = "number";
//     } else {
//       dataTypes[key] = typeof sampleValue;
//     }
//   });

//   return dataTypes;
// };
// // Get unique values of a field
// const getUniqueValues = (data, key) => {
//   const uniqueValues = [...new Set(data.map((entry) => entry[key]))];
//   return uniqueValues;
// };

// // Count the occurrences of each unique value in a field
// const countUniqueValues = (data, key) => {
//   const valueCounts = {};
//   data.forEach((entry) => {
//     const value = entry[key];
//     valueCounts[value] = (valueCounts[value] || 0) + 1;
//   });
//   // console.log("valueCounts:", valueCounts);
//   return valueCounts;
// };
// // Calculate numeric field statistics (e.g., mean, min, max)
// const calculateNumericStats = (data, key) => {
//   const values = data
//     .map((entry) => entry[key])
//     .filter((v) => typeof v === "number");
//   const total = values.reduce((acc, value) => acc + value, 0);
//   const min = Math.min(...values);
//   const max = Math.max(...values);
//   const mean = total / values.length;

//   return { total, min, max, mean };
// };
// // Get the range of a date field
// const getDateRange = (data, key) => {
//   const dates = data
//     .map((entry) => new Date(entry[key]))
//     .filter((d) => !isNaN(d));
//   const minDate = new Date(Math.min(...dates));
//   const maxDate = new Date(Math.max(...dates));

//   return { minDate, maxDate };
// };
// // Group by date field and aggregate numeric field
// const groupByAndAggregate = (data, dateField, numericField) => {
//   const groupedData = {};

//   data.forEach((entry) => {
//     const date = entry[dateField];
//     const value = entry[numericField];

//     if (!groupedData[date]) {
//       groupedData[date] = { sum: 0, count: 0 };
//     }

//     groupedData[date].sum += value;
//     groupedData[date].count += 1;
//   });

//   // Return the sum and average for each date
//   const result = Object.keys(groupedData).map((date) => ({
//     date,
//     total: groupedData[date].sum,
//     average: groupedData[date].sum / groupedData[date].count,
//   }));

//   return result;
// };

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
const chartDataSchema = z.object({
  data: z.array(
    z.object({
      name: z.string(),
      uv: z.number(),
      pv: z.number(),
      amt: z.number(),
      // Add more columns as needed
    })
  ),
  recommendedChart: z.string(),
  explanation: z.string(),
});

// Utilize .withStructuredOutput() to enforce the schema
const structuredClient = client.withStructuredOutput(chartDataSchema);

// Function to split data into two parts
const splitData = (data) => {
  const mid = Math.floor(data.length / 2);
  const part1 = data.slice(0, mid);
  const part2 = data.slice(mid);
  return [part1, part2];
};

// Function to process part of the data with LLM
const processPartWithLLM = async (query, dataPart) => {
  const prompt = `
  You are an intelligent data analysis assistant. Your task is to analyze data based on the user's query and return a portion of the data that meets the query conditions.
  **Thoroughly examine all input data at least 3 times**, ensuring no relevant information is overlooked.

  **User Query**:
  \`\`\`json
  ${JSON.stringify(query)}
  \`\`\`

  **Data Part**:
  \`\`\`json
  ${JSON.stringify(dataPart)}
  \`\`\`

  **Output Format** (strict JSON only):
  {
    "data": [
      { "column1": "value1", "column2": "value2", ... }
    ]
  }
  `;

  try {
    const rawResponse = await client.invoke(prompt);

    // Debugging - Print the raw response from the LLM
    // console.log("Raw LLM Response:", rawResponse);

    // Clean the response by removing extraneous text like ```json...```
    let cleanedResponse = rawResponse.content.trim();

    // Remove ```json``` wrappers if they exist
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7, -3).trim(); // Remove ```json and ```
    }

    // Check if the cleaned response is valid JSON
    if (!cleanedResponse.startsWith("{") || !cleanedResponse.endsWith("}")) {
      throw new Error(
        "LLM response is not a valid JSON object: " + cleanedResponse
      );
    }

    // console.log("cleanresponse in json:", JSON.parse(cleanedResponse));

    // Parse and return the JSON content
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error processing data part:", error);
    throw error;
  }
};

// Function to merge the results of two parts
const mergeResults = (part1Result, part2Result) => {
  return {
    data: [...part1Result.data, ...part2Result.data],
  };
};
// Main function to analyze data and recommend charts
const analyzeDataForCharts = async (query, excelData) => {
  const formattedData = JSON.stringify(excelData);
  // Split data into two parts
  const [part1, part2] = splitData(formattedData);
  // Process both parts in parallel
  const [part1Result, part2Result] = await Promise.all([
    processPartWithLLM(query, part1),
    processPartWithLLM(query, part2),
  ]);
  // Merge the results from both parts
  const mergedResult = mergeResults(part1Result, part2Result);
  // Perform secondary analysis
  return await performSecondaryAnalysis(mergedResult, query);
};

export { analyzeDataForCharts };

const performSecondaryAnalysis = async (structuredResponse, query) => {
  const data = structuredResponse.data;
  // Dynamically detect data types
  const dataTypes = detectDataTypes(data);

  // Analysis results object
  const analysisResults = {};

  // Count total entries in the first column (first field)
  const firstField = Object.keys(data[0])[0]; // Get the name of the first field
  const totalEntries = data.length;
  analysisResults[firstField] = { totalEntries };

  // Perform analysis on each field
  Object.keys(dataTypes).forEach((key) => {
    switch (dataTypes[key]) {
      case "string":
        const uniqueValues = getUniqueValues(data, key);
        const valueCounts = countUniqueValues(data, key);
        analysisResults[key] = {
          uniqueValues,
          valueCounts,
          multipleStates: uniqueValues.length > 1 ? true : false, // Determine if there are multiple states
        };
        break;
      case "number":
        analysisResults[key] = calculateNumericStats(data, key); // Numeric field statistics
        break;
      case "date":
        analysisResults[key] = { dateRange: getDateRange(data, key) }; // Date range analysis
        break;
    }
  });

  // If there is a date field, group by date and aggregate numeric fields
  const dateField = Object.keys(dataTypes).find(
    (key) => dataTypes[key] === "date"
  );
  if (dateField) {
    const numericFields = Object.keys(dataTypes).filter(
      (key) => dataTypes[key] === "number"
    );
    numericFields.forEach((numericField) => {
      analysisResults[`${dateField}_grouped_${numericField}`] =
        groupByAndAggregate(data, dateField, numericField);
    });
  }

  // Include query information
  analysisResults.query = query;
  // Build a new prompt to pass to LLM to recommend chart type
  return await recommendChartType(data, dataTypes, analysisResults);
};

// Recommend chart type
const recommendChartType = async (data, dataTypes, analysisResults) => {
  const prompt = `
You are an intelligent data analysis assistant. Your task is to analyze the provided data and user query, then recommend the most suitable chart type for visualization and output the chart data.

**Input Data Sample:**
${data}

**Data Types:**
${JSON.stringify(dataTypes, null, 2)}

**Analysis Results:**
${JSON.stringify(analysisResults, null, 2)}

**User Query:**
${JSON.stringify(analysisResults.query, null, 2)}

Based on the above data, data types, analysis results and user query, please recommend the most suitable chart type for visualizing this data. Consider the following factors:

1. The nature of the data (time series, categorical, numerical, etc.)
2. The number of unique values for each field
3. The presence of date fields and their range
4. The distribution and statistics of numerical fields

In your response, please include:
1. The recommended chart type: line or bar
3. Any additional data transformations or aggregations that might be necessary for the chosen chart type
4. The chart data in JSON format, including the chart title, x-axis label, y-axis label, and the chart data
  **Output Format:**
  {
    "chartType": "line",
    "dataTransformations": {
      "xAxis": "date",
      "yAxis": "value",
      "aggregation": "sum"
    },
    "chartData": {
      "title": "Sales by Date",
      "xAxisLabel": "Date",
      "yAxisLabel": "Sales",
      "data": [
        { "date": "2023-01-01", "sales": 100 },
        { "date": "2023-01-02", "sales": 150 },
        { "date": "2023-01-03", "sales": 200 }
      ]
    }
  }
  Thoroughly examine all input data at least **3 times**, ensuring that no relevant information is lost.
  **Important**: Ensure that the response is valid JSON. Do not include any extra text, headers, or explanations.`;

  try {
    // Call LLM to recommend chart type
    const response = await client.invoke(prompt);
    // Ensure response is not undefined or null
    if (!response || !response.content) {
      throw new Error("LLM returned an undefined or null response.");
    }
    // Check if the response is a valid JSON
    const cleanedResponse = response.content.trim();
    if (!cleanedResponse.startsWith("{") && !cleanedResponse.endsWith("}")) {
      throw new Error("LLM response is not a valid JSON object");
    }

    // Try to parse JSON
    const jsonResponse = JSON.parse(cleanedResponse);
    // Return recommended chart type and data
    return jsonResponse;
  } catch (error) {
    console.error("Failed to recommend chart type:", error);
    throw error;
  }
};

// Helper functions for data analysis
const detectDataTypes = (data) => {
  const dataTypes = {};

  if (data.length === 0) return dataTypes;

  Object.keys(data[0]).forEach((key) => {
    const sampleValue = data[0][key];
    if (typeof sampleValue === "string") {
      // Check if it is a date
      const date = Date.parse(sampleValue);
      if (!isNaN(date)) {
        dataTypes[key] = "date";
      } else {
        dataTypes[key] = "string";
      }
    } else if (typeof sampleValue === "number") {
      dataTypes[key] = "number";
    } else {
      dataTypes[key] = typeof sampleValue;
    }
  });

  return dataTypes;
};

// Get unique values of a field
const getUniqueValues = (data, key) => {
  const uniqueValues = [...new Set(data.map((entry) => entry[key]))];
  return uniqueValues;
};

// Count the occurrences of each unique value in a field
const countUniqueValues = (data, key) => {
  const valueCounts = {};
  data.forEach((entry) => {
    const value = entry[key];
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });
  return valueCounts;
};

// Calculate numeric field statistics (e.g., mean, min, max)
const calculateNumericStats = (data, key) => {
  const values = data
    .map((entry) => entry[key])
    .filter((v) => typeof v === "number");
  const total = values.reduce((acc, value) => acc + value, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = total / values.length;

  return { total, min, max, mean };
};

// Get the range of a date field
const getDateRange = (data, key) => {
  const dates = data
    .map((entry) => new Date(entry[key]))
    .filter((d) => !isNaN(d));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return { minDate, maxDate };
};

// Group by date field and aggregate numeric field
const groupByAndAggregate = (data, dateField, numericField) => {
  const groupedData = {};

  data.forEach((entry) => {
    const date = entry[dateField];
    const value = entry[numericField];

    if (!groupedData[date]) {
      groupedData[date] = { sum: 0, count: 0 };
    }

    groupedData[date].sum += value;
    groupedData[date].count += 1;
  });

  // Return the sum and average for each date
  const result = Object.keys(groupedData).map((date) => ({
    date,
    total: groupedData[date].sum,
    average: groupedData[date].sum / groupedData[date].count,
  }));

  return result;
};
