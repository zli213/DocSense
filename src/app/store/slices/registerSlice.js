// registerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transitionClass: "page-register-enter",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    message: "",
    showPassword: false,
};

const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        setTransitionClass: (state, action) => {
            state.transitionClass = action.payload;
        },
        setUsername: (state, action) => {
            state.username = action.payload;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        },
        setConfirmPassword: (state, action) => {
            state.confirmPassword = action.payload;
        },
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setShowPassword: (state, action) => {
            state.showPassword = action.payload;
        },
    },
});

export const {
    setTransitionClass,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    setMessage,
    setShowPassword,
} = registerSlice.actions;

export default registerSlice.reducer;
