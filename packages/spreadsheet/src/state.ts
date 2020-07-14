import produce, { enablePatches } from "immer";
import { uuid } from "./constants";
import { Sheet } from "./Spreadsheet";

// enablePatches()

export const defaultSheets: Sheet[] = [
  {
    id: uuid(),
    name: "Sheet1",
    frozenColumns: 0,
    frozenRows: 0,
    activeCell: {
      rowIndex: 1,
      columnIndex: 1,
    },
    mergedCells: [],
    selections: [],
    cells: {},
    scrollState: { scrollTop: 0, scrollLeft: 0 },
    filterViews: [],
  },
];

export interface StateInterface {
  selectedSheet: React.ReactText | null;
}

export enum ACTION_TYPE {
  SELECT_SHEET = "SELECT_SHEET",
}

export type ActionTypes = {
  type: ACTION_TYPE.SELECT_SHEET;
  id: React.ReactText;
};

const initialState: StateInterface = {
  selectedSheet: 0,
  // sheets: defaultSheets
};

export default function (
  state = initialState,
  action: ActionTypes
): StateInterface {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SELECT_SHEET":
        draft.selectedSheet = action.id;
        break;
    }
  });
}
