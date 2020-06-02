import React, { useState, useCallback, useRef } from "react";
import { AreaProps, CellInterface, GridRef } from "./../Grid";

export interface UseSelectionOptions {
  gridRef?: React.MutableRefObject<GridRef>;
  initialSelections: AreaProps[];
  columnCount?: number;
  rowCount?: number;
  newSelection: (coords: CellInterface) => void;
}

enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

export enum SelectionKeys {
  Right = 39,
  Left = 37,
  Up = 38,
  Down = 40,
  Escape = 27,
  Tab = 9,
  Meta = 91,
}

export enum DeleteKeys {
  Delete = 9,
  BackSpace = 8,
}

/**
 * useSelection hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = (options?: UseSelectionOptions) => {
  const { gridRef, initialSelections = [], columnCount = 0, rowCount = 0 } =
    options || {};
  const [selections, setSelections] = useState<AreaProps[]>(initialSelections);
  const selectionStart = useRef<CellInterface>();
  const selectionEnd = useRef<CellInterface>();
  const isSelectionMode = useRef<boolean>();

  /* New selection */
  const newSelection = (coords: CellInterface) => {
    selectionStart.current = coords;
    selectionEnd.current = coords;
    const selection = selectionFromStartEnd(coords, coords);
    if (!selection) return;
    setSelections([selection]);
  };

  /* selection object from start, end */
  const selectionFromStartEnd = (start: CellInterface, end: CellInterface) => {
    if (!gridRef) return null;
    const boundsStart = gridRef.current.getCellBounds(start);
    const boundsEnd = gridRef.current.getCellBounds(end);
    return {
      top: Math.min(boundsStart.top, boundsEnd.top),
      bottom: Math.max(boundsStart.bottom, boundsEnd.bottom),
      left: Math.min(boundsStart.left, boundsEnd.left),
      right: Math.max(boundsStart.right, boundsEnd.right),
    };
  };

  /* Modify current selection */
  const modifySelection = (coords: CellInterface) => {
    if (!selectionStart.current) return;
    selectionEnd.current = coords;
    const selection = selectionFromStartEnd(selectionStart.current, coords);
    if (!selection) return;
    setSelections([selection]);
  };

  /* Adds a new selection, CMD key */
  const appendSelection = (coords: CellInterface) => {
    selectionStart.current = coords;
    selectionEnd.current = coords;
    const selection = selectionFromStartEnd(coords, coords);
    if (!selection) return;
    setSelections((prev) => [...prev, selection]);
  };

  /**
   * Triggers a new selection start
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    /* Exit early if grid is not initialized */
    if (!gridRef || !gridRef.current) return;

    /* Activate selection mode */
    isSelectionMode.current = true;

    const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
      e.clientX,
      e.clientY
    );

    /**
     * Save the initial Selection in ref
     * so we can adjust the bounds in mousemove
     */
    const coords = { rowIndex, columnIndex };

    /* Shift key */
    if (e.nativeEvent.shiftKey) {
      modifySelection(coords);
      return;
    }

    /* Command  or Control key */
    if (e.nativeEvent.metaKey || e.nativeEvent.ctrlKey) {
      appendSelection(coords);
      return;
    }

    /* Trigger new selection */
    newSelection(coords);
  }, []);

  /**
   * Mousemove handler
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      /* Exit if user is not in selection mode */
      if (!isSelectionMode.current || !gridRef || !selectionEnd.current) return;

      const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
        e.clientX,
        e.clientY
      );

      modifySelection({ rowIndex, columnIndex });
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

  /**
   * Navigate selection using keyboard
   * @param direction
   * @param modify
   */
  const keyNavigate = (direction: Direction, modify?: boolean) => {
    if (!selectionEnd.current || !gridRef) return;
    var { rowIndex, columnIndex } = selectionEnd.current;
    const isMergedCell = gridRef?.current.isMergedCell({
      rowIndex,
      columnIndex,
    });

    const bounds = gridRef.current.getCellBounds({ rowIndex, columnIndex });

    switch (direction) {
      case Direction.Up:
        if (isMergedCell) rowIndex = bounds.top;
        rowIndex = Math.max(rowIndex - 1, 0);
        break;

      case Direction.Down:
        if (isMergedCell) rowIndex = bounds.bottom;
        rowIndex = Math.min(rowIndex + 1, rowCount - 1);
        break;

      case Direction.Left:
        if (isMergedCell) columnIndex = bounds.left;
        columnIndex = Math.max(columnIndex - 1, 0);
        break;

      case Direction.Right:
        if (isMergedCell) columnIndex = bounds.right;
        columnIndex = Math.min(columnIndex + 1, columnCount - 1);
        break;
    }

    if (modify) {
      modifySelection({ rowIndex, columnIndex });
    } else {
      newSelection({ rowIndex, columnIndex });
    }

    /* Keep the item in view */
    gridRef.current.scrollToItem({ rowIndex, columnIndex });
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const modify = e.nativeEvent.shiftKey;
      switch (e.nativeEvent.which) {
        case SelectionKeys.Right:
          keyNavigate(Direction.Right, modify);
          break;

        case SelectionKeys.Left:
          keyNavigate(Direction.Left, modify);
          break;

        // Up
        case SelectionKeys.Up:
          keyNavigate(Direction.Up, modify);
          break;

        case SelectionKeys.Down:
          keyNavigate(Direction.Down, modify);
          break;

        case SelectionKeys.Tab:
          if (modify) {
            keyNavigate(Direction.Left);
          } else {
            keyNavigate(Direction.Right);
          }
          e.preventDefault();
          break;
      }
    },
    [rowCount, columnCount]
  );

  return {
    selections,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onKeyDown: handleKeyDown,
    newSelection,
  };
};

export default useSelection;
