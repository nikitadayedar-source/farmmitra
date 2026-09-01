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

// ------------------- Temporay Code ------------------- //

"use client";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 text-center text-black ">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Public access to this website has been restricted by the owner. The
        website is currently available for admin use only.
      </h1>
    </div>
  );
}
