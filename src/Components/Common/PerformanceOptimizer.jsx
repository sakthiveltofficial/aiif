import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// Performance optimization context
const PerformanceContext = createContext({
  quality: 'high',
  fps: 60,
  autoOptimize: true,
  deviceTier: 'high'
});

export const usePerformanceContext = () => useContext(PerformanceContext);

export function PerformanceOptimizer({ children, targetFPS = 30 }) {
  const [quality, setQuality] = useState('high');
  const [fps, setFPS] = useState(60);
  const [deviceTier, setDeviceTier] = useState('high');
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef([]);
  const optimizationTimeout = useRef(null);
  const { gl } = useThree();

  // Detect device capabilities on mount
  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return 'high';
      
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      const pixelRatio = window.devicePixelRatio || 1;
      const memory = navigator.deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      
      // iPhone XR specific detection
      const isIPhoneXR = /iPhone.*OS 1[2-6]_/.test(ua) && 
                         (width === 414 || width === 375) && 
                         pixelRatio < 3;
      
      // Medium device detection (including iPhone XR)
      const isMediumDevice = (
        (width <= 768 && width > 375 && pixelRatio <= 2) ||
        isIPhoneXR ||
        (cores <= 4 && memory <= 4) ||
        /iPhone.*OS (1[0-4])_/.test(ua)
      );
      
      const isLowEnd = cores <= 2 || memory <= 2 || pixelRatio <= 1;
      
      if (isLowEnd) return 'low';
      if (isMediumDevice) return 'medium';
      return 'high';
    };

    const tier = detectDevice();
    setDeviceTier(tier);
    setQuality(tier);
    
    console.log('Device tier detected:', tier);
    
    // Initial GPU-specific optimizations
    if (gl) {
      const context = gl.getContext();
      const renderer = gl;
      
      switch (tier) {
        case 'low':
          renderer.setPixelRatio(1);
          renderer.shadowMap.enabled = false;
          break;
        case 'medium':
          renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = 2; // Basic shadows
          break;
        case 'high':
        default:
          renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = 3; // Soft shadows
          break;
      }
    }
  }, [gl]);

  // Monitor FPS and adjust quality dynamically
  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    
    if (now - lastTime.current >= 1000) {
      const currentFPS = (frameCount.current * 1000) / (now - lastTime.current);
      fpsHistory.current.push(currentFPS);
      
      // Keep only last 5 measurements for responsive adjustment
      if (fpsHistory.current.length > 5) {
        fpsHistory.current.shift();
      }
      
      const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
      setFPS(Math.round(avgFPS));
      
      // Auto-optimization logic
      if (deviceTier === 'medium' || deviceTier === 'low') {
        // Clear any existing timeout
        if (optimizationTimeout.current) {
          clearTimeout(optimizationTimeout.current);
        }
        
        // Debounced quality adjustment
        optimizationTimeout.current = setTimeout(() => {
          if (avgFPS < targetFPS && quality !== 'low') {
            const newQuality = quality === 'high' ? 'medium' : 'low';
            setQuality(newQuality);
            console.log(`Performance degraded to ${newQuality}. FPS: ${avgFPS.toFixed(1)}`);
            
            // Apply immediate optimizations
            if (gl) {
              switch (newQuality) {
                case 'medium':
                  gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
                  break;
                case 'low':
                  gl.setPixelRatio(1);
                  gl.shadowMap.enabled = false;
                  break;
              }
            }
          } else if (avgFPS > targetFPS + 10 && quality !== deviceTier) {
            // Only improve if we're below the device's native tier
            const newQuality = quality === 'low' ? 'medium' : 'high';
            if (newQuality === deviceTier || (deviceTier === 'high' && newQuality === 'medium')) {
              setQuality(newQuality);
              console.log(`Performance improved to ${newQuality}. FPS: ${avgFPS.toFixed(1)}`);
            }
          }
        }, 2000); // Wait 2 seconds before adjusting
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (optimizationTimeout.current) {
        clearTimeout(optimizationTimeout.current);
      }
    };
  }, []);

  const contextValue = {
    quality,
    fps,
    deviceTier,
    autoOptimize: true
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Hook for components to check if they should render expensive effects
export const useShouldRenderEffect = (effectLevel = 'medium') => {
  const { quality, deviceTier } = usePerformanceContext();
  
  const effectLevels = { low: 0, medium: 1, high: 2 };
  const currentLevel = effectLevels[quality];
  const requiredLevel = effectLevels[effectLevel];
  
  return currentLevel >= requiredLevel;
};

// Hook for getting device-specific animation settings
export const useAnimationSettings = () => {
  const { quality, deviceTier } = usePerformanceContext();
  
  switch (quality) {
    case 'low':
      return {
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.05,
        force3D: false
      };
    case 'medium':
      return {
        duration: 0.5,
        ease: 'power3.out', 
        stagger: 0.1,
        force3D: true
      };
    case 'high':
    default:
      return {
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.15,
        force3D: true
      };
  }
};