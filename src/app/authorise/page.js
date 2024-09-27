// src/app/admin/page.js
"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Select from "react-select";
import MenuBar from "@/components/menuBar.js";
import Modal from "@/components/Modal"; // Import the Modal component
import { AlignJustify, Search, UserRoundPen, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import chroma from "chroma-js";
import { useDispatch, useSelector } from "react-redux";
import {
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
} from "@/app/store/slices/authoriseSlice";
const departments = ["All Departments", "IT", "Finance", "HR", "Medical"];

export default function AdminPage() {
  const { data: session, status } = useSession(); // get session
  const router = useRouter();
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const {
    isAuthorized, // Track authorization status
    users, //Store all the users
    roleOptions,
    departmentOptions,
    selectedDepartment,
    selectedSecondaryDepartments,
    dropdownOpen,
    isModalOpen, // Modal states
    isDeleteModalOpen,
    currentUser,
    departmentsData, // To store all departments data
    subDepartments, //To store secondary departments
    selectedDepartments, // State for multi-select dropdowns
    selectedroles,
    selectedUserID,
    userName,
    usersFetched, // New state to track whether users have been fetched
  } = useSelector((state) => state.authorise);

  useEffect(() => {
    if (departments && departments.length > 0) {
      dispatch(setSelectedDepartment(departments[0])); // Initialize selectedDepartment
    }
    if (currentUser && currentUser.name) {
      dispatch(setUserName(currentUser.name)); // Initialize userName
    }
  }, [currentUser, dispatch]);

  //Configuration for react-select component
  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "white",
      borderColor: "transparent", // Remove border color on focus
      boxShadow: "none", // Remove box-shadow on focus
      "&:hover": {
        borderColor: "transparent",
      },
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = chroma.valid(data.color)
        ? chroma(data.color)
        : chroma("gray"); // Safeguard
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.color
          : isFocused
          ? color.alpha(0.1).css()
          : undefined,
        color: isDisabled
          ? "#ccc"
          : isSelected
          ? chroma.contrast(color, "white") > 2
            ? "white"
            : "black"
          : "black", // Fallback color
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
          backgroundColor: !isDisabled
            ? isSelected
              ? "#ECECEC"
              : color.alpha(0.3).css()
            : undefined,
        },
      };
    },
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: "#ECECEC",
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: "black", // Fallback color
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: "black",
      ":hover": {
        backgroundColor: "#ECECEC", // Fallback color
      },
    }),
  };

  //Fetch the roles information
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/role");
        const data = await response.json();

        // Transform the data to match the desired format
        const roleOptions = data.map((role) => ({
          value: role.id.toString(), // Ensure the value is a string
          label: role.roleName,
        }));

        dispatch(setRoleOptions(roleOptions));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRoles();

    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/department");
        const data = await response.json();
        dispatch(setDepartmentsData(data)); // Store the full departments data

        // Filter departments where parentDepartmentId is null
        const filteredDepartments = data.filter(
          (department) => department.parentDepartmentId === null
        );
        const options = filteredDepartments.map((department) => ({
          value: department.id,
          label: department.departmentName,
        }));
        dispatch(setDepartmentOptions(options));
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    fetchDepartments();
  }, [dispatch]);

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    dispatch(setDropdownOpen(!dropdownOpen)); // Here you need to determine if it is open or closed by the current dropdownOpen status.
  };

  // Handle department selection
  const handleDepartmentSelect = (department) => {
    if (department === "All Departments") {
      dispatch(setSelectedDepartment(department));
    } else {
      dispatch(setSelectedDepartment(department));
    }
    dispatch(setDropdownOpen(false));
  };

  // Handle role changes
  const handleRoleChange = (selectedOption) => {
    dispatch(setSelectedroles(selectedOption));
  };

  // Handle Role Edit
  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/authorise", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: currentUser?.id,
        roleID: parseInt(selectedroles?.value, 10),
        userName: userName,
        selectedDepartment: selectedDepartments,
        selectedSecondaryDepartment: selectedSecondaryDepartments,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      //console.log('User updated successfully:', result);
      dispatch(setIsModalOpen(false));
      window.location.reload();
      // Optionally, update local state or show a success message
    } else {
      console.error("Failed to update user:", result.error);
      // Optionally, show an error message
    }
  };

  //Authentication Protection
  useEffect(() => {
    if (status === "loading") {
      // Do nothing while loading
      return;
    }
    // console.log("id", session?.user?.id)
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.id != 1) {
      router.push("/noAccess");
    } else if (status === "authenticated") {
      dispatch(setIsAuthorized(true)); // User is authorized
    }
  }, [status, session, router, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(setDropdownOpen(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/authorise");
        const data = await response.json();
        dispatch(setUsers(data));
        dispatch(setUsersFetched(true));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [dispatch]);

  // Open modal for edit
  const openEditModal = (user) => {
    dispatch(setCurrentUser(user));
    if (user.department === "Not assigned") {
      // Do nothing here
    } else {
      const selectedDepartment = departmentsData.find(
        (dept) => dept.departmentName === user.department
      );
      const parentDepartment = departmentsData.find(
        (dept) => dept.id === selectedDepartment.parentDepartmentId
      );
      if (parentDepartment) {
        const mappedSubDepartments = parentDepartment.subDepartments.map(
          (subDept) => ({
            value: subDept.id,
            label: subDept.departmentName,
          })
        );
        dispatch(setSubDepartments(mappedSubDepartments));
      } else {
        const mappedSubDepartments = selectedDepartment.subDepartments.map(
          (subDept) => ({
            value: subDept.id,
            label: subDept.departmentName,
          })
        );
        dispatch(setSubDepartments(mappedSubDepartments));
      }
    }

    if (user.parentDepartment) {
      dispatch(setSelectedDepartments([user.parentDepartment]));
      dispatch(setSelectedSecondaryDepartments([user.department]));
    } else {
      dispatch(setSelectedDepartments([user.department]));
      dispatch(setSelectedSecondaryDepartments([]));
    }
    dispatch(setSelectedroles([user.role]));

    dispatch(setIsModalOpen(true));
  };

  // Open modal for delete
  const openDeleteModal = (user) => {
    dispatch(setSelectedUserID(user.id));
    dispatch(setIsDeleteModalOpen(true));
  };

  // Handle Department Change
  const handleDepartmentChange = useCallback(
    (selectedOption) => {
      // console.log('Selected Option:', selectedOption);

      dispatch(setSelectedDepartments(selectedOption ? [selectedOption] : []));

      if (!selectedOption) {
        dispatch(setSubDepartments([]));
        dispatch(setSelectedSecondaryDepartments([]));
        return;
      }
      const selectedDepartmentId = selectedOption.value;
      const selectedDepartment = departmentsData.find(
        (dept) => dept.id === selectedDepartmentId
      );

      if (selectedDepartment) {
        const mappedSubDepartments = selectedDepartment.subDepartments.map(
          (subDept) => ({
            value: subDept.id,
            label: subDept.departmentName,
          })
        );

        dispatch(setSubDepartments(mappedSubDepartments));

        dispatch(setSelectedSecondaryDepartments([]));

        // console.log("mapped sub:", mappedSubDepartments);
      }
    },
    [departmentsData, dispatch]
  );

  const handleSecondaryDepartmentChange = (selectedOption) => {
    //const sec = JSON.stringify(selectedOption);
    dispatch(
      setSelectedSecondaryDepartments(selectedOption ? [selectedOption] : [])
    );
  };

  //Debug using useeffect
  // useEffect(() => {
  //   console.log("testing:", subDepartments);
  // }, [subDepartments]);

  //Handle User Deletion Request
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    //setIsLoading(true);
    try {
      const response = await fetch("/api/authorise", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: selectedUserID }),
      });
      if (response.ok) {
        // Handle successful deletion (e.g., refresh data, show success message)
        //console.log('User deleted successfully');
        dispatch(setIsDeleteModalOpen(false));
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    } finally {
      //setIsLoading(false);
    }
  };

  // Prevent rendering until authorization is confirmed
  if (!isAuthorized || !usersFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-xs"></span>
        <span className="loading loading-ring loading-sm"></span>
        <span className="loading loading-ring loading-md"></span>
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex bg-primary-background dark:bg-dark-primary-background min-h-screen">
      <MenuBar />
      <div className="w-3/5 mr-56 mx-auto p-8 bg-primary-background dark:bg-dark-primary-background min-h-screen">
        <h1 className="text-4xl font-bold mb-6 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-gray-300 after:mt-2 dark:text-cross-color">
          Welcome, Administrator
        </h1>
        <div className="bg-tertiary-background dark:bg-dark-tertiary-background p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center mb-6 dark:text-cross-color">
            USER LIST
          </h2>
          <form className="flex justify-center items-center mb-8 relative">
            <div className="relative flex items-center w-full">
              {/* Input container with icon inside */}
              <div className="flex items-center w-full border rounded">
                <span
                  className="p-2 bg-primary-background dark:bg-dark-primary-background cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <AlignJustify className="dark:text-cross-color" size={24} />
                </span>
                <input
                  type="text"
                  value={selectedDepartment}
                  readOnly
                  placeholder="Search by specific department"
                  className="p-2 flex-1 outline-none dark:text-cross-color  bg-primary-background dark:bg-dark-primary-background"
                  onClick={toggleDropdown}
                />
              </div>
              <button type="button" className="ml-2">
                <Search className="p-2 bg-primary-color  hover:bg-secondary-color text-white rounded w-10 h-10" />
              </button>
            </div>
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <ul
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 bg-white   border rounded shadow-lg z-10 w-full "
              >
                {departments.map((department, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer bg-primary-background dark:bg-dark-primary-background dark:text-cross-color hover:bg-secondary-background"
                    onClick={() => handleDepartmentSelect(department)}
                  >
                    {department}
                  </li>
                ))}
              </ul>
            )}
          </form>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-dark-primary-background">
                <th className="border p-2 dark:text-cross-color">ID</th>
                <th className="border p-2 dark:text-cross-color">Name</th>
                <th className="border p-2 dark:text-cross-color">Role</th>
                <th className="border p-2 dark:text-cross-color">Department</th>
                <th className="border p-2 dark:text-cross-color w-1/3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users
                ?.slice() // Create a copy of the users array to avoid modifying Redux's state directly.
                .sort((a, b) => {
                  const aHasIndicator =
                    a.role === "Not assigned" ||
                    a.department === "Not assigned";
                  const bHasIndicator =
                    b.role === "Not assigned" ||
                    b.department === "Not assigned";

                  // If both have indicators or neither have, sort by ID
                  if (aHasIndicator === bHasIndicator) {
                    return a.id - b.id; // Ascending order by ID
                  }

                  // Otherwise, prioritize items with indicators
                  return bHasIndicator - aHasIndicator;
                })
                .map((user, index) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-50 even:bg-secondary-background dark:bg-dark-primary-background"
                  >
                    <td className="border p-2 dark:text-cross-color w-1/12">
                      <div className="flex justify-between items-center">
                        <span>{user.id}</span>
                        {(user.role === "Not assigned" ||
                          user.department === "Not assigned") && (
                          <span className="indicator-item badge badge-primary ml-2">
                            new
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border p-2 dark:text-cross-color">
                      {user.name}
                    </td>
                    <td className="border p-2 dark:text-cross-color">
                      {user.role}
                    </td>
                    <td className="border p-2 dark:text-cross-color">
                      {user.department}
                    </td>
                    <td className="border p-2 dark:text-cross-color text-center">
                      <div className="flex flex-row">
                        <button
                          className={`mx-auto flex items-center justify-center px-4 py-2 text-white rounded gap-2 ${
                            user.role === "Admin"
                              ? "bg-primary-color opacity-40 cursor-not-allowed"
                              : "bg-primary-color hover:bg-secondary-color"
                          }`}
                          onClick={() => openEditModal(user)}
                          disabled={user.role === "Admin"}
                        >
                          <span>
                            <UserRoundPen />
                          </span>
                          EDIT
                        </button>
                        <button
                          className={`mx-auto flex items-center justify-center px-2 py-2 text-white rounded gap-2 ${
                            user.role === "Admin"
                              ? "bg-primary-color opacity-40 cursor-not-allowed"
                              : "bg-primary-color hover:bg-secondary-color"
                          }`}
                          onClick={() => openDeleteModal(user)}
                          disabled={user.role === "Admin"}
                        >
                          <span>
                            <Trash2 />
                          </span>
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Editing User */}
      <Modal
        isOpen={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        onClose={() => dispatch(setIsModalOpen(false))}
      >
        <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
          Edit User: {currentUser?.name}
        </h3>
        <form className="flex flex-col gap-4">
          <label className="relative dark:text-cross-color">
            Name:
            <input
              type="text"
              defaultValue={currentUser?.name}
              className="w-full p-2 border rounded bg-white dark:bg-dark-tertiary-background focus:outline-none focus:ring-0"
            />
          </label>
          <label className="relative dark:text-cross-color">
            Role:
            <div className="w-full flex items-center border rounded bg-white dark:bg-dark-tertiary-background">
              <Select
                closeMenuOnSelect={true}
                className="basic-single w-full h-full"
                classNamePrefix="select"
                value={selectedroles}
                onChange={handleRoleChange}
                options={roleOptions}
                styles={colourStyles}
                getOptionLabel={(option) => option.label || option} // If option is a string, use it directly
                getOptionValue={(option) => option.value || option} // If option is a string, use it directly
              />
            </div>
          </label>
          <label className="relative dark:text-cross-color">
            Department*:
            <div className="w-full flex items-center border rounded bg-white dark:bg-dark-tertiary-background">
              <Select
                closeMenuOnSelect={true}
                isMulti={false}
                options={departmentOptions}
                styles={colourStyles}
                className="basic-single w-full h-full"
                classNamePrefix="select"
                getOptionLabel={(option) => option.label || option} // If option is a string, use it directly
                getOptionValue={(option) => option.value || option} // If option is a string, use it directly
                onChange={handleDepartmentChange}
                value={selectedDepartments}
              />
            </div>
          </label>
          <label className="relative dark:text-cross-color">
            Secondary Department:
            <div className="w-full flex items-center border rounded bg-white dark:bg-dark-tertiary-background">
              <Select
                closeMenuOnSelect={true}
                isMulti={false}
                options={subDepartments}
                styles={colourStyles}
                className="basic-select w-full h-full"
                classNamePrefix="select"
                getOptionLabel={(option) => option.label || option} // If option is a string, use it directly
                getOptionValue={(option) => option.value || option} // If option is a string, use it directly
                onChange={handleSecondaryDepartmentChange}
                value={selectedSecondaryDepartments}
              />
            </div>
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-color text-white px-4 py-2 rounded hover:bg-secondary-color"
              //onClick={() => setIsModalOpen(false)}
              onClick={handleUpdateSubmit}
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for deleting users */}
      <Modal
        isOpen={isDeleteModalOpen}
        // onClose={() => setIsDeleteModalOpen(false)}
        onClose={() => dispatch(setIsDeleteModalOpen(false))}
      >
        <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
          Warning!
        </h3>
        <p>
          Are you sure you want to delete this user? Make sure to notify user in
          advance for deletion.
        </p>
        <div className="flex justify-around mt-5">
          <button
            type="button"
            className="bg-primary-color text-white px-6 py-2 rounded hover:bg-secondary-color"
            // onClick={() => setIsDeleteModalOpen(false)}
            onClick={() => dispatch(setIsDeleteModalOpen(false))}
          >
            Cancel
          </button>
          <form onSubmit={handleDeleteSubmit}>
            <button
              type="submit"
              className="bg-error-red text-white px-6 py-2 rounded hover:bg-warning-yellow"
            >
              Delete
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
