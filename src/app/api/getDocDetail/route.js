import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const s3link = searchParams.get('s3link');

  if (!s3link) {
    return NextResponse.json({ error: "Missing s3link parameter" }, { status: 400 });
  }

  try {
    // Query the database to find the corresponding document
    const document = await prisma.document.findFirst({
      where: { s3link },
      select: {
        summary: true,
        Tag: true,
        docDepartment: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Return summary, Tag and docDepartment
    return NextResponse.json({ 
      summary: document.summary,
      tag: document.Tag,
      docDepartment: document.docDepartment
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching document details:", error);
    return NextResponse.json({ error: "Failed to fetch document details" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
