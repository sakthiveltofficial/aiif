import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCurrentSheet } from "@theatre/r3f";
import { val } from "@theatre/core";
import { useNavbarStore } from "../../../store/navbarStore";

// Smooth easing function
const easeOutCubic = (x) => {
  return 1 - Math.pow(1 - x, 3);
};

// Gentler easing function for smoother motion
const easeInOutQuint = (x) => {
  return x < 0.5 
    ? 16 * x * x * x * x * x
    : 1 - Math.pow(-2 * x + 2, 5) / 2;
};

function ScrollbasedAnimation({ project }) {
  const sheet = useCurrentSheet();
  const { setIsDesktopMenuOpen } = useNavbarStore();
  const scrollRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    lastScrollTime: 0,
  });
  const [introPlayed, setIntroPlayed] = useState(false);
  const [projectReady, setProjectReady] = useState(false);
  const totalDuration = val(sheet.sequence.pointer.length);
  // Enhanced device detection for performance optimization
  const detectDevice = () => {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Detect iPhone XR and similar medium-performance devices
    const isIPhoneXR = /iPhone.*OS 1[2-6]_/.test(ua) && (width === 414 || width === 375) && pixelRatio < 3;
    const isMediumDevice = (
      width <= 768 && width > 375 && pixelRatio <= 2
    ) || isIPhoneXR || (
      navigator.hardwareConcurrency <= 4 && 
      navigator.deviceMemory <= 4
    );
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || width <= 768;
    
    return { isMobile, isMediumDevice, isIPhoneXR };
  };
  
  const { isMobile, isMediumDevice, isIPhoneXR } = detectDevice();
  const MAX_SCROLL_DURATION = isMobile ? (isMediumDevice ? 38.0 : 38.55) : 39;
  const INTRO_DURATION = 1; // Start from duration 1 (no longer skipping first 4)
  const INTRO_END_DURATION = 4; // Auto-play until duration 4
  const INTRO_PLAY_DURATION_MS = 4000; // Smooth autoplay duration (ms)
  const INITIAL_DELAY = 0; // No delay - immediate start

  // Wait for project to be ready
  useEffect(() => {
    if (!project) return;

    project.ready.then(() => {
      setProjectReady(true);
    });
  }, [project]);

  // Intro auto-play animation from 1 -> 4, then enable interaction
  useEffect(() => {
    if (!sheet || !projectReady || introPlayed) return;

    // Set initial position immediately
    sheet.sequence.position = INTRO_DURATION;
    scrollRef.current.current = INTRO_DURATION;
    scrollRef.current.target = INTRO_DURATION;

    // Smoothly animate to INTRO_END_DURATION
    let rafId;
    const startTime = performance.now();
    const startPos = INTRO_DURATION;
    const endPos = INTRO_END_DURATION;

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / INTRO_PLAY_DURATION_MS);
      const eased = easeInOutQuint(t);
      const pos = startPos + (endPos - startPos) * eased;
      sheet.sequence.position = pos;
      scrollRef.current.current = pos;
      scrollRef.current.target = pos;

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        // Ensure we land exactly at the end and enable interaction
        sheet.sequence.position = endPos;
        scrollRef.current.current = endPos;
        scrollRef.current.target = endPos;
        setIntroPlayed(true);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };

  }, [sheet, projectReady, introPlayed]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (!introPlayed || !projectReady) return;

      e.preventDefault();
      // Adaptive scroll speed based on device performance
      const scrollSpeed = isMediumDevice ? 0.001 : (isMobile ? 0.0012 : 0.0015);
      const deltaY = e.deltaY * scrollSpeed;
      
      const newTarget = Math.max(
        INTRO_END_DURATION,
        Math.min(MAX_SCROLL_DURATION, scrollRef.current.target + deltaY)
      );
      
      scrollRef.current.target = newTarget;
    };

    // Touch event handlers for mobile devices
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      if (!introPlayed || !projectReady) return;
      
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e) => {
      if (!introPlayed || !projectReady) return;

      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // Inverted for natural feel
      // Optimized touch scroll speed for medium devices
      const scrollSpeed = isMediumDevice ? 0.006 : (isMobile ? 0.008 : 0.01);
      
      const newTarget = Math.max(
        INTRO_END_DURATION,
        Math.min(MAX_SCROLL_DURATION, scrollRef.current.target + deltaY * scrollSpeed)
      );
      
      scrollRef.current.target = newTarget;
      touchStartY = touchY; // Update for continuous tracking
    };

    const handleTouchEnd = (e) => {
      if (!introPlayed || !projectReady) return;
      
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      // Add momentum for quick swipes
      if (touchDuration < 300) {
        // Reduced momentum for smoother performance on medium devices
        const velocity = isMediumDevice ? 0.003 : 0.006;
        const momentum = velocity * (touchDuration / (isMediumDevice ? 150 : 100));
        
        const newTarget = Math.max(
          INTRO_END_DURATION,
          Math.min(MAX_SCROLL_DURATION, scrollRef.current.target + momentum)
        );
        
        scrollRef.current.target = newTarget;
      }
    };

    // Add event listeners
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [MAX_SCROLL_DURATION, introPlayed, projectReady]);

  useFrame((state, delta) => {
    if (!sheet || !projectReady || !introPlayed) return;

    const { current, target } = scrollRef.current;
    const distance = target - current;
    // Adaptive smoothness for better performance on medium devices
    const smoothness = isMediumDevice ? 0.05 : 0.075;
    
    // Use RAF throttling for medium devices
    if (isMediumDevice && Math.abs(distance) < 0.001) return;
    
    scrollRef.current.current += distance * smoothness;
    
    scrollRef.current.current = Math.max(
      INTRO_END_DURATION,
      Math.min(MAX_SCROLL_DURATION, scrollRef.current.current)
    );
    
    sheet.sequence.position = scrollRef.current.current;
    
    // Control navbar based on scroll position
    if (scrollRef.current.current >= 38.0) {
      setIsDesktopMenuOpen(true);
    }
  });

  return null;
}

export default ScrollbasedAnimation;
