import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary-background p-4">
      <div className="mb-8">
        <TriangleAlert className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-primary-color mb-10">
        404 - Page Not Found!!
      </h1>
      <p className="mb-10 text-lg text-primary-color">
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <p>
        <Link
          className=" text-white bg-primary-color rounded p-2  hover:underline"
          href="/"
          title="Home"
        >
          Go back home
        </Link>
      </p>
    </div>
  );
}
