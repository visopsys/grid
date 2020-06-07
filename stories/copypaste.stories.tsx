// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import Grid, { Cell, useSelection, SelectionArea } from "../src";
import useCopyPaste from "./../src/hooks/useCopyPaste";

export default {
  title: "Copy Paste",
  component: Grid,
};

export const Default = () => {
  const rowCount = 100;
  const columnCount = 100;
  const App = () => {
    const [data, setData] = useState({
      [[1, 2]]: "Hello world",
    });
    const gridRef = useRef();
    const getValue = useCallback(
      ({ rowIndex, columnIndex }) => {
        return data[[rowIndex, columnIndex]];
      },
      [data]
    );
    const {
      activeCell,
      selections,
      setSelections,
      ...selectionProps
    } = useSelection({
      gridRef,
    });

    useCopyPaste({
      gridRef,
      selections,
      activeCell,
      getValue,
      onPaste: (rows, activeCell) => {
        const { rowIndex, columnIndex } = activeCell;
        const endRowIndex = rowIndex + rows.length - 1;
        const endColumnIndex =
          columnIndex + (rows.length && rows[0].length - 1);
        const changes = {};
        for (const [i, row] of rows.entries()) {
          for (const [j, cell] of row.entries()) {
            changes[[rowIndex + i, columnIndex + j]] = cell;
          }
        }
        setData((prev) => ({ ...prev, ...changes }));
        if (rows.length === 1 && rows[0].length === 1) return;

        setSelections([
          {
            bounds: {
              top: rowIndex,
              left: columnIndex,
              bottom: endRowIndex,
              right: endColumnIndex,
            },
          },
        ]);
      },
    });
    return (
      <>
        <Grid
          activeCell={activeCell}
          selections={selections}
          ref={gridRef}
          rowCount={rowCount}
          columnCount={columnCount}
          columnWidth={() => 100}
          itemRenderer={(props) => {
            return (
              <Cell
                {...props}
                value={data[[props.rowIndex, props.columnIndex]]}
              />
            );
          }}
          {...selectionProps}
        />
      </>
    );
  };
  return <App />;
};

Default.story = {
  name: "Copy cells",
};
