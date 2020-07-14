import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import Toolbar from "./Toolbar";
import Formulabar from "./Formulabar";
import Workbook from "./Workbook";
import {
  theme,
  ThemeProvider,
  ColorModeProvider,
  Flex,
  IUseColorMode,
  Grid,
} from "@chakra-ui/core";
import { Global, css } from "@emotion/core";
import {
  CellInterface,
  SelectionArea,
  ScrollCoords,
  AreaProps,
  selectionFromActiveCell,
  FilterView,
  FilterDefinition,
  Filter,
} from "@rowsncolumns/grid";
import {
  createNewSheet,
  uuid,
  detectDataType,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  EMPTY_ARRAY,
  cellsInSelectionVariant,
  SYSTEM_FONT,
  format as defaultFormat,
  FONT_FAMILIES,
} from "./constants";
import {
  FORMATTING_TYPE,
  CellFormatting,
  AXIS,
  BORDER_VARIANT,
  BORDER_STYLE,
  STROKE_FORMATTING,
  FormatType,
  DATATYPE,
  SELECTION_MODE,
  HORIZONTAL_ALIGNMENT,
} from "./types";
import { useImmer } from "use-immer";
import { WorkbookGridRef } from "./Grid/Grid";
import { KeyCodes, Direction } from "@rowsncolumns/grid/dist/types";
import invariant from "tiny-invariant";
import { ThemeType } from "./styled";
import Editor, { CustomEditorProps } from "./Editor/Editor";
import StatusBarComponent from "./StatusBar";
import { StatusBarProps } from "./StatusBar/StatusBar";
import useFonts from "./hooks/useFonts";

export interface SpreadSheetProps {
  /**
   * Minimum column width of the grid
   */
  minColumnWidth?: number;
  /**
   * Minimum row height of the grid
   */
  minRowHeight?: number;
  /**
   * Total number of rows to render
   */
  rowCount?: number;
  /**
   * Total number of columns to render
   */
  columnCount?: number;
  /**
   * Customize cell rendering
   */
  CellRenderer?: React.ReactType;
  /**
   * Custom header cell
   */
  HeaderCellRenderer?: React.ReactType;
  /**
   * Array of sheets to render
   */
  sheets?: Sheet[];
  /**
   * Uncontrolled sheets
   */
  initialSheets?: Sheet[];
  /**
   * Active  sheet on the workbook
   */
  activeSheet?: string;
  /**
   * Hide rows
   */
  hiddenRows?: number[];
  /**
   * Hide columns
   */
  hiddenColumns?: number[];
  /**
   * Callback fired when cells are modified
   */
  onChangeCells?: (id: string, changes: Cells) => void;
  /**
   * Get the new selected sheet
   */
  onChangeSelectedSheet?: (id: string) => void;
  /**
   * Listen to changes to all the sheets
   */
  onChange?: (sheets: Sheet[]) => void;
  /**
   * Show formula bar
   */
  showFormulabar?: boolean;
  /**
   * Show hide toolbar
   */
  showToolbar?: boolean;
  /**
   * Conditionally format cell text
   */
  formatter?: FormatType;
  /**
   * Enabled or disable dark mode
   */
  enableDarkMode?: true;
  /**
   * Font family
   */
  fontFamily?: string;
  /**
   * Min Height of the grid
   */
  minHeight?: number;
  /**
   * Custom Cell Editor
   */
  CellEditor?: React.ReactType<CustomEditorProps>;
  /**
   * Allow multiple selection
   */
  allowMultipleSelection?: boolean;
  /**
   * Callback when active cell changes
   */
  onActiveCellChange?: (
    id: string,
    cell: CellInterface | null,
    value?: string
  ) => void;
  /**
   * Callback fired when selection changes
   */
  onSelectionChange?: (
    id: string,
    activeCell: CellInterface | null,
    selections: SelectionArea[]
  ) => void;
  /**
   * Select mode
   */
  selectionMode?: SELECTION_MODE;
  /**
   * Show or hide tab strip
   */
  showTabStrip?: boolean;
  /**
   * Make tab editable
   */
  isTabEditable?: boolean;
  /**
   * Allow user to add new sheet
   */
  allowNewSheet?: boolean;
  /**
   * Show or hide status bar
   */
  showStatusBar?: boolean;
  /**
   * Status bar component
   */
  StatusBar?: React.FC<StatusBarProps>;
  /**
   * Scale
   */
  initialScale?: number;
  /**
   * Web font loader config
   */
  fontLoaderConfig?: WebFont.Config;
  /**
   * Visible font families
   */
  fontList?: string[];
}

