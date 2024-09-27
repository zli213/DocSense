"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import MenuBar from "@/components/menuBar.js";
import SearchBar from "@/components/SearchBar.js";
import AnswerBox from "@/components/AnswerBox.js";
import HistoryLog from "@/components/HistoryLog";
import FollowUp from "@/components/FollowUp.js";
import AnswerLoading from "@/components/AnswerLoading";
import {
  handleSummarize,
  handleCreateLog,
  handleUpdateLog,
  handleSearchLogs,
  handleRetrieve,
  handleAzureOpenAIStream,
  fetchUserRoleAndPermissions,
  fetchDepartmentInfo,
  generateFollowUpQuestions,
} from "@/app/utils/apiService.js";
import AnswerSource from "@/components/AnswerSource";
import { LibraryBig, Sparkles, Search, LogOut, Bolt } from "lucide-react";
import LoadingSection from "@/components/LoadingSection";
import {
  setSearchActive,
  setInput,
  setMessage,
  setResponseContent,
  setPreviousSearch,
  setFirstSearchDone,
  setCurrentLogId,
  setSourceVisible,
  setIsResponse,
  setIsLoading,
  setIsAuthorized,
  setIsStreamComplete,
  setIsHistoryVisible,
  setFolders,
  setRoleTypes,
  setError,
  setIsMessageLocked,
  setIsNewQuerySubmitted,
  setIsHistoryLogClicked,
  setPreviousSearchUpdated,
  setLimitedPreviousSearchUpdated,
  setActiveSourceIndex,
  setNewLogTitle,
  setChartComponent,
  setQuestionList,
  setShowQuestions,
} from "@/app/store/slices/searchSlice";
import { render } from "@react-email/components";

