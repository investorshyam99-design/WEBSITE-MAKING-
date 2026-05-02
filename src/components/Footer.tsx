export function Footer() {
  return (
    <footer id="footer" className="bg-[#1A1A1A] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Contact & Policies */}
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-4 tracking-widest">Contact Us</h4>
              <p className="text-xs mb-2">+91 8788965436</p>
              <p className="text-xs mb-3">jerseyunicorn1@gmail.com</p>
              <a href="https://wa.me/918788965436" className="text-[10px] font-bold border-b border-gray-500 hover:text-white transition-colors">Chat on WhatsApp</a>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-4 tracking-widest">Policies</h4>
              <p className="text-xs mb-2">Exchange for damages only (within 3 days)</p>
              <p className="text-xs text-[#25D366] font-bold uppercase">Prepaid Orders Only</p>
            </div>
          </div>

          {/* Social & Copyright */}
          <div className="text-left md:text-right flex flex-col md:items-end justify-between min-h-[100px]">
            <div className="mb-4">
              <a 
                href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs opacity-80 hover:opacity-100 font-medium transition-opacity inline-flex items-center"
              >
                Follow us on Instagram @jerseyunicorn_
              </a>
            </div>
            <p className="text-[10px] opacity-40 uppercase tracking-wider font-bold">© {new Date().getFullYear()} Jersey Unicorn. Premium Apparel.</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
