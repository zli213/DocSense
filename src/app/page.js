"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-10 text-center">
          <h1 className="text-white text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-8 text-shadow-xl dark:text-cross-color">
            DocSense
          </h1>
          <div className="flex">
            <p className="fade-in-text text-white dark:text-cross-color text-base sm:text-lg md:text-xl leading-relaxed tracking-wide max-w-2xl mx-auto text-shadow-xl">
              Welcome to DocSense, leveraging generative AI to optimize your
              document search, categorization, and summarization, enhancing work
              efficiency.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </section>
      <Footer />
    </main>
  );
}