export default function SearchPage() {
  const dispatch = useDispatch();
  const {
    isSearchActive,
    input,
    message,
    responseContent,
    previousSearch,
    firstSearchDone,
    currentLogId,
    sourceVisible,
    isResponse,
    isLoading,
    isAuthorized,
    isStreamComplete,
    isHistoryVisible,
    folders,
    roleTypes,
    error,
    isMessageLocked,
    isNewQuerySubmitted,
    isHistoryLogClicked,
    previousSearchUpdated, //Triggered when previousSearch length is greater than 1 and both isHistoryLogClicked and isNewQuerySubmitted are true.
    limitedPreviousSearchUpdated, //Unconditionally triggered by simply limiting previousSearch to a length greater than 0
    activeSourceIndex,
    newLogTitle,
    chartComponent,
    theme,
    isDeleteModalOpen,
    questionList,
    showQuestions,
  } = useSelector((state) => state.search);

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  // Getting logs in Redux
  const currentLogs = useSelector((state) => state.search.searchLogs);

  // Listen for changes to previousSearch
  useEffect(() => {
    if (previousSearch.length > 0) {
      dispatch(setLimitedPreviousSearchUpdated(true));
    }
  }, [previousSearch, dispatch]);

  // Listen for changes to isHistoryLogClicked.
  useEffect(() => {
    if (isHistoryLogClicked) {
      dispatch(setLimitedPreviousSearchUpdated(false));
    }
  }, [isHistoryLogClicked, dispatch]);

  // Listen for changes to previousSearch.
  useEffect(() => {
    if (
      previousSearch.length > 1 &&
      isNewQuerySubmitted &&
      isHistoryLogClicked
    ) {
      dispatch(setPreviousSearchUpdated(true));
    }
  }, [previousSearch, dispatch, isNewQuerySubmitted, isHistoryLogClicked]);

  // Listens for changes to isNewQuerySubmitted and isHistoryLogClicked and resets them to false if they are not also true
  useEffect(() => {
    if (!(isNewQuerySubmitted && isHistoryLogClicked)) {
      dispatch(setPreviousSearchUpdated(false));
    }
  }, [isNewQuerySubmitted, isHistoryLogClicked, dispatch]);

  useEffect(() => {
    const fetchUserRoleAndDepartmentAndSearchLog = async () => {
      if (status === "authenticated" && session?.user?.id) {
        // Check if departmentId or roleId is missing.
        if (!session.user.departmentId || !session.user.roleId) {
          alert("Missing department ID or role ID. Please log in again.");
          await signOut({ redirect: false }); // Empty session
          router.push("/login"); // Redirect to login page
          return;
        }
        try {
          const userId = session.user.id.toString();
          const userRoleData = await fetchUserRoleAndPermissions(userId);

          if (session.user.departmentId) {
            const departmentData = await fetchDepartmentInfo(
              session.user.departmentId
            );
            if (departmentData && departmentData.departmentName) {
              dispatch(setFolders([departmentData.departmentName]));
            }
          }
          dispatch(setRoleTypes(userRoleData[0].roleTypes));
          if (session?.user?.roleId === 1) {
            router.push("/noAccess");
          } else {
            dispatch(setIsAuthorized(true));

            if (id) {
              dispatch(setInput(""));
              dispatch(
                setResponseContent({ answer: "", question: "", metaData: [] })
              );
              dispatch(setSearchActive(false));
              dispatch(setIsLoading(false));
              const { data, error } = await handleSearchLogs(
                session.user.id,
                currentLogs
              );
              if (error) {
                dispatch(setError(error));
                return;
              }
              const foundLog = data.find((log) => log.id === parseInt(id));
              if (foundLog) {
                const structuredLog = foundLog.searchContent.map((content) => ({
                  title: content.title,
                  answer: content.answer,
                  metaData: content.metaData,
                }));
                dispatch(setPreviousSearch(structuredLog));
                dispatch(setMessage(foundLog.searchQueryTitle));
                dispatch(setCurrentLogId(foundLog.id));
                dispatch(setFirstSearchDone(true));
                dispatch(setIsResponse(true));
                dispatch(setIsHistoryVisible(true));
                dispatch(setIsStreamComplete(true));
                if (structuredLog.length > 0) {
                  dispatch(setSearchActive(true));
                }
              }
            }
          }
        } catch (error) {
          console.error(
            "Error fetching user role or department information:",
            error
          );
        }
      } else if (status === "unauthenticated") {
        router.push("/login");
      }
    };

    fetchUserRoleAndDepartmentAndSearchLog();
  }, [status, session, id, router, dispatch, currentLogs]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleInputChange = (event) => {
    dispatch(setInput(event.target.value));
  };

  const handleSearchSubmit = async (event, question = null) => {
    event.preventDefault();

    let newSearch = question ? question : input;

    dispatch(setShowQuestions(false));
    dispatch(setInput(""));
    dispatch(setSearchActive(true));
    dispatch(setIsLoading(true));
    dispatch(setIsStreamComplete(false));
    dispatch(setLimitedPreviousSearchUpdated(false));
    // dispatch(setIsHistoryLogClicked(false));

    // Set isNewQuerySubmitted to true when a new query is made
    dispatch(setIsNewQuerySubmitted(true));

    if (firstSearchDone) {
      dispatch(setIsHistoryVisible(true));
    }
    dispatch(setNewLogTitle(newSearch));

    if (!isMessageLocked) {
      dispatch(setMessage(newSearch));
      dispatch(setIsMessageLocked(true));
    }

    // Update the responseContent locally and dispatch it.
    dispatch(
      setResponseContent({
        ...responseContent,
        question: newSearch,
      })
    );
    if (firstSearchDone && newSearch !== null) {
      const historyContent = previousSearch.map((item) => ({
        title: item.title,
        answer: item.answer,
      }));
      const searchContentString = JSON.stringify(historyContent, null, 2);
      const getSummary = await handleSummarize(searchContentString, newSearch);
      if (getSummary.data.summary && getSummary.data.summary !== false) {
        newSearch =
          getSummary.data.summary + " This time my question is:" + newSearch;
      }
    }
    let logInput = question ? question : input;
    const searchResult = await performSearch(newSearch);

    // Creating a new log entry
    if (!currentLogId && searchResult.question) {
      try {
        const logResult = await handleCreateLog(session.user.id, newSearch, [
          {
            title: newSearch,
            answer: searchResult.answer,
            metaData: searchResult.metaData,
          },
        ]);
        dispatch(setPreviousSearch(logResult.data.searchContent));
        dispatch(setCurrentLogId(logResult.data.id));
        dispatch(setFirstSearchDone(true));
      } catch (error) {
        console.error("Error creating search log:", error);
        dispatch(setError("Failed to create search log"));
      }
    }
    // Updating existing log records
    if (currentLogId && searchResult.question && isStreamComplete) {
      try {
        // Get the current user's search log from the database
        const { data, error } = await handleSearchLogs(session.user.id);

        // Find log records matching currentLogId
        const currentLog = data.find((log) => log.id === currentLogId);
        if (!currentLog) {
          throw new Error("Log with currentLogId not found");
        }
        // Get the searchContent of the first record from the search log.
        let existingContent = currentLog.searchContent;
        // Create a new search entry containing the title, answer, and metaData for this query
        const newItem = {
          title: logInput, // The title of the new query, i.e. the content of the query entered by the user
          answer: searchResult.answer, // Answers to queries
          metaData: searchResult.metaData, // Metadata for queries
        };

        // Check if the new entry already exists in the existing log by comparing the title with the answer.
        const isAlreadyIncluded = existingContent.some(
          (item) =>
            item.title === newItem.title && item.answer === newItem.answer
        );

        // If the entry is not already in the log, add the new entry to existingContent
        if (!isAlreadyIncluded) {
          existingContent.push(newItem); // Pushing new entries into an existing content array
        }

        // Find the header of the current log (by currentLogId) and update the log record.
        const updateResult = await handleUpdateLog(
          session.user.id, // User ID
          currentLogId, // The ID of the current log, to ensure that it is the history of the user's clicks that is being updated
          data.find((log) => log.id === currentLogId).searchQueryTitle, // Find the title of the log
          JSON.stringify(existingContent) // Converting updated log content to string storage
        );

        // Updating the Redux status to ensure that the front-end shows the latest log content
        dispatch(setPreviousSearch(updateResult.data.searchContent));
      } catch (error) {
        // Catch and handle any errors when updating logs
        console.error("Error updating search log:", error);
        dispatch(setError("Failed to update search log")); // Passing error messages to the front-end for display via Redux
      }

      if (!isHistoryVisible) {
        dispatch(setIsHistoryVisible(true)); // force history visible
      }
    }
  };

  const handleReSearchSubmit = async (event, question, index) => {
    event.preventDefault();

    dispatch(setShowQuestions(false));
    dispatch(setInput(""));
    dispatch(setSearchActive(true));
    dispatch(setIsLoading(true));
    dispatch(setIsStreamComplete(false));
    dispatch(setLimitedPreviousSearchUpdated(false));

    //Hide the old search log to be ready to show the new results
    const updatedSearch = previousSearch.filter((_, i) => i !== index);

    // Dispatch the action to update the state with the modified array
    dispatch(setPreviousSearch(updatedSearch));

    // Set isNewQuerySubmitted to true when a new query is made
    dispatch(setIsNewQuerySubmitted(true));

    if (firstSearchDone) {
      dispatch(setIsHistoryVisible(true));
    }

    let newSearch = capitalizeFirstLetter(question);
    dispatch(setNewLogTitle(newSearch));

    if (!isMessageLocked) {
      dispatch(setMessage(newSearch));
      dispatch(setIsMessageLocked(true));
    }

    // Update the responseContent locally and dispatch it.
    dispatch(
      setResponseContent({
        ...responseContent,
        question: newSearch,
      })
    );

    if (firstSearchDone && newSearch !== null) {
      const historyContent = previousSearch.map((item) => ({
        title: item.title,
        answer: item.answer,
      }));
      const searchContentString = JSON.stringify(historyContent, null, 2);
      const getSummary = await handleSummarize(searchContentString, newSearch);
      if (getSummary.data.summary && getSummary.data.summary !== false) {
        newSearch =
          getSummary.data.summary + " This time my question is:" + question;
      }
    }
    let logInput = question;

    const searchResult = await performSearch(newSearch);

    // Updating existing log records
    if (currentLogId && searchResult.question && isStreamComplete) {
      try {
        // Get the current user's search log from the database
        const { data, error } = await handleSearchLogs(session.user.id);
        // Find log records matching currentLogId
        const currentLog = data.find((log) => log.id === currentLogId);
        if (!currentLog) {
          throw new Error("Log with currentLogId not found");
        }

        // Get the searchContent of the first record from the search log.
        let existingContent = currentLog.searchContent;
        // Create a new search entry containing the title, answer, and metaData for this query
        const newItem = {
          title: logInput, // The title of the new query, i.e. the content of the query entered by the user
          answer: searchResult.answer, // Answers to queries
          metaData: searchResult.metaData, // Metadata for queries
        };
        // Check if the new entry already exists in the existing log by comparing the title with the answer.
        const isAlreadyIncluded = existingContent.some(
          (item) =>
            item.title === newItem.title && item.answer === newItem.answer
        );

        // If the entry is not already in the log, add the new entry to existingContent
        if (!isAlreadyIncluded) {
          existingContent[index] = newItem; // Replace the old entry with the new entry
        }

        let logTitle = data.find(
          (log) => log.id === currentLogId
        ).searchQueryTitle;

        if (index === 0) {
          logTitle = question;
        }

        // Find the header of the current log (by currentLogId) and update the log record.
        const updateResult = await handleUpdateLog(
          session.user.id, // User ID
          currentLogId, // The ID of the current log, to ensure that it is the history of the user's clicks that is being updated
          logTitle, // Find the title of the log
          JSON.stringify(existingContent) // Converting updated log content to string storage
        );

        // Updating the Redux status to ensure that the front-end shows the latest log content
        const searchContent = updateResult.data.searchContent;

        // // Assuming updateResult.data.searchContent is an array
        // const updatedSearchContent = updateResult.data.searchContent.slice(
        //   0,
        //   -1
        // );

        // Updating the Redux state to ensure that the front-end shows the latest log content
        dispatch(setPreviousSearch(searchContent));
      } catch (error) {
        // Catch and handle any errors when updating logs
        console.error("Error updating search log:", error);
        dispatch(setError("Failed to update search log")); // Passing error messages to the front-end for display via Redux
      }
    }

    if (!isHistoryVisible) {
      dispatch(setIsHistoryVisible(true)); // Force history visibility
    }
  };

  const handleFollowUpClick = (question) => {
    handleSearchSubmit(new Event("submit"), question);
  };

  const performSearch = async (query) => {
    try {
      const { prompt, metadataArray } = await handleRetrieve(
        query,
        folders,
        roleTypes
      );
      if (!prompt) {
        dispatch(setError("Failed to retrieve prompt or empty response"));
        return { question: query, answer: "", metaData: [] };
      }

      dispatch(setIsLoading(false));

      let fullAnswer = "";
      const handleStreamUpdate = (newDataChunk) => {
        fullAnswer += newDataChunk;
        // Update the responseContent and make sure it contains the question, answer, and metaData.
        dispatch(
          setResponseContent({
            question: query, // Ensure that every update includes the question
            answer: fullAnswer,
            metaData: metadataArray,
          })
        );
      };

      const { error } = await handleAzureOpenAIStream(
        prompt,
        handleStreamUpdate
      );

      if (error) {
        console.error("Error streaming data:", error);
        dispatch(setError(error));
        return {
          question: query,
          answer: fullAnswer,
          metaData: metadataArray,
        };
      } else {
        dispatch(setIsStreamComplete(true));

        if (
          fullAnswer ===
          "<p>I could not find an exact answer to this question.</p>"
        ) {
          console.log(
            "No answer provided to generate new follow up questions."
          );
        } else {
          const followUpQuestions = await generateFollowUpQuestions(fullAnswer);
          dispatch(setQuestionList(followUpQuestions));
          dispatch(setShowQuestions(true));
        }

        // Finally, the responseContent is updated to make sure all the data is complete.
        dispatch(
          setResponseContent({
            question: query, // Make sure to include the question
            answer: fullAnswer,
            metaData: metadataArray,
          })
        );
      }

      dispatch(setIsResponse(true));
      return {
        question: query,
        answer: fullAnswer,
        metaData: metadataArray,
      };
    } catch (error) {
      dispatch(setError(error.message));
      return { question: query, answer: "", metaData: [] };
    }
  };

  const toggleSourceVisibility = (index) => {
    dispatch(setActiveSourceIndex(index)); // Set the current index
    dispatch(setSourceVisible(!sourceVisible));
  };

  const uniquePreviousSearch = previousSearch.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.title === item.title &&
          JSON.stringify(t.answer) === JSON.stringify(item.answer) &&
          JSON.stringify(t.metaData) === JSON.stringify(item.metaData)
      )
  );

  // console.log("uniquePreviousSearch",uniquePreviousSearch);
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-xs"></span>
        <span className="loading loading-ring loading-sm"></span>
        <span className="loading loading-ring loading-md"></span>
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  const handleNewSearch = () => {
    // Reset necessary state
    dispatch(setInput(""));
    dispatch(setResponseContent({ answer: "", question: "", metaData: [] }));
    dispatch(setSearchActive(false));
    dispatch(setIsLoading(false));
    dispatch(setPreviousSearch([]));
    dispatch(setMessage(""));
    dispatch(setCurrentLogId(null));
    dispatch(setFirstSearchDone(false));
    dispatch(setIsResponse(false));
    dispatch(setIsHistoryVisible(false));
    dispatch(setIsStreamComplete(false));
    dispatch(setNewLogTitle(""));

    router.push("/search");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative flex w-full min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/01_bg.png')",
        }}
      ></div>
      {/* !!!change opacity here: */}
      <div className="relative z-10 flex w-full bg-primary-background bg-opacity-0 min-h-screen dark:bg-dark-primary-background dark:bg-opacity-0">
        <div className="hidden lg:block">
          <MenuBar className="backdrop-filter " newLog={uniquePreviousSearch} />
        </div>
        <div className="flex-grow m-auto p-0 sm:p-5 text-gray-900 dark:text-cross-color flex flex-col items-center w-full lg:w-[calc(100%-240px)] lg:ml-60">
          <div
            className={`fixed top-0 w-11/12 lg:w-[calc(90%-240px)] bg-gray-100 p-2 sm:p-4 lg:ml-1 shadow-md z-10 text-center dark:bg-dark-secondary-background rounded-xl ${
              isDeleteModalOpen ? "bg-opacity-0" : ""
            }`}
          >
            <div className="flex justify-center items-center dark:text-cross-color ">
              {firstSearchDone ? (
                <LibraryBig className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="ml-2 text-xs sm:text-sm md:text-base lg:text-lg truncate">
                {" "}
                {message
                  ? message
                  : "Hi there, what would you like to search today?"}
              </span>
            </div>
          </div>
          {/* SearchBar wrapper with responsive positioning */}
          {/* If Modal is on, hide SearchBar */}
          {!isDeleteModalOpen && (
            <div
              className={`w-2/3 flex justify-center ${
                isSearchActive
                  ? "lg:mt-16 lg:right-auto lg:left-auto fixed bottom-24 left-auto right-auto"
                  : "fixed top-1/2 left-1/2 lg:ml-28 transform -translate-x-1/2 -translate-y-1/2"
              } px-0 sm:px-5 z-20`}
            >
              <SearchBar
                onSubmit={handleSearchSubmit}
                isBottom={isSearchActive}
                onInputChange={handleInputChange}
                input={input}
              />
            </div>
          )}
          <div className="mt-10 "></div>
          {/* Display the real-time streamed answer */}

          {!isDeleteModalOpen &&
            previousSearch.length > 0 &&
            isHistoryVisible &&
            (id
              ? previousSearch
                  .slice(
                    0,
                    previousSearch.length > 1 &&
                      isNewQuerySubmitted &&
                      isHistoryLogClicked &&
                      previousSearchUpdated &&
                      limitedPreviousSearchUpdated
                      ? previousSearch.length - 1
                      : previousSearch.length
                  )
                  .map((content, index) => (
                    <React.Fragment key={content.id || index}>
                      <div className="w-full px-4 sm:px-0">
                        <HistoryLog
                          key={index}
                          index={index}
                          question={capitalizeFirstLetter(content.title)}
                          answer={content.answer}
                          metaData={content.metaData}
                          handleReSearchSubmit={handleReSearchSubmit}
                          onSourceToggle={() => toggleSourceVisibility(index)} // Wrapping with an anonymous function
                        />
                      </div>
                    </React.Fragment>
                  ))
              : previousSearch
                  .slice(
                    0,
                    previousSearch.length > 0 && limitedPreviousSearchUpdated
                      ? previousSearch.length - 1
                      : previousSearch.length
                  )
                  .map((content, index) => (
                    <React.Fragment key={content.id || index}>
                      <>
                        <div className="w-full px-4 sm:px-0">
                          <HistoryLog
                            key={index}
                            index={index}
                            question={capitalizeFirstLetter(content.title)}
                            answer={content.answer}
                            metaData={content.metaData}
                            handleReSearchSubmit={handleReSearchSubmit}
                            onSourceToggle={() => toggleSourceVisibility(index)}
                          />
                        </div>
                      </>
                    </React.Fragment>
                  )))}
          {isLoading && <AnswerLoading />}

          {!isDeleteModalOpen &&
            isSearchActive &&
            !isLoading &&
            responseContent.answer && (
              <>
                {/* <p>new log</p> */}
                <div className="w-full px-4 sm:px-0">
                  <AnswerBox
                    question={capitalizeFirstLetter(newLogTitle)}
                    answer={responseContent.answer}
                    isVisible={true}
                    metaData={responseContent.metaData}
                    handleReSearchSubmit={handleReSearchSubmit}
                    // If limitedPreviousSearchUpdated is true, clicks are allowed, otherwise disabled.
                    onSourceToggle={
                      () =>
                        limitedPreviousSearchUpdated
                          ? toggleSourceVisibility(
                              uniquePreviousSearch.length - 1
                            )
                          : null // Disable Click
                    }
                  />
                </div>
              </>
            )}

          {!isDeleteModalOpen &&
            showQuestions &&
            questionList &&
            Array.isArray(questionList.questions) &&
            questionList.questions.length > 0 && (
              <div className="w-full px-4 sm:px-0">
                <FollowUp
                  questions={questionList.questions}
                  onQuestionClick={handleFollowUpClick}
                />
              </div>
            )}

          <div className="bg-primary-background dark:bg-dark-secondary-background lg:hidden fixed bottom-14 left-0 right-0 flex justify-between items-center w-full px-2">
            <button
              onClick={handleNewSearch}
              className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color flex-1 mx-2 px-2 min-w-0"
            >
              <Search size={20} className="mr-1 flex-shrink-0" />
              <span className="truncate text-xs">New</span>
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color flex-1 mx-2 px-2 min-w-0"
            >
              <Bolt size={20} className="mr-1 flex-shrink-0" />
              <span className="truncate text-xs">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color flex-1 mx-2 px-2 min-w-0"
            >
              <LogOut size={20} className="mr-1 flex-shrink-0" />
              <span className="truncate text-xs">Logout</span>
            </button>
          </div>

          <div className="mb-24 "></div>

          <footer
            className={`bg-primary-background dark:bg-dark-secondary-background text-zinc-400 text-sm sm:text-base dark:text-cross-color text-center p-2 fixed bottom-0 right-0 z-10 lg:w-3/4 lg:left-auto lg:right-auto lg:translate-x-0 w-full translate-x-[-50%] left-1/2 ${
              isDeleteModalOpen ? "bg-opacity-0" : ""
            }`}
          >
            DocSense may occasionally make mistakes. Please verify important
            information.
          </footer>
        </div>
        {sourceVisible &&
          uniquePreviousSearch.length > 0 &&
          uniquePreviousSearch.map(
            (content, index) =>
              activeSourceIndex === index && ( // Show only if the currently clicked index matches.
                <AnswerSource
                  key={content.id || index}
                  index={index}
                  metaData={content.metaData}
                  isVisible={sourceVisible}
                  onClose={() => toggleSourceVisibility(null)} // Reset activeSourceIndex to null on shutdown
                  message={message}
                />
              )
          )}
      </div>
    </div>
  );
}
