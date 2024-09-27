import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import getFileIcon from "@/app/utils/fileIconUtils";
import FilePreview from "@/components/FilePreview";


const InfoCard = ({
  isHovered,
  content,
  sourceUri,
  score,
  position,
  category,
  tag,
  summary,
}) => {
  const [isAttentionNeeded, setIsAttentionNeeded] = useState(false);


  // Monitor changes to the summary with useEffect and set isAttentionNeeded.
  useEffect(() => {
    if (summary && summary.includes("ATTENTION: This document may be old, so please be careful to screen it.")) {
      setIsAttentionNeeded(true); // Set isAttentionNeeded to true when the summary contains specific keywords.
    } else {
      setIsAttentionNeeded(false); // Otherwise set to false
    }
  }, [summary]);


  if (!isHovered) return null;
  const fileIcon = getFileIcon(sourceUri);
  // Get the file name from sourceUri, excluding the file extension
  let fileName = sourceUri.split("/").pop().split(".")[0];
  if (fileName.length > 20) {
    fileName = fileName.slice(0, 20) + "...";
  }
  const fileExtension = sourceUri.split(".").pop().toLowerCase();
  // Get the integer part of score
  score = parseInt(100 * score);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 w-96 max-h-48 overflow-hidden shadow-md dark:bg-dark-secondary-background dark:border-primary-color"
      style={{
        position: "absolute",
        left: `${position.x - 192}px`,
        top: `${position.y - 220}px`,
        zIndex: 1000,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src={fileIcon}
            alt="Document type icon"
            className="w-4 h-4 mr-1"
            width={16}
            height={16}
          />
          <FilePreview
            fileName={fileName}
            // presignedUrl={presignedUrl}
            fileExtension={fileExtension}
          />
        </div>
        <div
          className="radial-progress bg-primary text-primary-content border-primary border-2"
          style={{ "--value": score, "--size": "1.5rem", fontSize: "12px" }}
          role="progressbar"
        >
          {score}
        </div>
      </div>
      <p className="m-0 text-sm line-clamp-5 dark:text-cross-color">
        {content}
      </p>
      <div className="flex justify-start items-center mt-2 text-xs text-gray-500">
        <div className="badge badge-primary bg-blue-100 font-bold badge-outline mr-3 p-2.5">
          {category}
        </div>
        <div className="badge badge-accent bg-green-50 text-green-500 font-bold badge-outline mr-3 p-2.5">
          {tag}
        </div>
        {isAttentionNeeded && ( // Show or hide CircleAlert based on judgment
          <button title="This source may be outdated, please do not totally rely on it.">
            <CircleAlert className="text-red-500 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
