"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import MenuBar from "@/components/menuBar.js";
import {
  Eye,
  EyeOff,
  UserRoundPen,
  Save,
  Camera,
  LogOut,
  Search,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Modal from "@/components/Modal.js";
import { useRouter } from "next/navigation";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
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
  setUserProfileImage,
} from "@/app/store/slices/settingsSlice";
import Image from "next/image";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const {
    userData,
    isEditing,
    showPassword,
    showConfirmPassword,
    password,
    confirmPassword,
    showPasswordError,
    isModalOpen,
    modalContentPhase,
    fileImage,
    depName,
    roleName,
    userProfileImage,
  } = useSelector((state) => state.settings);

  const { isDeleteModalOpen } = useSelector((state) => state.search);

  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const cropperRef = useRef(null);
  const userId = session?.user?.id;
  const userRoleId = session?.user?.roleId;
  const userDepId = session?.user?.departmentId;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleNewSearch = () => {
    router.push("/search");
  };

  const fetchRoleName = useCallback(() => {
    if (status === "authenticated" && userRoleId) {
      fetch(`/api/role?roleId=${userRoleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.roleName) {
            dispatch(setRoleName(data.roleName));
          } else {
            console.error("Expected a role name but got:", data);
          }
        })
        .catch((error) => console.error("Error fetching role name:", error));
    }
  }, [status, userRoleId, dispatch]);

  const fetchDepName = useCallback(() => {
    if (status === "authenticated" && userDepId) {
      fetch(`/api/department?id=${userDepId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            dispatch(setDepName(data.departmentName));
          } else {
            console.error("Expected a department name but got:", data);
          }
        })
        .catch((error) =>
          console.error("Error fetching department name:", error)
        );
    }
  }, [status, userDepId, dispatch]);

  const checkUserProfileImage = useCallback(
    async (userId) => {
      try {
        const response = await fetch(`/uploads/${userId}.png`);
        if (response.ok) {
          dispatch(setUserProfileImage(true)); // Image exists, set state to true
        } else {
          dispatch(setUserProfileImage(false)); // Image doesn't exist, set state to false
        }
      } catch (error) {
        console.error("Error checking profile image:", error);
        setUserProfileImage(false); // On error, fallback to false
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/account");
          const data = await response.json();
          dispatch(setUserData(data));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
    if (userDepId) {
      fetchDepName(userDepId);
    }
    if (userRoleId) {
      fetchRoleName(userRoleId);
    }
    if (userId) {
      checkUserProfileImage(userId);
    }
  }, [
    session,
    fetchDepName,
    fetchRoleName,
    checkUserProfileImage,
    userId,
    userDepId,
    userRoleId,
    dispatch,
  ]);

  useEffect(() => {
    if (password && confirmPassword) {
      dispatch(setShowPasswordError(password !== confirmPassword));
    } else {
      dispatch(setShowPasswordError(false));
    }
  }, [password, confirmPassword, dispatch]);

  const togglePasswordVisibility = () => {
    dispatch(setShowPassword(!showPassword));
  };

  const toggleConfirmPasswordVisibility = () => {
    dispatch(setShowConfirmPassword(!showConfirmPassword));
  };

  const openModal = () => {
    dispatch(setIsModalOpen(true));
  };

  const closeModal = () => {
    dispatch(setIsModalOpen(false)); //Close the modal and reset states to false
    dispatch(setModalContentPhase("view"));
    dispatch(setFileImage(null));
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size and type
      if (file.size > 15 * 1024 * 1024) {
        alert("File size exceeds 15 MB");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Invalid file type. Only JPG and PNG are allowed.");
        return;
      }

      // Read file and set modal content to cropping phase
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch(setFileImage(e.target.result));
        dispatch(setModalContentPhase("crop"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    const cropper = cropperRef.current.cropper;
    const croppedImage = cropper.getCroppedCanvas().toDataURL();

    // Update the modal with the cropped image preview
    dispatch(setModalContentPhase("finalize"));
    dispatch(setFileImage(croppedImage));
  };

  const handleSubmitCroppedImage = async (croppedImage) => {
    // const userId = userId;
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: croppedImage,
          fileName: `${userId}.png`,
        }),
      });
      if (!response.ok) {
        throw new Error("Error uploading image");
      }

      const result = await response.json();
      //console.log(result.message); // 'Image uploaded successfully'
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/updateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: e.target.username.value,
        email: e.target.email.value,
        password,
      }),
    });

    if (response.ok) {
      dispatch(setIsEditing(false));
      const updatedUserData = await response.json();
      dispatch(setUserData(updatedUserData.user));
    } else {
      console.error("Failed to update user");
    }
  };

  if (status === "loading" || !userData) {
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
    <div className="flex flex-col lg:flex-row justify-between bg-primary-background dark:bg-dark-tertiary-background min-h-screen w-full">
      <div className="hidden lg:block">
        <MenuBar />
      </div>
      {!isDeleteModalOpen && (
        <div className="w-full lg:ml-60 p-5 rounded-2 bg-primary-background dark:bg-dark-tertiary-background flex flex-col ">
          <div className="flex justify-center lg:justify-start items-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 relative after:content-[''] after:block after:w-full after:h-[2px] after:bg-gray-300 dark:text-cross-color after:mt-2">
              Settings
            </h1>
          </div>

          {/* Conditional rendering based on whether the user is editing or not */}

          <div className="card card-side bg-base-100 shadow-xl p-4 flex items-center dark:bg-dark-secondary-background dark:text-cross-color min-w-[300px] lg:min-w-[550px] overflow-x-auto">
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row justify-between items-center dark:bg-dark-secondary-background dark:text-cross-color w-full p-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full mb-4 sm:mb-0">
                  <figure className="w-28 h-28 relative mb-4 sm:mb-0 sm:mr-4">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={
                          userProfileImage
                            ? `/uploads/${userId}.png`
                            : "/john_doeA.png"
                        }
                        alt="Profile Picture"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Gray overlay and camera icon */}
                      <div
                        onClick={openModal}
                        className="absolute bottom-0 left-0 w-full h-[25%] bg-gray-800 bg-opacity-50 flex items-center justify-center cursor-pointer"
                      >
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                  </figure>
                  <div className="text-center sm:text-left">
                    <p className="text-lg">
                      Username: <span>{userData.userName}</span>
                    </p>
                    <p className="text-lg">
                      Email: <span>{userData.email}</span>
                    </p>
                    <p className="text-lg">
                      Department: <span>{depName}</span>
                    </p>
                    <p className="text-lg">
                      Role: <span>{roleName}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <button
                    className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color"
                    onClick={() => dispatch(setIsEditing(true))} // Enable edit mode
                  >
                    <UserRoundPen size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center dark:bg-dark-secondary-background dark:text-cross-color w-full">
                <form onSubmit={handleSubmit} className="flex flex-col w-full">
                  <div className="mb-4">
                    <label className="block text-lg font-bold mb-2 dark:text-cross-color">
                      Username:
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="w-full p-2.5 border border-solid border-slate-200 dark:bg-dark-secondary-background rounded-md"
                      defaultValue={userData.userName}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-bold mb-2 dark:text-cross-color">
                      Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full p-2.5 border border-solid border-slate-200 dark:bg-dark-secondary-background rounded-md"
                      defaultValue={userData.email}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-bold mb-2 dark:text-cross-color">
                      Password:
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => dispatch(setPassword(e.target.value))}
                        className="w-full p-2.5 border border-solid border-slate-200 dark:bg-dark-secondary-background rounded-md pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-bold mb-2 dark:text-cross-color">
                      Confirm Password:
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          dispatch(setConfirmPassword(e.target.value))
                        }
                        className="w-full p-2.5 border border-solid border-slate-200 dark:bg-dark-secondary-background rounded-md pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  {showPasswordError && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Passwords do not match
                    </p>
                  )}
                  <div className="flex justify-end items-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color w-full sm:w-auto"
                    >
                      <Save size={16} className="mr-0" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-primary-background dark:bg-dark-tertiary-background">
        <button
          onClick={handleNewSearch}
          className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color flex-1 mx-1 px-1 min-w-0"
        >
          <Search size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate text-xs">Back</span>
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-accent btn-sm bg-primary-color text-white rounded cursor-pointer hover:bg-secondary-color flex-1 mx-1 px-1 min-w-0"
        >
          <LogOut size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate text-xs">Logout</span>
        </button>
      </div>

      {/* Modal Component */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-4">
          {modalContentPhase === "view" && (
            <div className="flex flex-col items-center w-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-cross-color">
                Profile Picture
              </h2>
              <div className="flex justify-center w-full">
                <Image
                  src={
                    userProfileImage
                      ? `/uploads/${userId}.png`
                      : "/john_doeA.png"
                  }
                  alt="Current Avatar"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[#909090] border bg-tertiary-backgroun"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-center w-full mb-4">
                <button
                  className="btn btn-sm w-full sm:w-40 bg-primary-color text-white rounded-2.5 cursor-pointer hover:bg-secondary-color p-2 sm:p-3 pb-4 sm:pb-6 mt-4"
                  onClick={handleFileUploadClick}
                >
                  Upload Image
                </button>
                {/* Leave take photo option if needed
                          <button className="btn btn-sm w-full sm:w-40 bg-primary-color text-white rounded-2.5 cursor-pointer hover:bg-secondary-color p-2 sm:p-3 pb-4 sm:pb-6 mt-2 sm:mt-4 sm:ml-2">
                            Take Photo
                          </button> */}
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {modalContentPhase === "crop" && fileImage && (
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4">Crop the Image</h2>
              <Cropper
                src={fileImage}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={1}
                aspectRatio={1}
                guides={false}
                ref={cropperRef}
              />
              <button
                onClick={handleCrop}
                className="btn btn-sm w-40 bg-primary-color text-white rounded-2.5 cursor-pointer hover:bg-secondary-color p-3 pb-6 mt-5"
              >
                Crop and Save
              </button>
            </div>
          )}

          {modalContentPhase === "finalize" && fileImage && (
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4">
                Profile Picture Updated
              </h2>
              <div className="w-40 h-40 relative mb-4">
                <Image
                  src={fileImage}
                  alt="Cropped Avatar"
                  className="w-full object-covew-60 h-full rounded-full border-[#909090] border bg-tertiary-background"
                />
              </div>
              <button
                onClick={() => handleSubmitCroppedImage(fileImage)}
                className="btn btn-sm w-40 bg-primary-color text-white rounded-2.5 cursor-pointer hover:bg-secondary-color p-3 pb-6"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
