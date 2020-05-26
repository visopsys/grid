import React, { useState, useCallback, useRef } from "react";
import { IArea, TGridRef } from "./../Grid";

interface IOptions {
  gridRef?: TGridRef;
  initialSelections?: IArea[];
}

/**
 * useSelection hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = (options: IOptions = {}) => {
  const { gridRef, initialSelections = [] } = options;
  const [selections, setSelections] = useState<IArea[]>(initialSelections);
  const selectionStart = useRef<IArea>();
  const isSelectionMode = useRef<boolean>();
  const handleMouseDown = useCallback((_, rowIndex, columnIndex) => {
    /* Exit early if grid is not initialized */
    if (!gridRef || !gridRef.current) return;

    /* Activate selection mode */
    isSelectionMode.current = true;

    /* To cater to merged Cells, get the bounds from internal fn */
    const selection = gridRef.current.getCellBounds(rowIndex, columnIndex);

    /**
     * Save the initial Selection in ref
     * so we can adjust the bounds in mousemove
     */
    selectionStart.current = selection;

    /* Add selection to state */
    setSelections([selection]);
  }, []);

  /**
   * Mousemove handler
   */
  const handleMouseMove = useCallback(
    (_, rowIndex, columnIndex) => {
      /* Exit if user is not in selection mode */
      if (!isSelectionMode.current) return;

      /* Get the current selection */
      const _selectionStart = selectionStart.current as IArea;

      /* Exit early */
      if (!_selectionStart) return;

      setSelections((prevSelection) => {
        return prevSelection.map((selection) => {
          return {
            top: Math.min(rowIndex, _selectionStart.top),
            bottom: Math.max(rowIndex, _selectionStart.bottom),
            left: Math.min(columnIndex, _selectionStart.left),
            right: Math.max(columnIndex, _selectionStart.right),
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
