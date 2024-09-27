// pages/api/departments/route.js

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma.js";

export async function GET(req) {
  const idParam = req.nextUrl.searchParams.get("id");
  
  try {
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
      }
      
      const department = await prisma.department.findUnique({ 
        where: { id },
        include: { subDepartments: true }
      });
      
      if (!department) {
        return NextResponse.json({ message: "Department not found" }, { status: 404 });
      }
      
      return NextResponse.json(department);
    } else {
      const departments = await prisma.department.findMany({
        include: { subDepartments: true },
      });
      return NextResponse.json(departments);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server internal error" },
      { status: 500 }
    );
  }
}
