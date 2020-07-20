import React, {
  useCallback,
  useState,
  useMemo,
  isValidElement,
  useRef,
  useEffect
} from "react";
import { CellInterface, GridRef } from "../Grid";
import { rafThrottle, debounce, throttle } from "../helpers";

export interface DefaultTooltipOptions {
  /**
   * Tooltip component
   */
  // component?: React.FC<TooltipProps> | React.ComponentClass<TooltipProps>;
  getTooltip?: (cell: CellInterface | null) => React.ElementType | null;
  /**
   * Grid references
   */
  gridRef: React.MutableRefObject<GridRef | null>;
}

export interface TooltipResults {
  /**
   * Tooltip component to inject into the page
   */
  tooltipComponent: React.ReactElement | null;
  /**
   * Mousemove listener to align tooltip
   */
  onMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  /**
   * Mouse leave listener to hide tooltip
   */
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export interface TooltipProps {
  /**
   * Tooltip x position
   */
  x?: number;
  /**
   * Tooltip y position
   */
  y?: number;
  width?: number;
  height?: number;
  scrollLeft?: number;
  scrollTop?: number;
}

const DefaultTooltipComponent: React.FC<TooltipProps> = ({ x = 0, y = 0 }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        maxWidth: 200,
        background: "white",
        boxShadow: "0 4px 8px 3px rgba(60,64,67,.15)",
        padding: 12,
        borderRadius: 4,
        fontSize: 13
      }}
    >
      {x}
    </div>
  );
};

const getDefaultTooltip = (cell: CellInterface | null) =>
  DefaultTooltipComponent;

const useTooltip = ({
  gridRef,
  getTooltip = getDefaultTooltip
}: TooltipOptions): TooltipResults => {
  const [activeCell, setActiveCell] = useState<CellInterface | null>(null);
  const isTooltipActive = useRef(false);
  const activeCellRef = useRef(activeCell);
  const [tooltipPosition, setTooltipPosition] = useState<
    Pick<
      TooltipProps,
      "x" | "y" | "width" | "height" | "scrollLeft" | "scrollTop"
    >
  >({});
  const showTooltip = !!activeCell;
  const TooltipComponent = useMemo(() => {
    return getTooltip(activeCell);
  }, [activeCell]);

  const handleTooltipMouseEnter = useCallback(() => {
    isTooltipActive.current = true;
  }, []);
  const handleTooltipMouseLeave = useCallback(() => {
    isTooltipActive.current = false;
    setActiveCell(null);
  }, []);

  const tooltipComponent =
    showTooltip && TooltipComponent ? (
      <TooltipComponent
        {...tooltipPosition}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
    ) : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!gridRef.current) return;
    const coords = gridRef.current.getCellCoordsFromOffset(
      e.clientX,
      e.clientY
    );

    if (!coords) return;
    const { rowIndex, columnIndex } = coords;
    /* Exit if its the same cell */
    if (
      activeCellRef.current &&
      activeCellRef.current.rowIndex === rowIndex &&
      activeCellRef.current.columnIndex === columnIndex
    )
      return;

    const pos = gridRef.current.getCellOffsetFromCoords(coords);
    const scrollPosition = gridRef.current.getScrollPosition();
    setTooltipPosition({
      ...pos,
      ...scrollPosition
    });
    setActiveCell({ rowIndex, columnIndex });
  }, []);

  const handleMouseLeave = useCallback(e => {
    if (isTooltipActive.current) return;
    setActiveCell(null);
  }, []);

  /* Raf throttler */
  const mouseMoveThrottler = useRef(throttle(handleMouseMove, 100));
  const mouseLeaveThrottler = useRef(debounce(handleMouseLeave, 2000));

  /* Update activecell ref */
  useEffect(() => {
    activeCellRef.current = activeCell;
  }, [activeCell]);

  return {
    tooltipComponent,
    onMouseMove: mouseMoveThrottler.current,
    onMouseLeave: mouseLeaveThrottler.current
  };
};

export default useTooltip;
