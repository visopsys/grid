import React, { useState, useCallback, useRef } from "react";
import { SelectionArea, CellInterface, GridRef } from "./../Grid";
import {
  findNextCellWithinBounds,
  Align,
  getBoundedCells,
  cellIndentifier,
} from "./../helpers";
import { KeyCodes, Direction, Movement } from "./../types";

export interface UseSelectionOptions {
  /**
   * Access grid functions
   */
  gridRef?: React.MutableRefObject<GridRef>;
  /**
   * Initial selections
   */
  initialSelections?: SelectionArea[];
  /**
   * Option to set 0,0 as initially selected cell
   */
  initialActiveCell?: CellInterface | null;
  /**
   * No of columns in the grid
   */
  columnCount?: number;
  /**
   * No of rows in the grid
   */
  rowCount?: number;
}

export interface SelectionResults {
  /**
   * Active selected cell
   */
  activeCell: CellInterface | null;
  /**
   * Use this to invoke a new selection. All old selection will be cleared
   */
  newSelection: (coords: CellInterface) => void;
  /**
   * Use this to update selections without clearning old selection.
   */
  setSelections: (selection: SelectionArea[]) => void;
  /**
   * Set the currently active cell
   */
  setActiveCell: (coords: CellInterface | null) => void;
  /**
   * Array of all selection bounds
   */
  selections: SelectionArea[];
  /**
   * Handler for mousedown, use to set activeCell
   */
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * Used to move selections based on pressed key
   */
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

const EMPTY_SELECTION: SelectionArea[] = [];

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
    setSelections(EMPTY_SELECTION);
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

  const removeSelection = useCallback(
    (index: number): [SelectionArea | null, number] => {
      const prev = selections[index - 1];
      setSelections((prev) => prev.filter((_, idx) => idx !== index));
      return [prev, selections.length - 1];
    },
    [selections]
  );

  const cellIndexInSelection = (
    cell: CellInterface,
    selections: SelectionArea[]
  ) => {
    return selections.findIndex((sel) => {
      const boundedCells = getBoundedCells(sel.bounds);
      return boundedCells.has(cellIndentifier(cell.rowIndex, cell.columnIndex));
    });
  };

  /**
   * Triggers a new selection start
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      /* Exit early if grid is not initialized */
      if (!gridRef || !gridRef.current) return;

      const isShiftKey = e.nativeEvent.shiftKey;
      const isMetaKey = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;

      /* Attaching mousemove to document, so we can detect drag move */
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

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
      if (isShiftKey) {
        modifySelection(coords);
        return;
      }

      /* Command  or Control key */
      if (isMetaKey) {
        appendSelection(coords);
        return;
      }

      /* Trigger new selection */
      newSelection(coords);
    },
    [activeCell, selections]
  );

  /**
   * Mousemove handler
   */
  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
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

      gridRef.current.scrollToItem({ rowIndex, columnIndex });
    },
    [activeCell]
  );
  /**
   * Mouse up handler
   */
  const handleMouseUp = useCallback(() => {
    /* Reset selection mode */
    isSelectionMode.current = false;

    /* Remove listener */
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

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
  }, [selections]);

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

  // Ctrl+Space
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

  //  Home
  const selectFirstCellInRow = () => {
    if (!selectionStart.current) return;
    const cell = {
      rowIndex: selectionStart.current.rowIndex,
      columnIndex: 0,
    };
    newSelection(cell);

    gridRef?.current.scrollToItem(cell);
  };
  //  End
  const selectLastCellInRow = () => {
    if (!selectionStart.current) return;
    const cell = {
      rowIndex: selectionStart.current.rowIndex,
      columnIndex: columnCount - 1,
    };
    newSelection(cell);
    gridRef?.current.scrollToItem(cell);
  };

  //  ⌘+Home
  const selectFirstCellInColumn = () => {
    if (!selectionStart.current) return;
    const cell = {
      rowIndex: 0,
      columnIndex: selectionStart.current.columnIndex,
    };
    newSelection(cell);

    gridRef?.current.scrollToItem(cell);
  };
  //  ⌘+End
  const selectLastCellInColumn = () => {
    if (!selectionStart.current) return;
    const cell = {
      rowIndex: rowCount - 1,
      columnIndex: selectionStart.current.columnIndex,
    };
    newSelection(cell);
    gridRef?.current.scrollToItem(cell);
  };

  //  ⌘+Backspace
  const scrollToActiveCell = () => {
    if (!activeCell) return;
    gridRef?.current.scrollToItem(activeCell, Align.smart);
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
          if (isMetaKey) {
            selectAll();
          }
          break;

        case KeyCodes.Home:
          if (isMetaKey) {
            selectFirstCellInColumn();
          } else {
            selectFirstCellInRow();
          }
          break;

        case KeyCodes.End:
          if (isMetaKey) {
            selectLastCellInColumn();
          } else {
            selectLastCellInRow();
          }
          break;

        case KeyCodes.BackSpace:
          if (isMetaKey) scrollToActiveCell();
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
          /* Cycle through the selections if selections.length > 0 */
          if (selections.length && activeCell && gridRef) {
            const { bounds } = selections[0];
            const activeCellBounds = gridRef.current.getCellBounds(activeCell);
            const direction = isShiftKey
              ? Movement.backwards
              : Movement.forwards;
            const nextCell = findNextCellWithinBounds(
              activeCellBounds,
              bounds,
              direction
            );
            if (nextCell) setActiveCell(nextCell);
          } else {
            if (isShiftKey) {
              keyNavigate(Direction.Left);
            } else {
              keyNavigate(Direction.Right);
            }
          }
          e.preventDefault();
          break;
      }
    },
    [rowCount, columnCount, activeCell, selections]
  );

  return {
    activeCell,
    selections,
    onMouseDown: handleMouseDown,
    onKeyDown: handleKeyDown,
    newSelection,
    setSelections,
    setActiveCell,
  };
};

export default useSelection;
