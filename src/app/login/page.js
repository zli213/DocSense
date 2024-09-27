"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { signIn, getSession, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setTransitionClass,
  setEmail,
  setPassword,
  setMessage,
  setShowPassword,
} from "@/app/store/slices/loginSlice";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { loading, transitionClass, email, password, message, showPassword } =
    useSelector((state) => state.login);

  useEffect(() => {
    setTimeout(() => dispatch(setTransitionClass("")), 500);
  }, [dispatch]);

  // Handling redirection logic after authentication
  useEffect(() => {
    if (status === "loading") return; // Avoiding redirects when status is loading

    if (status === "authenticated") {
      if (session?.user.roleId === 1) {
        router.push("/authorise"); // Administrator users are redirected to the authorise page
      } else {
        router.push("/search"); // Normal users are redirected to the search page
      }
    }
  }, [status, session, router]);

  const switchToRegister = () => {
    dispatch(setTransitionClass("page-exit"));
    setTimeout(() => router.push("/register"), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setMessage(""));

    const result = await signIn("credentials", {
      redirect: false,
      email, // Ensure this key matches what the backend expects
      password, // Ensure this key matches what the backend expects
    });

    dispatch(setLoading(false));

    if (result.error) {
      dispatch(setMessage(result.error));
    }
  };

  const togglePasswordVisibility = () => {
    dispatch(setShowPassword(!showPassword));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-xs"></span>
        <span className="loading loading-ring loading-sm"></span>
        <span className="loading loading-ring loading-md"></span>
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-background dark:bg-dark-primary-background">
      <div className="relative z-50">
        <Navbar />
      </div>

      <main
        className={`flex-grow flex flex-col md:flex-row justify-between items-center bg-primary-background dark:bg-dark-primary-background relative overflow-hidden ${transitionClass}`}
      >
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center bg-primary-background dark:bg-dark-primary-background z-10">
          <h1 className="text-xl md:text-2xl font-bold mb-4 dark:text-cross-color">
            Welcome to DocSense
          </h1>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-cross-color">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value))}
                className="w-full px-3 py-2 border rounded dark:bg-dark-secondary-background dark:text-cross-color"
                required
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 dark:text-cross-color">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                className="w-full px-3 py-2 border rounded dark:bg-dark-secondary-background dark:text-cross-color"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6">
                <button type="button" onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    <EyeOff className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Eye className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <button
              type="submit"
              className="w-full bg-primary-color hover:bg-secondary-color text-white py-2 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
          <p className="mt-4 dark:text-cross-color">
            Don&apos;t have an account?{" "}
            <a href="#" onClick={switchToRegister} className="text-blue-500">
              Sign Up!
            </a>
          </p>
        </div>
        <div
          className={`hidden md:flex relative overflow-hidden rounded-tl-[200px] pt-60 pb-60 w-1/2 h-full items-center justify-center bg-gray-200 transition-transform duration-500 ${transitionClass}`}
        >
          <Image
            src="/loginP.png"
            alt="Background Image"
            fill
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            className="z-0"
            priority
          />
          <div className="z-10 flex items-center justify-center w-full h-full"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
