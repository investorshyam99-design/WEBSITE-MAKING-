import { useEffect, useRef, useState } from "react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState("/hero-video.mp4");

  useEffect(() => {
    fetch("/api/hero-video")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.url) {
          setVideoUrl(data.url);
        }
      })
      .catch((err) => {
        // Fallback silently or just warn, default is already set to /hero-video.mp4
        console.warn("Could not fetch dynamic video, using fallback:", err);
      });
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
    </section>
  );
}
