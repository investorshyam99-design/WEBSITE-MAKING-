import { Instagram, MessageCircle } from "lucide-react";

export function InstagramSection() {
  return (
    <section className="bg-white py-4 border-b border-[#EDE3D8]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-row flex-wrap items-center justify-center text-center gap-2 sm:gap-4">
        <a 
          href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex flex-1 sm:flex-none sm:w-[220px] items-center justify-center px-2 sm:px-6 py-2.5 border-2 border-[#5A2E0F] bg-[#5A2E0F] text-white font-black uppercase text-[10px] sm:text-xs tracking-wider hover:bg-[#4A260C] hover:border-[#4A260C] transition-colors"
        >
          <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          Follow @jerseyunicorn_
        </a>
        <a 
          href="https://chat.whatsapp.com/Jlqr9TdMDIQHmhx2kTOflz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex flex-1 sm:flex-none sm:w-[220px] items-center justify-center px-2 sm:px-6 py-2.5 border-2 border-[#5A2E0F] bg-[#5A2E0F] text-white font-black uppercase text-[10px] sm:text-xs tracking-wider hover:bg-[#4A260C] hover:border-[#4A260C] transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          Join WhatsApp Group
        </a>
      </div>
    </section>
  );
}
