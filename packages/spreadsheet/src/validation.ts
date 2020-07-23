import { CellConfig, SheetID } from "./Spreadsheet";
import { CellInterface } from "@rowsncolumns/grid";
import { detectDataType } from "./constants";

export interface ValidationResponse {
  valid?: boolean;
  message?: string;
}

/**
 * Validate cell changes
 * @param id
 * @param value
 * @param cell
 * @param cellConfig
 */
export const validate = async (
  value: React.ReactText,
  id: SheetID,
  cell: CellInterface,
  cellConfig: CellConfig | undefined
): Promise<ValidationResponse | undefined> => {
  let valid = true;
  switch (cellConfig?.dataValidation?.type) {
    case "list": {
      const validList = cellConfig?.dataValidation?.formulae;
      if (!validList) {
        valid = false;
        return { valid };
      }
      valid = validList?.includes(value);
      return {
        valid,
      };
    }

    case "boolean": {
      const validList = cellConfig?.dataValidation?.formulae;
      if (!validList) {
        valid = false;
        return { valid };
      }
      valid = validList?.includes(value);
      return {
        valid,
      };
    }

    case "decimal": {
      const { operator, formulae } = cellConfig.dataValidation;
      const inferredType = detectDataType(value);
      if (inferredType !== "number") return { valid: false };
      let valid = true;
      switch (operator) {
        case "between":
          const val = parseFloat(value as string);
          const [from, to] = formulae as number[];
          valid = val >= from && val <= to;
          break;
      }
      return {
        valid,
      };
      break;
    }

    default:
      return {
        valid,
      };
  }
};

export default validate;
