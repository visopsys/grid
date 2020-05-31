import React, { useState, useCallback, useRef } from "react";
import { AreaProps, GridRef } from "./../Grid";

export interface UseSelectionOptions {
  gridRef?: React.MutableRefObject<GridRef>;
  initialSelections?: AreaProps[];
}

/**
 * useSelection hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = (options: UseSelectionOptions = {}) => {
  const { gridRef, initialSelections = [] } = options;
  const [selections, setSelections] = useState<AreaProps[]>(initialSelections);
  const selectionStart = useRef<AreaProps>();
  const isSelectionMode = useRef<boolean>();

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    /* Exit early if grid is not initialized */
    if (!gridRef || !gridRef.current) return;

    /* Activate selection mode */
    isSelectionMode.current = true;

    const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
      e.clientX,
      e.clientY
    );

    /* To cater to merged Cells, get the bounds from internal fn */
    const bounds = gridRef.current.getCellBounds({ rowIndex, columnIndex });

    /**
     * Save the initial Selection in ref
     * so we can adjust the bounds in mousemove
     */
    selectionStart.current = bounds;

    /* Add selection to state */
    setSelections([bounds]);
  }, []);

  /**
   * Mousemove handler
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      /* Exit if user is not in selection mode */
      if (!isSelectionMode.current || !gridRef) return;

      /* Get the current selection */
      const _selectionStart = selectionStart.current;

      /* Exit early */
      if (!_selectionStart) return;

      const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
        e.clientX,
        e.clientY
      );

      /* Get new bounds */
      const bounds = gridRef.current.getCellBounds({ rowIndex, columnIndex });

      setSelections((prevSelection) => {
        return prevSelection.map((selection) => {
          return {
            top: Math.min(bounds.top, _selectionStart.top),
            bottom: Math.max(bounds.bottom, _selectionStart.bottom),
            left: Math.min(bounds.left, _selectionStart.left),
            right: Math.max(bounds.right, _selectionStart.right),
          };
        });
      });
    },
    [isSelectionMode]
  );
  /**
   * Mouse up handler
   */
  const handleMouseUp = useCallback(() => {
    /* Reset selection mode */
    isSelectionMode.current = false;
  }, []);

  return {
    selections,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
};

export default useSelection;
