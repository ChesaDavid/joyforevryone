'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/favicon.ico"
import {useIsPhone} from "@/app/hook/useIsPhone";
const navLinks = [
  { href: "/", label: "Home", icon: "home" , show: false},
  { href: "/projects", label: "Projects", icon: "users" , show:false},
  { href: "/gallery", label: "Gallery", icon: "mail" ,show:false},
];


const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
const { user, rank, whatsappInvite, joinWhatsapp } = useAuth();
  const pathname = usePathname();
  const isPhone = useIsPhone();

  const userLinks = [
    user && { href: `/dashboard/${user.uid}`, label: "Dashboard", icon: "brifecase", show: !!user },
    { href: "/login", label: "Login", show: !user },
    {href:"/donations", label: "Donations", icon: "heart", show: true},
    { href: "/logout", label: "Logout", show: !!user },
  ].filter(Boolean);

  return (
    <nav
  className={`fixed left-0 w-full z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 shadow-lg
    ${isPhone ? "pt-6" : "top-0"}`}
>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex justify-between w-min-screen items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-11 h-11   rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {Logo && <Image src={Logo.src} alt="Logo" width={32} height={32} className="w-8 h-8" />}
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
            {user && whatsappInvite && (
          <button  
            onClick={joinWhatsapp}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"> 
                  <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.59 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-2.01 0-3.97-.59-5.64-1.69l-.4-.26-3.66.96.98-3.57-.24-.37A9.93 9.93 0 012 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0122 12c0 5.52-4.48 10-10 10zm4.81-7.38c-.26-.13-1.54-.76-1.78-.84-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.2-.56.07-.26-.13-1.11-.41-2.11-1.31-.78-.7-1.31-1.56-1.46-1.82-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.39-.8-1.9-.21-.5-.42-.43-.58-.44-.15 0-.32-.01-.49-.01s-.45.07-.68.32c-.24.26-.89.87-.89 2.12s.91 2.45 1.03 2.62c.13.17 1.79 2.74 4.34 3.84.61.27 1.08.43 1.45.55.61.19 1.16.16 1.6.1.49-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3z" />
              </svg>
              JOIN
              </button>
            )}
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
          <div className="md:hidden flex items-center ">
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
            {user && whatsappInvite &&(
              <button  
               onClick={joinWhatsapp}
               className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"> 
                  <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.59 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-2.01 0-3.97-.59-5.64-1.69l-.4-.26-3.66.96.98-3.57-.24-.37A9.93 9.93 0 012 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0122 12c0 5.52-4.48 10-10 10zm4.81-7.38c-.26-.13-1.54-.76-1.78-.84-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.2-.56.07-.26-.13-1.11-.41-2.11-1.31-.78-.7-1.31-1.56-1.46-1.82-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.39-.8-1.9-.21-.5-.42-.43-.58-.44-.15 0-.32-.01-.49-.01s-.45.07-.68.32c-.24.26-.89.87-.89 2.12s.91 2.45 1.03 2.62c.13.17 1.79 2.74 4.34 3.84.61.27 1.08.43 1.45.55.61.19 1.16.16 1.6.1.49-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3z" />
              </svg>
              JOIN
              </button>
            )}
            
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