import React, { useCallback, useEffect, useRef } from "react";
import { GridRef } from "../Grid";
// @ts-ignore
import { Scroller } from "scroller";

export interface TouchProps {
  /**
   * Grid reference to access grid methods
   */
  gridRef: React.MutableRefObject<GridRef | null>;
}

/**
 * Enable touch interactions
 * Supports
 * 1. Scrolling
 * 2. Cell selection
 */
const useTouch = ({ gridRef }: TouchProps): void => {
  const scrollerRef = useRef<typeof Scroller | null>(null);
  useEffect(() => {
    const options = {
      scrollingX: true,
      scrollingY: true,
      decelerationRate: 0.95,
      penetrationAcceleration: 0.08,
    };

    /* Add listeners */
    gridRef.current?.container?.addEventListener(
      "touchstart",
      handleTouchStart
    );
    gridRef.current?.container?.addEventListener("touchend", handleTouchEnd);
    gridRef.current?.container?.addEventListener("touchmove", handleTouchMove);

    /* Add scroller */
    scrollerRef.current = new Scroller(handleTouchScroll, options);

    /* Update dimension */

    if ("ontouchstart" in window) {
      const dims = gridRef.current?.getDimensions();
      /* Update dimensions */
      updateScrollDimensions(dims);
    }
  }, []);

  const updateScrollDimensions = useCallback(
    ({
      containerWidth,
      containerHeight,
      estimatedTotalWidth,
      estimatedTotalHeight,
    }) => {
      scrollerRef.current.setDimensions(
        containerWidth,
        containerHeight,
        estimatedTotalWidth,
        estimatedTotalHeight
      );
    },
    []
  );

  const handleTouchScroll = useCallback((scrollLeft, scrollTop) => {
    gridRef.current?.scrollTo({ scrollTop, scrollLeft });
  }, []);
  const handleTouchStart = useCallback((e: globalThis.TouchEvent) => {
    scrollerRef.current.doTouchStart(e.touches, e.timeStamp);
  }, []);
  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    e.preventDefault();
    scrollerRef.current.doTouchMove(e.touches, e.timeStamp);
  }, []);
  const handleTouchEnd = useCallback((e) => {
    scrollerRef.current.doTouchEnd(e.timeStamp);
  }, []);
};

export default useTouch;
