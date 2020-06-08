import React, { useCallback, useState, useMemo, isValidElement } from "react";
import { CellInterface, GridRef } from "../Grid";

export interface TooltipOptions {
  /**
   * Tooltip component
   */
  component?: React.FC<TooltipProps> | React.ComponentClass<TooltipProps>;
  /**
   * Grid references
   */
  gridRef: React.MutableRefObject<GridRef>;
  /**
   * Tooltip value getter of a cell
   */
  getValue: (cell: CellInterface) => any;
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
   * Tooltip content
   */
  content: string;
  /**
   * Tooltip x position
   */
  x: number;
  /**
   * Tooltip y position
   */
  y: number;
}

const DefaultTooltipComponent: React.FC<TooltipProps> = ({ content, x, y }) => {
  const offset = 10;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x + offset}px, ${y + offset}px)`,
        maxWidth: 200,
        background: "rgba(0,0,0,0.8)",
        padding: 5,
        borderRadius: 5,
        color: "white",
      }}
    >
      {content}
    </div>
  );
};

const useTooltip = ({
  getValue,
  gridRef,
  component: Component = DefaultTooltipComponent,
}: TooltipOptions): TooltipResults => {
  const [activeCell, setActiveCell] = useState<CellInterface | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<
    Pick<TooltipProps, "x" | "y">
  >({ x: 0, y: 0 });
  const content = useMemo(
    () => (activeCell ? getValue(activeCell) ?? null : null),
    [activeCell]
  );
  const showTooltip = activeCell && content !== null;
  const tooltipProps: TooltipProps = {
    content,
    x: tooltipPosition.x,
    y: tooltipPosition.y,
  };
  const tooltipComponent = showTooltip ? <Component {...tooltipProps} /> : null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
        e.clientX,
        e.clientY
      );
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY,
      });
      /* Exit if its the same cell */
      if (
        activeCell &&
        activeCell.rowIndex === rowIndex &&
        activeCell.columnIndex === columnIndex
      )
        return;
      setActiveCell({ rowIndex, columnIndex });
    },
    [activeCell]
  );

  const handleMouseLeave = useCallback((e) => {
    setActiveCell(null);
  }, []);

  return {
    tooltipComponent,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
};

export default useTooltip;
