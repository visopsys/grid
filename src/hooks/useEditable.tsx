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
import { SelectionKeys } from "./useSelection";

export interface UseEditableOptions {
  getEditor?: (cell: CellInterface | null) => React.ElementType;
  gridRef: React.MutableRefObject<GridRef>;
  getValue: (cell: CellInterface) => any;
  onChange?: (value: string, coords: CellInterface) => void;
  onSubmit?: (
    value: string,
    coords: CellInterface,
    nextCoords?: CellInterface
  ) => void;
  selections: AreaProps[];
}

export interface EditableResults {
  editorComponent: React.ReactNode;
  onDoubleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  onScroll: (props: ScrollCoords) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface EditorProps extends CellInterface {
  onChange: (value: string) => void;
  onSubmit: (sourceKey?: SelectionKeys) => void;
  onNext: () => void;
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
        onChange(e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter key
        if (e.which === SelectionKeys.Enter) {
          onSubmit && onSubmit();
        }

        if (e.which === SelectionKeys.Escape) {
          onHide();
        }

        if (e.which === SelectionKeys.Tab) {
          e.preventDefault();
          onSubmit && onSubmit(SelectionKeys.Tab);
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
  onSubmit,
  selections,
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (
        e.nativeEvent.which in SelectionKeys ||
        e.nativeEvent.ctrlKey ||
        e.nativeEvent.shiftKey
      )
        return;

      const { top: rowIndex, left: columnIndex } = selections[0];
      const initialValue = e.nativeEvent.key;
      makeEditable({ rowIndex, columnIndex }, initialValue);
    },
    [selections]
  );

  /* Save the value */
  const handleSubmit = useCallback(
    (sourceKey: SelectionKeys) => {
      if (!activeCell) return;
      const nextActiveCell =
        sourceKey === SelectionKeys.Tab
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
    onKeyDown: handleKeyDown,
  };
};

export default useEditable;
