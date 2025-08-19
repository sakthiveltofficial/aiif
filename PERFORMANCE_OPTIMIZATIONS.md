# Performance Optimizations for iPhone XR and Medium Devices

## Overview
This document outlines the performance optimizations implemented to address scroll animation lag issues on medium-performance devices like iPhone XR.

## Device Detection Strategy

### Target Devices
- **iPhone XR**: Detected via user agent + screen dimensions + pixel ratio < 3
- **Medium Devices**: Devices with <= 4 CPU cores, <= 4GB RAM, pixel ratio <= 2
- **Low-end Devices**: <= 2 cores, <= 2GB RAM, pixel ratio <= 1

## Key Optimizations Implemented

### 1. Enhanced ScrollbasedAnimation.jsx
- **Adaptive scroll speeds** based on device performance tier
  - High-end: 0.0015 (wheel), 0.01 (touch)
  - Medium: 0.001 (wheel), 0.006 (touch) 
  - Low-end: 0.0012 (wheel), 0.008 (touch)
- **Reduced momentum** for smoother performance on medium devices
- **Adaptive smoothness** values (0.05 for medium vs 0.075 for high-end)
- **RAF throttling** for medium devices to skip frames when changes are minimal

### 2. Smart Canvas Configuration (CanvesWrapper.jsx)
- **Device-specific renderer settings**:
  - Low-end: DPR=1, no antialiasing, basic shadows
  - Medium: DPR=1.5, conditional antialiasing, basic shadows
  - High-end: DPR=2, full antialiasing, soft shadows
- **Adaptive camera FOV** based on device performance
- **Performance-based frameloop** settings (demand vs always)

### 3. 3D Model Optimizations (FinalModel.jsx)
- **Material optimization** for medium/low devices:
  - Removed normal maps on low-end devices
  - Reduced normal map intensity on medium devices
  - Disabled unnecessary material features
- **Frame throttling** for animations (every 2nd frame for medium, every 3rd for low)
- **Distance-based frustum culling** for mesh visibility
- **Conditional shadow casting** based on device tier

### 4. GSAP Animation Optimizations (page.jsx)
- **Device-specific animation durations**:
  - Low-end: 0.4s with power2.out easing
  - Medium: 0.6s with power3.out easing  
  - High-end: 0.8s with back.out(1.7) easing
- **Reduced movement distances** for low-end devices
- **Conditional shimmer effects** (only on high-end devices)
- **Force3D optimization** based on device capabilities

### 5. Real-time Performance Monitor
- **Automatic FPS monitoring** with 5-sample rolling average
- **Dynamic quality adjustment** when FPS drops below target (30fps for medium, 24fps for low)
- **Renderer setting updates** in real-time based on performance
- **Debounced quality changes** (2-second delay) to prevent oscillation

## Performance Targets

### Frame Rate Targets
- **High-end devices**: 60 FPS
- **Medium devices (iPhone XR)**: 30 FPS  
- **Low-end devices**: 24 FPS

### Quality Tiers
1. **High**: Full features, max quality settings
2. **Medium**: Balanced performance, optimized for iPhone XR
3. **Low**: Minimal features, maximum performance

## Device-Specific Improvements

### iPhone XR Optimizations
- Pixel ratio capped at 1.5 instead of 2
- Touch scroll speed reduced by 40%
- Animation duration reduced to 0.6s
- Basic shadow mapping instead of soft shadows
- Material optimizations with reduced normal map intensity

### General Medium Device Optimizations
- Frame throttling (every 2nd frame for animations)
- Adaptive scroll smoothness (0.05 vs 0.075)
- Distance-based frustum culling
- Conditional expensive effects rendering
- Real-time FPS monitoring and adjustment

## Testing Recommendations

### Manual Testing
1. Test on actual iPhone XR device
2. Use Chrome DevTools device emulation for iPhone XR
3. Monitor FPS using browser performance tools
4. Test scroll performance in different sections of the site

### Performance Metrics to Monitor
- **Frame rate**: Should maintain target FPS during scroll
- **Memory usage**: Should remain stable during extended use
- **GPU utilization**: Should not exceed device capabilities
- **Touch response**: Should feel smooth and responsive

## Fallback Strategy
If performance issues persist, the system will automatically:
1. Further reduce quality settings
2. Disable expensive effects
3. Increase frame throttling
4. Reduce scroll sensitivity

## Implementation Notes
- All optimizations are backward compatible
- High-end devices maintain full quality experience
- Debug logging available in development mode
- Automatic quality adjustment prevents manual intervention needs

## Future Improvements
- WebGL context loss recovery
- Memory usage monitoring
- Battery level-based optimizations
- Network-aware quality adjustments