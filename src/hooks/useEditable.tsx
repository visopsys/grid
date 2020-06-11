import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  CellInterface,
  ScrollCoords,
  CellPosition,
  GridRef,
  SelectionArea,
} from "../Grid";
import { KeyCodes, Direction } from "./../types";
import { findNextCellWithinBounds, AutoSizerCanvas } from "../helpers";

export interface UseEditableOptions {
  /**
   * Inject custom editors based on a cell
   */
  getEditor?: (cell: CellInterface | null) => React.ElementType;
  /**
   * Access grid methods
   */
  gridRef: React.MutableRefObject<GridRef>;
  /**
   * Value getter
   */
  getValue: (cell: CellInterface) => any;
  /**
   * Callback when user cancels editing
   */
  onCancel?: (e?: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Callback when user changes a value in editor
   */
  onChange: (value: string, activeCell: CellInterface) => void;
  /**
   * Callback when user submits a value. Use this to update state
   */
  onSubmit?: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface | null
  ) => void;
  /**
   * Callback when user selects an area and presses delete key
   */
  onDelete?: (activeCell: CellInterface, selections: SelectionArea[]) => void;
  /**
   * Currently selected cells, injected by useSelection
   */
  selections: SelectionArea[];
  /**
   * Active selected cell. This can change, if the user is in formula mode
   */
  activeCell: CellInterface | null;
  /**
   * Callback fired before editing. Can be used to prevent editing. Do not use it, Can be removed in next release.
   */
  onBeforeEdit?: (coords: CellInterface) => boolean;
}

export interface EditableResults {
  /**
   * Editor component that can be injected
   */
  editorComponent: React.ReactNode;
  /**
   * Double click listener, activates the grid
   */
  onDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * OnScroll listener to align the editor
   */
  onScroll: (props: ScrollCoords) => void;
  /**
   * Key down listeners
   */
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  /**
   * Mouse down listener which triggers Blur event on the editors
   */
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * Get next focusable cell based on current activeCell and direction user is moving
   */
  nextFocusableCell: (
    currentCell: CellInterface,
    direction: Direction
  ) => CellInterface;
}

export interface EditorProps extends CellInterface {
  /**
   * Currently selected bounds, useful for fomulas
   */
  selections: SelectionArea[];
  /**
   * Initial value of the cell
   */
  value?: string;
  /**
   * Callback when a value has changed.
   */
  onChange: (value: string, activeCell: CellInterface) => void;
  /**
   * Callback to submit the value back to data store
   */
  onSubmit?: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface | null
  ) => void;
  /**
   * On Cancel callbacks. Hides the editor
   */
  onCancel?: (e?: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Cell position, x, y, width and height
   */
  position: CellPosition;
  /**
   * Currently active cell, based on selection
   */
  activeCell: CellInterface;
  /**
   * Currrently edited cell
   */
  cell: CellInterface;
  /**
   * Next cell that should receive focus
   */
  nextFocusableCell: (
    activeCell: CellInterface,
    direction?: Direction
  ) => CellInterface | null;
}

/**
 * Default cell editor
 * @param props
 */
const DefaultEditor: React.FC<EditorProps> = (props) => {
  const {
    rowIndex,
    columnIndex,
    onChange,
    onSubmit,
    onCancel,
    position,
    cell,
    nextFocusableCell,
    value = "",
    activeCell,
    ...rest
  } = props;
  const borderWidth = 2;
  const padding = 12;
  const textSizer = useRef(AutoSizerCanvas("12px Arial"));
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { x = 0, y = 0, width = 0, height = 0 } = position;
  const getWidth = useCallback((text) => {
    const textWidth = textSizer.current.measureText(text)?.width || 0;
    return Math.max(textWidth + padding, width + borderWidth);
  }, []);
  const [inputWidth, setInputWidth] = useState(() => getWidth(value));
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    /* Focus cursor at the end */
    inputRef.current.selectionStart = value.length;
  }, []);
  return (
    <textarea
      rows={1}
      cols={1}
      ref={inputRef}
      defaultValue={value}
      style={{
        font: "12px Arial",
        lineHeight: height,
        position: "absolute",
        top: y - borderWidth / 2,
        left: x - borderWidth / 2,
        width: inputWidth,
        height: height + borderWidth,
        background: "white",
        padding: "0 4px",
        margin: 0,
        boxSizing: "border-box",
        border: "2px #1a73e8 solid",
        boxShadow: "0 2px 6px 2px rgba(60,64,67,.15)",
        outline: "none",
        resize: "none",
      }}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputWidth(getWidth(e.target.value));
        onChange(e.target.value, cell);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!inputRef.current) return;
        const isShiftKey = e.nativeEvent.shiftKey;
        const isMetaKey = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
        if (isShiftKey || isMetaKey) return;

        const value = inputRef.current.value;
        // Enter key
        if (e.which === KeyCodes.Enter) {
          onSubmit &&
            onSubmit(
              value,
              cell,
              nextFocusableCell(
                cell,
                isShiftKey ? Direction.Up : Direction.Down
              )
            );
        }

        if (e.which === KeyCodes.Escape) {
          onCancel && onCancel(e);
        }

        if (e.which === KeyCodes.Tab) {
          // e.preventDefault();
          onSubmit &&
            onSubmit(value, cell, nextFocusableCell(cell, Direction.Right));
        }
      }}
      {...rest}
    />
  );
};

