import React from "react";

const FilePreview = ({ fileName, presignedUrl, fileExtension }) => {
  const officeExtensions = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];

  const getPreviewUrl = () => {
    if (officeExtensions.includes(fileExtension)) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        presignedUrl
      )}`;
    }
    return presignedUrl;
  };

  return (
    <a
      href={getPreviewUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-xs dark:text-cross-color ml-1"
    >
      {fileName}
    </a>
  );
};

export default FilePreview;
