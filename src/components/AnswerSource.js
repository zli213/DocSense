import React from "react";
import { X } from "lucide-react";
import SourceInforCard from "@/components/SourceInforCard";
import getFileIcon from "@/app/utils/fileIconUtils";
import { useEffect, useState } from "react";

const AnswerSource = ({ metaData, isVisible, onClose, message }) => {
  // State to control the visibility and animation
  const [isClosing, setIsClosing] = useState(false);

  // //Get the fileIcon of each data
  // metaData.forEach((cardContent) => {
  //   cardContent.fileIcon = getFileIcon(cardContent.location.s3Location.uri);
  // });
  // Clone metaData and add fileIcon to each cardContent
  const clonedMetaData = metaData.map((cardContent) => ({
    ...cardContent,
    fileIcon: getFileIcon(cardContent.doc.metadata.source),
  }));

  useEffect(() => {
    if (!isVisible && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        onClose(); // Call onClose after the animation duration
      }, 300); // Matches the animation duration
    }
  }, [isVisible, onClose, isClosing]);

  const handleInnerClick = (event) => {
    // Prevents click event from propagating to the outer div
    event.stopPropagation();
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Ensure this matches the duration of the animation
  };

  return (
    <div
      className={`fixed inset-0 z-30 bg-opacity-90 backdrop-blur-sm flex items-start justify-end transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleCloseClick}
    >
      <div
        className="p-4 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-full overflow-y-auto bg-white bg-opacity-90 rounded-xl shadow-lg border-l-2 border-gray-300 dark:border-primary-color dark:bg-dark-primary-background"
        onClick={handleInnerClick}
      >
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl sm:text-2xl font-bold dark:text-cross-color">
            {metaData.length === 1
              ? "1 Source:"
              : `${metaData.length} Sources:`}
          </h2>
          <button
            className="text-gray-600 dark:text-cross-color text-sm w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
            onClick={handleCloseClick}
          >
            <X />
          </button>
        </div>

        <h3 className="text-sm sm:text-base text-gray-600 mb-4 dark:text-cross-color">
          {message}
        </h3>

        {metaData.map((cardContent, index) => (
          <div
            key={index}
            className="mb-4 p-2 sm:p-3 bg-tertiary-background dark:bg-dark-secondary-background rounded-md mx-auto max-w-2xl"
          >
            <SourceInforCard
              content={cardContent.doc.metadata.pageContent}
              sourceUri={cardContent.doc.metadata.source}
              score={cardContent.rrfScore}
              category={cardContent.doc.metadata.category}
              tag={cardContent.doc.metadata.tag}
              summary={cardContent.doc.metadata.summary}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerSource;
