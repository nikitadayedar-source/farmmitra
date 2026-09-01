"use client";

import React from "react";
import Link from "next/link";

// --- Main About Page Component ---
export default function AboutPage() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black opacity-70 z-0"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl bg-black bg-opacity-60 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            आमच्याबद्दल (About Us)
          </h1>
        </div>

        {/* Main Content */}
        <div className="text-gray-300 space-y-8 text-base md:text-lg">
          <section>
            <p>
              krushibandhan.com हे एक खासगी डिजिटल व्यासपीठ आहे, जे वापरकर्त्यास
              त्यांच्या माहितीच्या आधारे फोटो / JPEG/ PDF फाईल तयार करून देते.
              हे खाजगी सेवा फक्त वापरकर्त्यास त्यांची माहिती लक्षात रहावी म्हणून
              तयार करण्यात आला आहे. वापरकर्ता या प्लॅटफॉर्मवर आपली माहिती
              (उदा.नाव ,पत्ता ,मोबाईल क्र ,संदर्भ क्र,शेतीची माहिती .) भरून PDF
              व JPG स्वरूपात FILE तयार करू शकतात. हे फोटो / JPEG/ PDF फाईल केवळ
              संदर्भ आणि वैयक्तिक वापरासाठी असून कोणतेही शासकीय किंवा कायदेशीर
              ओळख नाही. फोटो / JPEG/ PDF फाईल मराठी आणि इंग्रजी भाषेत उपलब्ध
              असून, यामध्ये QR कोड दिला जातो. हा QR कोड फक्त संदर्भ माहिती
              तपासण्यासाठी आहे.
            </p>
            <p className="mt-4 font-semibold">
              महत्त्वाचे: krushibandhan.com या व्यासपीठाचा कोणत्याही शासकीय
              संस्था, मंत्रालय किंवा योजनेस थेट अथवा अप्रत्यक्ष संबंध नाही. ही
              वेबसाईट केवळ वैयक्तिक उपयोगासाठी वापरकर्त्यास डेमो (नमुना) फोटो /
              JPEG/ PDF फाईल उपलब्ध करून देते. ही कोणतीही अधिकृत कागदपत्रे
              नाहीत. या फोटो / JPEG/ PDF फाईल चा गैरवापर केल्यास त्यासाठी
              वेबसाईटचे मालक जबाबदार राहणार नाहीत. अशा गैरवापराची संपूर्ण
              जबाबदारी संबंधित वापरकर्त्यावरच राहील.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-green-400 border-b border-green-400 pb-2 mb-4">
              अस्वीकृती (Disclaimer)
            </h2>
            <ul className="list-disc list-inside space-y-3">
              <li>krushibandhan.com हे एक खासगी डिजिटल व्यासपीठ आहे.</li>
              <li>
                या वेबसाईटवरून तयार होणारे फोटो / JPEG/ PDF फाईल हे फक्त
                वैयक्तिक संदर्भासाठी (Personal Reference) आहे. (Dummy / Sample
                Reference Only)
              </li>
              <li>
                हे फोटो / JPEG/ PDF फाईल कोणत्याही शासकीय अथवा कायदेशीर संस्थेचे
                अधिकृत दस्तऐवज किंवा ओळखपत्र नाही.
              </li>
              <li>
                या व्यासपीठाचा कृषी मंत्रालय, प्रधानमंत्री योजना, Agristack,
                Mahadbt किंवा इतर कोणत्याही शासकीय पोर्टल/योजनेशी कोणताही संबंध
                नाही.
              </li>
              <li>
                या फोटो / JPEG/ PDF फाईलवर टाकलेला संदर्भ क्रमांक (Reference
                Number) हा फक्त वापरकर्त्याच्या सोयीसाठी आहे. तो Dummy / Sample
                Reference Only आहे यामुळे फोटो / JPEG/ PDF फाईल अधिकृत ठरत नाही.
              </li>
              <li>
                या फोटो / JPEG/ PDF फाईल चा वापर शासकीय योजना, सबसिडी, बँक,
                कोर्ट, पोलीस किंवा कोणत्याही अधिकृत कारणांसाठी करता येणार नाही.
              </li>
              <li>
                या फोटो / JPEG/ PDF फाईल गैरवापर, चुकीचा वापर किंवा खोटी माहिती
                दिल्यास त्याची पूर्ण जबाबदारी संबंधित वापरकर्त्याचीच राहील.
              </li>
              <li>
                वेबसाईट व्यवस्थापन कोणत्याही गैरवापर, फसवणूक (IPC 420), किंवा
                त्यातून उद्भवलेल्या कायदेशीर अडचणींसाठी जबाबदार राहणार नाही.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-green-400 border-b border-green-400 pb-2 mb-4">
              Terms of Use & Disclaimers (English)
            </h2>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Nature of Service:</strong> This website
                (www.krushibandhan.com) provides a facility to generate a
                Digital Photo / JPEG / PDF file based on the information
                submitted by the user. The purpose of this file is only to
                display the user’s information in digital format. This file is
                not related to any government department and does not serve as
                an official identity or proof.
              </li>
              <li>
                <strong>Purpose of Service:</strong> The purpose of this website
                is solely to provide the user with his/her personal information
                in Digital format. It works just like saving your information in
                various apps on your mobile (e.g., Notes, Reminders, Resume
                Apps) or like keeping a Xerox copy of a document. The file
                generated is only for the user’s convenience. No sensitive or
                harmful information is stored.
              </li>
              <li>
                <strong>User Responsibility:</strong> All information entered
                must be true and accurate. Any misuse, false data, or fraudulent
                activity is the sole responsibility of the user.
              </li>
              <li>
                <strong>No Liability:</strong> The website shall not be held
                responsible for any financial, social, or legal issues arising
                from the use of this service. No legal claim can be made against
                the website owner/admin. This service is purely voluntary and
                private.
              </li>
              <li>
                <strong>Data Protection:</strong> User data is automatically
                deleted within 24 hours. The website does not store or misuse
                user information.
              </li>
              <li>
                <strong>Fraud Protection:</strong> Misuse of the generated file
                in fraudulent acts (e.g., IPC 420) will not make the website
                liable in any way.
              </li>
              <li>
                <strong>Ownership:</strong> All templates, designs, and source
                code are protected. Unauthorized copying or resale will lead to
                legal action.
              </li>
              <li>
                <strong>Agreement:</strong> By proceeding, the user agrees that
                the generated file is a Demo / Reference File only and will not
                be used for official, government, banking, or legal purposes.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-green-400 border-b border-green-400 pb-2 mb-4">
              वापर अटी व अस्वीकृती (Marathi)
            </h2>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>सेवेचे स्वरूप:</strong> ही वेबसाईट
                (www.krushibandhan.com) वापरकर्त्याने दिलेल्या माहितीच्या आधारे
                केवळ डिजिटल फोटो / JPEG/ PDF फाईल तयार करण्याची सुविधा देते.
                याचा उद्देश फक्त वापरकर्त्याची माहिती डिजिटल स्वरूपात दाखवणे
                आहे.
              </li>
              <li>
                <strong>सेवेचा उद्देश:</strong> सदर वेबसाईटचा उद्देश केवळ
                वापरकर्त्याला त्याची वैयक्तिक माहिती Digital स्वरूपात (Photo
                Copy / JPEG / PDF File) उपलब्ध करून देणे हा आहे. हे अगदी तसंच
                आहे जसं आपण आपल्या मोबाईलमध्ये वेगवेगळ्या अॅप्समध्ये माहिती जतन
                करून ठेवतो.
              </li>
              <li>
                <strong>मर्यादित वापर:</strong> हे फोटो / JPEG/ PDF फाईल केवळ
                संदर्भासाठी (Reference Purpose) वापरायचे आहे. शासकीय योजना, बँक,
                न्यायालय, पोलीस किंवा अधिकृत कामकाजासाठी हे ग्राह्य धरले जाणार
                नाही.
              </li>
              <li>
                <strong>माहितीची जबाबदारी:</strong> फाईल तयार करताना दिलेली
                माहिती खरी, अचूक व योग्य असल्याची पूर्ण जबाबदारी वापरकर्त्याचीच
                राहील.
              </li>
              <li>
                <strong>डेटा संरक्षण:</strong> सर्व माहिती 24 तासांच्या आत आपोआप
                delete केली जाते. वेबसाईट वापरकर्त्याचा डेटा स्वतःकडे साठवत नाही
                किंवा त्याचा गैरवापर करत नाही.
              </li>
              <li>
                <strong>फसवणूक संरक्षण:</strong> जर कोणी खोट्या माहितीवर फाईल
                तयार केले आणि त्याचा गैरवापर केला, तर त्याची पूर्ण जबाबदारी
                संबंधित वापरकर्त्याची असेल. वेबसाइट व्यवस्थापनावर IPC 420 सारखे
                गुन्हे लावता येणार नाहीत.
              </li>
              <li>
                <strong>जबाबदारीची मर्यादा:</strong> ही सेवा “As Is” (जशी आहे
                तशी) उपलब्ध करून दिली जाते. याच्या वापरामुळे उद्भवणाऱ्या
                कोणत्याही आर्थिक, सामाजिक, कायदेशीर अडचणींसाठी वेबसाइट जबाबदार
                राहणार नाही.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-green-400 border-b border-green-400 pb-2 mb-4">
              Server Hosting Policy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-white">Marathi</h3>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    ही सेवा खाजगी सर्व्हरवर (India/Private Hosting) चालवली जाते.
                  </li>
                  <li>
                    सर्व डेटा केवळ फाईल तयार करण्यासाठी process केला जातो.
                  </li>
                  <li>
                    कोणतेही शासकीय सर्व्हर, शासकीय डेटाबेस किंवा सार्वजनिक
                    (public) नेटवर्क यामध्ये वापरले जात नाही.
                  </li>
                  <li>
                    वापरकर्त्याने दिलेली माहिती फक्त खाजगी सर्व्हरवर process
                    केली जाते आणि 24 तासांच्या आत delete केली जाते.
                  </li>
                  <li>
                    ही सेवा पूर्णपणे स्वतंत्र (Independent) व Non-Governmental
                    आहे.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">English</h3>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    This service operates on private servers (India/Private
                    Hosting).
                  </li>
                  <li>
                    All data is processed only for the purpose of generating the
                    file.
                  </li>
                  <li>
                    No Government servers, Government databases, or public
                    networks are used at any stage.
                  </li>
                  <li>
                    User-provided information is processed exclusively on
                    private servers and is automatically deleted within 24
                    hours.
                  </li>
                  <li>
                    The service is completely independent and non-governmental.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Back to Home Link */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-base md:text-lg text-green-400 hover:text-green-200 transition-colors"
            >
              &larr; Back to Registration Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
