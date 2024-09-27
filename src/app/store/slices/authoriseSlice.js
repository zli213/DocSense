// authoriseSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthorized: false,
    users: [],
    roleOptions: [],
    departmentOptions: [],
    selectedDepartment: null,
    selectedSecondaryDepartments: '',
    dropdownOpen: false,
    isModalOpen: false,
    isDeleteModalOpen: false,
    currentUser: null,
    departmentsData: [],
    subDepartments: [],
    selectedDepartments: [],
    selectedroles: [],
    selectedUserID: null,
    userName: '',
    usersFetched: false,
};

const authoriseSlice = createSlice({
    name: 'authorise',
    initialState,
    reducers: {
        setIsAuthorized: (state, action) => {
            state.isAuthorized = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setRoleOptions: (state, action) => {
            state.roleOptions = action.payload;
        },
        setDepartmentOptions: (state, action) => {
            state.departmentOptions = action.payload;
        },
        setSelectedDepartment: (state, action) => {
            state.selectedDepartment = action.payload;
        },
        setSelectedSecondaryDepartments: (state, action) => {
            state.selectedSecondaryDepartments = action.payload;
        },
        setDropdownOpen: (state, action) => {
            state.dropdownOpen = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setIsDeleteModalOpen: (state, action) => {
            state.isDeleteModalOpen = action.payload;
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        setDepartmentsData: (state, action) => {
            state.departmentsData = action.payload;
        },
        setSubDepartments: (state, action) => {
            state.subDepartments = action.payload;
        },
        setSelectedDepartments: (state, action) => {
            state.selectedDepartments = action.payload;
        },
        setSelectedroles: (state, action) => {
            state.selectedroles = action.payload;
        },
        setSelectedUserID: (state, action) => {
            state.selectedUserID = action.payload;
        },
        setUserName: (state, action) => {
            state.userName = action.payload;
        },
        setUsersFetched: (state, action) => {
            state.usersFetched = action.payload;
        },
    },
});

export const {
    setIsAuthorized,
    setUsers,
    setRoleOptions,
    setDepartmentOptions,
    setSelectedDepartment,
    setSelectedSecondaryDepartments,
    setDropdownOpen,
    setIsModalOpen,
    setIsDeleteModalOpen,
    setCurrentUser,
    setDepartmentsData,
    setSubDepartments,
    setSelectedDepartments,
    setSelectedroles,
    setSelectedUserID,
    setUserName,
    setUsersFetched,
} = authoriseSlice.actions;

export default authoriseSlice.reducer;
