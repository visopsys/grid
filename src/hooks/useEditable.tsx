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
  GridMutableRef,
} from "../Grid";

export interface UseEditableOptions {
  getEditor: (cell: CellInterface | null) => React.ElementType;
  gridRef: GridMutableRef;
  getValue: <T>(cell: CellInterface) => T;
  onChange: <T>(value: T, coords: CellInterface) => void;
}

export interface EditableResults {
  editorComponent: React.ReactNode;
  onDoubleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  onScroll: (props: ScrollCoords) => void;
}

export interface EditorProps extends CellInterface {
  onChange: <T>(value: T) => void;
  onSubmit: () => void;
  onHide: () => void;
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
    scrollPosition,
    position,
    onHide,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.select();
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
        outline: "none",
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange<string>(e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter key
        if (e.which === 13) {
          onSubmit && onSubmit();
        }
      }}
      onBlur={() => onHide()}
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
}: UseEditableOptions): EditableResults => {
  const [activeCell, setActiveCell] = useState<CellInterface | null>(null);
  const [value, setValue] = useState<string>("");
  const getValueRef = useRef(getValue);
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

  /* Update the valueref when dependencies change */
  getValueRef.current = getValue;

  /* Activate edit mode */
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffset(
      e.clientX,
      e.clientY
    );
    const activeCell = { rowIndex, columnIndex };
    if (!gridRef.current) return;
    const pos = gridRef.current.getCellOffsetFromCoords(activeCell);
    setActiveCell(activeCell);
    setValue(getValueRef.current<string>(activeCell) || "");
    setPosition(pos);
  }, []);

  /* Save the value */
  const handleSubmit = useCallback(() => {
    if (!activeCell) return;
    onChange && onChange(value, activeCell);
    setActiveCell(null);
  }, [value, activeCell]);

  /* When the input is blurred out */
  const handleHide = useCallback(() => {
    setActiveCell(null);
  }, []);

  /* Editor */
  const Editor = useMemo(() => getEditor(activeCell), [activeCell]);
  const editorComponent = activeCell ? (
    <Editor
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      position={position}
      scrollPosition={scrollPosition}
      onHide={handleHide}
    />
  ) : null;
  return {
    editorComponent,
    onDoubleClick: handleDoubleClick,
    onScroll: setScrollPosition,
  };
};

export default useEditable;
