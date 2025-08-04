'use client'
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

export const LogoutPage: React.FC = () => {
  const { logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logOut?.().then(() => {
      router.push("/login");
      toast.warn('Oh no so sorry to see you go')    
    });
    
  }, [logOut, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Signing you out...</h2>
        <p className="text-center text-gray-400">Please wait.</p>
        
      </div>
    </div>
  );
};
export default LogoutPage;