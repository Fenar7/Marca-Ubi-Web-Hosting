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
    // Skip in Sanity Studio
    if (pathname?.startsWith("/studio")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Prevent GSAP from catching up missed frames
    gsap.ticker.lagSmoothing(0);

    // Mobile = touch device or narrow viewport. On mobile:
    // - Skip Lenis (it fights iOS/Android native momentum scroll → jank)
    // - Keep GSAP + ScrollTrigger driven by native scroll events
    // - Reduce ticker to 60fps (enough for 60Hz mobile screens)
    const isMobile =
      window.matchMedia("(max-width: 600px)").matches;

    if (isMobile) {
      gsap.ticker.fps(60);

      // Wire ScrollTrigger to native scroll
      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });

      const handleLoaderComplete = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("initial-loader:complete", handleLoaderComplete);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("initial-loader:complete", handleLoaderComplete);
      };
    }

    // Desktop — full Lenis smooth scroll
    gsap.ticker.fps(120);

    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);

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
  }, [pathname]);

  return <>{children}</>;
}
