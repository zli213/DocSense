// app/api/users/route.js

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Adjust the import path to your Prisma client

export async function GET(request) {
  try {
    const users = await prisma.user.findMany({
      include: {
        UserRoles: {
          include: {
            Role: true, // Include role details
          },
        },
        UserDepartment: {
          include: {
            Department: {
              include: {
                parentDepartment: true, // Include parent department details
              },
            },
          },
        },
      },
    });

    // Format the data to only include the required fields
    const formattedUsers = users.map((user) => {
      // Get the first department associated with the user
      const department =
        user.UserDepartment.length > 0
          ? user.UserDepartment[0].Department
          : null;

      // Determine the department and parent department names
      const departmentName = department
        ? department.departmentName
        : "Not assigned";
      const parentDepartmentName =
        department && department.parentDepartment
          ? department.parentDepartment.departmentName
          : null;

      // Get the first role associated with the user
      const role =
        user.UserRoles.length > 0
          ? user.UserRoles[0].Role.roleName
          : "Not assigned";

      return {
        id: user.id,
        name: user.userName,
        role,
        department: departmentName,
        parentDepartment: parentDepartmentName,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Parse the JSON body
    const {
      userID,
      userName,
      roleID,
      selectedDepartment,
      selectedSecondaryDepartment,
    } = await request.json();

    // Validate input
    if (!userID) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Prepare update data for the User table
    const updateData = {};
    if (userName && userName.trim() !== "") {
      updateData.userName = userName;
    }
    if (roleID !== null) {
      updateData.roleID = roleID;
    }

    // Determine departmentID based on the selected department and secondary department
    let departmentID;
    if (selectedSecondaryDepartment && selectedSecondaryDepartment.length > 0) {
      departmentID = selectedSecondaryDepartment[0].value; // Extract value from array
    } else if (selectedDepartment && selectedDepartment.length > 0) {
      departmentID = selectedDepartment[0].value; // Extract value from array
    }

    // If departmentID is determined, add it to the updateData
    if (departmentID) {
      updateData.departmentID = departmentID;
    }

    // Update the user in the database if there is data to update
    let updatedUser;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: userID },
        data: updateData,
      });
    }

    // Update the UserDepartment if departmentID was provided
    if (departmentID) {
      const userDepartment = await prisma.userDepartment.findFirst({
        where: { userID: userID },
      });

      if (userDepartment) {
        // Update the existing UserDepartment entry
        await prisma.userDepartment.update({
          where: {
            userID_depID: { userID: userID, depID: userDepartment.depID },
          },
          data: { depID: departmentID },
        });
      } else {
        // Create a new UserDepartment entry if it does not exist
        await prisma.userDepartment.create({
          data: {
            userID: userID,
            depID: departmentID,
          },
        });
      }
    }

    // Check if UserRole entry exists by userID
    const userRole = await prisma.userRole.findFirst({
      where: { userID: userID },
    });

    if (roleID !== null) {
      if (userRole) {
        // Update the existing UserRole entry
        await prisma.userRole.update({
          where: { userID_roleID: { userID: userID, roleID: userRole.roleID } },
          data: { roleID },
        });
      } else {
        // Create a new UserRole entry if it does not exist
        await prisma.userRole.create({
          data: {
            userID: userID,
            roleID,
          },
        });
      }
    }

    // Return the updated user
    return NextResponse.json(updatedUser || { message: "No updates applied" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { userID } = await req.json();
    //console.log("delete request received")
    // Delete related data first
    await prisma.userRole.deleteMany({
      where: { userID },
    });

    await prisma.userDepartment.deleteMany({
      where: { userID },
    });

    await prisma.userPositions.deleteMany({
      where: { userID },
    });

    await prisma.accessLog.deleteMany({
      where: { userID },
    });

    await prisma.searchLog.deleteMany({
      where: { userID },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: userID },
    });

    return NextResponse.json({
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user data" },
      { status: 500 }
    );
  }
}
