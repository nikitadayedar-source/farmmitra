"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";

export default function HelpPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, subject, description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.");
      }

      setStatusMessage(
        "Your request has been submitted successfully! We will get back to you soon."
      );
      setEmail("");
      setSubject("");
      setDescription("");
    } catch (error) {
      const err = error as Error;
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="fixed inset-0 bg-black opacity-70 z-0"></div>

      <div className="relative z-10 w-full max-w-2xl bg-black bg-opacity-60 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Help & Support</h1>
          <p className="text-lg text-gray-300 mt-2">
            Have a question or need assistance? Fill out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>

          {statusMessage && (
            <p
              className={`text-center text-lg font-semibold mt-4 ${
                statusMessage.startsWith("Error")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {statusMessage}
            </p>
          )}

          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              &larr; Back to Registration Form
            </Link>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .form-input {
          background-color: white;
          color: black;
          border: 1px solid #4b5563; /* gray-600 */
          border-radius: 8px;
          padding: 12px;
          font-size: 1rem;
          width: 100%;
        }
        .form-input:focus {
          outline: none;
          border-color: #22c55e; /* green-500 */
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  );
}
