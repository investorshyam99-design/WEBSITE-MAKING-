import { Instagram } from "lucide-react";

export function InstagramSection() {
  return (
    <section className="bg-white py-4 border-b border-[#EDE3D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-center sm:text-left">
        <h2 className="text-[11px] md:text-xs font-bold text-[#5A2E0F] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5A2E0F] opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5A2E0F]"></span>
          </span>
          Join our growing community
        </h2>
        <a 
          href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-[#1A1A1A] text-[#1A1A1A] font-black uppercase text-[10px] tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-colors group"
        >
          <Instagram className="h-4 w-4 mr-2" />
          Follow @jerseyunicorn_
        </a>
      </div>
    </section>
  );
}
