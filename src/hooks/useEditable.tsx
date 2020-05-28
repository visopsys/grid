import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  RefAttributes,
  DependencyList,
} from "react";
import { ICell, TScrollCoords, IPosition, TGridRef } from "../Grid";

interface IProps {
  getEditor: (cell: ICell | null) => React.ElementType;
  gridRef: TGridRef;
  getValue: <T>(cell: ICell) => T;
  onChange: <T>(value: T, coords: ICell) => void;
}

interface IEditable {
  editorComponent: JSX.Element | null;
  onDoubleClick: (
    e: React.MouseEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number
  ) => void;
  onScroll: (props: TScrollCoords) => void;
}

interface EditorProps extends ICell {
  onChange: <T>(value: T) => void;
  onSubmit: () => void;
  onHide: () => void;
  scrollPosition: TScrollCoords;
  position: IPosition;
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

const getDefaultEditor = (cell: ICell | null) => DefaultEditor;

/**
 * Hook to make grid editable
 * @param param
 */
const useEditable = ({
  getEditor = getDefaultEditor,
  gridRef,
  getValue,
  onChange,
}: IProps): IEditable => {
  const [activeCell, setActiveCell] = useState<ICell | null>(null);
  const [value, setValue] = useState<string>("");
  const getValueRef = useRef(getValue);
  const wheelingRef = useRef<number | null>(null);
  const [position, setPosition] = useState<IPosition>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [scrollPosition, setScrollPosition] = useState<TScrollCoords>({
    scrollLeft: 0,
    scrollTop: 0,
  });

  /* Update the valueref when dependencies change */
  getValueRef.current = getValue;

  /* Activate edit mode */
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { rowIndex, columnIndex } = gridRef.current.getCellCoordsFromOffsets(
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

  /* Save scroll position to align the input */
  const handleScroll = useCallback((position: TScrollCoords) => {
    if (wheelingRef.current) return;
    wheelingRef.current = window.requestAnimationFrame(() => {
      wheelingRef.current = null;
      setScrollPosition(position);
    });
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
    onScroll: handleScroll,
  };
};

export default useEditable;
