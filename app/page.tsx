// ------------------- Temporay Code ------------------- //

"use client";

import React from "react";
import { Lock } from "lucide-react";

export default function RestrictedAccessPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Website Access Restricted
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Public access to this website has been restricted by the owner. The
            website is currently available for admin use only.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Farmmitra. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

// ------------------- Main Code ------------------- //

// "use client";

// import React, { useState } from "react";
// import FarmerForm from "./components/FarmerForm";
// import TermsModal from "./components/TermsModal";

// export default function HomePage() {
//   const [termsAccepted, setTermsAccepted] = useState(false);

//   const handleAcceptTerms = () => {
//     setTermsAccepted(true);
//   };

//   return (
//     <main>
//       {!termsAccepted && <TermsModal onAccept={handleAcceptTerms} />}
//       {termsAccepted && <FarmerForm />}
//     </main>
//   );
// }
