"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SmoothScrollProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Skip Lenis entirely in Sanity Studio — let the browser handle scroll
    if (pathname?.startsWith("/studio")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Prevent GSAP from catching up missed frames — biggest single fix for scroll jank
    gsap.ticker.lagSmoothing(0);

    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });

    // Official Lenis + GSAP ScrollTrigger integration pattern
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.fps(120);

    const handleLoaderComplete = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("initial-loader:complete", handleLoaderComplete);
    requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.removeEventListener("initial-loader:complete", handleLoaderComplete);
      gsap.ticker.remove(onTick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
