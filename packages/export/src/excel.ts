import ExcelJS, {
  FillPattern,
  CellFormulaValue,
  WorksheetViewFrozen,
  Buffer,
  ValueType,
  Borders
} from "exceljs";
import {
  Sheet,
  addressToCell,
  CellConfig,
  cellAddress
} from "@rowsncolumns/spreadsheet";
import {
  CellInterface,
  getBoundedCells,
  cellIdentifier,
  isNull
} from "@rowsncolumns/grid";
import { DATATYPE } from "@rowsncolumns/spreadsheet/dist/types";

export interface ExportProps {
  file: File;
}

export interface ExportResults {
  sheets: Sheet[];
}

/**
 * 
 * @param type 
 * 
export declare enum ValueType {
	Null = 0,
	Merge = 1,
	Number = 2,
	String = 3,
	Date = 4,
	Hyperlink = 5,
	Formula = 6,
	SharedString = 7,
	RichText = 8,
	Boolean = 9,
	Error = 10
}
 */
export const getDataTypeFromType = (type: number): DATATYPE => {
  switch (type) {
    case ValueType.Number:
      return DATATYPE.NUMBER;
    case ValueType.Date:
      return DATATYPE.DATE;
    default:
      return DATATYPE.STRING;
  }
};

export const getTypeFromDataType = (datatype: DATATYPE): number => {
  switch (datatype) {
    case DATATYPE.NUMBER:
      return ValueType.Number;
    case DATATYPE.DATE:
      return ValueType.Date;
    default:
      return ValueType.String;
  }
};

/**
 * Convert excel file to Spreadsheet format
 * @param param0
 */
