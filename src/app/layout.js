"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "./ProviderWrapper";
import { useEffect, useState } from "react";
import { metadata } from "./metadata";
import Head from "next/head";
import { Provider } from 'react-redux';
import store from '@/app/store/store'; 


// import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Provider store={store}>
      <ProviderWrapper>
        <html lang="en" className={theme}>
          <Head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
          </Head>
          <body className={`${inter.className} flex flex-col min-h-screen`}>
            <main className="flex-grow">{children}</main>
          </body>
        </html>
      </ProviderWrapper>
    </Provider>
  );
}
