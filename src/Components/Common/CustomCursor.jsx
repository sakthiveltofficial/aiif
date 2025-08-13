import React, { useEffect, useRef, useState } from 'react';

const CURSOR_SIZE = 10;
const GLOW_SIZE = 24; // Outer glow diameter
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const glowRef = useRef(null);
  // Safely access window for SSR
  const isClient = typeof window !== 'undefined';
  const mouse = useRef({ x: isClient ? window.innerWidth / 2 : 0, y: isClient ? window.innerHeight / 2 : 0 });
  const pos = useRef({ x: isClient ? window.innerWidth / 2 : 0, y: isClient ? window.innerHeight / 2 : 0 });
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    setVisible(true);
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    let animationFrame;
    const animate = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.18;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.18;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x - CURSOR_SIZE / 2}px, ${pos.current.y - CURSOR_SIZE / 2}px, 0)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.current.x - GLOW_SIZE / 2}px, ${pos.current.y - GLOW_SIZE / 2}px, 0)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isClient]);

  // Don't render cursor on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <>
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7ecbff88 0%, #4e73ff88 100%)',
          filter: 'blur(10px)',
          opacity: visible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'opacity 0.6s',
          willChange: 'transform',
        }}
      />
      {/* <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7ecbff 0%, #4e73ff 100%)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: 'background 0.2s, opacity 0.6s',
          willChange: 'transform',
        }}
      /> */}
    </>
  );
};

export default CustomCursor; 