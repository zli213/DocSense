import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(request, { params }) {
  const userId = params.userId;

  try {
    // transform userId to integer
    const userIdInt = parseInt(userId, 10);

    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      include: {
        UserRoles: {
          include: {
            Role: {
              include: {
                RoleType: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // process user role data
    const roles = user.UserRoles.map((ur) => ({
      roleName: ur.Role.roleName,
      roleTypes: ur.Role.RoleType.map((rt) => ({
        documentType: rt.documentType,
        accessCode: rt.AccessCode,
      })),
    }));

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error getting user role information:", error);
    return NextResponse.json(
      { error: "Server internal error" },
      { status: 500 }
    );
  }
}
