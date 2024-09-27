import React from "react";
import Image from "next/image";
import getFileIcon from "@/app/utils/fileIconUtils";
import { generatePresignedUrl } from "@/lib/s3Service";
import { useState, useEffect } from "react";
import FilePreview from "@/components/FilePreview";

const SimpleInfoCard = ({ content, sourceUri, score, displayCitations }) => {
  const [presignedUrl, setPresignedUrl] = useState("");
  const fileIcon = getFileIcon(sourceUri);
  let fileName = sourceUri.split("/").pop().split(".")[0];
  if (fileName.length > 20) {
    fileName = fileName.slice(0, 20) + "...";
  }
  const fileExtension = sourceUri.split(".").pop().toLowerCase();
  score = Math.round(score * 100);
  const widthClass =
    displayCitations.length === 1
      ? "w-full"
      : displayCitations.length >= 3
      ? "w-1/3"
      : "w-1/2";
  // Solve the mess of content, if there is �, replace it with a space
  // console.log("content", content);
  content = content.replace(/�/g, " ");
  // Split sourceUri into bucketName and objectKey
  const objectKey = sourceUri.split("documentsearch/")[1];
  const bucketName = "documentsearch";
  useEffect(() => {
    const fetchUrl = async () => {
      const url = await generatePresignedUrl(bucketName, objectKey);
      setPresignedUrl(url);
    };
    fetchUrl();
  }, [objectKey, bucketName]);
  return (
    <div
      className={`bg-tertiary-background border border-gray-200 rounded-lg p-2 ${widthClass} max-h-32 overflow-hidden dark:bg-dark-secondary-background dark:border-primary-color m-1`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
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
        <div
          className="radial-progress bg-primary text-primary-content border-primary border"
          style={{ "--value": score, "--size": "1rem", fontSize: "8px" }}
          role="progressbar"
        >
          {score}
        </div>
      </div>
      <p className="text-xs line-clamp-2 dark:text-cross-color mx-4 my-1">
        {content}
      </p>
    </div>
  );
};

export default SimpleInfoCard;
