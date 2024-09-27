import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

//retrieve user info
export const GET = async () => {
  const session = await getServerSession(options);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

//save new username
export const POST = async (req) => {
  const session = await getServerSession(options);

  const {inputValue: newUsername} = await req.json();

  const filter = { email: session.user.email };
  const update = { username: newUsername };

  try {
    await prisma.user.update({
      where: filter,
      data: update,
    });
    return NextResponse.json({ message: "Succeed. ", status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error, status: 500 });
  }
};
//create new user
export const PUT = async (req) => {
  const { email, username } = await req.json();

  try {
    await prisma.user.create({
      data: {
        email,
        username,
      },
    });
    return NextResponse.json({ message: "Succeed. ", status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error, status: 500 });
  }
};