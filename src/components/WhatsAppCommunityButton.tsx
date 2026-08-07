import React from "react";
import { Users } from "lucide-react";
import { useLocation } from "react-router-dom";

export function WhatsAppCommunityButton() {
  const location = useLocation();

  if (location.pathname === "/checkout") {
    return null;
  }

  return (
    <a
      href="https://chat.whatsapp.com/IsSp5rdtYC5H9CjhLXbga2"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[125px] md:bottom-[70px] right-6 z-[200] w-14 h-14 bg-gradient-to-tr from-[#14213D] to-[#1E2A44] text-[#E6C9A8] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(20,33,61,0.3)] hover:shadow-[0_8px_40px_rgb(230,201,168,0.2)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
      aria-label="Join WhatsApp Community"
      title="👥 Join WhatsApp Community"
    >
      <Users className="w-6 h-6 text-[#25D366] group-hover:scale-110 transition-transform duration-300" />
    </a>
  );
}
