"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    name: "Zhaohua Li",
    title: "CEO",
    description: "Leader of the company",
    image: "/about3.png", // Replace with the actual avatar path
  },
  {
    name: "Nuo Chen",
    title: "CTO",
    description: "Chief Technology Officer",
    image: "/about1.png", // Replace with the actual avatar path
  },
  {
    name: "Xinyu Chen",
    title: "CFO",
    description: "Chief Financial Officer",
    image: "/about2.png", // Replace with the actual avatar path
  },
  {
    name: "James Wu",
    title: "COO",
    description: "Chief Operating Officer",
    image: "/about4.png", // Replace with the actual avatar path
  },
];

export default function About() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  return (
    <div className="min-h-screen bg-primary-background dark:bg-dark-background">
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="p-8 bg-primary-background dark:bg-dark-secondary-background shadow-lg rounded-lg">
        <section className="my-16">
          <h2 className="text-shadow-sm text-3xl font-semibold mb-6 dark:text-cross-color border-b-2 border-gray-300 dark:border-dark-primary pb-1 text-center md:text-left md:inline-block">
            ABOUT
          </h2>

          <p className="mb-8 dark:text-cross-color text-shadow-md sm:text-justify">
            This system, named DocSense, is an AI-powered assistant specifically
            designed to enhance document management efficiency at FRW Healthcare
            Limited. It integrates cloud data preprocessing, AI-driven search,
            categorization, and summarization features, significantly reducing
            the time employees spend retrieving documents, thereby improving the
            overall efficiency of the company.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg shadow-lg bg-tertiary-background dark:bg-dark-primary-background transform hover:scale-105 transition-transform duration-300"
              >
                <blockquote className="text-lg italic mb-4 dark:text-cross-color shadow-sm">
                  {member.name}
                </blockquote>
                <div className="flex items-center">
                  <Image
                    src={member.image}
                    alt="Avatar"
                    width={60}
                    height={60}
                    className="rounded-full shadow-md"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-bold dark:text-cross-color shadow-sm text-shadow-md">
                      {member.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-cross-color shadow-sm text-shadow-md">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
