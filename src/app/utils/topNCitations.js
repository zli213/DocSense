export default function selectCitations(citations) {
  // Group citations by file name (assuming the file name can be extracted from the URI)
  const groups = {};
  citations.forEach((citation) => {
    const fileName = citation.doc.metadata.source.split("/").pop().split(".")[0];
    if (!groups[fileName]) {
      groups[fileName] = [];
    }
    groups[fileName].push(citation);
  });

  // Sort each group by score in descending order
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => b.score - a.score);
  });

  const sortedFiles = Object.keys(groups).sort(
    (a, b) => groups[b][0].score - groups[a][0].score
  );
  let selectedCitations = [];

  if (sortedFiles.length >= 3) {
    // If there are three or more different files, select the top scoring citation from the top three scoring files
    selectedCitations = sortedFiles.slice(0, 3).map((key) => groups[key][0]);
  } else if (sortedFiles.length === 2) {
    // If there are exactly two different files, select the top scoring citation from each file
    selectedCitations = sortedFiles.map((key) => groups[key][0]);
  } else if (sortedFiles.length === 1) {
    // If there's only one file, select the top scoring citation from that file
    selectedCitations.push(groups[sortedFiles[0]][0]);
  }

  return selectedCitations;
}