export interface Sheet {
  id: string;
  name: string;
  cells: Cells;
  activeCell: CellInterface | null;
  selections: SelectionArea[];
  scrollState?: ScrollCoords;
  columnSizes?: SizeType;
  rowSizes?: SizeType;
  mergedCells?: AreaProps[];
  frozenRows?: number;
  frozenColumns?: number;
  hiddenRows?: number[];
  hiddenColumns?: number[];
  showGridLines?: boolean;
  filterViews?: FilterView[];
  rowCount?: number;
  columnCount?: number;
}

export type SizeType = {
  [key: number]: number;
};

export type Cells = Record<string, Cell>;
export type Cell = Record<string, CellConfig>;
export interface CellConfig extends CellFormatting {
  text?: string | number;
  result?: string | number | any;
}

const defaultActiveSheet = uuid();
export const defaultSheets: Sheet[] = [
  {
    id: defaultActiveSheet,
    name: "Sheet1",
    frozenColumns: 0,
    frozenRows: 0,
    activeCell: {
      rowIndex: 1,
      columnIndex: 1,
    },
    mergedCells: [],
    selections: [],
    cells: {
      1: {
        1: {
          text: "Hello world",
          fontFamily: "Source Sans Pro",
        },
      },
    },
    scrollState: { scrollTop: 0, scrollLeft: 0 },
    filterViews: [],
  },
];

export type RefAttributeSheetGrid = {
  ref?: React.Ref<SheetGridRef>;
};

export type SheetGridRef = {
  grid: WorkbookGridRef | null;
};

/**
 * Spreadsheet component
 * TODO
 * 1. Undo/redo
 * @param props
 */
