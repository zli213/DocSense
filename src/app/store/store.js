// store.js
import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "@/app/store/slices/searchSlice";
import settingsReducer from "@/app/store/slices/settingsSlice";
import loginReducer from "@/app/store/slices/loginSlice";
import registerReducer from "@/app/store/slices/registerSlice";
import roleReducer from "@/app/store/slices/roleSlice";
import authoriseReducer from "@/app/store/slices/authoriseSlice";



const store = configureStore({
  reducer: {
    search: searchReducer,
    login: loginReducer,
    settings: settingsReducer,
    register: registerReducer,
    role:roleReducer,
    authorise:authoriseReducer,
  },
});

export default store;