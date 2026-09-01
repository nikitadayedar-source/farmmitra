"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "View Users", href: "/admin/users" },
  { name: "Manage Admins", href: "/admin/manage" },
  { name: "Help Requests", href: "/admin/help-requests" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        router.push("/admin/login");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-grow overflow-hidden">
          <div className="p-4 text-2xl font-bold text-white">Admin Panel</div>
          <nav className="mt-6">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`block py-3 px-4 transition-colors ${
                      pathname === link.href
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 hover:bg-red-700 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-0 md:ml-64 h-screen overflow-y-auto">
        <div className="md:hidden sticky top-0 bg-gray-800 p-4 text-white z-20 flex items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="mr-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
