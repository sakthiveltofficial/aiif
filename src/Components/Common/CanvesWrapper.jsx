"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import React, { Suspense, useEffect, useRef, useState, Component } from "react";
import BaseEnvironment from "./BaseEnvironment";
import { getProject } from "@theatre/core";
import { PerspectiveCamera, SheetProvider } from "@theatre/r3f";
import extension from "@theatre/r3f/dist/extension";
import studio from "@theatre/studio";
import { editable as e } from "@theatre/r3f";
import sequences from "@/../public/sequences/MainProject.theatre-project-state_5.json";
import ScrollbasedAnimation from "@/Three/RoomWithRobo/Animation/ScrollbasedAnimation";
import { CustomLoader } from "./CustomerLoader";
import { SimpleLoader } from "./SimpleLoader";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import DynamicLighting from "@/Three/lighting/DynamicLighting";
import { PerformanceOptimizer } from "./PerformanceOptimizer";

// Device performance detection and optimization
const detectDevicePerformance = () => {
  if (typeof window === 'undefined') return { tier: 'high', settings: {} };
  
  const ua = navigator.userAgent;
  const width = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  
  // iPhone XR and similar medium devices detection
  const isIPhoneXR = /iPhone.*OS 1[2-6]_/.test(ua) && (width === 414 || width === 375) && pixelRatio < 3;
  const isMediumDevice = (
    (width <= 768 && width > 375 && pixelRatio <= 2) ||
    isIPhoneXR ||
    (cores <= 4 && memory <= 4) ||
    /iPhone.*OS (1[0-4])_/.test(ua)
  );
  
  const isLowEnd = cores <= 2 || memory <= 2 || pixelRatio <= 1;
  
  if (isLowEnd) {
    return {
      tier: 'low',
      settings: {
        dpr: 1,
        antialias: false,
        shadows: false,
        powerPreference: 'default',
        fov: width < 768 ? 130 : 80,
        frameloop: 'demand'
      }
    };
  } else if (isMediumDevice) {
    return {
      tier: 'medium', 
      settings: {
        dpr: Math.min(1.5, pixelRatio),
        antialias: pixelRatio <= 1,
        shadows: 'basic',
        powerPreference: 'high-performance',
        fov: width < 768 ? 120 : 75,
        frameloop: 'always'
      }
    };
  }
  
  return {
    tier: 'high',
    settings: {
      dpr: Math.min(2, pixelRatio),
      antialias: true,
      shadows: 'soft',
      powerPreference: 'high-performance', 
      fov: width < 768 ? 120 : 70,
      frameloop: 'always'
    }
  };
};

// Error boundary for React errors
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-[3rem]">
          <div className="text-white text-center">
            <div>3D Scene Error</div>
            <button 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize Theatre.js studio in development mode only
// if (process.env.NODE_ENV === 'development') {
//   studio.initialize();
//   studio.extend(extension);
// }

