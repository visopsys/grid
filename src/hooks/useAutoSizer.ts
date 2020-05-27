import React, {
  useCallback,
  useMemo,
  DependencyList,
  useState,
  useRef,
  useEffect,
} from "react";
import { IView, TGridRef, ICell, TItemSize } from "./../Grid";

interface IProps {
  gridRef: TGridRef;
  getValue: <T>(cell: ICell) => T;
  initialVisibleRows?: number;
}

interface IOut {
  columnWidth: TItemSize;
  onViewChange: (cells: IView) => void;
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
}: IProps) => {
  const autoSizer = useRef(AutoSizerCanvas());
  const [viewport, setViewport] = useState<IView>({
    rowStartIndex: 0,
    rowStopIndex: 0,
    columnStartIndex: 0,
    columnStopIndex: 0,
  });
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

  const handleViewChange = useCallback((cells: IView) => {
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
  context.font = "12px Arial";
  return {
    context,
    measureText: (text) => {
      return context.measureText(text);
    },
    setFont: () => {},
  };
};

export default useAutoSizer;
