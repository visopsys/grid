import React, {
  useCallback,
  useState,
  useMemo,
  isValidElement,
  useRef,
  useEffect,
} from "react";
import { CellInterface, GridRef } from "../Grid";
import { rafThrottle } from "../helpers";

export interface TooltipOptions {
  /**
   * Tooltip component
   */
  // component?: React.FC<TooltipProps> | React.ComponentClass<TooltipProps>;
  getTooltip?: (cell: CellInterface | null) => React.ElementType | null;
  /**
   * Grid references
   */
  gridRef: React.MutableRefObject<GridRef | null>;
  /**
   * Tooltip position
   */
  position?: TooltipPosition;
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
  x: number;
  /**
   * Tooltip y position
   */
  y: number;
}

export type TooltipPosition = "right" | "left" | "top" | "bottom";

const DefaultTooltipComponent: React.FC<TooltipProps> = ({ x, y }) => {
  const offset = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x + offset}px, ${y + offset}px)`,
        maxWidth: 200,
        background: "white",
        boxShadow: "0 4px 8px 3px rgba(60,64,67,.15)",
        padding: 12,
        borderRadius: 4,
        fontSize: 13,
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
  getTooltip = getDefaultTooltip,
  position = "right",
}: TooltipOptions): TooltipResults => {
  const [activeCell, setActiveCell] = useState<CellInterface | null>(null);
  const activeCellRef = useRef(activeCell);
  const [tooltipPosition, setTooltipPosition] = useState<
    Pick<TooltipProps, "x" | "y">
  >({ x: 0, y: 0 });
  const showTooltip = !!activeCell;
  const tooltipProps: TooltipProps = {
    x: tooltipPosition.x,
    y: tooltipPosition.y,
  };
  const TooltipComponent = useMemo(() => {
    return getTooltip(activeCell);
  }, [activeCell]);

  const tooltipComponent =
    showTooltip && TooltipComponent ? (
      <TooltipComponent {...tooltipProps} />
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

    const {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
    } = gridRef.current.getCellOffsetFromCoords(coords);
    const posX = position === "right" ? x + width : x;
    const posY = y;
    setTooltipPosition({
      x: posX,
      y: posY,
    });
    setActiveCell({ rowIndex, columnIndex });
  }, []);

  /* Raf throttler */
  const mouseMoveThrottler = useRef(rafThrottle(handleMouseMove));

  /* Update activecell ref */
  useEffect(() => {
    activeCellRef.current = activeCell;
  }, [activeCell]);

  const handleMouseLeave = useCallback((e) => {
    setActiveCell(null);
  }, []);

  return {
    tooltipComponent,
    onMouseMove: mouseMoveThrottler.current,
    onMouseLeave: handleMouseLeave,
  };
};

export default useTooltip;