const getDefaultEditor = (cell: CellInterface | null) => DefaultEditor;

/**
 * Hook to make grid editable
 * @param param
 */
const useEditable = ({
  getEditor = getDefaultEditor,
  gridRef,
  getValue,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  selections = [],
  activeCell,
  onBeforeEdit,
}: UseEditableOptions): EditableResults => {
  const [isEditorShown, setShowEditor] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [position, setPosition] = useState<CellPosition>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const currentActiveCellRef = useRef<CellInterface | null>(null);
  const initialActiveCell = useRef<CellInterface | null>();
  const [scrollPosition, setScrollPosition] = useState<ScrollCoords>({
    scrollLeft: 0,
    scrollTop: 0,
  });
  const isDirtyRef = useRef<boolean>(false);
  const showEditor = () => setShowEditor(true);
  const hideEditor = () => {
    setShowEditor(false);
    currentActiveCellRef.current = null;
  };
  const focusGrid = () => requestAnimationFrame(() => gridRef.current.focus());

  /**
   * Make a cell editable
   * @param coords
   * @param initialValue
   */
  const makeEditable = (coords: CellInterface, initialValue?: string) => {
    if (!gridRef.current) return;
    /* Call on before edit */
    if (onBeforeEdit && !onBeforeEdit(coords)) return;
    currentActiveCellRef.current = coords;
    const pos = gridRef.current.getCellOffsetFromCoords(coords);
    setValue(initialValue || getValue(coords) || "");
    showEditor();
    setPosition(pos);
  };

  /* Activate edit mode */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
        e.clientX,
        e.clientY
      );
      makeEditable({ rowIndex, columnIndex });
    },
    [getValue]
  );

  const isSelectionKey = (keyCode: number) => {
    return [
      KeyCodes.Right,
      KeyCodes.Left,
      KeyCodes.Up,
      KeyCodes.Down,
      KeyCodes.Meta,
      KeyCodes.Escape,
      KeyCodes.Tab,
      KeyCodes.Home,
      KeyCodes.End,
    ].includes(keyCode);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const keyCode = e.nativeEvent.keyCode;
      if (keyCode === KeyCodes.Tab && !initialActiveCell.current) {
        initialActiveCell.current = activeCell;
      }
      if (
        isSelectionKey(keyCode) ||
        e.nativeEvent.ctrlKey ||
        (e.nativeEvent.shiftKey &&
          (e.nativeEvent.key === "Shift" ||
            e.nativeEvent.which === KeyCodes.SPACE)) ||
        e.nativeEvent.metaKey ||
        e.nativeEvent.which === KeyCodes.ALT
      )
        return;

      /* If user has not made any selection yet */
      if (!activeCell) return;

      const { rowIndex, columnIndex } = activeCell;

      if (keyCode === KeyCodes.Delete || keyCode === KeyCodes.BackSpace) {
        // TODO: onbefore  delete
        onDelete && onDelete(activeCell, selections);
        return;
      }

      const initialValue =
        keyCode === KeyCodes.Enter // Enter key
          ? undefined
          : e.nativeEvent.key;
      makeEditable({ rowIndex, columnIndex }, initialValue);
    },
    [selections, activeCell]
  );

  /**
   * Get next focusable cell
   * Respects selection bounds
   */
  const nextFocusableCell = useCallback(
    (
      currentCell: CellInterface,
      direction: Direction = Direction.Right
    ): CellInterface => {
      /* Next immediate cell */
      let nextActiveCell = currentCell;
      switch (direction) {
        case Direction.Right:
          nextActiveCell = {
            rowIndex: currentCell.rowIndex,
            columnIndex: currentCell.columnIndex + 1,
          };
          break;
        case Direction.Up:
          nextActiveCell = {
            rowIndex: currentCell.rowIndex - 1,
            columnIndex: currentCell.columnIndex,
          };
          break;

        default:
          nextActiveCell = {
            rowIndex:
              (initialActiveCell.current?.rowIndex ?? currentCell.rowIndex) + 1,
            columnIndex:
              initialActiveCell.current?.columnIndex ?? currentCell.columnIndex,
          };
          break;
      }
      if (direction === Direction.Right && !initialActiveCell.current) {
        initialActiveCell.current = currentCell;
      }
      if (direction === Direction.Down || direction === Direction.Up) {
        /* Move to the next row + cell */
        initialActiveCell.current = undefined;

        /* If user has selected some cells and active cell is within this selection */
        if (selections.length && currentCell && gridRef) {
          const { bounds } = selections[selections.length - 1];
          const activeCellBounds = gridRef.current.getCellBounds(currentCell);
          const nextCell = findNextCellWithinBounds(
            activeCellBounds,
            bounds,
            direction
          );
          if (nextCell) nextActiveCell = nextCell;
        }
      }
      return nextActiveCell;
    },
    [selections]
  );

  /* Save the value */
  const handleSubmit = useCallback(
    (
      value: string,
      activeCell: CellInterface,
      nextActiveCell?: CellInterface
    ) => {
      /**
       * Hide the editor first, so that we can handle onBlur events
       * 1. Editor hides -> Submit
       * 2. If user clicks outside the grid, onBlur is called, if there is a activeCell, we do another submit
       */
      hideEditor();

      /* Save the new value */
      onSubmit && onSubmit(value, activeCell, nextActiveCell);

      /* Keep the focus */
      focusGrid();
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (currentActiveCellRef.current) {
        if (isDirtyRef.current) {
          handleSubmit(value, currentActiveCellRef.current);
        } else {
          handleHide();
        }
      }
      initialActiveCell.current = undefined;
    },
    [value]
  );

  const handleChange = useCallback(
    (newValue: string, activeCell) => {
      if (!activeCell) return;
      /* Check if the value has changed. Used to conditionally submit if editor is not in focus */
      isDirtyRef.current = newValue !== value;
      setValue(newValue);
      onChange && onChange(newValue, activeCell);
    },
    [value]
  );

  /* When the input is blurred out */
  const handleHide = useCallback(() => {
    hideEditor();
    onCancel && onCancel();
    /* Keep the focus back in the grid */
    focusGrid();
  }, []);

  const handleScroll = useCallback((scrollPos: ScrollCoords) => {
    setScrollPosition(scrollPos);
  }, []);

  /* Editor */
  const editingCell = currentActiveCellRef.current;
  const Editor = useMemo(() => {
    return editingCell
      ? getEditor(editingCell) || getDefaultEditor(editingCell)
      : null;
  }, [editingCell]);

  /**
   * Position of the cell
   */
  const cellPositon: CellPosition = useMemo(() => {
    return {
      ...position,
      x: (position.x as number) - scrollPosition.scrollLeft,
      y: (position.y as number) - scrollPosition.scrollTop,
    };
  }, [position, scrollPosition]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (currentActiveCellRef.current) {
      /* Keep the focus */
      focusGrid();
    }
  }, []);

  const editorComponent =
    isEditorShown && Editor ? (
      <Editor
        /* This is the cell that is currently being edited */
        cell={editingCell}
        activeCell={activeCell}
        value={value}
        selections={selections}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleHide}
        position={cellPositon}
        nextFocusableCell={nextFocusableCell}
        onBlur={handleBlur}
      />
    ) : null;

  return {
    editorComponent,
    onDoubleClick: handleDoubleClick,
    onScroll: handleScroll,
    onKeyDown: handleKeyDown,
    onMouseDown: handleMouseDown,
    nextFocusableCell,
  };
};

export default useEditable;
