'use client';
import React, { useState } from "react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { toast } from 'react-toastify';

const ResetPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');

   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending password reset to:", email); // Debug

    if (!email) {
        toast.error("Please enter your email address.");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            toast.success('Password reset email sent successfully');
            console.log("Reset email sent"); // Debug
            setEmail('');
        })
        .catch((error) => {
        if (error.code === 'auth/user-not-found') {
            toast.error('No user found with this email address.');
        } else if (error.code === 'auth/invalid-email') {
            toast.error('Invalid email format.');
        } else {
            toast.error('Error: ' + error.message);
        }
        });

};


    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
            </div>
            <div className="max-w-md w-full bg-gradient-to-br from-gray-950 to-gray-800 text-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center text-white">Reset Your Password</h2>
                <p className="text-sm text-white mb-6 text-center ">
                    Enter your email address below and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="you@example.com"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                        Send Reset Link
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Remembered your password? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                </div>
            </div>
        </section>
    );
};

export default ResetPasswordPage;
