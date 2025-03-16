import { UserButton } from "@clerk/nextjs";
import Link from "next/dist/client/link";
import React from "react";

function Header() {
  return (
    <header className="bg-white border-b border-black/5 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            <h1 className="text-lg font-semibold tracking-tight text-black">
              JPSS Cloud
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Upload New Files
            </Link>
            <Link
              href="/files"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              My Files
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              About
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Help
            </Link>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
