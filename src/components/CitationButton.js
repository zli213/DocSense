import { useState } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import getFileIcon from "@/app/utils/fileIconUtils";
import InfoCard from "@/components/InfoCard";

const CitationButton = ({ sourceNumber, sourceInfo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const sourceUri = sourceInfo.location;
  const content = sourceInfo.description;
  const score = sourceInfo.score;
  let fileIcon = getFileIcon(sourceUri);
  return (
    <span
      className="relative cursor-pointer text-blue-600 z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute bottom-full mb-2 left-0 z-0 w-96 max-h-48 overflow-hidden dark:bg-dark-secondary-background dark:border-primary-color">
        <InfoCard
          isHovered={isHovered}
          content={content}
          fileIcon={fileIcon}
          sourceUri={sourceUri}
          score={score}
        />
      </div>
      <sup className="mr-1">[{sourceNumber}]</sup>
    </span>
  );
};

export default CitationButton;
