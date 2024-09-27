import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/../lib/prisma";


export async function POST(req) {
  try {
    const userData = await req.json();
    // Confirm data exists
    if (!userData?.email || !userData.password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Check for duplicate emails
    const duplicate = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (duplicate) {
      return NextResponse.json({ message: "Duplicate Email" }, { status: 409 });
    }

    // Hash password for email users
    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashPassword;

    // Create new user
    await prisma.user.create({
      data: {
        userName: userData.username,
        email: userData.email,
        password: userData.password,
        // token: "", // Save token
      },
    });
    
    return NextResponse.json({ message: "User Created successfully." }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user.", error },
      { status: 500 }
    );
  }
}
