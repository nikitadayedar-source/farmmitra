"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LandDetail {
  village: string;
  taluka: string;
  district: string;
  state: string;
  groupNumber: string;
  area: string;
}

const initialLandDetailState: LandDetail = {
  village: "",
  taluka: "",
  district: "",
  state: "",
  groupNumber: "",
  area: "",
};

export default function AdminGenerateCardPage() {
  const router = useRouter();

  const [nameMarathi, setNameMarathi] = useState("");
  const [nameEnglish, setNameEnglish] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [landDetail1, setLandDetail1] = useState<LandDetail>(
    initialLandDetailState
  );
  const [landDetail2, setLandDetail2] = useState<LandDetail>(
    initialLandDetailState
  );
  const [showLandDetail2, setShowLandDetail2] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "nameMarathi") setNameMarathi(value);
    if (name === "nameEnglish") setNameEnglish(value);
    if (name === "mobileNumber") setMobileNumber(value);
    if (name === "farmerId") setFarmerId(value);
    if (name === "address") setAddress(value);
  };

  const handleLandDetail1Change = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLandDetail1((prev) => ({ ...prev, [name]: value }));
  };

  const handleLandDetail2Change = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLandDetail2((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("farmerId", farmerId);
    formData.append("mobileNumber", mobileNumber);
    formData.append("nameEnglish", nameEnglish);
    formData.append("nameMarathi", nameMarathi);
    formData.append("address", address);

    const landDetailsPayload: LandDetail[] = [landDetail1];

    if (
      showLandDetail2 &&
      Object.values(landDetail2).some((field) => field !== "")
    ) {
      landDetailsPayload.push(landDetail2);
    }

    const processedLandDetails = landDetailsPayload.map((ld: LandDetail) => ({
      ...ld,
      area: parseFloat(ld.area) || 0,
    }));

    formData.append("landDetails", JSON.stringify(processedLandDetails));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("/api/admin/generate-card", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error(result.error || "Failed to create user.");
      }

      alert("Card created successfully!");
      router.push(`/card/${result.id}`);
    } catch (error) {
      const err = error as Error;
      setStatusMessage(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 text-white">
      <h1 className="text-3xl font-bold">Generate New Card (Admin)</h1>
      <p className="mt-2 text-gray-400">
        Fill out this form to create a new user card instantly without payment.
      </p>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">नाव (मराठी)</label>
              <input
                type="text"
                name="nameMarathi"
                value={nameMarathi}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">नाव (इंग्रजी)</label>
              <input
                type="text"
                name="nameEnglish"
                value={nameEnglish}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">मोबाईल क्र.</label>
              <input
                type="tel"
                name="mobileNumber"
                value={mobileNumber}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">शेतकरी क्र.</label>
              <input
                type="text"
                name="farmerId"
                value={farmerId}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">पत्ता</label>
              <input
                type="text"
                name="address"
                value={address}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-600 pb-2">
              <h3 className="text-xl font-semibold text-white">
                जमिनीचा तपशील
              </h3>
              <button
                type="button"
                onClick={() => setShowLandDetail2(!showLandDetail2)}
                className="flex items-center text-green-400 hover:text-green-300 font-semibold py-1 px-3 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="ml-1 hidden sm:inline">अधिक</span>
              </button>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  name="district"
                  placeholder="जिल्हा"
                  value={landDetail1.district}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
                <input
                  type="text"
                  name="taluka"
                  placeholder="तालुका"
                  value={landDetail1.taluka}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
                <input
                  type="text"
                  name="village"
                  placeholder="गाव"
                  value={landDetail1.village}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="राज्य"
                  value={landDetail1.state}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="groupNumber"
                  placeholder="गट क्र."
                  value={landDetail1.groupNumber}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
                <input
                  type="text"
                  name="area"
                  placeholder="क्षेत्र"
                  value={landDetail1.area}
                  onChange={handleLandDetail1Change}
                  className="form-input-sm"
                  required
                />
              </div>
            </div>
            {showLandDetail2 && (
              <div className="p-4 bg-gray-700 rounded-lg space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="district"
                    placeholder="जिल्हा"
                    value={landDetail2.district}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                  <input
                    type="text"
                    name="taluka"
                    placeholder="तालुका"
                    value={landDetail2.taluka}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                  <input
                    type="text"
                    name="village"
                    placeholder="गाव"
                    value={landDetail2.village}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="राज्य"
                    value={landDetail2.state}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="groupNumber"
                    placeholder="गट क्र."
                    value={landDetail2.groupNumber}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                  <input
                    type="text"
                    name="area"
                    placeholder="क्षेत्र"
                    value={landDetail2.area}
                    onChange={handleLandDetail2Change}
                    className="form-input-sm"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Upload Photo</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500"
            />
          </div>
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg transition duration-300 disabled:bg-gray-500"
            >
              {isLoading ? "Generating..." : "Generate Card"}
            </button>
          </div>
          {statusMessage && (
            <p className="text-center text-lg font-semibold text-red-400 mt-4">
              {statusMessage}
            </p>
          )}
        </form>
      </div>
      <style jsx global>{`
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-label {
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }
        .form-input,
        .form-input-sm {
          background-color: #374151;
          border: 1px solid #4b5563;
          border-radius: 0.375rem;
          padding: 0.75rem;
          color: white;
        }
        .form-input-sm {
          padding: 0.5rem;
        }
        .form-input:focus,
        .form-input-sm:focus {
          outline: none;
          border-color: #34d399;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.5);
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
