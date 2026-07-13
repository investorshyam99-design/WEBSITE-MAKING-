import { Instagram, MessageCircle } from "lucide-react";

export function InstagramSection() {
  return (
    <section className="bg-white py-3 border-b border-[#EDE3D8]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-3">
        <a 
          href="https://www.instagram.com/jerseyunicorn1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex w-full h-12 items-center justify-center border-2 border-[#1E2A44] bg-[#1E2A44] text-white font-black uppercase text-xs md:text-sm tracking-wider hover:bg-[#151f33] hover:border-[#151f33] transition-all rounded-lg gap-2 active:scale-95"
        >
          <Instagram className="h-4 w-4 shrink-0" />
          Instagram
        </a>
        <a 
          href="https://chat.whatsapp.com/K2t3JO050Z6GJ662AReKUv" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex w-full h-12 items-center justify-center border-2 border-[#1E2A44] bg-[#1E2A44] text-white font-black uppercase text-xs md:text-sm tracking-wider hover:bg-[#151f33] hover:border-[#151f33] transition-all rounded-lg gap-2 active:scale-95"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
      </div>
    </section>
  );
}
