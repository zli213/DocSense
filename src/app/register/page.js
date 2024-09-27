"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useDispatch, useSelector } from 'react-redux';
import {
  setTransitionClass,
  setUsername,
  setEmail,
  setPassword,
  setConfirmPassword,
  setMessage,
  setShowPassword,
} from "@/app/store/slices/registerSlice";


export default function RegisterPage() {
  const router = useRouter();

  const dispatch = useDispatch();
  const {
    transitionClass,
    username,
    email,
    password,
    confirmPassword,
    message,
    showPassword,
  } = useSelector((state) => state.register);


  useEffect(() => {
    setTimeout(() => dispatch(setTransitionClass("")), 500);
  }, [dispatch]);

  const switchToLogin = () => {
    dispatch(setTransitionClass("page-register-exit"));
    setTimeout(() => router.push("/login"), 500);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setMessage(""));


    if (password !== confirmPassword) {
      dispatch(setMessage("Passwords do not match."));
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
      const data = await response.json();
      // Modified Logic: Replace the above email alert with a simple signup success alert, or jump directly
      if (response.status === 201) {
        dispatch(setMessage("User registered successfully!"));
        // router.push("/login"); 
      }
    } catch (error) {
      dispatch(setMessage("Error creating user."));
      console.error("Error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    dispatch(setShowPassword(!showPassword));
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-background dark:bg-dark-primary-background">
      <div className="relative z-50">
        <Navbar />
      </div>
      <main
        className={`flex-grow flex flex-col md:flex-row justify-between items-center bg-primary-background dark:bg-dark-primary-background relative overflow-hidden ${transitionClass}`}
      >
        <div
          className={`hidden md:flex relative overflow-hidden rounded-tl-[200px] pt-60 pb-60 w-1/2 h-full items-center justify-center bg-gray-200 transition-transform duration-500 ${transitionClass}`}
        >
          <Image
            src="/registerP.png"
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
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-primary-background dark:bg-dark-primary-background z-10">
          <h1 className="text-2xl font-bold mb-4 dark:text-cross-color">
            Sign Up
          </h1>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-cross-color">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => dispatch(setUsername(e.target.value))}
                className="w-full px-3 py-2 border rounded dark:bg-dark-secondary-background dark:text-cross-color"
                required
              />
            </div>
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
            <div className="mb-4 relative">
              <label className="block text-gray-700 dark:text-cross-color">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border rounded dark:bg-dark-secondary-background dark:text-cross-color"
                value={confirmPassword}
                onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
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
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 dark:text-cross-color">
            Already have an account?{" "}
            <a href="#" onClick={switchToLogin} className="text-blue-500">
              Login!
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
