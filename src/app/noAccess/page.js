// src/pages/403.js
"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Custom403() {
  const { data: session, status } = useSession(); // get session
  const userId = session?.user?.id; // Get userId from session

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary-background p-4">
      {userId === 1 ? (
        <>
          <div className="mb-8">
            <TriangleAlert className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-color mb-10">
            403 - Forbidden
          </h1>
          <p className="mb-10 text-lg text-primary-color">
            Is it you again admin? Go back and do your work, you don&apos;t get to search
          </p>
          <p>
            <Link
              className="text-white bg-primary-color rounded p-2 hover:underline"
              href="/authorise"
              title="Authorise"
            >
              Go back
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mb-8">
            <TriangleAlert className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-color mb-10">
            403 - Forbidden
          </h1>
          <p className="mb-10 text-lg text-primary-color">
            Is it you again user? Go back and do your work, you don&apos;t get to authorise
          </p>
          <p>
            <Link
              className="text-white bg-primary-color rounded p-2 hover:underline"
              href="/search"
              title="Search"
            >
              Go back
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
