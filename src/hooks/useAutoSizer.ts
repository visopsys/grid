import React, {
  useCallback,
  useMemo,
  DependencyList,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  ViewPortProps,
  GridMutableRef,
  CellInterface,
  ItemSizer,
} from "./../Grid";

interface IProps {
  gridRef: GridMutableRef;
  getValue: <T>(cell: CellInterface) => T;
  initialVisibleRows?: number;
}

interface AutoResizerResults {
  columnWidth: ItemSizer;
  onViewChange: (cells: ViewPortProps) => void;
}

/**
 * Auto sizer hook
 * @param param0
 * @param deps
 *
 * TODO
 * Dynamically resize columns after user has scrolled down/view port changed ?
 */
const useAutoSizer = ({
  gridRef,
  getValue,
  initialVisibleRows = 20,
}: IProps): AutoResizerResults => {
  const autoSizer = useRef(AutoSizerCanvas());
  const [viewport, setViewport] = useState<ViewPortProps>({
    rowStartIndex: 0,
    rowStopIndex: 0,
    columnStartIndex: 0,
    columnStopIndex: 0,
  });

  /* Update any styles, fonts if necessary */
  useEffect(() => {
    autoSizer.current.setFont();
  }, []);

  const getValueRef = useRef(getValue);
  /* Keep it in sync */
  getValueRef.current = getValue;

  const getColumnWidth = useCallback(
    (columnIndex: number) => {
      const { rowStartIndex, rowStopIndex } = viewport;
      const visibleRows = rowStopIndex || initialVisibleRows;
      let start = rowStartIndex;
      let maxWidth = 0;
      while (start < visibleRows) {
        const value = getValueRef.current({ rowIndex: start, columnIndex });
        const { width } = autoSizer.current.measureText(value);
        if (width > maxWidth) maxWidth = width + 10;
        start++;
      }
      return Math.max(20, maxWidth);
    },
    [viewport, initialVisibleRows]
  );

  const handleViewChange = useCallback((cells: ViewPortProps) => {
    setViewport(cells);
  }, []);

  return {
    columnWidth: getColumnWidth,
    onViewChange: handleViewChange,
  };
};

/* Canvas element */
const AutoSizerCanvas = () => {
  const canvas = <HTMLCanvasElement>document.createElement("canvas");
  const context = canvas.getContext("2d");
  return {
    context,
    measureText: (text) => {
      return context.measureText(text);
    },
    setFont: (font: string = "12px Arial") => {
      context.font = font;
    },
  };
};

export default useAutoSizer;
