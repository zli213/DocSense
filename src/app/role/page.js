// src/app/admin/page.js
"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import MenuBar from "@/components/menuBar.js";
import Modal from "@/components/Modal"; // Import the Modal component
import { UserRoundPen, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import chroma from "chroma-js";
import { useDispatch, useSelector } from "react-redux";
import {
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
} from "@/app/store/slices/roleSlice";

export default function RolePage() {
  const { data: session, status } = useSession(); // get session
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    isAuthorized, // Track authorization status
    isModalOpen, // Modal states
    isCreateModalOpen,
    isDeleteModalOpen,
    currentRole,
    roles,
    selectedaccesses, // State for multi-select dropdowns
    roleName, //State for role creations
    selectedRoleId,
    errorMessage,
    error, //State for role deletion error
    rolesFetched, // New state to track whether users have been fetched
  } = useSelector((state) => state.role);

  //Authentication Protection
  useEffect(() => {
    if (status === "loading") {
      // Do nothing while loading
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.id != 1) {
      router.push("/noAccess");
    } else if (status === "authenticated") {
      dispatch(setIsAuthorized(true)); // User is authorized
    }
  }, [status, session, router, dispatch]);

  //Fetch the roles information
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/role");
        const data = await response.json();
        dispatch(setRoles(data));
        dispatch(setRolesFetched(true));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRoles();
  }, [dispatch]);

  // // Debug using useeffect
  // useEffect(() => {
  //     console.log("departmentOptions:", departmentOptions);
  // }, [departmentOptions]);

  //Options for Access
  const accessOptions = [
    { value: "G0", label: "G0 - Generic Company Documents" },
    { value: "G1", label: "G1 - Generic Department Documents" },
    { value: "S0", label: "S0 - Sensetive Company Documents" },
    { value: "S1", label: "S1 - Sensetive Department Documents" },
    { value: "S2", label: "S2 - Sensetive Secondary Department Documents" },
    {
      value: "S3",
      label: "S3 - Private Documents (by default)",
      isDisabled: true,
    },
  ];

  //Configuration for react-select component
  const colourStyles = {
    control: (styles, state) => ({
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

  // Open modal for edit
  const openEditModal = (role) => {
    dispatch(setcurrentRole(role));
    dispatch(setSelectedRoleId(role.id));
    // Map AccessCode values to corresponding option objects from accessOptions
    const filteredAccesses = role.AccessCode.slice(0, -1).map((code) => {
      return accessOptions.find((option) => option.value === code);
    });
    dispatch(setSelectedaccesses(filteredAccesses));
    dispatch(setIsModalOpen(true));
  };

  // Open modal for create
  const openCreateModal = () => {
    dispatch(setIsCreateModalOpen(true));
  };

  // Open modal for delete
  const openDeleteModal = (role) => {
    dispatch(setIsDeleteModalOpen(true));
    dispatch(setSelectedRoleId(role.id));
  };

  const handleAccessChange = (selectedOptions) => {
    dispatch(setSelectedaccesses(selectedOptions));
  };

  // Format option label for display
  const formatOptionLabel = ({ value, label }, { context }) => {
    return context === "value" ? value : label;
  };

  // // Debugging useEffect
  // useEffect(() => {
  //     console.log("testing:", selectedaccesses);
  // }, [selectedaccesses]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    // Validation logic
    if (!roleName) {
      dispatch(setErrorMessage("Please fill out all required fields."));
      return;
    }

    // Clear error message and proceed with form submission
    dispatch(setErrorMessage(""));

    // Prepare formData object
    const formData = {
      roleName,
      access: selectedaccesses.map((option) => option.value),
    };
    try {
      // Make a POST request to the API route
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle success (e.g., show success message, refresh roles list, etc.)
        dispatch(setIsCreateModalOpen(false));

        window.location.reload(); // Refresh the page
      } else {
        console.error("Error creating role:", result.error);
        dispatch(
          setErrorMessage(
            result.error || "An error occurred while creating the role."
          )
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      dispatch(setErrorMessage("A network error occurred. Please try again."));
    }
  };

  // Handle role editing
  const handleSave = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const updatedRoleName = e.target.elements.roleName.value;
    //const updatedAccessCodes = [...selectedaccesses.map((access) => access.value), "S3"]; // Extract the value property

    // Map the selected access codes, checking if they are objects or strings
    const updatedAccessCodes = [
      ...selectedaccesses.map((access) =>
        typeof access === "string" ? access : access.value
      ),
      "S3",
    ];

    // Check if the values have changed
    if (
      updatedRoleName !== currentRole.roleName ||
      updatedAccessCodes !== selectedaccesses
    ) {
      try {
        const response = await fetch("/api/role", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentRole.id,
            roleName: updatedRoleName,
            accessCodes: updatedAccessCodes,
          }),
        });

        if (response.ok) {
          //console.log('Role updated successfully');
          dispatch(setIsModalOpen(false));

          window.location.reload();
        } else {
          console.error("Failed to update role");
        }
      } catch (error) {
        console.error("Error updating role:", error);
      }
    } else {
      dispatch(setIsModalOpen(false));
    }
  };

  //Handles role deletion
  const handleDelete = async (e) => {
    e.preventDefault();
    dispatch(setError(null));

    try {
      const response = await fetch("/api/role", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });

      if (response.ok) {
        dispatch(setIsDeleteModalOpen(false));

        window.location.reload();
      } else {
        const errorData = await response.json();
        dispatch(setError(errorData.error || "Failed to delete role"));
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      dispatch(setError("Failed to delete role"));
    }
  };

  // Prevent rendering until authorization is confirmed
  if (!isAuthorized || !rolesFetched) {
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
        <h1 className="text-4xl font-bold mb-4 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-gray-300 after:mt-2 dark:text-cross-color">
          Role Management
        </h1>
        <div className="bg-tertiary-background dark:bg-dark-tertiary-background p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center mb-6 dark:text-cross-color">
            ROLE LIST
          </h2>

          <button
            className="ml-auto mr-7 flex items-center justify-center px-2 py-2 mb-3 bg-primary-color hover:bg-secondary-color text-white rounded gap-2"
            onClick={() => openCreateModal()}
          >
            <span>
              <UserRoundPen />
            </span>
            Add Role
          </button>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-dark-primary-background">
                <th className="border p-2 dark:text-cross-color w-1/4">Role</th>
                <th className="border p-2 dark:text-cross-color">Access</th>
                <th className="border p-2 dark:text-cross-color w-1/3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr
                  key={index}
                  className="odd:bg-gray-50 even:bg-secondary-background dark:bg-dark-primary-background"
                >
                  <td className="border p-2 dark:text-cross-color text-center">
                    {role.roleName}
                  </td>
                  <td className="border p-2 dark:text-cross-color text-center">
                    {role.AccessCode.join(", ")}
                  </td>
                  <td className="border p-2 dark:text-cross-color text-center h-full">
                    <div className="flex flex-row">
                      <button
                        className="mx-auto flex items-center justify-center px-4 py-2 bg-primary-color hover:bg-secondary-color text-white rounded gap-2"
                        onClick={() => openEditModal(role)}
                      >
                        <span>
                          <UserRoundPen />
                        </span>
                        EDIT
                      </button>
                      <button
                        className="mx-auto flex items-center justify-center px-2 py-2 bg-primary-color hover:bg-secondary-color text-white rounded gap-2"
                        onClick={() => openDeleteModal(role)}
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
        onClose={() => {
          dispatch(setIsModalOpen(false));

          dispatch(setSelectedaccesses([]));
        }}
      >
        <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
          Edit Role: {currentRole?.roleName}
        </h3>
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <label className="relative dark:text-cross-color">
            Role Name:
            <input
              type="text"
              name="roleName"
              defaultValue={currentRole?.roleName}
              className="w-full p-2 border rounded bg-white text-black focus:outline-none focus:ring-0"
            />
          </label>
          <label className="relative dark:text-cross-color">
            Access:
            <div className="w-full flex items-center border rounded bg-white dark:bg-dark-tertiary-background">
              <Select
                closeMenuOnSelect={true}
                isSearchable={false}
                isMulti
                options={accessOptions}
                styles={colourStyles}
                className="w-full h-full"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                formatOptionLabel={formatOptionLabel}
                onChange={handleAccessChange}
                value={selectedaccesses}
              />
            </div>
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-color text-white px-4 py-2 rounded hover:bg-secondary-color"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Creating Role */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          dispatch(setIsCreateModalOpen(false));

          dispatch(setSelectedaccesses([]));
        }}
      >
        <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
          Create Role:
        </h3>
        <form className="flex flex-col gap-4" onSubmit={handleCreateSubmit}>
          <label className="relative dark:text-cross-color">
            Role Name*:
            <input
              type="text"
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-0"
              value={roleName}
              onChange={(e) => dispatch(setRoleName(e.target.value))}
            />
          </label>
          <label className="relative dark:text-cross-color">
            Access*:
            <div className="w-full flex items-center border rounded bg-white dark:bg-dark-tertiary-background">
              <Select
                closeMenuOnSelect={true}
                isSearchable={false}
                isMulti
                options={accessOptions}
                styles={colourStyles}
                className="w-full h-full"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                formatOptionLabel={formatOptionLabel}
                onChange={handleAccessChange}
                value={selectedaccesses}
              />
            </div>
            {errorMessage && <p className="text-red-600 h-0">{errorMessage}</p>}
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-color text-white px-4 py-2 rounded hover:bg-secondary-color"
              onClick={() => dispatch(setIsModalOpen(false))}
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for deleting roles */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(setIsDeleteModalOpen(false))}
      >
        <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
          Warning!
        </h3>
        <p>
          Are you sure you want to delete this role? Deleting roles without
          precautions may lead to system failure.
        </p>
        <div className="flex justify-around mt-5">
          <button
            type="button"
            className="bg-primary-color text-white px-6 py-2 rounded hover:bg-secondary-color"
            onClick={() => dispatch(setIsDeleteModalOpen(false))}
          >
            Cancel
          </button>
          <form onSubmit={handleDelete} roleId={selectedRoleId}>
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
