// searchSlice.js
import { createSlice } from '@reduxjs/toolkit';
// import { setUserProfileImage } from './settingsSlice';
import { userAgentFromString } from 'next/server';

const initialState = {
  isSearchActive: false,
  input: "",
  message: "",
  responseContent: {
    answer: "",
    question: "",
    metaData: [],
  },
  previousSearch: [],
  firstSearchDone: false,
  currentLogId: null,
  sourceVisible: false,
  isResponse: false,
  isLoading: false,
  isAuthorized: false,
  isStreamComplete: false,
  isHistoryVisible: false,
  folders: [],
  roleTypes: [],
  error: null,
  isMessageLocked: false,
  isNewQuerySubmitted: false,
  isHistoryLogClicked: false,
  searchLogs: [],
  offset: 0,
  previousSearchUpdated: false,
  limitedPreviousSearchUpdated: false,
  activeSourceIndex: null,
  newLogTitle: "",
  chartComponent: null,
  userProfileImage: false,
  theme: "light",
  isDeleteModalOpen: false,
  questionList: null,
  showQuestions: true,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchActive: (state, action) => {
      state.isSearchActive = action.payload;
    },
    setInput: (state, action) => {
      state.input = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setResponseContent: (state, action) => {
      state.responseContent = action.payload;
    },
    setPreviousSearch: (state, action) => {
      state.previousSearch = action.payload;
    },
    setFirstSearchDone: (state, action) => {
      state.firstSearchDone = action.payload;
    },
    setCurrentLogId: (state, action) => {
      state.currentLogId = action.payload;
    },
    setSourceVisible: (state, action) => {
      state.sourceVisible = action.payload;
    },
    setIsResponse: (state, action) => {
      state.isResponse = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsAuthorized: (state, action) => {
      state.isAuthorized = action.payload;
    },
    setIsStreamComplete: (state, action) => {
      state.isStreamComplete = action.payload;
    },
    setIsHistoryVisible: (state, action) => {
      state.isHistoryVisible = action.payload;
    },
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
    setRoleTypes: (state, action) => {
      state.roleTypes = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsMessageLocked: (state, action) => {
      state.isMessageLocked = action.payload;
    },
    setIsNewQuerySubmitted: (state, action) => {
      state.isNewQuerySubmitted = action.payload;
    },
    setIsHistoryLogClicked: (state, action) => {
      state.isHistoryLogClicked = action.payload;
    },
    setSearchLogs: (state, action) => {
      const newLogs = action.payload;
      state.searchLogs = [...state.searchLogs, ...newLogs];
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    setPreviousSearchUpdated: (state, action) => {
      state.previousSearchUpdated = action.payload;
    },
    setLimitedPreviousSearchUpdated: (state, action) => {
      state.limitedPreviousSearchUpdated = action.payload;
    },
    setActiveSourceIndex: (state, action) => {
      state.activeSourceIndex = action.payload;
    },
    setNewLogTitle: (state, action) => {
      state.newLogTitle = action.payload;
    },
    setChartComponent: (state, action) => {
      state.chartComponent = action.payload;
    },
    setUserProfileImage: (state, action) => {
      state.userProfileImage = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setIsDeleteModalOpen: (state, action) => {
      state.isDeleteModalOpen = action.payload;
    },
    setQuestionList: (state, action) => {
      state.questionList = action.payload;
    },
    setShowQuestions: (state, action) => {
      state.showQuestions = action.payload;
    },
  },
});

export const {
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
  setSearchLogs,
  setOffset,
  setPreviousSearchUpdated,
  setLimitedPreviousSearchUpdated,
  setActiveSourceIndex,
  setNewLogTitle,
  setChartComponent,
  setUserProfileImage,
  setTheme,
  setIsDeleteModalOpen,
  setQuestionList,
  setShowQuestions,
} = searchSlice.actions;

export default searchSlice.reducer;
