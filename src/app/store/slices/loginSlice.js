// loginSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: false,
    transitionClass: "page-enter",
    email: "",
    password: "",
    message: "",
    showPassword: false,
};

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setTransitionClass: (state, action) => {
            state.transitionClass = action.payload;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
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
    setLoading,
    setTransitionClass,
    setEmail,
    setPassword,
    setMessage,
    setShowPassword,
} = loginSlice.actions;

export default loginSlice.reducer;
