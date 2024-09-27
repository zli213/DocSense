// src/app/api/updateUser/route.js

import { getServerSession } from "next-auth/next"; // or 'next-auth/react' depending on your setup
import prisma from "@/../lib/prisma"; // Ensure you have a Prisma instance setup
import { options } from "../auth/[...nextauth]/options";
import bcrypt from "bcrypt";

export const POST = async (req) => {
  const session = await getServerSession(options);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { username, email, password } = await req.json();
  let hashPassword;
  if (password) {
    hashPassword = await bcrypt.hash(password, 10);
  }

  try {
    // Update the user and return the updated data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(username && { userName: username }), // Update userName only if it's provided
        ...(email && { email: email }),
        ...(hashPassword && { password: hashPassword }), // Update password only if provided
      },
    });

    return new Response(
      JSON.stringify({
        message: "User updated successfully",
        user: {
          id: updatedUser.id,
          userName: updatedUser.userName,
          email: updatedUser.email,
        },
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to update user" }), {
      status: 500,
    });
  }
};
