import { useState, useEffect } from "react";

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export const PerformanceMonitor = ({ 
  enabled = false, 
  className = "" 
}: PerformanceMonitorProps) => {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const currentFrameTime = (currentTime - lastTime) / frameCount;
        
        setFps(currentFPS);
        setFrameTime(Math.round(currentFrameTime * 100) / 100);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`fixed top-4 right-4 bg-black/80 text-white text-xs font-mono p-2 rounded z-50 ${className}`}>
      <div>FPS: {fps}</div>
      <div>Frame: {frameTime}ms</div>
    </div>
  );
};

export default PerformanceMonitor;
