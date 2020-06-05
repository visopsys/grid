import React, { useState, useCallback, useRef } from "react";
import { SelectionArea, AreaProps, CellInterface, GridRef } from "./../Grid";
import { KeyCodes, Direction } from "./../types";

export interface UseSelectionOptions {
  gridRef?: React.MutableRefObject<GridRef>;
  initialSelections?: SelectionArea[];
  initialActiveCell: CellInterface | null;
  columnCount?: number;
  rowCount?: number;
}

export interface SelectionResults {
  activeCell: CellInterface | null;
  newSelection: (coords: CellInterface) => void;
  setActiveCell: (coords: CellInterface | null) => void;
  selections: SelectionArea[];
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

/**
 * useSelection hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = (options?: UseSelectionOptions): SelectionResults => {
  const {
    gridRef,
    initialActiveCell = null,
    initialSelections = [],
    columnCount = 0,
    rowCount = 0,
  } = options || {};
  const [activeCell, setActiveCell] = useState<CellInterface | null>(
    initialActiveCell
  );
  const [selections, setSelections] = useState<SelectionArea[]>(
    initialSelections
  );
  const selectionStart = useRef<CellInterface>();
  const selectionEnd = useRef<CellInterface>();
  const isSelectionMode = useRef<boolean>();

  /* New selection */
  const newSelection = (start: CellInterface, end: CellInterface = start) => {
    selectionStart.current = start;
    selectionEnd.current = end;
    const bounds = selectionFromStartEnd(start, end);
    if (!bounds) return;
    setActiveCell({ rowIndex: bounds.top, columnIndex: bounds.left });
    setSelections([]);
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
  const modifySelection = (coords: CellInterface, setInProgress?: boolean) => {
    if (!selectionStart.current) return;
    selectionEnd.current = coords;
    const bounds = selectionFromStartEnd(selectionStart.current, coords);
    if (!bounds) return;

    /**
     * 1. Multiple selections on mousedown/mousemove
     * 2. Move the activeCell to newly selection. Done by appendSelection
     */
    setSelections((prevSelection) => {
      const len = prevSelection.length;
      if (!len) {
        return [{ bounds, inProgress: setInProgress ? true : false }];
      }
      return prevSelection.map((sel, i) => {
        if (len - 1 === i) {
          return {
            ...sel,
            bounds,
            inProgress: setInProgress ? true : false,
          };
        }
        return sel;
      });
    });
  };

  /* Adds a new selection, CMD key */
  const appendSelection = (coords: CellInterface) => {
    selectionStart.current = coords;
    selectionEnd.current = coords;
    const bounds = selectionFromStartEnd(coords, coords);
    if (!bounds) return;
    setActiveCell({ rowIndex: bounds.top, columnIndex: bounds.left });
    setSelections((prev) => [...prev, { bounds }]);
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

      /**
       * If the user is moving across the Active Cell, lets not add it to selection
       */
      if (
        activeCell?.rowIndex === rowIndex &&
        activeCell?.columnIndex === columnIndex
      )
        return;

      modifySelection({ rowIndex, columnIndex }, true);
    },
    [activeCell]
  );
  /**
   * Mouse up handler
   */
  const handleMouseUp = useCallback(() => {
    /* Reset selection mode */
    isSelectionMode.current = false;

    /* Update last selection */
    setSelections((prevSelection) => {
      const len = prevSelection.length;
      return prevSelection.map((sel, i) => {
        if (len - 1 === i) {
          return {
            ...sel,
            inProgress: false,
          };
        }
        return sel;
      });
    });
  }, []);

  /**
   * Navigate selection using keyboard
   * @param direction
   * @param modify
   */
  const keyNavigate = useCallback(
    (direction: Direction, modify?: boolean) => {
      if (
        !selectionStart.current ||
        !selectionEnd.current ||
        !gridRef ||
        !activeCell
      )
        return;
      var { rowIndex, columnIndex } = modify
        ? selectionEnd.current
        : activeCell;
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

      const scrollToCell = modify
        ? selectionEnd.current.rowIndex === rowIndex
          ? { columnIndex }
          : { rowIndex }
        : { rowIndex, columnIndex };

      if (modify) {
        modifySelection({ rowIndex, columnIndex });
      } else {
        newSelection({ rowIndex, columnIndex });
      }

      /* Keep the item in view */
      gridRef.current.scrollToItem(scrollToCell);
    },
    [activeCell]
  );

  // ⌘A or ⌘+Shift+Space
  const selectAll = () => {
    selectionStart.current = { rowIndex: 0, columnIndex: 0 };
    modifySelection({ rowIndex: rowCount - 1, columnIndex: columnCount - 1 });
  };

  // Shift+Space
  const selectColumn = () => {
    if (!selectionEnd.current || !selectionStart.current) return;
    selectionStart.current = {
      rowIndex: 0,
      columnIndex: selectionStart.current.columnIndex,
    };
    modifySelection({
      rowIndex: rowCount - 1,
      columnIndex: selectionEnd.current.columnIndex,
    });
  };

  // Shift+Space
  const selectRow = () => {
    if (!selectionEnd.current || !selectionStart.current) return;
    selectionStart.current = {
      rowIndex: selectionStart.current.rowIndex,
      columnIndex: 0,
    };
    modifySelection({
      rowIndex: selectionEnd.current.rowIndex,
      columnIndex: columnCount - 1,
    });
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isShiftKey = e.nativeEvent.shiftKey;
      const isMetaKey = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
      switch (e.nativeEvent.which) {
        case KeyCodes.Right:
          keyNavigate(Direction.Right, isShiftKey);
          break;

        case KeyCodes.Left:
          keyNavigate(Direction.Left, isShiftKey);
          break;

        // Up
        case KeyCodes.Up:
          keyNavigate(Direction.Up, isShiftKey);
          break;

        case KeyCodes.Down:
          keyNavigate(Direction.Down, isShiftKey);
          break;

        case KeyCodes.A:
          // Select All
          if (isMetaKey) {
            selectAll();
          }
          break;

        case KeyCodes.SPACE:
          if (isMetaKey && isShiftKey) {
            selectAll();
          } else if (isMetaKey) {
            selectColumn();
          } else if (isShiftKey) {
            selectRow();
          }
          break;

        case KeyCodes.Tab:
          if (isShiftKey) {
            keyNavigate(Direction.Left);
          } else {
            keyNavigate(Direction.Right);
          }
          e.preventDefault();
          break;
      }
    },
    [rowCount, columnCount, activeCell]
  );

  return {
    activeCell,
    selections,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onKeyDown: handleKeyDown,
    newSelection,
    setActiveCell,
  };
};

export default useSelection;
