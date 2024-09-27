// components/FollowUp.js
import { SquareChevronRight, Plus } from "lucide-react";

const FollowUp = ({ questions, onQuestionClick }) => {
  return (
    <div className="bg-secondary-background bg-opacity-75 backdrop-blur-sm w-full rounded-3xl sm:w-11/12 md:w-3/5 mx-auto justify-center mt-3 sm:mt-5 px-2 sm:px-4 dark:bg-dark-primary-background dark:bg-opacity-75 dark:backdrop-blur-sm relative shadow-lg">
      <div className="flex justify-start my-2 mx-1 items-center pt-2">
        <SquareChevronRight className="w-5 h-5" />
        <p className="text-lg ml-2">Related</p>
      </div>
      {questions.map((question, index) => (
        <div
          key={index}
          className="p-2 border-t border-gray-300 flex items-center justify-between cursor-pointer"
          onClick={() => onQuestionClick(question)}
        >
          {/* Wrap the question in a flex-grow container */}
          <span className="flex-grow text-sm sm:text-base mr-4">
            {question}
          </span>
          <Plus className="w-5 h-5 text-gray-500 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default FollowUp;
