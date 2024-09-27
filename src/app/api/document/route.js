import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const s3link = searchParams.get("s3link");

  if (!s3link) {
    return NextResponse.json({ error: "s3link is required" }, { status: 400 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { s3link },
      select: {
        createdBy: true,
        summary: true,
        AccessCode: true,
        Tag: true,
        docDepartment: true,
        AccessLogs: true, // This will include all related AccessLogs
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
