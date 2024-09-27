import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const offset = parseInt(searchParams.get("offset")) || 0; // Get the offset parameter, default is 0
  const limit = parseInt(searchParams.get("limit")) || 5;   // Get the limit parameter, default is 5

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
    });
  }

  try {
    const logs = await prisma.searchLog.findMany({
      where: { userID: parseInt(userId) },
      select: {
        id: true,
        searchQueryTitle: true,
        searchContent: true, // Include search content if necessary
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: offset,  // Skip to previous offset record
      take: limit,   // Get limit rows
    });

    return new Response(JSON.stringify(logs), { status: 200 });
  } catch (error) {
    console.error("Error fetching search logs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch search logs" }),
      { status: 500 }
    );
  }
}


export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
    });
  }

  const { searchQueryTitle, searchContent } = await req.json();

  try {
    const newLog = await prisma.searchLog.create({
      data: {
        searchQueryTitle,
        searchContent, // Save the search content as JSON
        userID: parseInt(userId),
      },
    });

    return new Response(JSON.stringify(newLog), { status: 201 });
  } catch (error) {
    console.error("Error creating search log:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create search log" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
    });
  }

  const { id, searchQueryTitle, searchContent } = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing log id" }), {
      status: 400,
    });
  }

  try {
    const existingLog = await prisma.searchLog.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingLog) {
      return new Response(JSON.stringify({ error: "Log not found" }), {
        status: 404,
      });
    }

    // Parse the received new content
    const newSearchContent = JSON.parse(searchContent);
    // Update the log with the new content
    const updatedLog = await prisma.searchLog.update({
      where: {
        id: parseInt(id),
      },
      data: {
        searchQueryTitle,
        searchContent: newSearchContent,
        userID: parseInt(userId),
      },
    });

    return new Response(JSON.stringify(updatedLog), { status: 200 });
  } catch (error) {
    console.error("Error updating search log:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update search log",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const logId = searchParams.get("id");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
    });
  }

  try {
    if (logId) {
      // Delete a specific log
      await prisma.searchLog.delete({
        where: {
          id: parseInt(logId),
          userID: parseInt(userId),
        },
      });
      // Return success message instead of null
      return new Response(JSON.stringify({ message: "Log deleted successfully" }), { status: 200 });
    } else {
      // Delete all logs for the user
      await prisma.searchLog.deleteMany({
        where: { userID: parseInt(userId) },
      });
      // Return success message
      return new Response(JSON.stringify({ message: "All logs deleted successfully" }), { status: 200 });
    }
  } catch (error) {
    console.error("Error deleting search logs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete search logs" }),
      { status: 500 }
    );
  }
}
