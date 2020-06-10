import React, { useState, useCallback, useRef, useEffect } from "react";
import { SelectionArea, CellInterface, GridRef } from "./../Grid";
import {
  findNextCellWithinBounds,
  Align,
  getBoundedCells,
  cellIndentifier,
  mergedCellBounds,
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
  /**
   * Allow multiple selection
   */
  allowMultipleSelection?: boolean;
  /**
   * Allow deselect a selected area
   */
  allowDeselectSelection?: boolean;
  /**
   * If true, user can select multiple selections without pressing Ctrl/Cmd.
   * Useful for formula mode
   */
  persistantSelectionMode?: boolean;
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
 * Hook to enable selection in datagrid
 * @param initialSelection
 */
const useSelection = (options?: UseSelectionOptions): SelectionResults => {
  const {
    gridRef,
    initialActiveCell = null,
    initialSelections = [],
    columnCount = 0,
    rowCount = 0,
    allowMultipleSelection = true,
    persistantSelectionMode = false,
    allowDeselectSelection = true,
  } = options || {};
  const [activeCell, setActiveCell] = useState<CellInterface | null>(
    initialActiveCell
  );
  const [selections, setSelections] = useState<SelectionArea[]>(
    initialSelections
  );
  const selectionStart = useRef<CellInterface>();
  const selectionEnd = useRef<CellInterface>();
  const isSelecting = useRef<boolean>();
  const firstActiveCell = useRef<CellInterface | null>(null);
  /**
   * Need to store in ref because on mousemove and mouseup event that are
   * registered in document
   */
  const activeCellRef = useRef(activeCell);

  useEffect(() => {
    activeCellRef.current = activeCell;
  });

  /* New selection */
  const newSelection = (start: CellInterface, end: CellInterface = start) => {
    selectionStart.current = start;
    selectionEnd.current = end;
    const bounds = selectionFromStartEnd(start, end);
    if (!bounds) return;
    const coords = { rowIndex: bounds.top, columnIndex: bounds.left };
    /* Keep track  of first cell that was selected by user */
    firstActiveCell.current = coords;
    setActiveCell(coords);
    clearSelections();
  };

  /**
   * selection object from start, end
   * @param start
   * @param end
   *
   * TODO
   * Cater to Merged cells
   */
  const selectionFromStartEnd = (start: CellInterface, end: CellInterface) => {
    if (!gridRef) return null;
    const boundsStart = gridRef.current.getCellBounds(start);
    const boundsEnd = gridRef.current.getCellBounds(end);
    const bounds = {
      top: Math.min(boundsStart.top, boundsEnd.top),
      bottom: Math.max(boundsStart.bottom, boundsEnd.bottom),
      left: Math.min(boundsStart.left, boundsEnd.left),
      right: Math.max(boundsStart.right, boundsEnd.right),
    };
    /* Get max bounds of merged cell */
    const mergeCellBounds = mergedCellBounds(
      bounds,
      gridRef.current.getCellBounds
    );

    return {
      top: Math.min(mergeCellBounds.top, bounds.top),
      bottom: Math.max(mergeCellBounds.bottom, bounds.bottom),
      left: Math.min(mergeCellBounds.left, bounds.left),
      right: Math.max(mergeCellBounds.right, bounds.right),
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
  const appendSelection = (coords: CellInterface | null) => {
    if (!coords) return;
    selectionStart.current = coords;
    selectionEnd.current = coords;
    const bounds = selectionFromStartEnd(coords, coords);
    if (!bounds) return;
    setActiveCell({ rowIndex: bounds.top, columnIndex: bounds.left });
    setSelections((prev) => [...prev, { bounds }]);
  };

  const removeSelectionByIndex = useCallback(
    (index: number): SelectionArea[] => {
      const newSelection = selections.filter((_, idx) => idx !== index);
      setSelections(newSelection);
      return newSelection;
    },
    [selections]
  );

  const isEqualCells = (a: CellInterface | null, b: CellInterface | null) => {
    if (a === null || b === null) return false;
    return a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex;
  };

  const clearSelections = () => {
    setSelections(EMPTY_SELECTION);
  };

  const getPossibleActiveCellFromSelections = (
    selections: SelectionArea[]
  ): CellInterface | null => {
    if (!selections.length) return null;
    const { bounds } = selections[selections.length - 1];
    return {
      rowIndex: bounds.top,
      columnIndex: bounds.left,
    };
  };

  const cellIndexInSelection = (
    cell: CellInterface,
    selections: SelectionArea[]
  ) => {
    return selections.findIndex((sel) => {
      const boundedCells = getBoundedCells(sel.bounds);
      return boundedCells.has(cellIndentifier(cell.rowIndex, cell.columnIndex));
    });
  };

  const cellEqualsSelection = (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ): boolean => {
    if (cell === null) return false;
    return selections.some((sel) => {
      return (
        sel.bounds.left === cell.columnIndex &&
        sel.bounds.top === cell.rowIndex &&
        sel.bounds.right === cell.columnIndex &&
        sel.bounds.bottom === cell.rowIndex
      );
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
      const allowMultiple =
        persistantSelectionMode || (isMetaKey && allowMultipleSelection);
      const allowDeselect = allowDeselectSelection;
      const hasSelections = selections.length > 0;
      const isDeselecting = isMetaKey && allowDeselect;

      /* Attaching mousemove to document, so we can detect drag move */
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      /* Activate selection mode */
      isSelecting.current = true;

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
      if (activeCell && allowMultiple) {
        /**
         * User is adding activeCell to selection
         */
        if (isEqualCells(coords, activeCell) && !isDeselecting) {
          return;
        }
        /**
         * User is manually trying to select multiple selections,
         * So add the current active cell to the list
         */
        if (isMetaKey && !hasSelections) {
          appendSelection(activeCell);
        }

        /**
         * Check if this cell has already been selected (only for manual deselect)
         * Remove it from selection
         *
         * Future enhancements -> Split selection, so that 1 cell can be removed from range
         */
        if (isMetaKey && allowDeselect) {
          const cellIndex = cellIndexInSelection(coords, selections);
          if (cellIndex !== -1) {
            const newSelection = removeSelectionByIndex(cellIndex);
            const nextActiveCell = getPossibleActiveCellFromSelections(
              newSelection
            );
            if (nextActiveCell !== null) {
              setActiveCell(nextActiveCell);
            }
            if (
              newSelection.length === 1 &&
              cellEqualsSelection(nextActiveCell, newSelection)
            ) {
              /* Since we only have 1 cell, lets clear the selections and only keep activeCell */
              clearSelections();
            }
            return;
          }
        }

        /**
         * TODO
         * 1. Ability to remove selection
         * 2. Ability to remove from selection area
         * 3. Ability to switch activeCell if its part of removed selection
         */
        appendSelection(coords);
        return;
      }

      /* Trigger new selection */
      newSelection(coords);
    },
    [activeCell, selections, allowMultipleSelection, allowDeselectSelection]
  );

  /**
   * Mousemove handler
   */
  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    /* Exit if user is not in selection mode */
    if (!isSelecting.current || !gridRef) return;

    const coords = gridRef.current.getCellCoordsFromOffset(
      e.clientX,
      e.clientY
    );

    if (isEqualCells(firstActiveCell.current, coords)) {
      return clearSelections();
    }

    modifySelection(coords, true);

    gridRef.current.scrollToItem(coords);
  }, []);
  /**
   * Mouse up handler
   */
  const handleMouseUp = useCallback(() => {
    /* Reset selection mode */
    isSelecting.current = false;

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
  }, []);

  /**
   * Navigate selection using keyboard
   * @param direction
   * @param modify
   */
  const keyNavigate = useCallback(
    (direction: Direction, modify?: boolean, metaKeyPressed?: boolean) => {
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

      const currenBounds = gridRef.current.getCellBounds({
        rowIndex,
        columnIndex,
      });

      switch (direction) {
        case Direction.Up:
          if (isMergedCell) rowIndex = currenBounds.top;
          rowIndex = Math.max(rowIndex - 1, 0);
          // Shift + Ctrl/Commmand
          // TODO: Scroll to last contentful cell
          if (metaKeyPressed) rowIndex = 0;
          break;

        case Direction.Down:
          if (isMergedCell) rowIndex = currenBounds.bottom;
          rowIndex = Math.min(rowIndex + 1, rowCount - 1);
          // Shift + Ctrl/Commmand
          if (metaKeyPressed) rowIndex = rowCount - 1;
          break;

        case Direction.Left:
          if (isMergedCell) columnIndex = currenBounds.left;
          columnIndex = Math.max(columnIndex - 1, 0);
          // Shift + Ctrl/Commmand
          if (metaKeyPressed) columnIndex = 0;
          break;

        case Direction.Right:
          if (isMergedCell) columnIndex = currenBounds.right;
          columnIndex = Math.min(columnIndex + 1, columnCount - 1);
          // Shift + Ctrl/Commmand
          if (metaKeyPressed) columnIndex = columnCount - 1;
          break;
      }

      const newBounds = gridRef.current.getCellBounds({
        rowIndex,
        columnIndex,
      });
      const coords = { rowIndex: newBounds.top, columnIndex: newBounds.left };
      const scrollToCell = modify
        ? selectionEnd.current.rowIndex === coords.rowIndex
          ? // Scroll to a column
            { columnIndex: coords.columnIndex }
          : // Scroll to row
            { rowIndex: coords.rowIndex }
        : // Scroll to cell
          { rowIndex, columnIndex };

      const isUserNavigatingToActiveCell = isEqualCells(
        firstActiveCell.current,
        coords
      );

      if (modify && !isUserNavigatingToActiveCell) {
        modifySelection(coords);
      } else {
        newSelection(coords);
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
          keyNavigate(Direction.Right, isShiftKey, isMetaKey);
          break;

        case KeyCodes.Left:
          keyNavigate(Direction.Left, isShiftKey, isMetaKey);
          break;

        // Up
        case KeyCodes.Up:
          keyNavigate(Direction.Up, isShiftKey, isMetaKey);
          break;

        case KeyCodes.Down:
          keyNavigate(Direction.Down, isShiftKey, isMetaKey);
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
            const { bounds } = selections[selections.length - 1];
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
