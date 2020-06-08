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
import { KeyCodes, Movement, Direction } from "./../types";
import { findNextCellWithinBounds } from "../helpers";

export interface UseEditableOptions {
  getEditor?: (cell: CellInterface | null) => React.ElementType;
  gridRef: React.MutableRefObject<GridRef>;
  getValue: (cell: CellInterface) => any;
  onCancel?: (e?: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (value: string, activeCell: CellInterface) => void;
  onSubmit?: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface | null
  ) => void;
  onDelete?: (activeCell: CellInterface, selections: SelectionArea[]) => void;
  selections: SelectionArea[];
  activeCell: CellInterface | null;
  onBeforeEdit?: (coords: CellInterface) => boolean;
}

export interface EditableResults {
  editorComponent: React.ReactNode;
  onDoubleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  onScroll: (props: ScrollCoords) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface EditorProps extends CellInterface {
  selections: SelectionArea[];
  value?: string;
  onChange: (value: string, activeCell: CellInterface) => void;
  onSubmit?: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface | null
  ) => void;
  onCancel?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  scrollPosition: ScrollCoords;
  position: CellPosition;
  activeCell: CellInterface;
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
    scrollPosition,
    position,
    activeCell,
    nextFocusableCell,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <input
      type="text"
      ref={inputRef}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        width: position.width,
        height: position.height,
        padding: "0 3px",
        margin: 0,
        boxSizing: "border-box",
        border: "1px #1a73e8 solid",
        boxShadow: "0 2px 6px 2px rgba(60,64,67,.15)",
        outline: "none",
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value, activeCell)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!inputRef.current) return;
        // Enter key
        if (e.which === KeyCodes.Enter) {
          onSubmit &&
            onSubmit(
              inputRef.current.value,
              activeCell,
              nextFocusableCell(activeCell, Direction.Down)
            );
        }

        if (e.which === KeyCodes.Escape) {
          onCancel && onCancel(e);
        }

        if (e.which === KeyCodes.Tab) {
          e.preventDefault();
          onSubmit &&
            onSubmit(
              inputRef.current.value,
              activeCell,
              nextFocusableCell(activeCell, Direction.Right)
            );
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
  const initialActiveCell = useRef<CellInterface>();
  const [scrollPosition, setScrollPosition] = useState<ScrollCoords>({
    scrollLeft: 0,
    scrollTop: 0,
  });
  const showEditor = () => setShowEditor(true);
  const hideEditor = () => {
    setShowEditor(false);
    currentActiveCellRef.current = null;
  };

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
      let nextActiveCell =
        direction === Direction.Right
          ? {
              rowIndex: currentCell.rowIndex,
              columnIndex: currentCell.columnIndex + 1,
            }
          : {
              rowIndex:
                (initialActiveCell.current?.rowIndex || currentCell.rowIndex) +
                1,
              columnIndex:
                initialActiveCell.current?.columnIndex ||
                currentCell.columnIndex,
            };

      if (direction === Direction.Right && !initialActiveCell.current) {
        initialActiveCell.current = currentCell;
      }
      if (direction === Direction.Down) {
        /* Move to the next row + cell */
        initialActiveCell.current = undefined;

        /* If user has selected some cells and active cell is within this selection */
        if (selections.length && currentCell && gridRef) {
          const { bounds } = selections[0];
          const activeCellBounds = gridRef.current.getCellBounds(currentCell);
          const nextCell = findNextCellWithinBounds(
            activeCellBounds,
            bounds,
            Movement.downwards
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
      gridRef.current.focus();
    },
    []
  );

  const handleMouseDown = useCallback(() => {
    initialActiveCell.current = undefined;
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (!activeCell) return;
      setValue(value);
      onChange && onChange(value, activeCell);
    },
    [activeCell]
  );

  /* When the input is blurred out */
  const handleHide = useCallback((e) => {
    hideEditor();
    onCancel && onCancel();
    /* Keep the focus back in the grid */
    gridRef.current.focus();
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

  const editorComponent =
    isEditorShown && Editor ? (
      <Editor
        activeCell={editingCell}
        value={value}
        selections={selections}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleHide}
        position={cellPositon}
        nextFocusableCell={nextFocusableCell}
        onBlur={() => {
          if (currentActiveCellRef.current) {
            handleSubmit(value, currentActiveCellRef.current);
          }
        }}
      />
    ) : null;

  return {
    editorComponent,
    onDoubleClick: handleDoubleClick,
    onScroll: handleScroll,
    onKeyDown: handleKeyDown,
    onMouseDown: handleMouseDown,
  };
};

export default useEditable;
