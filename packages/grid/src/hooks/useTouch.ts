import React, { useCallback } from "react";
import { GridRef } from "../Grid";

export interface TouchProps {
  /**
   * Grid reference to access grid methods
   */
  gridRef: React.MutableRefObject<GridRef | null>;
}

export interface TouchResults {
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
}
/**
 * Enable touch interactions
 * Supports
 * 1. Scrolling
 * 2. Cell selection
 */
const useTouch = ({ gridRef }: TouchProps): TouchResults => {
  /**
   * Enable touch scrolling
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const { pageX, pageY } = e.touches[0];
      let x = pageX;
      let y = pageY;
      const handleTouchMove = (e: globalThis.TouchEvent) => {
        if (!gridRef.current) return
        const { pageX, pageY } = e.changedTouches[0];
        const dx = pageX - x;
        const dy = pageY - y;
        /* Scroll only in one direction */
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        gridRef.current.scrollBy({
          x: isHorizontal ? -dx : undefined,
          y: isHorizontal ? undefined : -dy,
        });
        x = pageX;
        y = pageY;
      };
      const handleTouchEnd = () => {
        target.removeEventListener("touchmove", handleTouchMove);
        target.removeEventListener("touchend", handleTouchEnd);
      };
      target.addEventListener("touchmove", handleTouchMove);
      target.addEventListener("touchend", handleTouchEnd);
    },
    []
  );

  return {
    onTouchStart: handleTouchStart,
  };
};

export default useTouch;
