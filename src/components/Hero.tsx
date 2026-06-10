import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e: any) => {
          if (e.name !== "AbortError") {
            console.error("Autoplay prevents:", e);
          }
        });
      }
    }
  }, []);

  return (
    <section className="bg-[#1B1B1B] flex flex-col justify-center relative overflow-hidden min-h-[70vh] md:min-h-[85vh]">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        poster="/hero-poster.jpg"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
        className="absolute inset-0 w-full h-full object-cover z-0"
        key="main-hero-video-v19"
      >
        <source src="/hero-video.mp4?v=2" type="video/mp4" />
      </video>

      {/* Subtle overlay to ensure button readability */}
      <div className="absolute inset-0 bg-black/30 z-[5]"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center h-[100%] flex-1">
        <button
          onClick={() => {
            if (window.location.pathname !== "/") {
              navigate("/");
            }
            setTimeout(() => {
              const element = document.getElementById("categories");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }, 100);
          }}
          className="bg-white/90 backdrop-blur-sm text-[#1B1B1B] px-10 py-5 md:px-16 md:py-6 mt-auto mb-24 md:mb-32 rounded-full font-black uppercase tracking-widest text-lg md:text-2xl shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-3 inline-flex border border-transparent cursor-pointer"
        >
          Shop Now
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
