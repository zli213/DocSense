import Image from "next/image";
import {
  GalleryVerticalEnd,
  LogOut,
  Search,
  UserRoundPen,
  GripVertical,
  PencilRuler,
  Trash2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/Modal"; // Assume you have a reusable Modal component
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsNewQuerySubmitted,
  setIsHistoryLogClicked,
  setSearchLogs,
  setOffset,
  setUserProfileImage,
  setIsDeleteModalOpen,
} from "@/app/store/slices/searchSlice"; // Introduce redux actions
import UserProfileSection from "./UserProfileSection.js";

const MenuBar = ({ newLog }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch(); // use useDispatch

  const userName = session?.user?.name || "Loading...";
  const userId = session?.user?.id || "Loading...";
  const userRoleId = session?.user?.roleId;
  const userDepId = session?.user?.departmentId;
  const [roleName, setRoleName] = useState("...");
  const [depName, setDepName] = useState("...");
  const [logToDelete, setLogToDelete] = useState(null); // Save the log ID to be deleted

  // Getting searchLogs and offset from Redux
  const searchLogs = useSelector((state) => state.search.searchLogs);
  const offset = useSelector((state) => state.search.offset);
  const userProfileImage = useSelector(
    (state) => state.search.userProfileImage
  );
  const isDeleteModalOpen = useSelector(
    (state) => state.search.isDeleteModalOpen
  );

  const openDeleteModal = (logId) => {
    setLogToDelete(logId); // Set the ID of the log to be deleted
    dispatch(setIsDeleteModalOpen(true)); // Open Modal
  };
  const handleDeleteSubmit = (event) => {
    event.preventDefault();
    if (logToDelete) {
      handleDeleteLog(logToDelete); // Calling the delete function
      dispatch(setIsDeleteModalOpen(false)); // Close Modal
    }
  };

  const handleDeleteLog = (logId) => {
    fetch(`/api/userSearchingHistory?userId=${userId}&id=${logId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          // Make sure you update the searchLogs reference
          const updatedLogs = searchLogs.filter((log) => log.id !== logId);
          dispatch(setSearchLogs([...updatedLogs]));
          window.location.reload();
        }
      })
      .catch((error) => console.error("Error deleting log:", error));
  };

  // Pulls the first 5 logs on initialization
  const fetchInitialLogs = useCallback(() => {
    if (status === "authenticated" && userId) {
      fetch(`/api/userSearchingHistory?userId=${userId}&offset=0&limit=5`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            dispatch(setSearchLogs(data)); // Saving Data to Redux
            dispatch(setOffset(5)); // After initializing the request for 5 bars, set the offset to 5
          } else {
            console.error("Expected an array but got:", data);
          }
        })
        .catch((error) => console.error("Error fetching search logs:", error));
    }
  }, [status, userId, dispatch]);

  // Append logic after clicking the “More” button
  const handleMoreLogs = () => {
    fetch(`/api/userSearchingHistory?userId=${userId}&offset=${offset}&limit=5`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          dispatch(setSearchLogs(data)); // Appending new logs to Redux
          dispatch(setOffset(offset + data.length)); // Update offset
        } else {
          // console.log("No more logs available");
        }
      })
      .catch((error) => console.error("Error fetching more logs:", error));
  };

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
        console.error("Error checking menu profile image:", error);
        setUserProfileImage(false); // On error, fallback to false
      }
    },
    [dispatch]
  );
  const fetchRoleName = useCallback(() => {
    if (status === "authenticated" && userRoleId) {
      fetch(`/api/role?roleId=${userRoleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.roleName) {
            setRoleName(data.roleName);
          } else {
            console.error("Expected a role name but got:", data);
          }
        })
        .catch((error) => console.error("Error fetching role name:", error));
    }
  }, [status, userRoleId]);

  const fetchDepName = useCallback(() => {
    if (status === "authenticated" && userDepId) {
      fetch(`/api/department?id=${userDepId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setDepName(data.departmentName);
          } else {
            console.error("Expected a department name but got:", data);
          }
        })
        .catch((error) =>
          console.error("Error fetching department name:", error)
        );
    }
  }, [status, userDepId]);
  // Used to pull the first 5 logs during initialization
  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchInitialLogs();
    }
    if (userRoleId) {
      fetchRoleName(userRoleId);
    }
    if (userDepId) {
      fetchDepName(userDepId);
    }
    if (userId) {
      checkUserProfileImage(userId);
    }
  }, [
    status,
    userId,
    userRoleId,
    userDepId,
    checkUserProfileImage,
    fetchRoleName,
    fetchDepName,
    fetchInitialLogs,
  ]);

 

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleLogClick = (id) => {
    // Set isHistoryLogClicked to true when clicking on a history log
    dispatch(setIsHistoryLogClicked(true));
    dispatch(setIsNewQuerySubmitted(false));
    router.push(`/search?id=${id}`);
  };

  return (
    <div
      className={`w-60 bg-tertiary-background p-1 fixed flex flex-col justify-between min-h-screen dark:border-secondary-color border-r-2 dark:bg-dark-primary-background shadow-sm shadow-gray-700`}
    >
      <div>
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            className="logo-pic dark:hidden"
            width={115}
            height={115}
            priority
          />
          <Image
            src="/darkLogo.png"
            alt="Dark Logo"
            className="logo-pic hidden dark:block"
            width={115}
            height={115}
            priority
          />
        </div>
        <nav className="navSection">
          <ul className="list-none pb-10 m-0 px-2">
            <li className="rounded-md">
              {userRoleId === 1 ? (
                <>
                  <a
                    href="/authorise"
                    className="flex items-center w-full mb-2 text-gray-800 dark:text-cross-color  hover:bg-secondary-background"
                  >
                    <UserRoundPen className="mr-2" />
                    <h2 className="text-lg">Authorise</h2>
                  </a>
                  <a
                    href="/role"
                    className="flex items-center w-full mb-2 text-gray-800 dark:text-cross-color  hover:bg-secondary-background"
                  >
                    <PencilRuler className="mr-2" />
                    <h2 className="text-lg">Manage Role</h2>
                  </a>
                </>
              ) : (
                <a
                  href="/search"
                  className="flex items-center w-full text-gray-800 dark:text-cross-color"
                >
                  <Search className="mr-2 mb-2" />
                  <h2 className="text-lg mb-2">New Search</h2>
                </a>
              )}
            </li>
            <li className="mb-2 rounded-md hover:bg-secondary-background">
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-gray-800 dark:text-cross-color"
              >
                <LogOut className="mr-2" />
                <h2 className="text-lg">Logout</h2>
              </button>
            </li>
          </ul>
        </nav>

        {/* Conditionally render search logs */}
        {userRoleId !== 1 && (
          <div className="px-2">
            <div className="flex justify-start mb-2 pt-3 border-t-[1px] border-zinc-300">
              <h2 className="flex items-center text-lg text-gray-800 rounded-md dark:text-cross-color">
                <GalleryVerticalEnd className="mr-2" />
                Search Logs
              </h2>
            </div>

            <div className="max-h-60 overflow-y-scroll">
              <ul className="list-none p-1 ml-1">
                {Array.isArray(searchLogs) && searchLogs.length > 0 ? (
                  searchLogs.map((log, index) => (
                    <li
                      key={`${log.id}-${index}`}
                      className="mb-2 relative flex group"
                    >
                      <button
                        onClick={() => handleLogClick(log.id)}
                        className="text-zinc-500 dark:text-cross-color hover:bg-secondary-background text-left border-l-2 border-zinc-400 pl-2 overflow-hidden rounded-r-md w-full"
                        style={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {log.searchQueryTitle}
                      </button>
                      {/* delete */}
                      <button
                        onClick={() => openDeleteModal(log.id)}
                        className="hover:bg-secondary-background text-error-red px-2 hidden group-hover:flex rounded-md"
                      >
                        <Trash2 className="w-5 h-5 mt-0.6" />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 rounded-md">
                    No search logs available
                  </li> // Handle case where there are no logs
                )}
              </ul>
            </div>

            <button
              onClick={handleMoreLogs} // Load more logs when clicking
              className="flex justify-start items-center w-full text-zinc-500 dark:text-cross-color hover:bg-secondary-background rounded-md py-1 pl-1"
            >
              <GripVertical className="mr-2 w-4 h-4" />
              <p className="text-sm">More</p>
            </button>
          </div>
        )}
      </div>
      <div className="px-2 py-4">
        <UserProfileSection
          userId={userId}
          userName={userName}
          depName={depName}
          roleName={roleName}
          userRoleId={userRoleId}
          userProfileImage={userProfileImage}
        />
      </div>

      {/* Modal for confirming deletion */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => dispatch(setIsDeleteModalOpen(false))}
        >
          <h3 className="text-xl font-bold mb-4 dark:text-cross-color">
            Delete?
          </h3>
          <p>Are you sure you want to delete this log?</p>
          <div className="flex justify-end mt-5 gap-4">
            <button
              type="button"
              className="bg-primary-color text-white px-6 py-2 rounded-3xl hover:bg-secondary-color"
              onClick={() => dispatch(setIsDeleteModalOpen(false))} // Use onClick to close the modal
            >
              Cancel
            </button>
            <form onSubmit={handleDeleteSubmit}>
              <button
                type="submit"
                className="bg-error-red text-white px-6 py-2 rounded-3xl hover:bg-warning-yellow"
              >
                Delete
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MenuBar;
