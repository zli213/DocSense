// roleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthorized: false,
    isModalOpen: false,
    isCreateModalOpen: false,
    isDeleteModalOpen: false,
    currentRole: null,
    roles: [],
    selectedaccesses: [],
    roleName: "",
    selectedRoleId: [],
    errorMessage: "",
    error: null,
    rolesFetched: false,
};

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        setIsAuthorized: (state, action) => {
            state.isAuthorized = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setIsCreateModalOpen: (state, action) => {
            state.isCreateModalOpen = action.payload;
        },
        setIsDeleteModalOpen: (state, action) => {
            state.isDeleteModalOpen = action.payload;
        },
        setcurrentRole: (state, action) => {
            state.currentRole = action.payload;
        },
        setRoles: (state, action) => {
            state.roles = action.payload;
        },
        setSelectedaccesses: (state, action) => {
            state.selectedaccesses = action.payload;
        },
        setRoleName: (state, action) => {
            state.roleName = action.payload;
        },
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setErrorMessage: (state, action) => {
            state.errorMessage = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setRolesFetched: (state, action) => {
            state.rolesFetched = action.payload;
        },
    },
});

export const {
    setIsAuthorized,
    setIsModalOpen,
    setIsCreateModalOpen,
    setIsDeleteModalOpen,
    setcurrentRole,
    setRoles,
    setSelectedaccesses,
    setRoleName,
    setSelectedRoleId,
    setErrorMessage,
    setError,
    setRolesFetched,
} = roleSlice.actions;

export default roleSlice.reducer;