export const excelToSheets = async ({
  file
}: ExportProps): Promise<ExportResults> => {
  let resolver: (value: ExportResults) => void | null;
  const sheetPromise: Promise<ExportResults> = new Promise(
    resolve => (resolver = resolve)
  );
  const wb = new ExcelJS.Workbook();
  const reader = new FileReader();
  const sheets: Sheet[] = [];
  reader.onload = async () => {
    const buffer = reader.result;
    if (!buffer || typeof buffer === "string") {
      console.warn("Invalid file", buffer);
      return;
    }
    const workbook = await wb.xlsx.load(buffer);

    /* Walk each sheet */
    workbook.eachSheet((sheet, id) => {
      if (sheet.state === "hidden") {
        return;
      }
      const _sheet: Sheet = {
        id: sheet.id.toString(),
        name: sheet.name,
        cells: {},
        activeCell: null,
        selections: [],
        mergedCells: [],
        hiddenRows: [],
        hiddenColumns: []
      };
      const mergedCellMap = new Map();
      if (sheet.hasMerges) {
        // @ts-ignore
        for (const address in sheet._merges) {
          // @ts-ignore
          const { model: bounds } = sheet._merges[address];
          const { top, bottom, left, right } = bounds;
          for (const cell of getBoundedCells(bounds)) {
            mergedCellMap.set(cell, bounds);
          }
          _sheet.mergedCells?.push({ top, bottom, left, right });
        }
      }

      /* Check if a cell is part of a merged cell */
      const isMergedCell = ({ rowIndex, columnIndex }: CellInterface) => {
        return mergedCellMap.has(cellIdentifier(rowIndex, columnIndex));
      };

      /* Views */
      const { views } = sheet;
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        const { activeCell } = view;
        if (activeCell) {
          _sheet.activeCell = addressToCell(activeCell);
        }
        const { xSplit, ySplit } = view as WorksheetViewFrozen;
        if (xSplit !== void 0) {
          _sheet.frozenColumns = xSplit;
        }
        if (ySplit !== void 0) {
          _sheet.frozenRows = ySplit;
        }
      }

      /* Walk each row */
      const rowCount = sheet.rowCount;
      for (let i = 1; i <= rowCount; i++) {
        const row = sheet.getRow(i);
        const rowId = row.number;
        const values = row.values;
        const columnCount = row.cellCount;

        if (row.hidden) {
          _sheet.hiddenRows?.push(rowId);
        }
        _sheet.cells[rowId] = {};
        for (let j = 1; j <= columnCount; j++) {
          const cell = row.getCell(j);
          let value = cell.value;

          const currentCell: CellInterface = {
            rowIndex: rowId,
            columnIndex: j
          };
          /* Check if its a merged cell */
          const isMerged = isMergedCell(currentCell);
          if (isMerged) {
            const mergedBounds = mergedCellMap.get(
              cellIdentifier(currentCell.rowIndex, currentCell.columnIndex)
            );
            if (
              mergedBounds.top !== currentCell.rowIndex ||
              mergedBounds.left !== currentCell.columnIndex
            ) {
              continue;
            }
          }

          let fill = undefined;
          let color = undefined;
          let strokes: CellConfig = {};
          /* Fill */
          const fillType = cell.style.fill;
          const datatype = getDataTypeFromType(cell.type);
          const border = cell.style.border;
          if (fillType !== void 0 && cell.style.fill?.type === "pattern") {
            const fillValue = (cell.style
              .fill as FillPattern).bgColor?.argb?.slice(2);
            if (fillValue) fill = "#" + fillValue;
          }

          if (cell.font?.color) {
            const colorValue = cell.font.color.argb?.slice(2);
            if (colorValue) color = "#" + colorValue;
          }
          if (border) {
            for (const key in border) {
              if (!border[key as keyof Borders]?.color?.argb) {
                continue;
              }
              if (key === "bottom") {
                strokes.strokeBottomWidth = 1;
                strokes.strokeBottomColor =
                  "#" + border[key]?.color?.argb?.slice(2);
              }
              if (key === "top") {
                strokes.strokeTopWidth = 1;
                strokes.strokeTopColor =
                  "#" + border[key]?.color?.argb?.slice(2);
              }
              if (key === "left") {
                strokes.strokeLeftWidth = 1;
                strokes.strokeLeftColor =
                  "#" + border[key]?.color?.argb?.slice(2);
              }
              if (key === "right") {
                strokes.strokeRightWidth = 1;
                strokes.strokeRightColor =
                  "#" + border[key]?.color?.argb?.slice(2);
              }
            }
          }

          if (!isNull(value) && typeof value === "object") {
            const result = (value as CellFormulaValue).result;
            if (typeof result === "string") value = result;
          }

          _sheet.cells[rowId][j] = {
            text:
              typeof value === "object" || isNull(value)
                ? ""
                : value.toString(),
            fill,
            color,
            datatype,
            ...strokes
          };
        }
      }

      sheets.push(_sheet);
    });
    resolver({
      sheets
    });
  };
  reader.readAsArrayBuffer(file);

  return sheetPromise;
};

/**
 * Create an excel file blob from sheets
 * @param sheets
 */
export const createExcelFileFromSheets = async (
  sheets: Sheet[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const { name, cells } = sheet;
    const rowCount = Math.max(0, ...Object.keys(cells ?? {}).map(Number));
    const workSheet = workbook.addWorksheet(name);
    for (let j = 1; j <= rowCount; j++) {
      const row = cells[j];
      const cellCount = Math.max(0, ...Object.keys(row ?? {}).map(Number));
      for (let k = 1; k <= cellCount; k++) {
        const cell = row[k];
        if (cell === void 0) continue;
        const address = cellAddress({ rowIndex: j, columnIndex: k });
        if (address !== null) {
          const newCell = workSheet.getCell(address);
          const isNumber = cell.datatype === DATATYPE.NUMBER;
          const value =
            isNumber && cell.text !== void 0
              ? parseFloat(cell.text.toString())
              : cell.text;
          if (value !== void 0) {
            newCell.value = value;
          }
        }
      }
    }
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
