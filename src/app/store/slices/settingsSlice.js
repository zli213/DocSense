import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  isEditing: false,
  showPassword: false,
  showConfirmPassword: false,
  password: "",
  confirmPassword: "",
  showPasswordError: false,
  isModalOpen: false,
  modalContentPhase: "view",
  fileImage: null,
  depName: "...",
  roleName: "...",
  theme: "light",
  userProfileImage: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setIsEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    setShowPassword: (state, action) => {
      state.showPassword = action.payload;
    },
    setShowConfirmPassword: (state, action) => {
      state.showConfirmPassword = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setConfirmPassword: (state, action) => {
      state.confirmPassword = action.payload;
    },
    setShowPasswordError: (state, action) => {
      state.showPasswordError = action.payload;
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setModalContentPhase: (state, action) => {
      state.modalContentPhase = action.payload;
    },
    setFileImage: (state, action) => {
      state.fileImage = action.payload;
    },
    setDepName: (state, action) => {
      state.depName = action.payload;
    },
    setRoleName: (state, action) => {
      state.roleName = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setUserProfileImage: (state, action) => {
      state.userProfileImage = action.payload;
    },
  },
});

export const {
  setUserData,
  setIsEditing,
  setShowPassword,
  setShowConfirmPassword,
  setPassword,
  setConfirmPassword,
  setShowPasswordError,
  setIsModalOpen,
  setModalContentPhase,
  setFileImage,
  setDepName,
  setRoleName,
  setTheme,
  setUserProfileImage,
} = settingsSlice.actions;

export default settingsSlice.reducer;
