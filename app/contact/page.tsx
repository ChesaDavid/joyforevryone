'use client'
import React, { useState } from "react";
import { sendContactEmail } from "@/lib/resend";
const ContactPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !message) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await sendContactEmail(email, message);
    if (result?.success) {
      setEmail('');
      setMessage('');
      setSuccess('Message sent successfully!');
    } else {
      setError(result?.error || 'Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>
      <div className="w-full max-w-md p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
          Contact Us
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-300 font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            ></textarea>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-sm text-center">{success}</div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send Message
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            We usually reply within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;