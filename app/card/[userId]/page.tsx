"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import FarmerCard from "../../components/FarmerCard";
import { toJpeg } from "html-to-image";

interface LandDetail {
  village: string;
  taluka: string;
  district: string;
  state: string;
  groupNumber: string;
  area: number;
}
interface UserData {
  farmerId: string;
  mobileNumber: string;
  nameEnglish: string;
  nameMarathi: string;
  address: string;
  cloudinaryUrl: string | null;
  landDetails: LandDetail[];
}

export default function CardPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/card/${userId}`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch user data");
          }

          const data = await response.json();
          setUser(data);
        } catch (err) {
          const e = err as Error;
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [userId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJpg = useCallback(() => {
    const cardElement = document.getElementById("printable-card");
    if (cardElement === null) {
      return;
    }

    toJpeg(cardElement, { cacheBust: true, quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `farmer-card-${user?.farmerId || "download"}.jpg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Oops, something went wrong!", err);
        alert("Could not download the card image.");
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Loading Card...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">User not found.</p>
      </div>
    );
  }

  return (
    <div className="print-area bg-gray-200 min-h-screen flex flex-col items-center justify-center p-8">
      <div className="card-wrapper">
        <FarmerCard user={user} />
      </div>

      <div className="no-print mt-8 text-center flex gap-4">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print Card
        </button>
        <button
          onClick={handleDownloadJpg}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
        >
          Download JPG
        </button>
      </div>
    </div>
  );
}
