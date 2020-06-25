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
import {
  theme,
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  Flex
} from "@chakra-ui/core";
import { Global, css } from "@emotion/core";
import {
  RendererProps,
  CellInterface,
  SelectionArea,
  ScrollCoords,
  useUndo,
  AreaProps,
  StylingProps,
  createPatches
} from "@rowsncolumns/grid";
import useControllableState from "./useControllableState";
import {
  createNewSheet,
  uuid,
  detectDataType,
  createBorderStyle
} from "./constants";
import {
  FORMATTING_TYPE,
  DATATYPE,
  VERTICAL_ALIGNMENT,
  HORIZONTAL_ALIGNMENT,
  CellFormatting,
  CellDataFormatting,
  AXIS,
  BORDER_VARIANT,
  OPERATION_TYPE,
  RESOURCE_TYPE
} from "./types";
import { useImmer } from "use-immer";
import { WorkbookGridRef } from "./Grid/Grid";
import { KeyCodes, Direction } from "@rowsncolumns/grid/dist/types";
import { Patches, PatchOperator } from "@rowsncolumns/grid/dist/hooks/useUndo";

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

/**
 * Spreadsheet component
 * TODO
 * 1. Reduce scroll jump
 * @param props
 */
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
    selections: [],
    borderStyles: [],
    cells: {
      1: {
        1: {
          text: "Hello world",
          color: "red",
          bold: true,
          italic: true,
          verticalAlign: VERTICAL_ALIGNMENT.MIDDLE,
          horizontalAlign: HORIZONTAL_ALIGNMENT.LEFT,
          strike: true,
          underline: true,
          fill: "green"
        },
        2: {
          text: "2",
          datatype: DATATYPE.NUMBER,
          decimals: 4
        }
      }
    },
    scrollState: { scrollTop: 0, scrollLeft: 0 }
  }
];
const Spreadsheet = (props: SpreadSheetProps) => {
  const {
    initialSheets = defaultSheets,
    onChange,
    showFormulabar = true,
    minColumnWidth,
    minRowHeight,
    CellRenderer,
    HeaderCellRenderer,
    initialActiveSheet = defaultActiveSheet,
    activeSheet,
    onChangeSelectedSheet,
    onChangeSheets,
    showToolbar = true,
    format,
    enableDarkMode = true
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

  /* Callback when sheets is changed */
  useEffect(() => {
    onChangeSheets?.(sheets);
  }, [sheets]);

  useEffect(() => {
    selectedSheetRef.current = selectedSheet;
  });

  /**
   * Handles undo/redo
   */
  const onUndoRedo = useCallback((type: string, patches: Patches) => {
    const { path, value, op } = patches;
    const [resource, id, subresource, ...values] = path;
    /* Select active sheet */
    if (id !== selectedSheetRef.current) setSelectedSheet(id);

    if (resource === RESOURCE_TYPE.SHEET) {
      /* Cell edits */
      if (subresource === RESOURCE_TYPE.CELL) {
        const [rowIndex, columnIndex, attribute] = values;
        setSheets(draft => {
          const sheet = draft.find(sheet => sheet.id === id);
          if (sheet) {
            if (value !== void 0) {
              if (!(rowIndex in sheet.cells)) sheet.cells[rowIndex] = {};
            }
            if (attribute) {
              sheet.cells[rowIndex][columnIndex][
                attribute as keyof CellFormatting
              ] = value;
            } else {
              sheet.cells[rowIndex][columnIndex] = value;
            }
          }
        });

        currentGrid.current?.setActiveCell({ rowIndex, columnIndex });
      }

      if (subresource === RESOURCE_TYPE.SELECTION) {
        const [selectionStr, atttribute] = values;
        const selections: SelectionArea[] = JSON.parse(selectionStr);
        setSheets(draft => {
          const sheet = draft.find(sheet => sheet.id === id);
          if (sheet) {
            selections.forEach(sel => {
              const { bounds } = sel;
              for (let i = bounds.top; i <= bounds.bottom; i++) {
                for (let j = bounds.left; j <= bounds.right; j++) {
                  sheet.cells[i][j][atttribute as keyof CellFormatting] =
                    typeof value === "object" ? value[i]?.[j]?.[type] : value;
                }
              }
            });
          }
        });
      }

      // Sheet name change
      if (subresource === OPERATION_TYPE.CHANGE_SHEET_NAME) {
        setSheets(draft => {
          const sheet = draft.find(sheet => sheet.id === id);
          if (sheet) {
            sheet.name = value;
          }
        });
      }

      if (op === PatchOperator.ADD) {
        const [index] = values;
        // Add sheet
        setSheets(draft => {
          draft.splice(index, 0, value);
        });
        setSelectedSheet(value.id);
      }

      if (op === PatchOperator.REMOVE) {
        // Remove sheet
        const previousSelectedSheet = subresource;
        setSelectedSheet(previousSelectedSheet);
        setSheets(draft => {
          const index = draft.findIndex(sheet => sheet.id === id);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        });
      }
    }
  }, []);

  /**
   * Undo/redo
   */
  const {
    undo,
    redo,
    add: pushToUndoStack,
    canUndo,
    canRedo,
    onKeyDown: handleUndoKeyDown
  } = useUndo({
    onRedo: patches => onUndoRedo("redo", patches),
    onUndo: patches => onUndoRedo("undo", patches)
  });

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

    /* Add to stack */
    pushToUndoStack(
      createPatches(
        [RESOURCE_TYPE.SHEET, newSheet.id, selectedSheet, count],
        newSheet,
        undefined,
        PatchOperator.ADD,
        PatchOperator.REMOVE
      )
    );
  }, [sheets, selectedSheet]);

  /**
   * Cell changes on user input
   */
  const handleChange = useCallback((id: string, changes: Cells) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        for (const row in changes) {
          if (!(row in sheet.cells)) sheet.cells[row] = {};
          for (const col in changes[row]) {
            /* Grab the previous value for undo */
            const previousValue = sheet.cells[row][col];
            if (!(col in sheet.cells[row])) sheet.cells[row][col] = {};
            const cell = sheet.cells[row][col];
            const value = changes[row][col].text;
            cell.text = value;

            /* Get datatype of user input */
            const datatype = detectDataType(value);
            cell.datatype = datatype;

            pushToUndoStack(
              createPatches(
                [RESOURCE_TYPE.SHEET, id, RESOURCE_TYPE.CELL, row, col],
                { ...cell },
                { ...previousValue }
              )
            );
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
        pushToUndoStack(
          createPatches(
            [RESOURCE_TYPE.SHEET, id, OPERATION_TYPE.CHANGE_SHEET_NAME],
            name,
            previousValue
          )
        );
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

      pushToUndoStack(
        createPatches(
          [RESOURCE_TYPE.SHEET, id, newSelectedSheet, index],
          undefined,
          sheets[index],
          PatchOperator.REMOVE,
          PatchOperator.ADD
        )
      );
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

      pushToUndoStack(
        createPatches(
          [RESOURCE_TYPE.SHEET, newSheetId, selectedSheet, index + 1],
          newSheet,
          undefined,
          PatchOperator.ADD,
          PatchOperator.REMOVE
        )
      );
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
                if (!(i in cells)) {
                  cells[i] = {};
                  previousValue[i] = {};
                }
                for (let j = bounds.left; j <= bounds.right; j++) {
                  if (!(j in cells[i])) {
                    cells[i][j] = {};
                    previousValue[i][j] = {};
                  }
                  previousValue[i][j] = { ...cells[i][j] };
                  cells[i][j][type as keyof CellFormatting] = value;
                }
              }
            });
            pushToUndoStack(
              createPatches(
                [
                  RESOURCE_TYPE.SHEET,
                  selectedSheet,
                  RESOURCE_TYPE.SELECTION,
                  JSON.stringify(selections),
                  type
                ],
                value,
                previousValue
              )
            );
          } else if (activeCell) {
            const { rowIndex, columnIndex } = activeCell;
            if (!(rowIndex in cells)) cells[rowIndex] = {};
            const previousValue =
              cells[rowIndex][columnIndex]?.[type as keyof CellFormatting];
            if (!(columnIndex in cells[rowIndex]))
              cells[rowIndex][columnIndex] = {};
            cells[rowIndex][columnIndex][type as keyof CellFormatting] = value;

            pushToUndoStack(
              createPatches(
                [
                  RESOURCE_TYPE.SHEET,
                  selectedSheet,
                  RESOURCE_TYPE.CELL,
                  rowIndex,
                  columnIndex,
                  type
                ],
                value,
                previousValue
              )
            );
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
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { cells } = sheet;
          const currentValue =
            cells[activeCell.rowIndex]?.[activeCell.columnIndex];
          for (let i = bounds.top; i <= bounds.bottom; i++) {
            if (!(i in cells)) cells[i] = {};
            if (!(i in changes)) changes[i] = {};
            for (let j = bounds.left; j <= bounds.right; j++) {
              if (i === activeCell.rowIndex && j === activeCell.columnIndex)
                continue;
              if (!(j in cells[i])) cells[i][j] = {};
              if (!(j in changes[i])) changes[i][j] = {};
              cells[i][j] = currentValue;
              changes[i][j] = currentValue;
            }
          }
        }
      });

      onChange?.(id, changes);
    },
    []
  );

  /**
   * Delete cell values
   */
  const handleDelete = useCallback(
    (id: string, activeCell: CellInterface, selections: SelectionArea[]) => {
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === id);
        if (sheet) {
          const { cells } = sheet;
          if (selections.length) {
            selections.forEach(sel => {
              const { bounds } = sel;
              for (let i = bounds.top; i <= bounds.bottom; i++) {
                if (!(i in cells)) continue;
                for (let j = bounds.left; j <= bounds.right; j++) {
                  if (!(j in cells[i]) || cells[i][j] === void 0) continue;
                  cells[i][j].text = "";
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
                  delete cells[i][j][key];
                });
              }
            }
          });
        } else if (activeCell) {
          const { rowIndex, columnIndex } = activeCell;
          Object.values(FORMATTING_TYPE).forEach(key => {
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
      requestAnimationFrame(() => {
        axis === AXIS.X
          ? currentGrid.current?.resizeColumns?.([index])
          : currentGrid.current?.resizeRows?.([index]);
      });
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
    (color: string, variant?: BORDER_VARIANT) => {
      /* Create a border style based on variant */
      const borderVariantStyle = createBorderStyle(variant);
      setSheets(draft => {
        const sheet = draft.find(sheet => sheet.id === selectedSheet);
        if (sheet) {
          const { activeCell, selections, borderStyles } = sheet;
          if (!activeCell) return;
          const { bounds: cellBounds } = selections.length
            ? selections[selections.length - 1]
            : {
                bounds: currentGrid.current?.getCellBounds?.(
                  activeCell as CellInterface
                )
              };
          const index = borderStyles?.findIndex(({ bounds }) => {
            return (
              bounds.left === cellBounds?.left &&
              bounds.right === cellBounds.right &&
              bounds.top === cellBounds.top &&
              bounds.bottom === cellBounds.bottom
            );
          });
          if (!cellBounds) return;
          /* This bound does not exist */
          if (!sheet.borderStyles) sheet.borderStyles = [];

          /* Create border style */
          const newStyle = {
            ...borderVariantStyle,
            stroke: color
          };

          /* Add borders */
          if (index === -1) {
            sheet.borderStyles.push({
              bounds: cellBounds,
              style: newStyle
            });
          } else if (index !== void 0) {
            if (variant === BORDER_VARIANT.NONE) {
              sheet.borderStyles.splice(index, 1);
            } else {
              sheet.borderStyles[index].style = newStyle;
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
  const handleScroll = useCallback((id: string, scrollState: ScrollCoords) => {
    setSheets(draft => {
      const sheet = draft.find(sheet => sheet.id === id);
      if (sheet) {
        sheet.scrollState = scrollState;
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
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
              onRedo={redo}
              onUndo={undo}
              canRedo={canRedo}
              canUndo={canUndo}
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
            onKeyDown={handleUndoKeyDown}
          />
        </Flex>
      </ColorModeProvider>
    </ThemeProvider>
  );
};

export default Spreadsheet;
