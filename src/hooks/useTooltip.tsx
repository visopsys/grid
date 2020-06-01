import React, { useCallback, useState, useMemo } from "react";
import { CellInterface, GridRef } from "../Grid";

export interface TooltipOptions {
  getTooltipComponent?: (cell?: CellInterface | null) => React.ElementType;
  gridRef: React.MutableRefObject<GridRef>;
  getValue: (cell: CellInterface) => any;
}

export interface TooltipResults {
  tooltipComponent: React.ReactNode;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export interface TooltipProps {
  content: string;
  x: number;
  y: number;
}
const defaultTooltipComponent: React.FC<TooltipProps> = ({ content, x, y }) => {
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
const getDefaultTooltipComponent = () => defaultTooltipComponent;

const useTooltip = ({
  getValue,
  gridRef,
  getTooltipComponent = getDefaultTooltipComponent,
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
  const Tooltip = useMemo(() => getTooltipComponent(activeCell), [activeCell]);
  const tooltipComponent = showTooltip ? (
    <Tooltip content={content} x={tooltipPosition.x} y={tooltipPosition.y} />
  ) : null;

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
