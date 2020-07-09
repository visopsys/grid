import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  memo,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Grid, {
  RendererProps,
  useSelection,
  GridRef,
  useEditable,
  useCopyPaste,
  CellInterface,
  SelectionArea,
  ScrollCoords,
  AreaProps,
  useSizer as useAutoSizer,
  CellOverlay,
  useTouch,
  useFilter,
  FilterView,
  FilterDefinition,
} from "@rowsncolumns/grid";
import { debounce, cellIdentifier } from "@rowsncolumns/grid/dist/helpers";
import { ThemeProvider, ColorModeProvider } from "@chakra-ui/core";
import {
  COLUMN_HEADER_WIDTH,
  DEFAULT_COLUMN_WIDTH,
  ROW_HEADER_HEIGHT,
  DEFAULT_ROW_HEIGHT,
  DARK_MODE_COLOR_LIGHT,
  HEADER_BORDER_COLOR,
  CELL_BORDER_COLOR,
} from "./../constants";
import HeaderCell from "./../HeaderCell";
import Cell from "./../Cell";
import { GridWrapper, ThemeType } from "./../styled";
import { Cells, CellConfig, SizeType } from "../Spreadsheet";
import { Direction } from "@rowsncolumns/grid/dist/types";
import { AXIS, STROKE_FORMATTING, FormatType, SELECTION_MODE } from "../types";
import Editor from "./../Editor";
import ContextMenu from "./../ContextMenu";
import { EditorProps } from "@rowsncolumns/grid/dist/hooks/useEditable";
import { CustomEditorProps } from "../Editor/Editor";
import FilterComponent from "./../FilterComponent";
import { FILTER_ICON_DIM } from "../FilterIcon/FilterIcon";
import usePrevious from "./../hooks/usePrevious";

const EMPTY_ARRAY: any = [];
const EMPTY_OBJECT: any = {};

