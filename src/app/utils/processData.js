// utils/processData.js

export function processJSONData(data) {
  // Initialize arrays to store extracted texts and metadata
  const extractedTexts = [];
  const metadataArray = [];

  // Iterate through each object in the "results" array
  data.results.forEach((result, index) => {
    // Check if the "score" value is greater than 0.4
    if (result.score > 0.4) {
      // Extract the "text" value from the "content" field and add a sequence number
      const extractedText = `<answer>${index + 1}. ${
        result.content.text
      }</answer>`;
      extractedTexts.push(extractedText);

      // Add a sequence number to the metadata and store it in the array
      const metadataWithIndex = { ...result, sequenceNumber: index + 1 };
      metadataArray.push(metadataWithIndex);
    }
  });

  // Join the extracted texts into a single string
  const extractedTextsString = extractedTexts.join("\n");

  // Return the extracted texts and metadata array
  return {
    extractedTexts: extractedTextsString,
    metadataArray: metadataArray,
  };
}
