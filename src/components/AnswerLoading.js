import React from "react";

const AnswerLoading = () => {
  return (
    <div className="flex flex-col gap-4 w-1/2 mt-5 ">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-4 w-56"></div>
      <div className="skeleton h-4 w-84"></div>
      <div className="skeleton h-32 w-full"></div>
    </div>
  );
};

export default AnswerLoading;
