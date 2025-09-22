'use client'
import React, { useState } from "react";
import { sendContactEmail } from "@/lib/resend";
import { toast } from "react-toastify";
import Image from "next/image";
import Logo from "@/app/favicon.ico";
const Footer : React.FC = () =>{
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) {
            toast.error("Please fill in ax`ll fields.");
            return;
        }
        const result = await sendContactEmail(email, message);
        if (result?.success) {
            setEmail('');
            setMessage('');
            toast.success('Message sent successfully!');
        } else {
            toast.error(result?.error || 'Failed to send message. Please try again later.');
        }
        };
    return(
        <footer className="relative bg-gray-900/80 text-white overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl animate-float1"></div>
                <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-float2"></div>
                <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-cyan-500 rounded-full filter blur-3xl animate-float3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
                
                <div className="group">
                    <div className="flex items-center space-x-2 mb-6">
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition duration-500">
                        {Logo && <Image src={Logo.src} alt="Logo" width={32} height={32} className="w-8 h-8" />}
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-900">
                        JoyForEveryone
                    </h2>
                    </div>
                    <p className="text-gray-300 mb-6">O facem din pasiune ,o facem pentru cei ce au nevoie.</p>
                    
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-6 relative inline-block">
                    <span className="relative z-10">Quick Links</span>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </h3>
                    <ul className="space-y-3">
                    <li><a href="/about" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300"></span>
                        About</a></li>
                    <li><a href="/contact" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300"></span>
                        Contact</a></li>
                    <li><a href="/login" className="text-gra    y-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300"></span>
                        Sign in</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
                    <ul className="space-y-4">
                    <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                            
                        </div>
                        </div>
                        <div className="ml-3">
                        <p className="text-sm text-gray-300">Email</p>
                        <a href="mailto:jfetimisoara@gmail.com" className="text-white hover:text-blue-400 transition">jfetimisoara@gmail.com</a>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">

                        </div>
                        </div>
                        <div className="ml-3">
                        <p className="text-sm text-gray-300">Phone</p>
                        <a href="tel:+40748323838" className="text-white hover:text-blue-400 transition">+40 748 323 838 HR</a>
                        </div>
                    </li>
                    </ul>
                </div>
                <div className="w-full max-w-xs mx-auto bg-gray-900/80 rounded-lg shadow-lg p-6 mt-8">
                    <h4 className="text-lg font-semibold text-center mb-4 text-cyan-300">Quick Contact</h4>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                        />
                        <textarea
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        rows={2}
                        required
                        />
                    
                        <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded font-semibold hover:from-purple-700 hover:to-cyan-700 transition"
                        >
                        Send
                        </button>
                    </form>
                    </div>
                <div>
                    
                </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm mb-4 md:mb-0">
                    &copy; <span id="year" className="text-blue-400"></span> JoyForEveryone all rights reserved
                </p>
                </div>
            </div>
            
            <div className="orb absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 filter blur-3xl pointer-events-none">
            
            </div>

            </footer>
    )
}
export default Footer;