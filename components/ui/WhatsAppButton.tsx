"use client";

import { whatsappLink } from "@/lib/utils";

export default function WhatsAppButton() {
  const phone   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const message = "Hello! I am interested in your construction materials.";

  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl
                 flex items-center justify-center transition-all duration-300
                 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.743a.5.5 0 0 0 .63.63l5.898-1.472A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.888a9.876 9.876 0 0 1-5.034-1.375l-.361-.214-3.742.981.998-3.645-.235-.375A9.863 9.863 0 0 1 2.112 12C2.112 6.533 6.533 2.112 12 2.112c5.468 0 9.888 4.42 9.888 9.888 0 5.467-4.42 9.888-9.888 9.888z" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-16 bg-dark-800 text-white text-xs
                       px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0
                       group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat on WhatsApp
      </span>
    </a>
  );
}
