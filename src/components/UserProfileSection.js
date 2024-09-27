import { Bolt } from "lucide-react";
import Image from "next/image";
const UserProfileSection = ({
  userId,
  userName,
  depName,
  roleName,
  userRoleId,
  userProfileImage,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="avatar border-[#909090] border rounded-full mr-2">
        <div className="rounded-full w-14">
          <Image
            src={userProfileImage ? `/uploads/${userId}.png` : "/john_doeA.png"}
            alt="Profile Picture"
            width={160}
            height={160}
          />
        </div>
      </div>
      <div className="flex flex-col mr-2">
        <h2 className="text-base dark:text-cross-color truncate max-w-full">
          {userName.charAt(0).toUpperCase() + userName.slice(1)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-cross-color">{depName}</p>
        <p className="text-sm text-gray-500 dark:text-cross-color">
          {roleName}
        </p>
      </div>

      <a href="/settings">
        <Bolt
          alt="Settings"
          className="w-6 h-6 rounded-full dark:text-cross-color"
        />
      </a>
    </div>
  );
};

export default UserProfileSection;
