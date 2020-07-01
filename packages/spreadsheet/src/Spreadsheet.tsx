import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from "react";
import Toolbar from "./Toolbar";
import Formulabar from "./Formulabar";
import Workbook from "./Workbook";
import { theme, ThemeProvider, ColorModeProvider, Flex } from "@chakra-ui/core";
import { Global, css } from "@emotion/core";
import {
  RendererProps,
  CellInterface,
  SelectionArea,
  ScrollCoords,
  useUndo,
  AreaProps,
  StylingProps,
  createPatches,
  selectionFromActiveCell
} from "@rowsncolumns/grid";
import useControllableState from "./useControllableState";
import {
  createNewSheet,
  uuid,
  detectDataType,
  createBorderStyle,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  EMPTY_ARRAY,
  cellsInSelectionVariant
} from "./constants";
import {
  FORMATTING_TYPE,
  DATATYPE,
  CellFormatting,
  CellDataFormatting,
  AXIS,
  BORDER_VARIANT,
  OPERATION_TYPE,
  RESOURCE_TYPE,
  BORDER_STYLE,
  STROKE_FORMATTING
} from "./types";
import { useImmer } from "use-immer";
import { WorkbookGridRef } from "./Grid/Grid";
import { KeyCodes, Direction } from "@rowsncolumns/grid/dist/types";
import { Patches, PatchOperator } from "@rowsncolumns/grid/dist/hooks/useUndo";
import { current } from "immer";

export interface SpreadSheetProps {
  minColumnWidth?: number;
  minRowHeight?: number;
  rowCount?: number;
  columnCount?: number;
  CellRenderer?: React.FC<RendererProps>;
  HeaderCellRenderer?: React.FC<RendererProps>;
  sheets?: Sheet[];
  initialSheets?: Sheet[];
  onNewSheet?: () => void;
  activeSheet?: string;
  initialActiveSheet?: string;
  initialHiddenRows?: number[];
  initialHiddenColumns?: number[];
  onChange?: (id: string, changes: Cells) => void;
  onChangeSelectedSheet?: (id: string) => void;
  onChangeSheets?: (sheets: Sheet[]) => void;
  showFormulabar?: boolean;
  showToolbar?: boolean;
  format?: (
    value: string,
    datatype?: DATATYPE,
    formatting?: CellDataFormatting
  ) => string;
  enableDarkMode?: true;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Cells;
  activeCell: CellInterface | null;
  selections: SelectionArea[];
  scrollState: ScrollCoords;
  columnSizes?: SizeType;
  rowSizes?: SizeType;
  mergedCells?: AreaProps[];
  borderStyles?: StylingProps;
  frozenRows?: number;
  frozenColumns?: number;
}

export type SizeType = {
  [key: number]: number;
};

export type Cells = Record<string, Cell>;
export type Cell = Record<string, CellConfig>;
export interface CellConfig extends CellFormatting {
  text?: string;
}

const defaultActiveSheet = uuid();
const defaultSheets: Sheet[] = [
  {
    id: defaultActiveSheet,
    name: "Sheet1",
    frozenColumns: 0,
    frozenRows: 0,
    activeCell: {
      rowIndex: 1,
      columnIndex: 1
    },
    mergedCells: [],
    selections: [],
    cells: {
      
    },
    scrollState: { scrollTop: 0, scrollLeft: 0 }
  }
];

/**
 * Spreadsheet component
 * TODO
 * 1. Undo/redo
 * 2. Order of cell rendering
 * @param props
 */