const Spreadsheet: React.FC<SpreadSheetProps & RefAttributeSheetGrid> = memo(
  forwardRef((props, forwardedRef) => {
    const {
      sheets: initialSheets = defaultSheets,
      showFormulabar = true,
      minColumnWidth = DEFAULT_COLUMN_WIDTH,
      minRowHeight = DEFAULT_ROW_HEIGHT,
      CellRenderer,
      HeaderCellRenderer,
      activeSheet,
      onChangeSelectedSheet,
      onChange,
      onChangeCells,
      showToolbar = true,
      formatter = defaultFormat,
      enableDarkMode = true,
      fontFamily = SYSTEM_FONT,
      minHeight = 400,
      CellEditor = Editor,
      allowMultipleSelection = true,
      onActiveCellChange,
      onSelectionChange,
      selectionMode,
      showTabStrip = true,
      isTabEditable = true,
      allowNewSheet = true,
      showStatusBar = true,
      StatusBar = StatusBarComponent,
      initialScale = 1,
      fontLoaderConfig,
      fontList = FONT_FAMILIES,
    } = props;
    const [selectedSheet, setSelectedSheet] = useState<string | null>(() => {
      return activeSheet === void 0
        ? initialSheets.length
          ? initialSheets[0].id
          : null
        : activeSheet;
    });
    const [scale, setScale] = useState(initialScale);
    const selectedSheetRef = useRef(selectedSheet);
    const currentGrid = useRef<WorkbookGridRef>(null);
    const [sheets, setSheets] = useImmer<Sheet[]>(initialSheets);
    const [formulaInput, setFormulaInput] = useState("");

    invariant(
      selectedSheet !== null,
      "Exception, selectedSheet is empty, Please specify a selected sheet using `selectedSheet` prop"
    );

    /* Fonts */
    const { isFontActive } = useFonts(fontLoaderConfig);

    useEffect(() => {
      if (isFontActive) {
        console.log("isFontActive", isFontActive);
        currentGrid.current?.resetAfterIndices?.({
          rowIndex: 0,
          columnIndex: 0,
        });
      }
    }, [isFontActive]);

    useImperativeHandle(
      forwardedRef,
      () => {
        return {
          grid: currentGrid.current,
        };
      },
      []
    );

    /* Callback when sheets is changed */
    useEffect(() => {
      onChange?.(sheets);
    }, [sheets]);

    /* Change selected sheet */
    useEffect(() => {
      onChangeSelectedSheet?.(selectedSheet);
    }, [selectedSheet]);

    useEffect(() => {
      selectedSheetRef.current = selectedSheet;
    });

    /* Listen to sheet change */
    useEffect(() => {
      /* If its the same sheets - Skip */
      if (sheets === initialSheets) {
        return;
      }

      /* Update sheets */
      setSheets((draft) => {
        draft.length = initialSheets.length;
        initialSheets.forEach((sheet, index) => {
          (draft[index] as Sheet) = sheet;
        });
      });

      /* Update selected sheet */
      setSelectedSheet(initialSheets[0].id);
    }, [initialSheets]);

    /**
     * Handle add new sheet
     */
    const handleNewSheet = useCallback(() => {
      const count = sheets.length;
      const newSheet = createNewSheet({ count: count + 1 });
      setSheets((draft) => {
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
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === id);
        if (sheet) {
          for (const row in changes) {
            sheet.cells[row] = sheet.cells[row] ?? {};
            for (const col in changes[row]) {
              /* Grab the previous value for undo */
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
      onChangeCells?.(id, changes);
    }, []);

    const handleSheetAttributesChange = useCallback(
      (id: string, changes: any) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
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
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === id);
        if (sheet) {
          sheet.name = name;
        }
      });
    }, []);

    const handleDeleteSheet = useCallback(
      (id: string) => {
        if (sheets.length === 1) return;
        const index = sheets.findIndex((sheet) => sheet.id === id);
        const newSheets = sheets.filter((sheet) => sheet.id !== id);
        const newSelectedSheet =
          selectedSheet === sheets[index].id
            ? newSheets[Math.max(0, index - 1)].id
            : selectedSheet;
        setSelectedSheet(newSelectedSheet);
        setSheets((draft) => {
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
        const index = sheets.findIndex((sheet) => sheet.id === id);
        if (index === -1) return;
        const newSheet = {
          ...sheets[index],
          id: newSheetId,
          name: `Copy of ${currentSheet.name}`,
        };
        setSheets((draft) => {
          // @ts-ignore
          draft.splice(index + 1, 0, newSheet);
        });
        setSelectedSheet(newSheetId);
      },
      [sheets, selectedSheet]
    );

    /**
     * Change formatting to auto
     */
    const handleFormattingChangeAuto = useCallback(() => {
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === selectedSheet);
        if (sheet) {
          const { selections, activeCell, cells } = sheet;
          const sel = selections.length
            ? selections
            : activeCell
            ? [{ bounds: currentGrid.current?.getCellBounds?.(activeCell) }]
            : [];
          for (let i = 0; i < sel.length; i++) {
            const { bounds } = sel[i];
            if (!bounds) continue;
            for (let j = bounds.top; j <= bounds.bottom; j++) {
              for (let k = bounds.left; k <= bounds.right; k++) {
                delete cells[j]?.[k]?.plaintext;
              }
            }
          }
        }
      });
    }, []);

    /**
     * Change formatting to plain
     */
    const handleFormattingChangePlain = useCallback(() => {
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === selectedSheet);
        if (sheet) {
          const { selections, activeCell, cells } = sheet;
          const sel = selections.length
            ? selections
            : activeCell
            ? [{ bounds: currentGrid.current?.getCellBounds?.(activeCell) }]
            : [];
          for (let i = 0; i < sel.length; i++) {
            const { bounds } = sel[i];
            if (!bounds) continue;
            for (let j = bounds.top; j <= bounds.bottom; j++) {
              cells[j] = cells[j] ?? {};
              for (let k = bounds.left; k <= bounds.right; k++) {
                cells[j][k] = cells[j][k] ?? {};
                cells[j][k].plaintext = true;
              }
            }
          }
        }
      });
    }, [selectedSheet]);

    /**
     * When cell or selection formatting change
     */
    const handleFormattingChange = useCallback(
      (type, value) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === selectedSheet);
          if (sheet) {
            const { selections, activeCell, cells } = sheet;
            const sel = selections.length
              ? selections
              : activeCell
              ? [{ bounds: currentGrid.current?.getCellBounds?.(activeCell) }]
              : [];
            for (let i = 0; i < sel.length; i++) {
              const { bounds } = sel[i];
              if (!bounds) continue;
              for (let j = bounds.top; j <= bounds.bottom; j++) {
                cells[j] = cells[j] ?? {};
                for (let k = bounds.left; k <= bounds.right; k++) {
                  cells[j][k] = cells[j][k] ?? {};
                  cells[j][k][type as keyof CellFormatting] = value;

                  /* if user is applying a custom number format, remove plaintext */
                  if (type === FORMATTING_TYPE.CUSTOM_FORMAT) {
                    delete cells[j]?.[k]?.plaintext;
                  }
                }
              }
            }
          }
        });
      },
      [selectedSheet]
    );

    /**
     * Pass active cell config back to toolbars
     */
    const currentSheet = useMemo(() => {
      return sheets.find((sheet) => sheet.id === selectedSheet) as Sheet;
    }, [sheets, selectedSheet]);

    const [activeCellConfig, activeCell] = useMemo(() => {
      const { activeCell, cells } = currentSheet || {};
      const activeCellConfig = activeCell
        ? cells?.[activeCell.rowIndex]?.[activeCell.columnIndex]
        : null;
      return [activeCellConfig, activeCell];
    }, [currentSheet]);

    const handleActiveCellChange = useCallback(
      (id: string, cell: CellInterface | null, value) => {
        if (!cell) return;
        setFormulaInput(value || "");

        onActiveCellChange?.(id, cell);
      },
      []
    );

    const handleActiveCellValueChange = useCallback((value) => {
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
        /* Row and column headers */
        if (activeCell?.rowIndex === 0 || activeCell?.columnIndex === 0) {
          return;
        }
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
        /* Row and column headers */
        if (activeCell?.rowIndex === 0 || activeCell?.columnIndex === 0) {
          return;
        }

        if (e.which === KeyCodes.Enter) {
          submitEditor(formulaInput, activeCell);
        }
        if (e.which === KeyCodes.Escape) {
          currentGrid.current?.cancelEditor();
          setFormulaInput(activeCellConfig?.text?.toString() || "");
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
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
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

        onChangeCells?.(id, changes);
      },
      [sheets]
    );

    /**
     * Delete cell values
     */
    const handleDelete = useCallback(
      (id: string, activeCell: CellInterface, selections: SelectionArea[]) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
          const attribute = "text";
          if (sheet) {
            const { cells } = sheet;
            const value: { [key: string]: any } = {};
            const previousValue: { [key: string]: any } = {};
            if (selections.length) {
              selections.forEach((sel) => {
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
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === selectedSheet);
        if (sheet) {
          const { activeCell, selections, cells } = sheet;
          if (selections.length) {
            selections.forEach((sel) => {
              const { bounds } = sel;
              for (let i = bounds.top; i <= bounds.bottom; i++) {
                if (!(i in cells)) continue;
                for (let j = bounds.left; j <= bounds.right; j++) {
                  if (!(j in cells[i])) continue;
                  Object.values(FORMATTING_TYPE).forEach((key) => {
                    delete cells[i]?.[j]?.[key];
                  });
                  Object.values(STROKE_FORMATTING).forEach((key) => {
                    delete cells[i]?.[j]?.[key];
                  });
                }
              }
            });
          } else if (activeCell) {
            const { rowIndex, columnIndex } = activeCell;
            Object.values(FORMATTING_TYPE).forEach((key) => {
              if (key) delete cells[rowIndex]?.[columnIndex]?.[key];
            });
            Object.values(STROKE_FORMATTING).forEach((key) => {
              if (key) delete cells[rowIndex]?.[columnIndex]?.[key];
            });
          }
        }
      });
    }, [sheets, selectedSheet]);

    const handleResize = useCallback(
      (id: string, axis: AXIS, index: number, dimension: number) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
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
      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === selectedSheet);
        if (sheet) {
          const { selections, activeCell } = sheet;
          const { bounds } = selections.length
            ? selections[selections.length - 1]
            : {
                bounds: currentGrid.current?.getCellBounds?.(
                  activeCell as CellInterface
                ),
              };
          if (!bounds) return;
          if (
            (bounds.top === bounds.bottom && bounds.left === bounds.right) ||
            bounds.top === 0 ||
            bounds.left === 0
          )
            return;
          if (!sheet.mergedCells) {
            sheet.mergedCells = [];
          } else {
            /* Check if cell is already merged */
            const index = sheet.mergedCells.findIndex((area) => {
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
      (num) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === selectedSheet);
          if (sheet) {
            sheet.frozenRows = num;
          }
        });
      },
      [selectedSheet]
    );

    const handleFrozenColumnChange = useCallback(
      (num) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === selectedSheet);
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
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === selectedSheet);
          if (sheet) {
            const { selections, cells, activeCell } = sheet;
            const sel = selections.length
              ? selections
              : selectionFromActiveCell(activeCell);
            const boundedCells = cellsInSelectionVariant(
              sel as SelectionArea[],
              variant,
              borderStyle,
              color,
              currentGrid.current?.getCellBounds
            );
            for (const row in boundedCells) {
              for (const col in boundedCells[row]) {
                if (variant === BORDER_VARIANT.NONE) {
                  // Delete all stroke formatting rules
                  Object.values(STROKE_FORMATTING).forEach((key) => {
                    delete cells[row]?.[col]?.[key];
                  });
                } else {
                  const styles = boundedCells[row][col];
                  Object.keys(styles).forEach((key) => {
                    cells[row] = cells[row] ?? {};
                    cells[row][col] = cells[row][col] ?? {};
                    // @ts-ignore
                    cells[row][col][key] = styles[key];
                  });
                }
              }
            }
          }
        });
      },
      [selectedSheet]
    );

    /**
     * Handle sheet scroll
     */
    const handleScroll = useCallback(
      (id: string, scrollState: ScrollCoords) => {
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
          if (sheet) {
            sheet.scrollState = scrollState;
          }
        });
      },
      []
    );

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

      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === id);
        if (sheet) {
          const { cells } = sheet;
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const r = rowIndex + i;
            cells[r] = cells[r] ?? {};
            for (let j = 0; j < row.length; j++) {
              const text = row[j];
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
            right: endColumnIndex,
          },
        },
      ]);
    }, []);

    /**
     * Handle cut event
     */
    const handleCut = useCallback((id: string, selection: SelectionArea) => {
      const { bounds } = selection;

      setSheets((draft) => {
        const sheet = draft.find((sheet) => sheet.id === id);
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
      (id: string, activeCell: CellInterface | null) => {
        if (activeCell === null) return;
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
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
      (id: string, activeCell: CellInterface | null) => {
        if (activeCell === null) return;
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
          if (sheet) {
            const { columnIndex } = activeCell;
            const { cells } = sheet;

            const changes: { [key: string]: any } = {};
            for (const row in cells) {
              const maxCol = Math.max(
                ...Object.keys(cells[row] ?? {}).map(Number)
              );
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
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
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
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
          if (sheet) {
            const { columnIndex } = activeCell;
            const { cells } = sheet;

            const changes: { [key: string]: any } = {};
            for (const row in cells) {
              const maxCol = Math.max(
                ...Object.keys(cells[row] ?? {}).map(Number)
              );
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

    /**
     * Handle keydown events
     */
    const handleKeyDown = useCallback(
      (id, event: React.KeyboardEvent<HTMLDivElement>) => {
        const isMeta = event.metaKey || event.ctrlKey;
        const isShift = event.shiftKey;
        const keyCode = event.which;
        switch (keyCode) {
          case KeyCodes.KEY_B:
            if (!isMeta) return;
            handleFormattingChange(
              FORMATTING_TYPE.BOLD,
              !activeCellConfig?.bold
            );
            break;

          case KeyCodes.KEY_I:
            if (!isMeta) return;
            handleFormattingChange(
              FORMATTING_TYPE.ITALIC,
              !activeCellConfig?.italic
            );
            break;

          case KeyCodes.KEY_U:
            if (!isMeta) return;
            handleFormattingChange(
              FORMATTING_TYPE.UNDERLINE,
              !activeCellConfig?.underline
            );
            break;

          case KeyCodes.KEY_X:
            if (!isMeta && !isShift) return;
            handleFormattingChange(
              FORMATTING_TYPE.STRIKE,
              !activeCellConfig?.strike
            );
            break;

          case KeyCodes.BACK_SLASH:
            if (!isMeta) return;
            handleClearFormatting();
            event?.preventDefault();
            break;

          case KeyCodes.KEY_L:
          case KeyCodes.KEY_E:
          case KeyCodes.KEY_R:
            if (!isMeta || !isShift) return;
            const align =
              keyCode === KeyCodes.KEY_L
                ? HORIZONTAL_ALIGNMENT.LEFT
                : keyCode === KeyCodes.KEY_E
                ? HORIZONTAL_ALIGNMENT.CENTER
                : HORIZONTAL_ALIGNMENT.RIGHT;
            handleFormattingChange(FORMATTING_TYPE.HORIZONTAL_ALIGN, align);
            event?.preventDefault();
            break;
        }
      },
      [activeCellConfig, currentSheet]
    );

    /**
     * Update filters views
     */
    const handleChangeFilter = useCallback(
      (
        id: string,
        filterViewIndex: number,
        columnIndex: number,
        filter?: FilterDefinition
      ) => {
        /* Todo, find rowIndex based on filterViewIndex */
        currentGrid.current?.resetAfterIndices?.({ rowIndex: 0 }, false);
        setSheets((draft) => {
          const sheet = draft.find((sheet) => sheet.id === id);
          if (sheet) {
            if (filter === void 0) {
              delete sheet?.filterViews?.[filterViewIndex]?.filters?.[
                columnIndex
              ];
            } else {
              sheet.filterViews = sheet.filterViews ?? [];
              if (!sheet.filterViews[filterViewIndex].filters) {
                sheet.filterViews[filterViewIndex].filters = {
                  [columnIndex]: filter,
                };
              } else {
                (sheet.filterViews[filterViewIndex].filters as Filter)[
                  columnIndex
                ] = filter;
              }
            }
          }
        });
      },
      []
    );

    /**
     * Callback when scale changes
     */
    const handleScaleChange = useCallback(
      (value) => {
        /* Update grid dimensions */
        currentGrid.current?.resetAfterIndices?.(
          { rowIndex: 0, columnIndex: 0 },
          false
        );
        /* Set scale */
        setScale(value);
      },
      [selectedSheet]
    );

    return (
      <>
        <Global
          styles={css`
            .rowsncolumns-spreadsheet {
              font-family: ${fontFamily};
            }
            .rowsncolumns-grid-container:focus {
              outline: none;
            }
          `}
        />

        <Flex
          flexDirection="column"
          flex={1}
          minWidth={0}
          minHeight={minHeight}
          className="rowsncolumns-spreadsheet"
        >
          {showToolbar ? (
            <Toolbar
              datatype={activeCellConfig?.datatype}
              plaintext={activeCellConfig?.plaintext}
              format={activeCellConfig?.format}
              fontSize={activeCellConfig?.fontSize}
              fontFamily={activeCellConfig?.fontFamily}
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
              onFormattingChangeAuto={handleFormattingChangeAuto}
              onFormattingChangePlain={handleFormattingChangePlain}
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
              scale={scale}
              onScaleChange={handleScaleChange}
              fontList={fontList}
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
            scale={scale}
            StatusBar={StatusBar}
            showTabStrip={showTabStrip}
            isTabEditable={isTabEditable}
            allowNewSheet={allowNewSheet}
            onResize={handleResize}
            formatter={formatter}
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
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onCut={handleCut}
            onInsertRow={handleInsertRow}
            onInsertColumn={handleInsertColumn}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            CellEditor={CellEditor}
            allowMultipleSelection={allowMultipleSelection}
            onSelectionChange={onSelectionChange}
            selectionMode={selectionMode}
            onChangeFilter={handleChangeFilter}
          />
        </Flex>
      </>
    );
  })
);

export interface SpreadSheetPropsWithTheme extends SpreadSheetProps {
  theme?: ThemeType;
  initialColorMode?: "light" | "dark";
}
const ThemeWrapper: React.FC<
  SpreadSheetPropsWithTheme & RefAttributeSheetGrid
> = forwardRef((props, forwardedRef) => {
  const { theme: defaultTheme = theme, initialColorMode, ...rest } = props;
  return (
    <ThemeProvider theme={defaultTheme}>
      <ColorModeProvider value={initialColorMode}>
        <Spreadsheet {...rest} ref={forwardedRef} />
      </ColorModeProvider>
    </ThemeProvider>
  );
});

export default ThemeWrapper;
