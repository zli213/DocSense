import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content p-10 dark:bg-dark-tertiary-background dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Image src="/FRW_Logo.jpg" alt="/FRW_Logo" width={50} height={50} />
          <p className="dark:text-cross-color mt-2">
            FRW Healthcare Ltd.
            <br />
            Providing reliable tech since 1992
          </p>
        </aside>
        <nav className="flex flex-col">
          <h6 className="footer-title dark:text-cross-color">Services</h6>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Branding <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Design <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Marketing <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Advertisement <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
        </nav>
        <nav className="flex flex-col">
          <h6 className="footer-title dark:text-cross-color">Company</h6>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            About us <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Contact <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Jobs <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Press kit <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
        </nav>
        <nav className="flex flex-col">
          <h6 className="footer-title dark:text-cross-color">Legal</h6>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Terms of use <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Privacy policy <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
          <a className="link link-hover dark:text-cross-color mb-1 flex items-center justify-between">
            Cookie policy <ChevronRight className="h-4 w-4 md:hidden" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
