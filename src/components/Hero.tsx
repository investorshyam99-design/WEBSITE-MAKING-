import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("/hero-video.mp4");

  useEffect(() => {
    fetch("/api/hero-video")
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setVideoUrl(data.url);
        }
      })
      .catch((err) => console.error("Failed to fetch dynamic video:", err));
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e: any) => {
          if (e.name !== "AbortError" && e.name !== "NotSupportedError" && e.name !== "NotAllowedError") {
            console.error("Autoplay prevented:", e);
          }
        });
      }
    }
  }, [videoUrl]);

  const handleShopNowClick = () => {
    if (window.location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      const element = document.getElementById("categories");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <section className="relative w-full h-[55vh] sm:h-[65vh] md:h-[80vh] overflow-hidden bg-[#1B1B1B] flex items-center justify-center">
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
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoUrl}
      />

      {/* Dark overlay (rgba 0,0,0,0.25) */}
      <div className="absolute inset-0 bg-black/25 z-[5]" />

      {/* Centered White Pill Button */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <button
          onClick={handleShopNowClick}
          className="bg-white/90 text-[#1B1B1B] px-12 py-4 rounded-full font-black text-lg sm:text-xl uppercase tracking-widest hover:scale-[1.05] hover:bg-white transition-all shadow-2xl duration-300 flex items-center gap-2 cursor-pointer active:scale-95 border-none"
        >
          <span>SHOP NOW</span>
          <span>&rarr;</span>
        </button>
      </div>
    </section>
  );
}
