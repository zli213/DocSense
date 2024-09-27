// fetchChartData.js

// Export fetchChartData function
export const fetchChartData = async (
  metaData,
  question,
  setChartData,
  setChartType,
  setChartXAxis,
  setChartYAxis,
  setChartTitle,
) => {
  if (metaData && metaData.length > 0) {
    const sourceUri = metaData[0]?.doc.metadata.source;
    const isExcel = sourceUri?.endsWith(".xlsx") || sourceUri?.endsWith(".xls");

    if (isExcel) {
      const isMultipleExcel = metaData.length > 1;

      if (isMultipleExcel) {
        const excelData = metaData
          .filter(
            (data) =>
              data.doc.metadata.source.endsWith(".xlsx") ||
              data.doc.metadata.source.endsWith(".xls")
          )
          .map((data) => data.doc.metadata.pageContent);

        try {
          const response = await fetch("/api/generate-chart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: question, excelData }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // console.log("rawchartdata", data);

            //Enable dynamic chart labelling
            const xAxis = data.chartData.dataTransformations.xAxis;
            const yAxis = data.chartData.dataTransformations.yAxis;
            setChartXAxis(xAxis);
            setChartYAxis(yAxis);

            const title = data.chartData.chartData.title;
            setChartTitle(title);

            const newData = data.chartData.chartData.data.map((item) => {
              return {
                [xAxis]: item[xAxis], // assuming you need these properties
                [yAxis]: item[yAxis], // assuming you need these properties
              };
            });

            switch (data.chartData.chartType) {
              case "line chart":
              case "line":
                setChartData(newData);
                setChartType("line");
                break;
              case "pie chart":
              case "pie":
                setChartData(newData);
                setChartType("pie");
                break;
              case "bar chart":
              case "bar":
                setChartData(newData);
                setChartType("bar");
                break;
              default:
                console.error("Unsupported chart type");
            }
          } else {
            console.error("Failed to generate chart data");
          }
        } catch (error) {
          console.error("Failed to generate chart data:", error);
        }
      }
    }
  }
};
