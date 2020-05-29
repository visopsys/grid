import React, { useCallback, useState, useMemo } from "react";
import { ICell, TGridRef } from "../Grid";

interface IProps {
  getTooltipComponent: (cell?: ICell | null) => React.ElementType;
  gridRef: TGridRef;
  getValue: <T>(cell: ICell) => T;
  onChange: <T>(value: T, coords: ICell) => void;
}

interface IResult {
  tooltipComponent: React.ReactNode;
  onMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement>) => void;
}

interface TooltipProps {
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
const getDefaultTooltipComponent = (cell: ICell) => defaultTooltipComponent;

const useTooltip = ({
  getValue,
  gridRef,
  getTooltipComponent = getDefaultTooltipComponent,
}: IProps): IResult => {
  const [activeCell, setActiveCell] = useState<ICell | null>(null);
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
