import prisma from "@/../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId");
    
    let roles;
    if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId, 10) },
      select: {
        roleName: true,
      },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json({ roleName: role.roleName });
  } else {
      // If no user ID is provided, retrieve all roles
      roles = await prisma.role.findMany({
        where: {
          id: {
            not: 1, // Exclude the role admin
          },
        },
        include: {
          UserRole: {
            include: {
              User: {
                include: {
                  UserDepartment: {
                    include: {
                      Department: {
                        include: {
                          parentDepartment: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          RoleType: {
            select: {
              AccessCode: true, // Assuming AccessCode is the document type
            },
          },
        },
      });

      const formattedRoles = roles.map(role => {
        // Assume we take the first user and their associated department as representative for the role
        const firstUser = role.UserRole.length > 0 ? role.UserRole[0].User : null;
        const department = firstUser?.UserDepartment.length > 0 ? firstUser.UserDepartment[0].Department : null;

        return {
          id: role.id,
          roleName: role.roleName,
          departmentId: department?.id || null,
          departmentName: department?.departmentName || 'Not assigned',
          parentDepartmentId: department?.parentDepartment?.id || null,
          parentDepartmentName: department?.parentDepartment?.departmentName || 'Not assigned',
          AccessCode: role.RoleType.map(rt => rt.AccessCode),
        };
      });

      return NextResponse.json(formattedRoles);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create role
export async function POST(req) {
  try {
    // Parse the request body
    const { roleName, access } = await req.json();
    // Automatically append 'S3' to the access array
    const updatedAccess = [...new Set([...access, 'S3'])];

    // Check if a role with the same roleName and depID already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        roleName,
      },
    });

    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 400 });
    }

    // Create a new Role entry
    const newRole = await prisma.role.create({
      data: {
        roleName,
        RoleType: {
          create: updatedAccess.map(docType => ({
            AccessCode: docType
          })),
        },
      },
      include: {
        RoleType: true, // Include RoleType in the response
      },
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the role" },
      { status: 500 }
    );
  }
}

// Edit Role
export async function PUT(request) {
  try {
    const { id, roleName, accessCodes } = await request.json();

    if (id) {
      // Update the existing role
      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          roleName,
          RoleType: {
            deleteMany: {}, // Remove existing access codes
            create: accessCodes.map((code) => ({ AccessCode: code })),
          },
        },
      });

      return NextResponse.json({ success: true, updatedRole });
    } else {
      // Create a new role
      const newRole = await prisma.role.create({
        data: {
          roleName,
          RoleType: {
            create: accessCodes.map((code) => ({ AccessCode: code })),
          },
        },
      });

      return NextResponse.json({ success: true, newRole });
    }
  } catch (error) {
    console.error('Error handling role request:', error);
    return NextResponse.json({ error: 'Failed to process role request' }, { status: 500 });
  }
}

// Delete role
export async function DELETE(req) {
  try {
    const { roleId } = await req.json();

    // Delete associated RoleType entries
    await prisma.roleType.deleteMany({
      where: { roleID: roleId },
    });

    // Delete associated UserRole entries
    await prisma.userRole.deleteMany({
      where: { roleID: roleId },
    });

    // Delete the role itself
    await prisma.role.delete({
      where: { id: roleId },
    });

    return new Response(
      JSON.stringify({ message: "Role deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to delete role" }), {
      status: 500,
    });
  }
}
