"use client"

import { Html, useProgress } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"

export function CustomLoader() {
  const { progress } = useProgress()
  const [isVisible, setIsVisible] = useState(true)
  const [display, setDisplay] = useState(0)
  const animProgress = useRef(0)
  const rafRef = useRef()

  useEffect(() => {
    function animate() {
      // Always animate toward 100 if progress is 100
      const target = progress === 100 ? 100 : progress
      // Only move forward - never backward
      const newProgress = Math.max(target, animProgress.current)
      animProgress.current += (newProgress - animProgress.current) * 0.4 // Faster animation
      if (Math.abs(newProgress - animProgress.current) < 0.1) { // More precise
        animProgress.current = newProgress
      }
      setDisplay(animProgress.current)
      if (animProgress.current < 100) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        // Hide loader immediately when 100% is reached
        setTimeout(() => setIsVisible(false), 100) // Very short delay
      }
    }
    if (isVisible) {
      rafRef.current = requestAnimationFrame(animate)
    }
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
  }, [progress, isVisible])

  if (!isVisible) return null

  return (
    <Html
      center
      style={{
        width: "100vw",
        height: "120vh",
        pointerEvents: "none",
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0
      }}
    >
      <div style={{
        background: "linear-gradient(135deg, #4e73ff 0%, #6b95ff 100%)",
        width: "100%",
        height: "100%",
        position: "relative"
      }}>
        {/* Top left logo/text */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 lg:top-8 lg:left-8">
          <div className="flex items-center space-x-1 text-white text-lg md:text-2xl font-bold">
            A I I F
          </div>
        </div>

        {/* Top right text */}
        <div className="absolute top-[150px] right-3 md:top-6 md:right-6 lg:top-[200px] lg:right-[80px]">
          <div className="text-white text-xs md:text-sm lg:text-base font-medium tracking-wider">
            LAUNCHING 3D
            <span className="ml-1 md:ml-2 inline-block w-1 h-1 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></span>
          </div>
        </div>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white font-bold tracking-tight select-none">
            <span
              className="text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem]"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 800,
                lineHeight: 0.8,
              }}
            >
              {Math.round(display)}%
            </span>
          </div>
        </div>

        {/* Bottom progress indicator (optional thin line) */}
        <div className="absolute bottom-[10.1rem] md:bottom-[10.2rem] lg:bottom-[12.2rem] xl:bottom-[14.2rem] left-0 w-full h-1 md:h-2 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${display}%` }}
          />
        </div>
      </div>
    </Html>
  )
}
