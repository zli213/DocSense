import React, { useState, useEffect, useRef, use } from "react";
import { Ellipsis, Dna } from "lucide-react";
import Image from "next/image";
import SimpleInfoCard from "./SimpleInfoCard";
import selectCitations from "@/app/utils/topNCitations";
import ActionButtonGroup from "./ActionButton";
import InfoCard from "@/components/InfoCard";
import logo from "@/../public/logo_no_font.png";
import renderAnswerWithCitations from "@/app/utils/renderAnswer";
import SourceSummary from "@/components/SourceSummary";
import { useSelector, useDispatch } from "react-redux";
import { fetchChartData } from "@/components/fetchChartData";
import { jumpToPresignedUrl } from "@/components/jumpToPresignedUrl";

const AnswerBox = ({
  index,
  question,
  answer,
  isVisible,
  onSourceToggle,
  metaData,
  handleReSearchSubmit,
  chartComponent,
}) => {
  const [showSource, setShowSource] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const answerBoxRef = useRef(null);
  const [presignedUrl, setPresignedUrl] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState(null);
  const [chartXAxis, setChartXAxis] = useState("");
  const [chartYAxis, setChartYAxis] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const handlePresignedUrlGenerated = (url) => {
    setPresignedUrl(url);
  };
  const handleMouseEnter = (event) => {
    const buttonRect = event.target.getBoundingClientRect();
    const answerBoxRect = answerBoxRef.current.getBoundingClientRect();
    setButtonPosition({
      x: buttonRect.left - answerBoxRect.left,
      y: buttonRect.top - answerBoxRect.top,
    });
  };

  // Implement jump logic after button click
  const handleButtonClick = async () => {
    jumpToPresignedUrl(metaData, hoveredIndex);
  };

  const titleRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newQuestion, setNewQuestion] = useState(question);

  const dispatch = useDispatch();
  const {
    limitedPreviousSearchUpdated, //Unconditionally triggered by simply limiting previousSearch to a length greater than 0
  } = useSelector((state) => state.search);

  useEffect(() => {}, [buttonPosition]);
  const displayCitations = selectCitations(metaData);
  const updateLogo = () => {
    const theme = localStorage.getItem("theme");
    setCurrentLogo(theme === "dark" ? logoDark : logo);
  };

  useEffect(() => {
    updateLogo();

    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        updateLogo();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Scroll with offset to avoid header obstruction
  const scrollToTitleWithOffset = () => {
    // Scroll to the title/input element
    titleRef.current.scrollIntoView({ behavior: "smooth" });
    const yOffset = -100; // Adjust this value based on the height of your main title/header
    const y =
      titleRef.current.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Add a delay to focus the text input
    setTimeout(() => {
      if (!isEditing && titleRef.current) {
        titleRef.current.focus();
      }
    }, 300);
  };

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    scrollToTitleWithOffset();
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewQuestion(e.target.value);
  };

  //Handle input submit
  const handleNewQuestionSubmit = () => {
    const syntheticEvent = { preventDefault: () => {} };
    setIsEditing(!isEditing);
    handleReSearchSubmit(syntheticEvent, newQuestion, index);
  };

  const toggleSourceVisibility = () => {
    setShowSource(!showSource);
    onSourceToggle(!showSource);
  };

  useEffect(() => {
    if (isVisible) {
      // Call the fetchChartData function imported from external source
      fetchChartData(
        metaData,
        question,
        setChartData,
        setChartType,
        setChartXAxis,
        setChartYAxis,
        setChartTitle
      );
    }
  }, [isVisible, question, metaData]);
  if (!isVisible) {
    return null;
  }
  return (
    <div
      ref={answerBoxRef}
      className="bg-secondary-background bg-opacity-75 backdrop-blur-sm w-full rounded-3xl sm:w-11/12 md:w-3/5 mx-auto justify-center mt-3 sm:mt-5 px-2 sm:px-4 dark:bg-dark-primary-background dark:bg-opacity-75 dark:backdrop-blur-sm relative shadow-lg"
    >
      <div className="flex justify-start items-center w-full">
        {isEditing ? (
          <input
            ref={titleRef}
            type="text"
            value={newQuestion}
            onChange={handleInputChange}
            className="text-lg sm:text-xl md:text-2xl font-bold w-full px-2 py-2 sm:py-3 border rounded-lg sm:rounded-2xl"
          />
        ) : (
          <h2
            className="text-lg sm:text-xl md:text-2xl font-bold w-full px-2 py-2 sm:py-3"
            ref={titleRef}
          >
            {question}
          </h2>
        )}
      </div>
      <div className="flex flex-row-reverse">
        {isEditing ? (
          <>
            <button
              type="button"
              className="bg-primary-color text-white text-sm sm:text-base mx-1 mt-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md hover:bg-secondary-color"
              onClick={handleEditClick}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-color text-white text-sm sm:text-base mx-1 mt-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md hover:bg-secondary-color"
              onClick={handleNewQuestionSubmit}
            >
              Save
            </button>
          </>
        ) : (
          <p></p>
        )}
      </div>
      {displayCitations.length > 0 &&
        (!answer.includes("could not find an exact answer") ||
          answer.length > 60) && (
          <>
            <div className="flex justify-start my-2 mx-1 items-center">
              <Dna className="w-5 h-5" color="#57C3BA" />
              <p className="text-lg ml-2">Sources</p>
            </div>
            <div className="flex justify-aroud w-full">
              {displayCitations.map((data, index) => (
                <SimpleInfoCard
                  key={index}
                  isHovered={true}
                  content={data.doc.metadata.pageContent}
                  sourceUri={data.doc.metadata.source}
                  score={data.rrfScore}
                  displayCitations={displayCitations}
                />
              ))}
              <button
                className={`transition-opacity duration-300 ${
                  limitedPreviousSearchUpdated
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
                onClick={toggleSourceVisibility}
                title="more"
              >
                <Ellipsis />
              </button>
            </div>
          </>
        )}

      <div className="flex justify-start my-2 mx-1 items-center">
        {currentLogo && (
          <Image src={currentLogo} alt="logo" className="w-5 h-5" />
        )}
        <p className="text-lg ml-2">Answer</p>
      </div>
      {metaData &&
        metaData.length > 0 &&
        (!answer.includes("could not find an exact answer") ||
          answer.length > 60) && (
          <SourceSummary
            content={metaData[0]?.doc.metadata.pageContent}
            sourceUri={metaData[0]?.doc.metadata.source}
            displayCitations={displayCitations}
            onPresignedUrlGenerated={handlePresignedUrlGenerated} // Pass the callback
            chartComponent={chartComponent}
            summary={metaData[0]?.doc.metadata.summary}
            chartData={chartData}
            chartType={chartType}
            chartXAxis={chartXAxis}
            chartYAxis={chartYAxis}
            chartTitle={chartTitle}
          />
        )}
      {metaData && metaData.length > 0 && (
        <div className="answer-section p-2">
          <div
            className="answer text-gray-700 dark:text-cross-color flex flex-wrap items-center"
            onClick={handleButtonClick}
          >
            {renderAnswerWithCitations(
              answer,
              setHoveredIndex,
              handleMouseEnter
            )}
            {hoveredIndex !== null && (
              <div className="hidden sm:block">
                <InfoCard
                  isHovered={true}
                  content={metaData[hoveredIndex].doc.metadata.pageContent}
                  sourceUri={metaData[hoveredIndex].doc.metadata.source}
                  score={metaData[hoveredIndex].rrfScore}
                  position={buttonPosition}
                  category={metaData[hoveredIndex].doc.metadata.category}
                  tag={metaData[hoveredIndex].doc.metadata.tag}
                  summary={metaData[hoveredIndex]?.doc.metadata.summary}
                />
              </div>
            )}
          </div>
          <div className="mt-4 md:mb-0 sm:mt-1 mb-14">
            <ActionButtonGroup
              s3Uri={metaData[0]?.doc.metadata.source}
              answer={answer}
              handleReSearchSubmit={handleReSearchSubmit}
              question={question}
              index={index}
              handleEditClick={handleEditClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerBox;
