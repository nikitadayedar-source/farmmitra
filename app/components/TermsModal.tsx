"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface TermsModalProps {
  onAccept: () => void;
}

export default function TermsModal({ onAccept }: TermsModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>

      <div className="relative z-10 bg-white text-gray-800 w-full lg:w-[55%] xl:w-[50%] rounded-xl m-2 shadow-2xl animate-fade-in-scale max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
            सूचना व अटी
          </h2>
          <p className="text-xs md:text-sm text-center text-gray-600">
            (फोटो / JPEG / PDF फाईल तयार करण्यापूर्वी सूचना व अटी वाचाव्या.)
            <br />
            (Instructions & Terms — Please read carefully before creating the
            Photo copy/JPEG/PDF file.)
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm md:text-base">
          <ol className="list-decimal list-inside space-y-4">
            <li>
              ही वेबसाइट (www.krushibandhan.com) वापरकर्त्याने दिलेल्या
              माहितीच्या आधारे फक्त त्यांची माहिती आठवण राहावी यासाठी हे फोटो /
              JPEG/ PDF फाईल स्वरूपात सेवा उपलब्ध करून देते. हे फोटो / JPEG/ PDF
              फाईल कोणत्याही शासकीय विभागाशी संबंधित नाही व कोणत्याही प्रकारे
              अधिकृत ओळख नाही.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                This website (www.krushibandhan.com) provides a service to
                generate a Photo copy/JPEG/PDF file based on the information
                submitted by the users, only for the purpose of remembering
                their information. This file is not related to any Government
                department and does not hold the status of an official
                Government identity.
              </p>
            </li>
            <li>
              या फोटो / JPEG/ PDF फाईल चा वापर केवळ माहिती दाखवण्यासाठी करावा.
              तसेच सदर तयार फोटो / JPEG/ PDF फाईल पूर्णपणे खाजगी आहे. आणि सेवा
              शुल्क सुद्धा खाजगी आहे.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                This file should be used only for showing/remembering the
                information. The generated file is entirely private, and the
                service charges are also private.
              </p>
            </li>
            <li>
              वापरकर्त्याने जर हे फोटो COPY / JPEG/ PDF फाईल ओळख किंवा शासकीय
              पुरावा म्हणून वापरले, तर त्याची पूर्ण जबाबदारी संबंधित
              वापरकर्त्याची असेल.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                If the user uses this file as an identity proof, the entire
                responsibility will rest solely with the user.
              </p>
            </li>
            <li>
              वेबसाईट व्यवस्थापन भविष्यातील कोणत्याही समस्येसाठी जबाबदार राहणार
              नाही.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                The website management will not be responsible for any issues or
                disputes in the future.
              </p>
            </li>
            <li>
              वापरकर्ता स्वतः फोटो COPY/ JPEG/ PDF फाईल बनवीत असल्यास प्रथम
              वेबसाईटवरील पूर्ण माहिती (नियम, अटी किवा अस्वीकृती) वाचून फोटो
              COPY/ JPEG/ PDF फाईल बनवावे.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                If the user creates the file themselves, they must read all the
                rules and disclaimers before proceeding.
              </p>
            </li>
            <li>
              या फोटो COPY / JPEG/ PDF फाईल निर्मितीसंदर्भात कोणतीही सक्ती अथवा
              बंधनकारकता नाही. हा निर्णय पूर्णपणे वापरकर्त्याचा वैयक्तिक आहे.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {`There is no compulsion to create this file. The decision is
                entirely the user's personal choice.`}
              </p>
            </li>
            <li>
              जर वापरकर्त्याला अटी व शर्ती मान्य नसतील, तर कृपया ही सेवा वापरू
              नये.
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                If the user does not agree, they should not use this service.
              </p>
            </li>
          </ol>
        </div>

        <div className="p-6 border-t border-gray-300 rounded-b-xl bg-white sticky bottom-0">
          <div className="flex items-start mb-4">
            <input
              id="accept-terms"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="accept-terms"
              className="ml-3 text-sm md:text-base font-medium"
            >
              मला मान्य / सहमत आहे की हे फोटो / JPEG/ PDF फाईल सरकारी ओळखपत्र
              नाही आणि ते अधिकृत कारणांसाठी वापरले जाणार नाही.
              <span className="block text-xs md:text-sm text-gray-600">
                I Agree that this Photo copy/JPEG/PDF file is not a Govt. ID and
                will not be used for official purposes.
              </span>
            </label>
          </div>
          <div className="text-center">
            <button
              onClick={onAccept}
              disabled={!isChecked}
              className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-12 rounded-full transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-in-out;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  return isMounted ? createPortal(modalContent, document.body) : null;
}
