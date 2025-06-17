import { throttle } from "lodash";
import { RefObject, useEffect, useMemo, useState } from "react"

export const useContainerDimensions = (
  containerRef: RefObject<HTMLDivElement>,
  fps: number = 30.0
) => {
  const [containerDimensions, setContainerDimensions] =
    useState({ width: 0, height: 0 });

  const throttledSetDimensions = 
      useMemo(() => {
        return throttle((width: number, height: number) => {
            setContainerDimensions({ width, height });
          }, 1000.0 / fps);
        
  }, [fps])
    
  useEffect(() => {
    // ✅ 將 throttle 包裝的函數放在外層（只建立一次）


    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          throttledSetDimensions(width, height);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      // ✅ 清除節流中的排程
      throttledSetDimensions.cancel();
    };
  }, [throttledSetDimensions]);

  return containerDimensions;
};
