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
  AreaProps,
} from "../Grid";
import { KeyCodes } from "./../types";

export interface UseEditableOptions {
  getEditor?: (cell: CellInterface | null) => React.ElementType;
  gridRef: React.MutableRefObject<GridRef>;
  getValue: (cell: CellInterface) => any;
  onChange?: (value: string, coords: CellInterface) => void;
  onCancel?: () => void;
  onSubmit?: (
    value: string,
    coords: CellInterface,
    nextCoords?: CellInterface
  ) => void;
  onDelete: (selections: AreaProps[]) => void;
  selections: AreaProps[];
  onBeforeEdit?: (coords: CellInterface) => boolean;
}

export interface EditableResults {
  editorComponent: React.ReactNode;
  onDoubleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  onScroll: (props: ScrollCoords) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface EditorProps extends CellInterface {
  onChange: (value: string) => void;
  onSubmit?: (sourceKey?: KeyCodes) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onEscape?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  scrollPosition: ScrollCoords;
  position: CellPosition;
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
    onBlur,
    onEscape,
    scrollPosition,
    position,

    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const escapePressedRef = useRef(false);
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, []);
  return (
    <input
      type="text"
      ref={inputRef}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        transform: `translate3d(-${scrollPosition.scrollLeft}px, -${scrollPosition.scrollTop}px, 0)`,
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
        onChange(e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        escapePressedRef.current = false;
        // Enter key
        if (e.which === KeyCodes.Enter) {
          onSubmit && onSubmit();
        }

        if (e.which === KeyCodes.Escape) {
          escapePressedRef.current = true;
          onEscape && onEscape(e);
        }

        if (e.which === KeyCodes.Tab) {
          e.preventDefault();
          onSubmit && onSubmit(KeyCodes.Tab);
        }
      }}
      onBlur={(e) => {
        /* If the user has pressed Escape key, do not call onBlur,
           Since we are any hiding the input
         */
        if (escapePressedRef.current) return;
        onBlur && onBlur(e);
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
  onBeforeEdit,
}: UseEditableOptions): EditableResults => {
  const [activeCell, setActiveCell] = useState<CellInterface | null>(null);
  const [value, setValue] = useState<string>("");
  const [position, setPosition] = useState<CellPosition>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [scrollPosition, setScrollPosition] = useState<ScrollCoords>({
    scrollLeft: 0,
    scrollTop: 0,
  });

  const makeEditable = (coords: CellInterface, initialValue?: string) => {
    if (!gridRef.current) return;
    /* Call on before edit */
    if (onBeforeEdit && !onBeforeEdit(coords)) return;
    const pos = gridRef.current.getCellOffsetFromCoords(coords);
    setActiveCell(coords);
    setValue(initialValue || getValue(coords) || "");
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
    ].includes(keyCode);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const keyCode = e.nativeEvent.keyCode;
      if (
        isSelectionKey(keyCode) ||
        e.nativeEvent.ctrlKey ||
        e.nativeEvent.shiftKey
      )
        return;

      /* If user has not made any selection yet */
      if (!selections.length) return;

      const { top: rowIndex, left: columnIndex } = selections[0];

      if (keyCode === KeyCodes.Delete || keyCode === KeyCodes.BackSpace) {
        return onDelete(selections);
      }
      const initialValue =
        keyCode === KeyCodes.Enter // Enter key
          ? undefined
          : e.nativeEvent.key;
      makeEditable({ rowIndex, columnIndex }, initialValue);
    },
    [selections]
  );

  /* Save the value */
  const handleSubmit = useCallback(
    (sourceKey: KeyCodes) => {
      if (!activeCell) return;
      const nextActiveCell =
        sourceKey === KeyCodes.Tab
          ? {
              rowIndex: activeCell.rowIndex,
              columnIndex: activeCell.columnIndex + 1,
            }
          : {
              rowIndex: activeCell.rowIndex + 1,
              columnIndex: activeCell.columnIndex,
            };

      onSubmit && onSubmit(value, activeCell, nextActiveCell);
      setActiveCell(null);
      /* Keep the focus */
      gridRef.current.focus();
    },
    [value, activeCell]
  );

  const handleChange = useCallback(
    (value: string) => {
      if (!activeCell) return;
      setValue(value);
      onChange && onChange(value, activeCell);
    },
    [activeCell]
  );

  /* When the input is blurred out */
  const handleHide = useCallback(
    (e) => {
      setActiveCell(null);
      onCancel && onCancel();
      /* Keep the focus back in the grid */
      gridRef.current.focus();
    },
    [activeCell]
  );

  /* Update value onBlur */
  const handleBlur = useCallback(() => {
    if (!activeCell) return;
    onSubmit && onSubmit(value, activeCell);
    setActiveCell(null);
  }, [value, activeCell]);

  /* Editor */
  const Editor = useMemo(() => getEditor(activeCell), [activeCell]);
  const editorComponent = activeCell ? (
    <Editor
      value={value}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      onEscape={handleHide}
      position={position}
      scrollPosition={scrollPosition}
    />
  ) : null;
  return {
    editorComponent,
    onDoubleClick: handleDoubleClick,
    onScroll: setScrollPosition,
    onKeyDown: handleKeyDown,
  };
};

export default useEditable;