function CanvesWrapper({ children, onDurationChange }) {
  const [isClient, setIsClient] = useState(false);
  const [devicePerformance, setDevicePerformance] = useState({ tier: 'high', settings: {} });
  
  // Initialize all hooks first - before any conditional returns
  const project = getProject("MainProject", { state: sequences });
  const sheet = project.sheet("HeroScene");
  const cameraLookAtRef = useRef(null);
  const durationRef = useRef(0);
  const overlayRef = useRef(null);

  // Null safety check for children
  const safeChildren = children || null;
  
  // Responsive camera state
  const [cameraSettings, setCameraSettings] = useState({
    position: [0, 2, 50],
    fov: 70,
  });
  
  useEffect(() => {
    setIsClient(true);
    // Detect device performance on client side
    const performance = detectDevicePerformance();
    setDevicePerformance(performance);
    
    console.log('Device performance tier:', performance.tier, performance.settings);
  }, []);
  

  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined') {
        const perf = detectDevicePerformance();
        if (window.innerWidth < 768) {
          // Mobile with adaptive settings based on device performance
          setCameraSettings({
            position: perf.tier === 'low' ? [0, 2, 90] : [0, 2, 80],
            fov: perf.settings.fov || (perf.tier === 'low' ? 130 : 120),
          });
        } else {
          // Desktop
          setCameraSettings({
            position: [0, 2, 50],
            fov: perf.settings.fov || 70,
          });
        }
        setDevicePerformance(perf);
      }
    }
    
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    // Prevent default scrolling behavior
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, []);

  useEffect(() => {
    let frame;
    function update() {
      if (sheet && overlayRef.current) {
        durationRef.current = sheet.sequence.position;
        overlayRef.current.textContent = `Current Duration: ${durationRef.current.toFixed(2)}`;
        
        // Call the callback if provided
        if (onDurationChange) {
          onDurationChange(durationRef.current);
        }
      }
      frame = requestAnimationFrame(update);
    }
    update();
    return () => cancelAnimationFrame(frame);
  }, [sheet, onDurationChange]);
  
  if (!isClient) {
    return <SimpleLoader />;
  }

  return (
    <ThreeErrorBoundary>
      <div className="w-full h-full relative p-2 md:p-3 lg:p-5 ">
          {/* Duration overlay - only show in development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div ref={overlayRef} style={{
              position: 'fixed',
              top: 20,
              left: 20,
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '1.1em',
              fontFamily: 'monospace',
              zIndex: 800,
              pointerEvents: 'none',
            }} />
          )} */}
        <div className="w-full h-full relative bg-black rounded-[3rem] overflow-hidden">
          <Canvas
          camera={{ fov: cameraSettings.fov, position: cameraSettings.position }}
          gl={{
            antialias: devicePerformance.settings.antialias ?? true,
            preserveDrawingBuffer: true,
            powerPreference: devicePerformance.settings.powerPreference || 'high-performance',
            alpha: false,
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: false,
            premultipliedAlpha: false
          }}
          dpr={devicePerformance.settings.dpr || (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2)}
          shadows={devicePerformance.settings.shadows || "soft"}
          performance={{ 
            min: devicePerformance.tier === 'low' ? 0.3 : 0.5, 
            max: devicePerformance.tier === 'low' ? 0.8 : 1, 
            debounce: devicePerformance.tier === 'medium' ? 200 : 100 
          }}
          frameloop={devicePerformance.settings.frameloop || "always"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #4e73ff 0%, #6b95ff 100%)",
          }}
        >
          <Suspense fallback={<CustomLoader />}>
            <PerformanceOptimizer targetFPS={devicePerformance.tier === 'low' ? 24 : 30}>
              <SheetProvider sheet={sheet}>
              <ScrollbasedAnimation project={project} />
              <PerspectiveCamera
                makeDefault
                position={cameraSettings.position}
                fov={cameraSettings.fov}
                theatreKey="camera"
                lookAt={cameraLookAtRef}
              />
              <e.mesh
                theatreKey="camera_lookAt"
                visible="editor"
                position={cameraSettings.position}
                fov={cameraSettings.fov}
                ref={cameraLookAtRef}
                >
                <octahedronGeometry args={[0.1, 0]} />
                <meshStandardMaterial color="red" />
              </e.mesh>
              <BaseEnvironment />
              <DynamicLighting />
              {safeChildren}
              {/* Conditionally render expensive effects based on device performance */}
              {/* <OrbitControls rotateSpeed={0.3} zoomSpeed={0.9} panSpeed={0.3} /> */}
              {devicePerformance.tier === 'high' && (
                // Only render bloom effect on high-performance devices
                // <EffectComposer>
                //   <Bloom intensity={0.33423} luminanceThreshold={0} luminanceSmoothing={0.9} layers={[1]} />
                // </EffectComposer>
                null
              )}
              </SheetProvider>
            </PerformanceOptimizer>
            {/* <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport
              axisColors={["red", "green", "blue"]}
                labelColor="black"
                />
                </GizmoHelper> */}
            {/* <Grid
          position={[0, -0.65, 0]}
          args={[150, 200]}
          cellColor="black"
          cellSize={1}
          cellThickness={1}
          /> */}
            </Suspense>
          </Canvas>
        </div>
      </div>
    </ThreeErrorBoundary>
  );
}

export default CanvesWrapper;
