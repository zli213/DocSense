import React, { useState } from "react";
import { generatePresignedUrl } from "@/lib/s3Service";
import {
  Share,
  RefreshCw,
  Copy,
  Pencil,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";

const ActionButton = ({ action, label, onClick, isActive, disabled, className }) => {
  const getIcon = (actionType) => {
    switch (actionType) {
      case "share":
        return <Share className="w-4 h-4" />;
      case "rewrite":
        return <RefreshCw className="w-4 h-4" />;
      case "copy":
        return <Copy className="w-4 h-4" />;
      case "edit":
        return <Pencil className="w-4 h-4" />;
      case "thumbsDown":
        return <ThumbsDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <button
      className={`flex items-center gap-1 px-3 py-3 sm:px-3 sm:py-2 text-sm sm:text-sm 
      ${isActive ? "bg-gray-400 text-white" : "text-gray-600 bg-white"}
      ${className} 
      border border-gray-300  hover:bg-gray-100 transition-colors duration-200 rounded-3xl`}
      onClick={onClick}
    >
      {getIcon(action)}
      <span className={label ? "" : "sr-only"}>{label}</span>
    </button>
  );
};

const convertHtmlToPlainText = (html) => {
  // Parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extract the text content while preserving basic structure like paragraphs and lists
  let plainText = "";

  // Loop through child nodes to maintain structure
  doc.body.childNodes.forEach((node) => {
    if (node.nodeName === "P") {
      plainText += node.textContent.trim() + "\n\n"; // Add extra line breaks for paragraphs
    } else if (node.nodeName === "UL") {
      node.childNodes.forEach((li) => {
        if (li.nodeName === "LI") {
          plainText += "• " + li.textContent.trim() + "\n"; // Add bullet points for list items
        }
      });
      plainText += "\n"; // Add extra line break after the list
    } else {
      plainText += node.textContent.trim() + "\n"; // For other elements, just add text
    }
  });

  return plainText.trim();
};

const ActionButtonGroup = ({
  s3Uri,
  answer,
  handleReSearchSubmit,
  question,
  index,
  handleEditClick,
  isInHistoryLog = false,
}) => {
  const [isThumbsDownActive, setIsThumbsDownActive] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState("");

  //Process uri sharing
  if (s3Uri) {
    const objectKey = s3Uri.split("documentsearch/")[1];
    const bucketName = "documentsearch";
    const fetchUrl = async () => {
      const url = await generatePresignedUrl(bucketName, objectKey);
      setPresignedUrl(url);
    };
    fetchUrl();
  }

  const handleShareClick = () => {
    if (s3Uri) {
      navigator.clipboard.writeText(presignedUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handleRewriteClick = () => {
    if (isInHistoryLog) return;

    const syntheticEvent = { preventDefault: () => { } };
    handleReSearchSubmit(syntheticEvent, question, index);
  };

  const handleCopyClick = () => {
    if (answer) {
      // Copy the renderedAnswer content to clipboard
      navigator.clipboard.writeText(convertHtmlToPlainText(answer));
      alert("Rendered answer copied to clipboard!");
    }
  };

  const handleEditingClick = () => {
    if (isInHistoryLog) return;

    handleEditClick();
  };

  const handleThumbsDownClick = () => {
    setIsThumbsDownActive(!isThumbsDownActive);
    // Add any additional logic for thumbs down click
  };

  return (
    <div className="flex flex-row items-center justify-between gap-2 my-2 flex-wrap">
      <div className="flex flex-wrap gap-2">
        <ActionButton action="share" label="Share" onClick={handleShareClick} />
        <ActionButton
          className={isInHistoryLog ? "bg-primary-color opacity-40 cursor-not-allowed" : ""}
          action="rewrite"
          label="Rewrite"
          onClick={handleRewriteClick}
          disabled={isInHistoryLog}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton action="copy" label="" onClick={handleCopyClick} />
        <ActionButton
          className={isInHistoryLog ? "bg-primary-color opacity-40 cursor-not-allowed" : ""}
          action="edit" label=""
          disabled={isInHistoryLog}
          onClick={handleEditingClick} />
        <ActionButton
          action="thumbsDown"
          label=""
          onClick={handleThumbsDownClick}
          isActive={isThumbsDownActive}
        />
      </div>
    </div>
  );
};

export default ActionButtonGroup;
