"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HelpRequest {
  id: string;
  email: string;
  subject: string;
  description: string;
  createdAt: string;
}

const HelpRequestModal = ({
  request,
  onClose,
}: {
  request: HelpRequest;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-gray-800 text-white w-full max-w-2xl p-6 rounded-lg shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-400">
              {request.subject}
            </h2>
            <p className="text-sm text-gray-400">
              From:{" "}
              <a href={`mailto:${request.email}`} className="hover:underline">
                {request.email}
              </a>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-gray-300 whitespace-pre-wrap">
            {request.description}
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HelpRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(
    null
  );

  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await fetch("/api/admin/help-requests");

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch help requests");
        }

        const data: HelpRequest[] = await response.json();
        setRequests(data);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequests();
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-white">Loading Help Requests...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="p-6 md:p-8 text-white">
        <h1 className="text-3xl font-bold">Help Requests</h1>
        <p className="mt-2 text-gray-400">
          A list of all support requests submitted by users.
        </p>

        <div className="mt-8 space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-green-400">
                      {request.subject}
                    </p>
                    <p className="text-sm text-gray-400">
                      From: {request.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-3 text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
                  {request.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">
              No help requests found.
            </p>
          )}
        </div>
      </div>

      {selectedRequest && (
        <HelpRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}