const Spreadsheet = (props: SpreadSheetProps) => {
  const {
    initialSheets = defaultSheets,
    onChange,
    showFormulabar = true,
    minColumnWidth = DEFAULT_COLUMN_WIDTH,
    minRowHeight = DEFAULT_ROW_HEIGHT,
    CellRenderer,
    HeaderCellRenderer,
    initialActiveSheet = defaultActiveSheet,
    activeSheet,
    onChangeSelectedSheet,
    onChangeSheets,
    showToolbar = true,
    format,
    enableDarkMode = true,
    initialHiddenRows = EMPTY_ARRAY,
    initialHiddenColumns = EMPTY_ARRAY,
    rowCount = 1000,
    columnCount = 1000,
  } = props;
  const [selectedSheet, setSelectedSheet] = useControllableState<string>({
    defaultValue: initialActiveSheet,
    value: activeSheet,
    onChange: onChangeSelectedSheet
  });
  const selectedSheetRef = useRef(selectedSheet);
  const currentGrid = useRef<WorkbookGridRef>();
  const [sheets, setSheets] = useImmer<Sheet[]>(initialSheets);
  const [formulaInput, setFormulaInput] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState(initialHiddenColumns);
  const [hiddenRows, setHiddenRows] = useState(initialHiddenRows);

  /* Callback when sheets is changed */
  useEffect(() => {
    onChangeSheets?.(sheets);
  }, [sheets]);

  useEffect(() => {
    selectedSheetRef.current = selectedSheet;
  });
  
  /**
   * Undo/redo
   */
  // const {
  //   undo,
  //   redo,
  //   add: pushToUndoStack,
  //   canUndo,
  //   canRedo,
  //   onKeyDown: handleUndoKeyDown
  // } = useUndo({
  //   onRedo: patches => onUndoRedo("redo", patches),
  //   onUndo: patches => onUndoRedo("undo", patches)
  // });

  /**
   * Handle add new sheet
   */
  const handleNewSheet = useCallback(() => {
    const count = sheets.length;
    const newSheet = createNewSheet({ count: count + 1 });
    setSheets(draft => {
      (draft as Sheet[]).push(newSheet);
    });
    setSelectedSheet(newSheet.id);
    /* Focus on the new grid */
    currentGrid.current?.focus();

  }, [sheets, selectedSheet]);

  /**
   * Cell changes on user input
   */
  const handleChange = useCallback((id: string, changes: Cells) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        for (const row in changes) {
          sheet.cells[row] = sheet.cells[row] ?? {};
          for (const col in changes[row]) {
            /* Grab the previous value for undo */
            const previousValue = sheet.cells[row]?.[col];
            sheet.cells[row][col] = sheet.cells[row][col] ?? {};
            const cell = sheet.cells[row][col];
            const value = changes[row][col].text;
            /* Get datatype of user input */
            const datatype = detectDataType(value);
            cell.text = value;
            cell.datatype = datatype;
          }
        }
      }
    });
    onChange?.(id, changes);
  }, []);

  const handleSheetAttributesChange = useCallback(
    (id: string, changes: any) => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          for (const key in changes) {
            // @ts-ignore
            sheet[key as keyof Sheet] = changes[key];
          }
        }
      });
    },
    []
  );

  const handleChangeSheetName = useCallback((id: string, name: string) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        const previousValue = sheet.name;
        sheet.name = name;
      }
    });
  }, []);

  const handleDeleteSheet = useCallback(
    (id: string) => {
      if (sheets.length === 1) return;
      const index = sheets.findIndex(sheet => sheet.id === id);
      const newSheets = sheets.filter(sheet => sheet.id !== id);
      const newSelectedSheet =
        selectedSheet === sheets[index].id
          ? newSheets[Math.max(0, index - 1)].id
          : selectedSheet;
      setSelectedSheet(newSelectedSheet);
      setSheets(draft => {
        draft.splice(index, 1);
      });

      /* Focus on the new grid */
      currentGrid.current?.focus();

    },
    [sheets, selectedSheet]
  );

  const handleDuplicateSheet = useCallback(
    (id: string) => {
      const newSheetId = uuid();
      const index = sheets.findIndex(sheet => sheet.id === id);
      if (index === -1) return;
      const newSheet = {
        ...sheets[index],
        id: newSheetId,
        name: `Copy of ${currentSheet.name}`
      };
      setSheets(draft => {
        // @ts-ignore
        draft.splice(index + 1, 0, newSheet);
      });
      setSelectedSheet(newSheetId);

    },
    [sheets, selectedSheet]
  );

  /**
   * When cell or selection formatting change
   */
  const handleFormattingChange = useCallback(
    (type, value) => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === selectedSheet);
        if (sheet) {
          const { activeCell, selections, cells } = sheet;
          if (selections.length) {
            const previousValue: { [key: string]: any } = {};
            selections.forEach(sel => {
              const { bounds } = sel;
              for (let i = bounds.top; i <= bounds.bottom; i++) {
                cells[i] = cells[i] ?? {};
                previousValue[i] = previousValue[i] ?? {};
                for (let j = bounds.left; j <= bounds.right; j++) {
                  cells[i][j] = cells[i][j] ?? {};
                  previousValue[i][j] = previousValue[i][j] ?? {};
                  previousValue[i][j] = { ...cells[i][j] };
                  cells[i][j][type as keyof CellFormatting] = value;
                }
              }
            });
          } else if (activeCell) {
            const { rowIndex, columnIndex } = activeCell;
            cells[rowIndex] = cells[rowIndex] ?? {};
            const previousValue = cells[rowIndex][columnIndex]?.[type as keyof CellFormatting];
            cells[rowIndex][columnIndex] = cells[rowIndex][columnIndex] ?? {};
            cells[rowIndex][columnIndex][type as keyof CellFormatting] = value;
          }
        }
      });
    },
    [sheets, selectedSheet]
  );

  /**
   * Pass active cell config back to toolbars
   */
  const currentSheet = useMemo(() => {
    return sheets.find(sheet => sheet.id === selectedSheet) as Sheet;
  }, [sheets, selectedSheet]);

  const [activeCellConfig, activeCell] = useMemo(() => {
    const { activeCell, cells } = currentSheet || {};
    const activeCellConfig = activeCell
      ? cells?.[activeCell.rowIndex]?.[activeCell.columnIndex]
      : null;
    return [activeCellConfig, activeCell];
  }, [currentSheet]);

  const handleActiveCellChange = useCallback(
    (cell: CellInterface | null, value) => {
      if (!cell) return;
      setFormulaInput(value || "");
    },
    []
  );

  const handleActiveCellValueChange = useCallback(value => {
    setFormulaInput(value);
  }, []);

  /**
   * Formula bar focus event
   */
  const handleFormulabarFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const input = e.target;
      if (activeCell) {
        currentGrid.current?.makeEditable(activeCell, input.value, false);
        requestAnimationFrame(() => input?.focus());
      }
    },
    [activeCell]
  );

  /**
   * When formula input changes
   */
  const handleFormulabarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeCell) return;
      const value = e.target.value;
      setFormulaInput(value);
      currentGrid.current?.setEditorValue(value, activeCell);
    },
    [activeCell, selectedSheet]
  );

  /**
   * Imperatively submits the editor
   * @param value
   * @param activeCell
   */
  const submitEditor = (
    value: string,
    activeCell: CellInterface,
    direction: Direction = Direction.Down
  ) => {
    const nextActiveCell = currentGrid.current?.getNextFocusableCell(
      activeCell,
      direction
    );
    currentGrid.current?.submitEditor(value, activeCell, nextActiveCell);
  };
  /**
   * When user presses Enter on formula input
   */
  const handleFormulabarKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!activeCell) return;

      if (e.which === KeyCodes.Enter) {
        submitEditor(formulaInput, activeCell);
      }
      if (e.which === KeyCodes.Escape) {
        currentGrid.current?.cancelEditor();
        setFormulaInput(activeCellConfig?.text || "");
      }
      if (e.which === KeyCodes.Tab) {
        submitEditor(formulaInput, activeCell, Direction.Right);
        e.preventDefault();
      }
    },
    [activeCell, formulaInput, activeCellConfig]
  );

  /**
   * Handle fill
   */
  const handleFill = useCallback(
    (
      id: string,
      activeCell: CellInterface,
      fillSelection: SelectionArea | null
    ) => {
      if (!fillSelection) return;
      /* Check if user is trying to extend a selection */
      const { bounds } = fillSelection;
      const changes: Cells = {};
      const previousValue: { [key: string]: any } = {};
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { cells } = sheet;
          const currentValue =
            cells[activeCell.rowIndex]?.[activeCell.columnIndex];
          for (let i = bounds.top; i <= bounds.bottom; i++) {
            previousValue[i] = previousValue[i] ?? {};
            cells[i] = cells[i] ?? {};
            changes[i] = changes[i] ?? {};
            for (let j = bounds.left; j <= bounds.right; j++) {
              if (i === activeCell.rowIndex && j === activeCell.columnIndex)
                continue;
              previousValue[i][j] = previousValue[i][j] ?? {};
              cells[i][j] = cells[i][j] ?? {};
              changes[i][j] = changes[i][j] ?? {};
              previousValue[i][j] = { ...cells[i][j] };
              cells[i][j] = currentValue;
              changes[i][j] = { ...currentValue };
            }
          }
        }
      });

      onChange?.(id, changes);
    },
    [sheets]
  );

  /**
   * Delete cell values
   */
  const handleDelete = useCallback(
    (id: string, activeCell: CellInterface, selections: SelectionArea[]) => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        const attribute = "text";
        if (sheet) {
          const { cells } = sheet;
          const value: { [key: string]: any } = {};
          const previousValue: { [key: string]: any } = {};
          if (selections.length) {
            selections.forEach(sel => {
              const { bounds } = sel;
              for (let i = bounds.top; i <= bounds.bottom; i++) {
                if (cells[i] === void 0) continue;
                for (let j = bounds.left; j <= bounds.right; j++) {
                  if (!(j in cells[i]) || cells[i][j] === void 0) continue;
                  value[i] = value[i] ?? {};
                  previousValue[i] = previousValue[i] ?? {};
                  previousValue[i][j] = previousValue[i][j] ?? {};
                  value[i][j] = value[i][j] ?? {};
                  previousValue[i][j][attribute] = cells[i][j][attribute];
                  cells[i][j][attribute] = "";
                  value[i][j][attribute] = "";
                }
              }
            });

          } else {
            const { rowIndex, columnIndex } = activeCell;
            const previousValue = { ...cells[rowIndex]?.[columnIndex] };
            if (cells[rowIndex]?.[columnIndex]) {
              cells[rowIndex][columnIndex].text = "";
            }

          }
        }
      });
      /* Clear formula input */
      setFormulaInput("");
    },
    []
  );

  const handleClearFormatting = useCallback(() => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === selectedSheet);
      if (sheet) {
        const { activeCell, selections, cells } = sheet;
        if (selections.length) {
          selections.forEach(sel => {
            const { bounds } = sel;
            for (let i = bounds.top; i <= bounds.bottom; i++) {
              if (!(i in cells)) continue;
              for (let j = bounds.left; j <= bounds.right; j++) {
                if (!(j in cells[i])) continue;
                Object.values(FORMATTING_TYPE).forEach(key => {
                  delete cells[i]?.[j]?.[key];
                });
                Object.values(STROKE_FORMATTING).forEach(key => {
                  delete cells[i]?.[j]?.[key];
                });
              }
            }
          });
        } else if (activeCell) {
          const { rowIndex, columnIndex } = activeCell;
          Object.values(FORMATTING_TYPE).forEach(key => {
            if (key) delete cells[rowIndex]?.[columnIndex]?.[key];
          });
          Object.values(STROKE_FORMATTING).forEach(key => {
            if (key) delete cells[rowIndex]?.[columnIndex]?.[key];
          });
        }
      }
    });
  }, [sheets, selectedSheet]);

  const handleResize = useCallback(
    (id: string, axis: AXIS, index: number, dimension: number) => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          if (axis === AXIS.X) {
            if (!("columnSizes" in sheet)) sheet.columnSizes = {};
            if (sheet.columnSizes) sheet.columnSizes[index] = dimension;
          } else {
            if (!("rowSizes" in sheet)) sheet.rowSizes = {};
            if (sheet.rowSizes) sheet.rowSizes[index] = dimension;
          }
        }
      });
      axis === AXIS.X
        ? currentGrid.current?.resizeColumns?.([index])
        : currentGrid.current?.resizeRows?.([index]);
    },
    []
  );

  /**
   * Handle toggle cell merges
   */
  const handleMergeCells = useCallback(() => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === selectedSheet);
      if (sheet) {
        const { selections, activeCell } = sheet;
        const { bounds } = selections.length
          ? selections[selections.length - 1]
          : {
              bounds: currentGrid.current?.getCellBounds?.(
                activeCell as CellInterface
              )
            };
        if (!bounds) return;
        if (bounds.top === bounds.bottom && bounds.left === bounds.right)
          return;
        if (!sheet.mergedCells) {
          sheet.mergedCells = [];
        } else {
          /* Check if cell is already merged */
          const index = sheet.mergedCells.findIndex(area => {
            return (
              area.left === bounds.left &&
              area.right === bounds.right &&
              area.top === bounds.top &&
              area.bottom === bounds.bottom
            );
          });

          if (index !== -1) {
            sheet.mergedCells.splice(index, 1);
            return;
          }
        }
        sheet.mergedCells.push(bounds);
      }
    });
  }, [selectedSheet]);

  const handleFrozenRowChange = useCallback(
    num => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === selectedSheet);
        if (sheet) {
          sheet.frozenRows = num;
        }
      });
    },
    [selectedSheet]
  );

  const handleFrozenColumnChange = useCallback(
    num => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === selectedSheet);
        if (sheet) {
          sheet.frozenColumns = num;
        }
      });
    },
    [selectedSheet]
  );

  const handleBorderChange = useCallback(
    (
      color: string | undefined,
      borderStyle: BORDER_STYLE,
      variant?: BORDER_VARIANT
    ) => {
      /* Create a border style based on variant */
      const borderVariantStyle = createBorderStyle(variant, borderStyle, color);
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === selectedSheet);
        if (sheet) {
          const { selections, cells, activeCell } = sheet
          const sel = selections.length
          ? selections
          : selectionFromActiveCell(activeCell);
          const boundedCells = cellsInSelectionVariant(sel as SelectionArea[], variant, borderStyle, color, currentGrid.current?.getCellBounds)
          for (const row in boundedCells) {
            for (const col in boundedCells[row]) {
              if (variant === BORDER_VARIANT.NONE) {
                // Delete all stroke formatting rules
                Object.values(STROKE_FORMATTING).forEach(key => {
                  delete cells[row]?.[col]?.[key];
                });
              } else {
                const styles = boundedCells[row][col]
                Object.keys(styles).forEach(key => {
                  cells[row] = cells[row] ?? {}
                  cells[row][col] = cells[row][col] ?? {}
                  // @ts-ignore
                  cells[row][col][key] = styles[key]
                })
              }
            }
          }
        }
      })
    },
    [selectedSheet]
  );

  /**
   * Handle sheet scroll
   */
  const handleScroll = useCallback((id: string, scrollState: ScrollCoords) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        sheet.scrollState = scrollState;
      }
    });
  }, []);

  /**.
   * On Paste
   * TODO: Preserve formatting
   */
  const handlePaste = useCallback((id, rows, activeCell) => {
    const { rowIndex, columnIndex } = activeCell;
    const endRowIndex = Math.max(rowIndex, rowIndex + rows.length - 1);
    const endColumnIndex = Math.max(
      columnIndex,
      columnIndex + (rows.length && rows[0].length - 1)
    );

    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        const { cells } = sheet;
        for (const [i, row] of rows.entries()) {
          const r = rowIndex + i;
          cells[r] = cells[r] ?? {};
          for (const [j, text] of row.entries()) {
            const c = columnIndex + j;
            cells[r][c] = cells[r][c] ?? {};
            cells[r][c].text = text;
          }
        }
      }
    });

    /* Should select */
    if (rowIndex === endRowIndex && columnIndex === endColumnIndex) return;

    currentGrid.current?.setSelections([
      {
        bounds: {
          top: rowIndex,
          left: columnIndex,
          bottom: endRowIndex,
          right: endColumnIndex
        }
      }
    ]);
  }, []);

  /**
   * Handle cut event
   */
  const handleCut = useCallback((id: string, selection: SelectionArea) => {
    const { bounds } = selection;
    const changes = {};

    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        const { cells } = sheet;
        for (let i = bounds.top; i <= bounds.bottom; i++) {
          if (!(i in cells)) continue;
          for (let j = bounds.left; j <= bounds.right; j++) {
            if (!(j in cells[i])) continue;
            delete cells[i][j];
          }
        }
      }
    });
  }, []);

  /**
   * Insert new row
   */
  const handleInsertRow = useCallback(
    (
      id: string,
      activeCell: CellInterface | null,
      selections: SelectionArea[]
    ) => {
      if (activeCell === null) return;
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { rowIndex } = activeCell;
          const { cells } = sheet;
          const maxRow = Math.max(...Object.keys(cells).map(Number));
          const changes: { [key: string]: any } = {};
          for (let i = rowIndex; i <= maxRow; i++) {
            changes[i + 1] = cells[i];
          }
          for (const index in changes) {
            cells[index] = changes[index];
          }
          delete cells[rowIndex];
        }
      });
    },
    []
  );

  /**
   * Insert new row
   */
  const handleInsertColumn = useCallback(
    (
      id: string,
      activeCell: CellInterface | null,
      selections: SelectionArea[]
    ) => {
      if (activeCell === null) return;
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { columnIndex } = activeCell;
          const { cells } = sheet;

          const changes: { [key: string]: any } = {};
          for (const row in cells) {
            const maxCol = Math.max(...Object.keys(cells[row]).map(Number));
            changes[row] = changes[row] ?? {};
            for (let i = columnIndex; i <= maxCol; i++) {
              changes[row][i] = changes[row][i] ?? {};
              changes[row][i + 1] = cells[row]?.[i];
            }
          }

          for (const row in changes) {
            for (const col in changes[row]) {
              cells[row][col] = changes[row][col];
            }
          }
        }
      });
    },
    []
  );

  /* Handle delete row */
  const handleDeleteRow = useCallback(
    (id: string, activeCell: CellInterface | null) => {
      if (activeCell === null) return;
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { rowIndex } = activeCell;
          const { cells } = sheet;
          const maxRow = Math.max(...Object.keys(cells).map(Number));
          const changes: { [key: string]: any } = {};
          for (let i = rowIndex; i <= maxRow; i++) {
            changes[i] = cells[i + 1];
          }
          for (const index in changes) {
            cells[index] = changes[index];
          }
        }
      });
    },
    []
  );

  /* Handle delete row */
  const handleDeleteColumn = useCallback(
    (id: string, activeCell: CellInterface | null) => {
      if (activeCell === null) return;
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { columnIndex } = activeCell;
          const { cells } = sheet;

          const changes: { [key: string]: any } = {};
          for (const row in cells) {
            const maxCol = Math.max(...Object.keys(cells[row]).map(Number));
            changes[row] = changes[row] ?? {};
            for (let i = columnIndex; i <= maxCol; i++) {
              changes[row][i] = changes[row][i] ?? {};
              changes[row][i] = cells[row]?.[i + 1];
            }
          }

          for (const row in changes) {
            for (const col in changes[row]) {
              cells[row][col] = changes[row][col];
            }
          }
        }
      });
    },
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          .rowsncolumns-grid-container:focus {
            outline: none;
          }
        `}
      />
      <ColorModeProvider>
        <Flex flexDirection="column" flex={1}>
          {showToolbar ? (
            <Toolbar
              fill={activeCellConfig?.fill}
              bold={activeCellConfig?.bold}
              italic={activeCellConfig?.italic}
              strike={activeCellConfig?.strike}
              underline={activeCellConfig?.underline}
              color={activeCellConfig?.color}
              percent={activeCellConfig?.percent}
              currency={activeCellConfig?.currency}
              verticalAlign={activeCellConfig?.verticalAlign}
              horizontalAlign={activeCellConfig?.horizontalAlign}
              onFormattingChange={handleFormattingChange}
              onClearFormatting={handleClearFormatting}
              onMergeCells={handleMergeCells}
              frozenRows={currentSheet.frozenRows}
              frozenColumns={currentSheet.frozenColumns}
              onFrozenRowChange={handleFrozenRowChange}
              onFrozenColumnChange={handleFrozenColumnChange}
              onBorderChange={handleBorderChange}
              // onRedo={redo}
              // onUndo={undo}
              // canRedo={canRedo}
              // canUndo={canUndo}
              enableDarkMode={enableDarkMode}
            />
          ) : null}
          {showFormulabar ? (
            <Formulabar
              value={formulaInput}
              onChange={handleFormulabarChange}
              onKeyDown={handleFormulabarKeydown}
              onFocus={handleFormulabarFocus}
            />
          ) : null}
          <Workbook
            rowCount={rowCount}
            columnCount={columnCount}
            onResize={handleResize}
            format={format}
            ref={currentGrid}
            onDelete={handleDelete}
            onFill={handleFill}
            onActiveCellValueChange={handleActiveCellValueChange}
            onActiveCellChange={handleActiveCellChange}
            currentSheet={currentSheet}
            selectedSheet={selectedSheet}
            onChangeSelectedSheet={setSelectedSheet}
            onNewSheet={handleNewSheet}
            theme={theme}
            sheets={sheets}
            onChange={handleChange}
            onSheetChange={handleSheetAttributesChange}
            minColumnWidth={minColumnWidth}
            minRowHeight={minRowHeight}
            CellRenderer={CellRenderer}
            HeaderCellRenderer={HeaderCellRenderer}
            onChangeSheetName={handleChangeSheetName}
            onDeleteSheet={handleDeleteSheet}
            onDuplicateSheet={handleDuplicateSheet}
            onScroll={handleScroll}
            // onKeyDown={handleUndoKeyDown}
            hiddenRows={hiddenRows}
            hiddenColumns={hiddenColumns}
            onPaste={handlePaste}
            onCut={handleCut}
            onInsertRow={handleInsertRow}
            onInsertColumn={handleInsertColumn}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
          />
        </Flex>
      </ColorModeProvider>
    </ThemeProvider>
  );
};

export default Spreadsheet;
