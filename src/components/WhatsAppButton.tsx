import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918788965436?text=Hi%20Jersey%20Unicorn%2C%20I%20need%20help%20with%20my%20order"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[80px] md:bottom-6 right-4 md:right-6 w-[52px] h-[52px] bg-[#25D366] text-white rounded-full flex items-center justify-center z-[199] shadow-lg animate-whatsapp-pulse transition-all active:scale-95 cursor-pointer"
      title="Contact WhatsApp Support"
    >
      <MessageCircle className="w-[26px] h-[26px] fill-white text-[#25D366] stroke-[2.5]" />
    </a>
  );
}