export interface SheetGridProps {
  theme?: ThemeType;
  minColumnWidth?: number;
  minRowHeight?: number;
  rowCount?: number;
  columnCount?: number;
  CellRenderer?: React.ReactType;
  HeaderCellRenderer?: React.ReactType;
  width?: number;
  height?: number;
  cells: Cells;
  onChange: (changes: Cells) => void;
  onFill?: (
    activeCell: CellInterface,
    currentSelection: SelectionArea | null,
    selections: SelectionArea[]
  ) => void;
  activeCell: CellInterface | null;
  selections: SelectionArea[];
  onSheetChange: (props: any) => void;
  selectedSheet: string;
  onScroll: (state: ScrollCoords) => void;
  scrollState?: ScrollCoords;
  onActiveCellChange?: (cell: CellInterface | null, value?: string) => void;
  onSelectionChange?: (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onActiveCellValueChange: (value: string) => void;
  onDelete?: (activeCell: CellInterface, selections: SelectionArea[]) => void;
  formatter?: FormatType;
  onResize?: (axis: AXIS, index: number, dimension: number) => void;
  columnSizes?: SizeType;
  rowSizes?: SizeType;
  mergedCells?: AreaProps[];
  frozenRows?: number;
  frozenColumns?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  hiddenRows?: number[];
  hiddenColumns?: number[];
  onPaste?: (
    rows: (string | null)[][],
    activeCell: CellInterface | null
  ) => void;
  onCut?: (selection: SelectionArea) => void;
  onInsertRow?: (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onDeleteRow?: (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onInsertColumn?: (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  onDeleteColumn?: (
    cell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  showGridLines?: boolean;
  CellEditor?: React.ReactType<CustomEditorProps>;
  allowMultipleSelection?: boolean;
  selectionMode?: SELECTION_MODE;
  isLightMode?: boolean;
  filterViews?: FilterView[];
  onChangeFilter: (
    filterIndex: number,
    columnIndex: number,
    filter: FilterDefinition
  ) => void;
}

export interface RowColSelection {
  rows: number[];
  cols: number[];
}

export type RefAttributeGrid = {
  ref?: React.Ref<WorkbookGridRef>;
};

export type WorkbookGridRef = {
  getNextFocusableCell: (
    cell: CellInterface,
    direction: Direction
  ) => CellInterface | null;
  setActiveCell: (cell: CellInterface | null) => void;
  setSelections: (selection: SelectionArea[]) => void;
  resetAfterIndices?: (
    coords: CellInterface,
    shouldForceUpdate?: boolean
  ) => void;
  focus: () => void;
  makeEditable: (cell: CellInterface, value?: string, focus?: boolean) => void;
  setEditorValue: (value: string, activeCell: CellInterface) => void;
  hideEditor: () => void;
  submitEditor: (
    value: string,
    activeCell: CellInterface,
    nextActiveCell?: CellInterface | null
  ) => void;
  cancelEditor: () => void;
  resizeColumns?: (indices: number[]) => void;
  resizeRows?: (indices: number[]) => void;
  getCellBounds?: (coords: CellInterface) => AreaProps;
  getScrollPosition?: () => ScrollCoords;
};

export interface ContextMenuProps {
  left: number;
  top: number;
}

/**
 * Grid component
 * @param props
 */
const SheetGrid: React.FC<SheetGridProps & RefAttributeGrid> = memo(
  forwardRef<WorkbookGridRef, SheetGridProps>((props, forwardedRef) => {
    const {
      theme,
      minColumnWidth = DEFAULT_COLUMN_WIDTH,
      minRowHeight = DEFAULT_ROW_HEIGHT,
      rowCount = 1000,
      columnCount = 1000,
      width,
      height,
      CellRenderer = Cell,
      HeaderCellRenderer = HeaderCell,
      cells,
      onChange,
      onFill,
      onSheetChange,
      activeCell: initialActiveCell,
      selections: initialSelections = EMPTY_ARRAY as SelectionArea[],
      selectedSheet,
      onScroll,
      scrollState,
      onActiveCellChange,
      onActiveCellValueChange,
      onDelete,
      formatter,
      onResize,
      columnSizes = EMPTY_OBJECT as SizeType,
      rowSizes = EMPTY_OBJECT as SizeType,
      mergedCells,
      frozenRows = 0,
      frozenColumns = 0,
      onKeyDown,
      hiddenColumns = EMPTY_ARRAY as number[],
      hiddenRows: userHiddenRows = EMPTY_ARRAY as number[],
      filterViews = EMPTY_ARRAY as FilterView[],
      onPaste,
      onCut,
      onInsertRow,
      onInsertColumn,
      onDeleteColumn,
      onDeleteRow,
      showGridLines,
      CellEditor = Editor,
      allowMultipleSelection = true,
      onSelectionChange,
      selectionMode,
      isLightMode,
      onChangeFilter,
    } = props;
    const gridRef = useRef<GridRef | null>(null);
    const onSheetChangeRef = useRef(debounce(onSheetChange, 100));
    const actualFrozenRows = Math.max(1, frozenRows + 1);
    const actualFrozenColumns = Math.max(1, frozenColumns + 1);
    const debounceScroll = useRef(debounce(onScroll, 500));
    const [
      contextMenuProps,
      setContextMenuProps,
    ] = useState<ContextMenuProps | null>(null);
    const borderStyles = useMemo(() => {
      return filterViews.map((filter) => {
        return {
          bounds: filter.bounds,
          style: {
            strokeWidth: 1,
            stroke: "green",
          },
        };
      });
    }, [filterViews]);

    /* Cell where filter icon will appear */
    const filterHeaderCells = useMemo((): string[] => {
      const initialValue: string[] = [];
      return filterViews.reduce((acc, filter) => {
        const { bounds } = filter;
        for (let i = bounds.left; i <= bounds.right; i++) {
          acc.push(cellIdentifier(bounds.top, i));
        }
        return acc;
      }, initialValue);
    }, [filterViews]);

    /* Filter columns */
    const columnsWithFilter = useMemo(() => {
      const initialValue: number[] = [];
      return filterViews.reduce((acc, filter) => {
        const { bounds } = filter;
        for (let i = bounds.left; i <= bounds.right; i++) {
          acc.push(i);
        }
        return acc;
      }, initialValue);
    }, [filterViews]);

    /* Has filter */
    const columnHasFilter = useCallback(
      (columnIndex) => {
        return columnsWithFilter.includes(columnIndex);
      },
      [columnsWithFilter]
    );

    useImperativeHandle(forwardedRef, () => {
      return {
        getNextFocusableCell,
        setActiveCell,
        setSelections,
        focus: () => gridRef.current?.focus(),
        resetAfterIndices: gridRef.current?.resetAfterIndices,
        makeEditable,
        setEditorValue: setValue,
        hideEditor,
        submitEditor,
        cancelEditor,
        resizeColumns: gridRef.current?.resizeColumns,
        resizeRows: gridRef.current?.resizeRows,
        getCellBounds: gridRef.current?.getCellBounds,
        getScrollPosition: gridRef.current?.getScrollPosition,
      };
    });

    /**
     * Get cell value or text
     */
    const getValue = useCallback(
      (cell: CellInterface | null, obj = false) => {
        if (!cell) return void 0;
        const { rowIndex, columnIndex } = cell;
        return rowIndex in cells
          ? obj
            ? cells[rowIndex]?.[columnIndex]
            : cells[rowIndex]?.[columnIndex]?.text
          : void 0;
      },
      [cells]
    );

    /* Enable touch */
    const {
      isTouchDevice,
      scrollTo: scrollToTouch,
      scrollToTop: scrollToTopTouch,
    } = useTouch({
      gridRef,
    });

    /**
     * Column resizer
     */
    const { getColumnWidth, onViewChange } = useAutoSizer({
      gridRef,
      minColumnWidth,
      getValue: (cell: CellInterface) => {
        const cellConfig = getValue(cell, true) as CellConfig;
        const formattedValue = formatter
          ? formatter(cellConfig?.text, cellConfig?.datatype, cellConfig)
          : cellConfig.text;
        return { ...cellConfig, text: formattedValue };
      },
      columnSizes,
      autoResize: false,
      resizeOnScroll: false,
    });

    /**
     * Selection
     */
    const {
      selections,
      activeCell,
      setActiveCell,
      setSelections,
      modifySelection,
      newSelection,
      clearLastSelection,
      ...selectionProps
    } = useSelection({
      allowMultipleSelection,
      initialActiveCell,
      initialSelections,
      gridRef,
      rowCount,
      columnCount,
      onFill,
    });

    /**
     * Copy paste
     */
    const { copy, paste, cut } = useCopyPaste({
      gridRef,
      selections,
      activeCell,
      getValue,
      onPaste,
      onCut,
    });

    const handleChangeFilter = useCallback(
      (filterIndex: number, columnIndex: number, filter: FilterDefinition) => {
        onChangeFilter?.(filterIndex, columnIndex, filter);
        hideFilter();
      },
      []
    );

    /**
     * Filter
     */
    const { filterComponent, showFilter, hideFilter } = useFilter({
      gridRef,
      getFilterComponent: (cell) => {
        return (props) => {
          return (
            <FilterComponent
              {...props}
              onChange={handleChangeFilter}
              onCancel={hideFilter}
            />
          );
        };
      },
      getValue,
    });

    const handleFilterClick = useCallback(
      (_, cell: CellInterface) => {
        const filterIndex = filterViews.findIndex(
          (views) => views.bounds.top === cell.rowIndex
        );
        const filterView = filterViews[filterIndex];
        const currentFilter = filterView?.filters[cell.columnIndex];
        if (!filterView) return;
        showFilter(cell, filterIndex, filterView, currentFilter);
      },
      [filterViews]
    );

    /**
     * Apply filter on the cells
     */
    const hiddenFilterRows = useMemo(() => {
      const rows = [];
      for (let i = 0; i < filterViews.length; i++) {
        const filterView = filterViews[i];
        const { bounds, filters } = filterView;
        for (const columnIndex in filters) {
          const { values, operator } = filters[columnIndex];
          for (let k = bounds.top + 1; k <= bounds.bottom; k++) {
            const cell = { rowIndex: k, columnIndex: parseInt(columnIndex) };
            const value = getValue(cell) || "";
            if (!values.includes(value)) {
              rows.push(k);
            }
          }
        }
      }
      return rows;
    }, [filterViews]);

    const hiddenRows = useMemo(() => {
      return userHiddenRows.concat(hiddenFilterRows);
    }, [hiddenFilterRows, userHiddenRows]);

    const previousHiddenRows = usePrevious<number[]>(hiddenRows);

    /**
     * Adjusts a column
     */
    const handleAdjustColumn = useCallback(
      (columnIndex: number) => {
        const width =
          getColumnWidth(columnIndex) +
          (columnHasFilter(columnIndex) ? FILTER_ICON_DIM : 0);
        onResize?.(AXIS.X, columnIndex, width);
      },
      [cells]
    );

    /**
     * Check if selections are in
     */
    useEffect(() => {
      onActiveCellChange?.(
        activeCell,
        getValue(activeCell) as string | undefined
      );
    }, [activeCell]);

    /**
     * Save it back to sheet
     */
    useEffect(() => {
      /* Batch this cos of debounce */
      onSheetChangeRef.current?.({ selections, activeCell });

      /* Callback */
      onSelectionChange?.(activeCell, selections);
    }, [activeCell, selections]);

    /**
     * If grid changes, lets restore the state
     */
    useEffect(() => {
      if (scrollState) {
        isTouchDevice
          ? scrollToTouch(scrollState)
          : gridRef.current?.scrollTo(scrollState);
      } else {
        isTouchDevice ? scrollToTopTouch() : gridRef.current?.scrollToTop();
      }
      setActiveCell(initialActiveCell, false);
      setSelections(initialSelections);
      /* Hide filter */
      // hideFilter()
      const rowIndices = Object.keys(rowSizes).map(Number);
      const colIndices = Object.keys(columnSizes).map(Number);
      gridRef.current?.resetAfterIndices?.({
        rowIndex: rowIndices.length
          ? Math.min(rowCount, ...rowIndices, ...hiddenRows)
          : 0,
        columnIndex: colIndices.length
          ? Math.min(columnCount, ...colIndices, ...hiddenColumns)
          : 0,
      });
    }, [selectedSheet]);

    /* TODO : Improve */
    useEffect(() => {
      if (!hiddenRows.length && !previousHiddenRows?.length) return;
      const prev = previousHiddenRows ? previousHiddenRows : [];
      gridRef.current?.resetAfterIndices({
        rowIndex: hiddenRows.length
          ? Math.min(...hiddenRows, rowCount, ...prev)
          : 0,
      });
    }, [hiddenRows]);

    const handleSubmit = useCallback(
      (
        value: React.ReactText,
        cell: CellInterface,
        nextActiveCell?: CellInterface | null
      ) => {
        const { rowIndex, columnIndex } = cell;
        const changes = {
          [rowIndex]: {
            [columnIndex]: {
              text: value,
            },
          },
        };

        onChange?.(changes);

        /* Focus on next active cell */
        if (nextActiveCell) setActiveCell(nextActiveCell, true);
      },
      [cells]
    );

    /**
     * Editable
     */
    const {
      editorComponent,
      isEditInProgress,
      nextFocusableCell,
      makeEditable,
      setValue,
      hideEditor,
      submitEditor,
      cancelEditor,
      editingCell,
      showEditor,
      ...editableProps
    } = useEditable({
      getEditor: (cell: CellInterface | null) => {
        const config = getValue(cell, true) as CellConfig;
        return (props: EditorProps) => (
          <CellEditor
            {...props}
            background={config?.fill}
            color={config?.color}
            fontSize={config?.fontSize}
            fontFamily={config?.fontFamily}
          />
        );
      },
      frozenRows: actualFrozenRows,
      frozenColumns: actualFrozenColumns,
      gridRef,
      selections,
      activeCell,
      onSubmit: handleSubmit,
      getValue,
      onChange: onActiveCellValueChange,
      canEdit: (cell: CellInterface) => {
        if (cell.rowIndex === 0 || cell.columnIndex === 0) return false;
        const isReadOnly = (getValue(cell, true) as CellConfig)?.readOnly;
        if (isReadOnly) return false;
        return true;
      },
      onDelete: onDelete,
    });

    const getNextFocusableCell = useCallback(
      (cell: CellInterface, direction: Direction): CellInterface | null => {
        return nextFocusableCell(cell, direction);
      },
      []
    );

    /* Width calculator */
    const columnWidth = useCallback(
      (columnIndex: number) => {
        if (columnIndex === 0) return COLUMN_HEADER_WIDTH;
        if (hiddenColumns?.indexOf(columnIndex) !== -1) return 0;
        return columnSizes[columnIndex] ?? minColumnWidth;
      },
      [minColumnWidth, columnSizes, selectedSheet]
    );
    const rowHeight = useCallback(
      (rowIndex: number) => {
        if (rowIndex === 0) return ROW_HEADER_HEIGHT;
        if (hiddenRows?.indexOf(rowIndex) !== -1) return 0;
        return rowSizes[rowIndex] ?? minRowHeight;
      },
      [minRowHeight, hiddenRows, rowSizes, selectedSheet]
    );
    const contextWrapper = useCallback(
      (children) => {
        return (
          <ThemeProvider theme={theme}>
            <ColorModeProvider>{children}</ColorModeProvider>
          </ThemeProvider>
        );
      },
      [theme]
    );
    const selectedRowsAndCols: RowColSelection = useMemo(
      () =>
        selections.reduce(
          (acc, { bounds }) => {
            for (let i = bounds.left; i <= bounds.right; i++) {
              acc.cols.push(i);
            }
            for (let i = bounds.top; i <= bounds.bottom; i++) {
              acc.rows.push(i);
            }
            return acc;
          },
          { rows: [], cols: [] } as RowColSelection
        ),
      [selections]
    );

    const itemRenderer = useCallback(
      (props: RendererProps) => {
        const { rowIndex, columnIndex } = props;
        const isRowHeader = rowIndex === 0;
        const isColumnHeader = columnIndex === 0;
        const isHidden =
          hiddenRows?.indexOf(rowIndex) !== -1 ||
          hiddenColumns?.indexOf(columnIndex) !== -1;
        if (isHidden) return null;
        const isHeaderActive =
          isRowHeader || isColumnHeader
            ? isRowHeader
              ? activeCell?.columnIndex === columnIndex ||
                selectedRowsAndCols.cols.includes(columnIndex)
              : activeCell?.rowIndex === rowIndex ||
                selectedRowsAndCols.rows.includes(rowIndex)
            : false;
        const cell = { rowIndex, columnIndex };
        if (rowIndex === 0 || columnIndex === 0) {
          return (
            <HeaderCellRenderer
              {...props}
              isLightMode={isLightMode}
              isActive={isHeaderActive}
              onResize={onResize}
              onAdjustColumn={handleAdjustColumn}
              theme={theme}
            />
          );
        }
        /* Row, cell column selection modes */
        const isRowSelected =
          selectionMode === SELECTION_MODE.ROW ||
          selectionMode === SELECTION_MODE.BOTH
            ? activeCell?.rowIndex === rowIndex ||
              selectedRowsAndCols.rows.includes(rowIndex)
            : false;
        const isColumnSelected =
          selectionMode === SELECTION_MODE.COLUMN ||
          selectionMode === SELECTION_MODE.BOTH
            ? activeCell?.columnIndex === columnIndex ||
              selectedRowsAndCols.cols.includes(columnIndex)
            : false;
        const isSelected = isRowSelected || isColumnSelected;
        const showFilter = filterHeaderCells.includes(
          cellIdentifier(rowIndex, columnIndex)
        );
        const cellConfig = getValue(cell, true) as CellConfig;
        const additionalStyles = {
          ...(showFilter ? { bold: true } : {}),
        };
        return (
          <CellRenderer
            {...props}
            {...cellConfig}
            {...additionalStyles}
            isLightMode={isLightMode}
            formatter={formatter}
            showStrokeOnFill={showGridLines}
            isSelected={isSelected}
            showFilter={showFilter}
            onFilterClick={handleFilterClick}
          />
        );
      },
      [
        cells,
        selectedRowsAndCols,
        activeCell,
        hiddenRows,
        hiddenColumns,
        showGridLines,
        selectionMode,
        isLightMode,
        theme,
        filterHeaderCells,
      ]
    );

    const overlayRenderer = useCallback(
      (props: RendererProps) => {
        const { rowIndex, columnIndex } = props;
        const isHidden =
          hiddenRows?.indexOf(rowIndex) !== -1 ||
          hiddenColumns?.indexOf(columnIndex) !== -1;
        const cell = { rowIndex, columnIndex };
        if (isHidden) return null;
        return (
          <CellOverlay {...props} {...(getValue(cell, true) as CellConfig)} />
        );
      },
      [cells, selectedRowsAndCols, activeCell, hiddenRows, hiddenColumns]
    );

    const handleScroll = useCallback(
      (scrollState: ScrollCoords) => {
        editableProps.onScroll?.(scrollState);
        // Save scroll state in sheet
        debounceScroll.current?.(scrollState);
      },
      [selectedSheet]
    );

    /**
     * Show context menu
     */
    const showContextMenu = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const left = e.clientX;
        const top = e.clientY;
        const pos = gridRef.current?.getRelativePositionFromOffset(left, top);
        if (!pos) return;
        const { x, y } = pos;
        setContextMenuProps({
          left: x,
          top: y,
        });
      },
      []
    );

    /**
     * Hides context menu
     */
    const hideContextMenu = useCallback(() => {
      setContextMenuProps(null);
      gridRef.current?.focus();
    }, []);
    const fillhandleBorderColor = isLightMode ? "white" : DARK_MODE_COLOR_LIGHT;
    const gridLineColor = isLightMode
      ? CELL_BORDER_COLOR
      : theme?.colors.gray[600];
    const shadowStroke = isLightMode
      ? HEADER_BORDER_COLOR
      : theme?.colors.gray[600];
    return (
      <GridWrapper>
        <Grid
          enableCellOverlay
          shadowSettings={{
            stroke: shadowStroke,
          }}
          showFrozenShadow
          gridLineColor={gridLineColor}
          showGridLines={showGridLines}
          ref={gridRef}
          rowCount={rowCount}
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          width={width}
          height={height}
          itemRenderer={itemRenderer}
          overlayRenderer={overlayRenderer}
          wrapper={contextWrapper}
          selections={selections}
          activeCell={activeCell}
          fillhandleBorderColor={fillhandleBorderColor}
          showFillHandle={!isEditInProgress}
          mergedCells={mergedCells}
          borderStyles={borderStyles}
          frozenRows={actualFrozenRows}
          frozenColumns={actualFrozenColumns}
          {...selectionProps}
          {...editableProps}
          onScroll={handleScroll}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            selectionProps.onMouseDown(e);
            editableProps.onMouseDown(e);
            hideContextMenu();
            hideFilter();
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            selectionProps.onKeyDown(e);
            editableProps.onKeyDown(e);
            onKeyDown?.(e);
          }}
          onContextMenu={showContextMenu}
          onViewChange={onViewChange}
        />
        {editorComponent}
        {contextMenuProps && (
          <ContextMenu
            onRequestClose={hideContextMenu}
            activeCell={activeCell}
            selections={selections}
            onCopy={copy}
            onPaste={paste}
            onCut={cut}
            onInsertRow={onInsertRow}
            onInsertColumn={onInsertColumn}
            onDeleteColumn={onDeleteColumn}
            onDeleteRow={onDeleteRow}
            {...contextMenuProps}
          />
        )}
        {filterComponent}
      </GridWrapper>
    );
  })
);

export default SheetGrid;
