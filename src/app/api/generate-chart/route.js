import { NextResponse } from "next/server";
import { analyzeDataForCharts } from "@/lib/chartUtils.js";

// Define the POST handler for the API route
export async function POST(req) {
  try {
    // Extract the body from the request
    const { query, excelData } = await req.json();

    // Generate chart data by calling the backend function
    const chartData = await analyzeDataForCharts(query, excelData);
    // Send the chart data back in the response
    return NextResponse.json({ chartData }, { status: 200 });
  } catch (error) {
    console.error("Error generating chart data:", error);
    return NextResponse.json(
      { error: "Failed to generate chart data" },
      { status: 500 }
    );
  }
}

// // Backend function to generate chart data from the parsed answer
// async function generateChart(data) {
//     // Parse the "answer" to extract data (assuming the answer contains structured tabular data)
//     const parsedData = parseAnswerToTable(data);

//     // Call LangChain or some AI analysis to determine the best chart type and data structure
//     const chartData = await analyzeDataForCharts(parsedData);

//     // Return the chart data
//     return chartData;
// }

// // Helper function to parse the answer into a structured format (rows and columns)
// function parseAnswerToTable(answer) {
//   // Example of how to parse an answer (adjust to your use case)
//   return {
//     //parse data here if required
//   };
// }
