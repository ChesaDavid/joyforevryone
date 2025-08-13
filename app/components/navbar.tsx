'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import Logo from "@/app/favicon.ico"
const navLinks = [
  { href: "/", label: "Home", icon: "home" , show: false},
  { href: "/projects", label: "Projects", icon: "users" , show:false},
  { href: "/gallery", label: "Gallery", icon: "mail" ,show:false},
];


export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, rank } = useAuth();
  const pathname = usePathname();

  const userLinks = [
    user && { href: `/dashboard/${user.uid}`, label: "Dashboard", icon: "brifecase", show: !!user },
    { href: "/login", label: "Login", show: !user },
    {href:"/donations", label: "Donations", icon: "heart", show: true},
    { href: "/logout", label: "Logout", show: !!user },
  ].filter(Boolean);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-11 h-11   rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {Logo && <img src={Logo.src} alt="Logo" className="w-8 h-8" />}
              </span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-900">
                JoyForEveryone
              </span>
            </div>
            <span className="hidden sm:inline-block ml-4 px-3 py-1 rounded-full bg-gray-800 text-sm text-cyan-300 border border-cyan-700">
              {user
                ? `${user.displayName || user.email} (${rank || "Volunteer"})`
                : "Guest"}
            </span>
          </div>
          <div className="hidden md:flex justify-center items-center  space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative h-10 p-5 rounded-lg font-medium text-base flex items-center transition
                    ${
                      isActive
                        ? "text-white bg-gradient-to-r from-purple-700 to-cyan-700 shadow-lg"
                        : "text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-cyan-700"
                    }
                    focus:outline-none focus:ring-2 focus:ring-cyan-400 group
                  `}
                >
                  <span className="flex items-center">
                    {link.label}
                  </span>
                  <span
                    className={`absolute left-2 right-2 -bottom-1 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full
                      transition-transform origin-left
                      ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                    `}
                  ></span>
                </Link>
              );
            })}
          {
            userLinks.map((link) => {
              if (link.show) {
                const isActive = pathname === link.href;
                
                return (
                  <Link
                  key={link.href}
                  href={link.href}
                  className={`relative h-10 p-5 rounded-lg font-medium text-base flex items-center transition
                    ${
                      isActive
                        ? "text-white bg-gradient-to-r from-purple-700 to-cyan-700 shadow-lg"
                        : "text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-cyan-700"
                    }
                    focus:outline-none focus:ring-2 focus:ring-cyan-400 group
                  `}
                >
                  <span className="flex items-center">
                    {link.label}
                  </span>
                  <span
                    className={`absolute left-2 right-2 -bottom-1 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full
                      transition-transform origin-left
                      ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                    `}
                  ></span>
                  </Link>
                );
              }
              return null;
            })
          }
          </div>
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-gray-800 text-purple-300 hover:bg-purple-700 hover:text-white transition"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 shadow-lg px-4 pb-4">
          <div className="flex flex-col space-y-2 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-4 py-2 rounded-lg font-medium text-base text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-cyan-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                <i data-lucide={link.icon} className="w-5 h-5 mr-2"></i>
                {link.label}
              </Link>
            ))}
            {
              userLinks.map((link) => {
                if (link.show) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center px-4 py-2 rounded-lg font-medium text-base text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-cyan-700 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i data-lucide={link.icon} className="w-5 h-5 mr-2"></i>
                      {link.label}
                    </Link>
                  );
                }
                return null;
              })
            }
            <span className="mt-2 px-3 py-1 rounded-full bg-gray-800 text-sm text-cyan-300 border border-cyan-700 self-start">
              {user
                ? `${user.displayName || user.email} (${rank || "Volunteer"})`
                : "Guest"}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;