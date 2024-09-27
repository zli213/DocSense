import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import getFileIcon from "@/app/utils/fileIconUtils";
import { ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import { generatePresignedUrl } from "@/lib/s3Service";
import FilePreview from "@/components/FilePreview";
import {
  LineChartComponent,
  PieChartComponent,
  BarChartComponent,
} from "./Charts";

const SourceSummary = ({ content, sourceUri, displayCitations, summary, chartComponent, chartData, chartType, chartXAxis, chartYAxis, chartTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState("");
  const fileIcon = sourceUri ? getFileIcon(sourceUri) : null; // Check if sourceUri exists and is valid
  let fileName = "Unknown File";
  if (sourceUri) {
    fileName = sourceUri.split("/").pop().split(".")[0];
    if (fileName.length > 20) {
      fileName = fileName.slice(0, 20) + "...";
    }
  }

  const fileExtension = sourceUri.split(".").pop().toLowerCase();

  const widthClass =
    displayCitations.length === 1
      ? "w-full"
      : displayCitations.length >= 3
      ? "w-1/4"
      : "w-1/2";

  // Split sourceUri into bucketName and objectKey
  const objectKey = sourceUri.split("documentsearch/")[1];
  const bucketName = "documentsearch";
  const hasExpandedAutomatically = useRef(false);
  const sourceRef = useRef(null);

  // let chartData = [];
  // let chartType = '';

  // if (fileExtension === "xlsx") {
  //   chartData = [{ name: "Present", value: 19 }, { name: "Late", value: 8 }, { name: "Absent", value: 4 }]
  //   chartType = "bar";
  // }
  
  const handleToggle = () => {
    setIsExpanded(prev => {
      const newState = !prev;
      
      if (newState && sourceRef.current) {
        // Scroll to the reference element
        sourceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
        // Adjust scroll position 100 pixels below
          window.scrollBy({
            top: 100, // Scroll 100 pixels down
            behavior: 'smooth' // Smooth scrolling
          })
  
      }
      
      return newState;
    });
  };

  useEffect(() => {
    if (chartData && chartType && !hasExpandedAutomatically.current) {
      setIsExpanded(true);
      hasExpandedAutomatically.current = true;
    }
  }, [chartData, chartType]);

  useEffect(() => {
    // const fetchSummary = async () => {
    //   const cachedSummary = Cookies.get(`${sourceUri}_summary`);

    //   if (cachedSummary) {
    //     setSummary(cachedSummary);
    //     setIsLoading(false);
    //   } else {
    //     try {
    //       const response = await fetch(
    //         `/api/getDocDetail?s3link=${encodeURIComponent(sourceUri)}`
    //       );
    //       const data = await response.json();

    //       if (data.summary) {
    //         setSummary(data.summary);
    //         Cookies.set(`${sourceUri}_summary`, data.summary, { expires: 1 }); // Stored in cookie, expires after 1 day
    //       } else {
    //         console.warn("Summary not found in response");
    //       }
    //     } catch (error) {
    //       console.error("Failed to fetch summary:", error);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   }
    // };

    const fetchUrl = async () => {
      const url = await generatePresignedUrl(bucketName, objectKey);
      setPresignedUrl(url);
    };

    // fetchSummary();
    fetchUrl();
  }, [sourceUri, bucketName, objectKey]);

  const sanitizedContent = summary.replace(/�/g, " ").replace(/^(\*\*Summary:\*\*\s*)/i, "");

  return (
    <div
      className={`bg-tertiary-background border border-gray-200 rounded-lg p-2 min-h-[7rem] w-full overflow-hidden dark:bg-dark-secondary-background dark:border-primary-color m-1`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center" ref={sourceRef}>
          <Image
            src={fileIcon}
            alt="Document type icon"
            width={12}
            height={12}
          />
          <FilePreview
            fileName={fileName}
            presignedUrl={presignedUrl}
            fileExtension={fileExtension}
          />
        </div>
        <div className="">
          <button
            className=""
            onClick={handleToggle} // Toggle Expanded State
          >
            <ChevronDown
              className={`h-4 w-4 transform transition-transform duration-500 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {/* This part shows the text summary */}
      <p
        className={`text-xs dark:text-cross-color mx-4 my-1 ${isExpanded ? "" : "line-clamp-4"
          }`}
      >
        <span className="font-bold">Quick Summary: </span>
        {sanitizedContent}
      </p>

      {/* Adjust transition duration with a fixed max height */}
  <div
    style={{ maxHeight: isExpanded ? '500px' : '0px' }} // Replace 500px with whatever height you need
    className={`transition-[max-height] duration-[800ms] ease-in-out overflow-hidden`}
  >
    {isExpanded && (
      <div className="chart-container">
        {chartData && chartType === "line" && <LineChartComponent data={chartData} XAxis={chartXAxis} YAxis={chartYAxis} title={chartTitle} />}
        {/* {chartData && chartType === "pie" && <PieChartComponent data={chartData} />} */}
        {chartData && chartType === "bar" && <BarChartComponent data={chartData} XAxis={chartXAxis} YAxis={chartYAxis} title={chartTitle} />}
      </div>
    )}
  </div>

    </div>
  );
};

export default SourceSummary;
