export function Hero() {
  return (
    <section className="bg-[#EDE3D8] p-8 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[60vh]">
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center">
        <div className="flex-1 text-center md:text-left">
          <div className="mb-4 inline-block bg-[#5A2E0F] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            🔥 Elite Football Gear & Accessories
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[#5A2E0F] leading-tight mb-4 uppercase">
            Premium Football <br className="hidden lg:block" /> Jerseys
          </h1>
          <p className="text-lg md:text-xl text-[#5A2E0F]/80 mb-8 max-w-md mx-auto md:mx-0">
            Starting at <span className="font-bold text-2xl md:text-3xl">₹349</span>. Made for champions, worn by fans.
          </p>
          <div className="flex flex-col items-center md:items-start gap-4">
            <a
              href="#categories"
              className="bg-[#5A2E0F] text-white px-8 py-4 rounded-none font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-[#3d1f0a] transition-all flex items-center justify-center gap-2 inline-flex"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <p className="text-[11px] text-[#5A2E0F] opacity-70 font-medium italic">
              * Prepaid Orders Only - No COD Available
            </p>
          </div>
        </div>

        {/* Floating Product Preview */}
        <div className="hidden lg:flex flex-1 justify-end items-center relative">
           <div className="w-64 bg-white shadow-2xl p-4 border border-[#EDE3D8] transform rotate-3 hover:rotate-0 transition-transform duration-500">
             <div className="w-full h-48 bg-[#f5f5f5] flex items-center justify-center mb-4 overflow-hidden">
               <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop')" }} />
             </div>
             <div className="text-xs font-bold uppercase mb-1 text-[#5A2E0F]">Premium Quality</div>
             <div className="text-lg font-black mb-2 text-[#1A1A1A]">₹1299.00</div>
             <div className="flex gap-1 text-[9px] font-bold mb-1">
                <span className="bg-[#EDE3D8] px-1.5 py-0.5">S</span>
                <span className="bg-[#EDE3D8] px-1.5 py-0.5">M</span>
                <span className="bg-[#EDE3D8] px-1.5 py-0.5">L</span>
                <span className="bg-[#5A2E0F] text-white px-1.5 py-0.5">XL</span>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
