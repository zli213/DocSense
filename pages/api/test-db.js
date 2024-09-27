// pages/api/test-db.js
import prisma from "@/../lib/prisma";

export default async function handler(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        UserRoles: true,
        UserDepartment: true,
        UserPositions: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Database connection error" });
  }
}
