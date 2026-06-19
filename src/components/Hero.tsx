import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("/hero-video.mp4");

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.load(); // Reload video engine with new dynamic source url
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e: any) => {
          if (e.name !== "AbortError") {
            console.error("Autoplay prevents:", e);
          }
        });
      }
    }
  }, [videoUrl]);

  return (
    <section className="bg-[#1B1B1B] relative flex flex-col justify-center items-center overflow-hidden w-full">
      <div className="relative w-full max-w-[858px] mx-auto flex flex-col items-center justify-center">
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
          className="w-full h-auto object-contain z-0"
          src={videoUrl}
        />

        {/* Subtle overlay to ensure button readability */}
        <div className="absolute inset-0 bg-black/20 z-[5]"></div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 md:pb-16 w-full">
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
          className="bg-white/90 backdrop-blur-sm text-[#1B1B1B] px-10 py-4 md:px-16 md:py-6 rounded-full font-black uppercase tracking-widest text-lg md:text-2xl shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-3 inline-flex border border-transparent cursor-pointer"
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
      </div>
    </section>
  );
}
