import { Instagram, MessageCircle } from "lucide-react";

export function InstagramSection() {
  return (
    <section className="bg-white py-4 border-b border-[#EDE3D8]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <a 
          href="https://www.instagram.com/jerseyunicorn1?igsh=MXRuN3VwcWtoNzlzdg==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex w-full sm:w-[220px] h-[44px] sm:h-[48px] items-center justify-center px-1 sm:px-6 border-2 border-[#1E2A44] bg-[#1E2A44] text-white font-black uppercase text-[10px] sm:text-xs tracking-wider hover:bg-[#223A5E] hover:border-[#223A5E] transition-colors whitespace-nowrap text-center"
        >
          <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          Instagram
        </a>
        <a 
          href="https://chat.whatsapp.com/L0D4uDrUCsq0LO3d5Hwlz6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex w-full sm:w-[220px] h-[44px] sm:h-[48px] items-center justify-center px-1 sm:px-6 border-2 border-[#1E2A44] bg-[#1E2A44] text-white font-black uppercase text-[10px] sm:text-xs tracking-wider hover:bg-[#223A5E] hover:border-[#223A5E] transition-colors whitespace-nowrap text-center"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          WhatsApp
        </a>
      </div>
    </section>
  );
}
