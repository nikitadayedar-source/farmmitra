"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

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

interface FarmerCardProps {
  user: UserData;
}

export default function FarmerCard({ user }: FarmerCardProps) {
  const formatFarmerId = (id: string) => {
    return id.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3").trim();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        id="printable-card"
        className="relative w-[500px] h-[282px] bg-white text-black p-2 rounded-lg shadow-2xl font-sans overflow-hidden flex flex-col"
      >
        <img
          src="/watermark.jpg"
          alt="Watermark"
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
        />

        <div className="absolute top-0 -right-21 h-full flex items-center z-10">
          <p className="text-[7.9px] text-gray-500 transform rotate-90 whitespace-nowrap origin-center">
            This JPEG/PDF is only for the user personal use.
          </p>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between border-b-2 border-gray-400 pb-1">
            <img
              src={user.cloudinaryUrl || "/logo.jpg"}
              alt="Farmer Photo"
              className="w-[50px] h-[62.5px] object-cover border-2 border-gray-400"
            />
            <div className="text-center ">
              <h2 className="text-lg font-extrabold text-gray-700 relative translate-y-6.5 opacity-13">
                PERSONAL USE-NOT GOV ID
              </h2>
            </div>
            <img src="/logo.jpg" alt="Shetkari Logo" className="w-14 h-14" />
          </div>

          <div className="flex-grow flex mt-1">
            <div
              className={`w-4/5 pr-2 leading-tight space-y-0 ${
                user.landDetails.length > 1 ? "text-[11px]" : "text-[13px]"
              }`}
            >
              <p className="font-semibold">
                <strong className="font-bold">नाव (मराठी) - </strong>{" "}
                {user.nameMarathi}
              </p>
              <p className="font-semibold">
                <strong className="bold">नाव (इंग्रजी) - </strong>{" "}
                {user.nameEnglish.toUpperCase()}
              </p>
              <p className="font-semibold">
                <strong className="bold">मोबाईल - </strong> {user.mobileNumber}
              </p>
              <p className="font-semibold">
                <strong className="bold">पत्ता - </strong> {user.address}
              </p>

              {user.landDetails.map((land, index) => (
                <div key={index} className="mt-0.5">
                  <p className="font-semibold">
                    <strong className="bold">जमिनीचा तपशील - </strong> गाव{" "}
                    {land.village}, ता. {land.taluka}, जिल्हा {land.district},
                    राज्य {land.state}
                  </p>
                  <p className="ml-4 font-bold">
                    गट क्र. {land.groupNumber}, क्षेत्र {land.area} हे.
                  </p>
                </div>
              ))}
            </div>

            <div className="w-1/5 flex items-center justify-center">
              <QRCodeCanvas
                value={user.farmerId}
                size={90}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
          </div>

          <div
            id="bg-slate"
            className="text-center h-13 bg-[#2B7453] border-t-1 border-gray-400 pt-0.5 space-y-0"
          >
            <p className="font-extrabold text-2xl mt-2 tracking-[0.5em]">
              {formatFarmerId(user.farmerId)}
            </p>
          </div>
          <p className="text-[8px] text-black flex justify-center">
            टीप-सदर JPEG/PDF फाईल फक्त वापरकर्त्याच्या माहितीसाठी असून शासकीय
            ओळख नाही.
          </p>
        </div>
      </div>
    </div>
  );
}
