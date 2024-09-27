// src/components/Navbar.js
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-tertiary-background dark:bg-dark-tertiary-background flex flex-col md:flex-row justify-between items-center p-4">
      <div className={`flex items-center ${isMenuOpen ? "mb-4" : "md:mb-0"}`}>
        <Link href="/" legacyBehavior>
          <a>
            {/* light logo */}
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              priority
              className="dark:hidden"
            />
            {/* Dark mode logo */}
            <Image
              src="/darkLogo.png"
              alt="Dark Logo"
              width={100}
              height={100}
              priority
              className="hidden dark:block"
            />
          </a>
        </Link>
      </div>

      <div className="hidden md:flex space-x-12 items-center">
        <Link href="/" legacyBehavior>
          <a
            className="text-lg hover:underline dark:text-cross-color"
            title="home"
          >
            Home
          </a>
        </Link>
        <Link href="/about" legacyBehavior>
          <a
            className="text-lg hover:underline dark:text-cross-color"
            title="about"
          >
            About
          </a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a
            className="text-lg hover:underline dark:text-cross-color"
            title="login"
          >
            Login
          </a>
        </Link>
        <Link href="/register" legacyBehavior>
          <a
            className="text-lg hover:underline dark:text-cross-color mr-2"
            title="register"
          >
            Register
          </a>
        </Link>
      </div>
      <div className="md:hidden absolute top-4 right-4">
        <button onClick={toggleMenu} className="focus:outline-none">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`
          md:hidden absolute top-full left-0 right-0 
          bg-tertiary-background dark:bg-dark-tertiary-background 
          flex flex-col items-center
          transition-all duration-300 ease-out origin-top transform
          ${isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
        `}
      >
        <Link href="/" legacyBehavior>
          <a className="hover:underline dark:text-cross-color py-2">Home</a>
        </Link>
        <Link href="/about" legacyBehavior>
          <a className="hover:underline dark:text-cross-color py-2">About</a>
        </Link>
        <Link href="/login" legacyBehavior>
          <a className="hover:underline dark:text-cross-color py-2">Login</a>
        </Link>
        <Link href="/register" legacyBehavior>
          <a className="hover:underline dark:text-cross-color py-2">Register</a>
        </Link>
      </div>
    </nav>
  );
}
