"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface LandDetail {
  village: string;
  taluka: string;
  district: string;
  state: string;
  groupNumber: string;
  area: string;
}
interface ValidationErrors {
  nameMarathi?: string;
  nameEnglish?: string;
  mobileNumber?: string;
  farmerId?: string;
  land1_village?: string;
  land1_taluka?: string;
  land1_district?: string;
  land1_state?: string;
  land1_groupNumber?: string;
  land1_area?: string;
}

const initialLandDetailState: LandDetail = {
  village: "",
  taluka: "",
  district: "",
  state: "",
  groupNumber: "",
  area: "",
};

export default function FarmerForm() {
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const textOnlyRegex = /^[a-zA-Z\u0900-\u097F\s]+$/;

    const groupNumberRegex = /^[a-zA-Z0-9\u0900-\u097F\/,\s]+$/;

    if (!/^[\u0900-\u097F\s]+$/.test(nameMarathi))
      newErrors.nameMarathi = "कृपया फक्त मराठी अक्षरे प्रविष्ट करा.";
    if (!/^[a-zA-Z\s]+$/.test(nameEnglish))
      newErrors.nameEnglish = "Please enter only English letters.";
    if (!/^\d{10}$/.test(mobileNumber))
      newErrors.mobileNumber = "मोबाईल क्रमांक १० अंकी असावा.";
    if (!/^\d{11}$/.test(farmerId))
      newErrors.farmerId = "शेतकरी आयडी ११ अंकी असावा.";

    if (!textOnlyRegex.test(landDetail1.village))
      newErrors.land1_village = "Please enter only text.";
    if (!textOnlyRegex.test(landDetail1.taluka))
      newErrors.land1_taluka = "Please enter only text.";
    if (!textOnlyRegex.test(landDetail1.district))
      newErrors.land1_district = "Please enter only text.";
    if (!textOnlyRegex.test(landDetail1.state))
      newErrors.land1_state = "Please enter only text.";
    if (!groupNumberRegex.test(landDetail1.groupNumber))
      newErrors.land1_groupNumber = "Invalid characters entered.";
    if (!/^\d*\.?\d*$/.test(landDetail1.area))
      newErrors.land1_area = "कृपया फक्त अंक प्रविष्ट करा.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const makePayment = async (userId: string) => {
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: 24 }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok)
      throw new Error(orderData.error || "Failed to create order.");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Krushibandhan Card",
      description: "Fee for new farmer card",
      order_id: orderData.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/payment/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok)
            throw new Error(verifyData.error || "Payment verification failed.");

          router.push(`/card/${userId}`);
        } catch (err) {
          const e = err as Error;
          setStatusMessage(`Error: ${e.message}. Please contact support.`);
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setStatusMessage("Payment was cancelled. Please try again.");
          setIsLoading(false);
        },
      },
      prefill: {
        name: nameEnglish,
        contact: mobileNumber,
      },
      theme: {
        color: "#22C55E",
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage("");

    if (!validateForm()) {
      setStatusMessage("Please correct the errors before submitting.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("farmerId", farmerId);
    formData.append("mobileNumber", mobileNumber);
    formData.append("nameEnglish", nameEnglish);
    formData.append("nameMarathi", nameMarathi);
    formData.append("address", address);

    const landDetailsPayload = [landDetail1];
    if (
      showLandDetail2 &&
      Object.values(landDetail2).some((field) => field !== "")
    ) {
      landDetailsPayload.push(landDetail2);
    }

    const processedLandDetails = landDetailsPayload.map((ld) => ({
      ...ld,
      area: parseFloat(ld.area) || 0,
    }));
    formData.append("landDetails", JSON.stringify(processedLandDetails));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("/api/save-user", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to save user data.");

      await makePayment(result.id);
    } catch (error) {
      const err = error as Error;
      setStatusMessage(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const newsText = `सूचना - सदर JPEG/PDF फाईल फक्त वापरकर्त्याच्या सोयीसाठी आहे.`;

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex justify-center p-4 pt-20 pb-8"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        <div className="fixed inset-0 bg-black opacity-60 z-0"></div>
        <div className="fixed top-0 left-0 right-0 z-30 h-12 bg-gray-800 bg-opacity-70 flex items-center justify-between px-4 shadow-lg">
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee">
              <span className="text-white whitespace-nowrap px-4">
                {newsText}
              </span>
              <span className="text-white whitespace-nowrap px-4">
                {newsText}
              </span>
              <span className="text-white whitespace-nowrap px-4">
                {newsText}
              </span>
              <span className="text-white whitespace-nowrap px-4">
                {newsText}
              </span>
              <span className="text-white whitespace-nowrap px-4">
                {newsText}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-green-600 text-white font-bold px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
            >
              MENU
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-40">
                <a
                  href="/help"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Help
                </a>
                <a
                  href="/about"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  About
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-green-600 p-4 rounded-t-lg">
            <h1 className="text-xl md:text-2xl font-bold text-white text-center">
              आपलं स्वागत आहे - कृषीबंधनमध्ये!
            </h1>
            <p className="text-sm md:text-base text-green-100 mt-1 text-center">
              {`आपलं स्वागत आहे – Krushibandhan या खासगी डिजिटल सेवेत!” डिजिटल प्रत फक्त - जी तुमच्या सोयीसाठी. "JPEG/PDF File तुमच्या साठी - जबाबदारी तुमचीच!`}
            </p>
          </div>
          <div className="bg-black bg-opacity-60 p-4 sm:p-6 md:p-8 rounded-b-xl shadow-2xl border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="form-group">
                  <label className="form-label">नाव (मराठी)</label>
                  <input
                    type="text"
                    name="nameMarathi"
                    value={nameMarathi}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.nameMarathi ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.nameMarathi && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.nameMarathi}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">नाव (इंग्रजी)</label>
                  <input
                    type="text"
                    name="nameEnglish"
                    value={nameEnglish}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.nameEnglish ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.nameEnglish && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.nameEnglish}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">मोबाईल क्र.</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.mobileNumber ? "border-red-500" : ""
                    }`}
                    maxLength={10}
                    required
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">REF. NUM.</label>
                  <input
                    type="text"
                    name="farmerId"
                    value={farmerId}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.farmerId ? "border-red-500" : ""
                    }`}
                    maxLength={11}
                    required
                  />
                  {errors.farmerId && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.farmerId}
                    </p>
                  )}
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
                <div className="flex justify-between items-center border-b border-green-400 pb-2">
                  <h3 className="text-xl font-semibold text-white">
                    जमिनीचा तपशील
                  </h3>
                </div>
                <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                    <div>
                      <input
                        type="text"
                        name="district"
                        placeholder="जिल्हा"
                        value={landDetail1.district}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_district ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_district && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_district}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="taluka"
                        placeholder="तालुका"
                        value={landDetail1.taluka}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_taluka ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_taluka && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_taluka}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="village"
                        placeholder="गाव"
                        value={landDetail1.village}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_village ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_village && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_village}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        placeholder="राज्य"
                        value={landDetail1.state}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_state ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_state && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_state}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <input
                        type="text"
                        name="groupNumber"
                        placeholder="गट क्र."
                        value={landDetail1.groupNumber}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_groupNumber ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_groupNumber && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_groupNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="area"
                        placeholder="क्षेत्र"
                        value={landDetail1.area}
                        onChange={handleLandDetail1Change}
                        className={`form-input-sm ${
                          errors.land1_area ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.land1_area && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.land1_area}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLandDetail2(!showLandDetail2)}
                  className="flex items-center text-green-300 hover:text-green-200 font-semibold py-1 px-3 rounded-lg transition duration-300"
                  title="Add more land details"
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
                {showLandDetail2 && (
                  <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg space-y-4 animate-fade-in">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                />
              </div>
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Submit"}
                </button>
              </div>
              {statusMessage && (
                <p className="text-center text-lg font-semibold text-yellow-300 mt-4">
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>
        <style jsx global>{`
          .form-group {
            display: flex;
            flex-direction: column;
          }
          .form-label {
            background-color: #e5e7eb;
            color: #1f2937;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 8px 8px 0 0;
            display: inline-block;
            width: fit-content;
          }
          .form-input {
            background-color: white;
            color: black;
            border: 1px solid #d1d5db;
            border-radius: 0 8px 8px 8px;
            padding: 12px;
            font-size: 1rem;
            width: 100%;
          }
          .form-input-sm {
            background-color: white;
            color: black;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px;
            font-size: 0.9rem;
            width: 100%;
          }
          .form-input:focus,
          .form-input-sm:focus {
            outline: none;
            border-color: #22c55e;
            box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          @keyframes marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
