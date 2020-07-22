import { CellConfig, SheetID } from "./Spreadsheet";
import { CellInterface } from "@rowsncolumns/grid";

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
      }
      return {
        valid,
      };
    }

    case "boolean": {
      const validList = cellConfig?.dataValidation?.formulae;
      if (!validList) {
        valid = false;
      }
      return {
        valid,
      };
    }

    default:
      return {
        valid,
      };
  }
};

export default validate;
