import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import getFileIcon from "@/app/utils/fileIconUtils";
import { generatePresignedUrl } from "@/lib/s3Service";
import FilePreview from "@/components/FilePreview";
import Cookies from "js-cookie";

const SourceInforCard = ({
  content,
  sourceUri,
  score,
  category,
  tag,
  summary,
}) => {
  const [presignedUrl, setPresignedUrl] = useState("");
  const [docDepartment, setDocDepartment] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [isAttentionNeeded, setIsAttentionNeeded] = useState(false);

  const fileIcon = getFileIcon(sourceUri);
  let fileName = sourceUri.split("/").pop().split(".")[0];
  if (fileName.length > 20) {
    fileName = fileName.slice(0, 20) + "...";
  }
  const fileExtension = sourceUri.split(".").pop().toLowerCase();
  score = parseInt(100 * score);

  // Split sourceUri into bucketName and objectKey
  const objectKey = sourceUri.split("documentsearch/")[1];
  const bucketName = "documentsearch";

  useEffect(() => {
    const fetchUrl = async () => {
      const url = await generatePresignedUrl(bucketName, objectKey);
      setPresignedUrl(url);
    };
    // const fetchDocDetails = async () => {
    //   const cachedData = Cookies.get(sourceUri);

    //   if (cachedData) {
    //     const data = JSON.parse(cachedData);

    //     setDocDepartment(data.docDepartment);
    //     setTag(data.tag);
    //     setSummary(data.summary);
    //     setIsAttentionNeeded(data.isAttentionNeeded);
    //     setIsLoading(false);
    //   } else {
    //     try {
    //       const response = await fetch(`/api/getDocDetail?s3link=${encodeURIComponent(sourceUri)}`);
    //       const data = await response.json();

    //       if (data.docDepartment) setDocDepartment(data.docDepartment);
    //       if (data.tag) setTag(data.tag);
    //       if (data.summary) {
    //         setSummary(data.summary);
    //         const attention = data.summary.includes(
    //           "ATTENTION: This document may be old, so please be careful to screen it."
    //         );
    //         setIsAttentionNeeded(attention);

    //         // Stored in a cookie
    //         Cookies.set(
    //           sourceUri,
    //           JSON.stringify({
    //             docDepartment: data.docDepartment,
    //             tag: data.tag,
    //             summary: data.summary,
    //             isAttentionNeeded: attention,
    //           }),
    //           { expires: 1 } // Set expiration time to 1 day
    //         );
    //       }
    //     } catch (error) {
    //       console.error("Failed to fetch document details:", error);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   }
    // };
    fetchUrl();
    // fetchDocDetails();
  }, [bucketName, objectKey, sourceUri]);

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-3 w-full max-w-96 max-h-48 overflow-hidden shadow-md dark:bg-dark-secondary-background dark:border-primary-color">
        <div className="flex items-center justify-between mb-2">
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
              presignedUrl={presignedUrl}
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
        <p className="m-0 text-sm line-clamp-3 sm:line-clamp-5 dark:text-cross-color">
          {content}
        </p>
        <div className="flex flex-wrap justify-start items-center mt-2 text-xs text-gray-500">
          <div className="badge badge-primary bg-blue-100 font-bold badge-outline mr-2 mb-1 p-2">
            {category}
          </div>
          <div className="badge badge-accent bg-green-50 text-green-500 font-bold badge-outline mr-2 mb-1 p-2">
            {tag}
          </div>
          {/* {isAttentionNeeded && (
      <button title="This source may be outdated, please do not totally rely on it.">
        <CircleAlert className="text-red-500 ml-2" />
      </button>
    )} */}
        </div>
      </div>
    </div>
  );
};

export default SourceInforCard;
