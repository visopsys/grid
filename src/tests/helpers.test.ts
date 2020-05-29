// @ts-nocheck
import {
  getEstimatedTotalWidth,
  getEstimatedTotalHeight,
  getBoundedCells,
  cellIndentifier,
} from "../helpers";

describe("getBoundedCells", () => {
  it("returns empty for undefined area", () => {
    const cells = getBoundedCells(undefined);
    expect(cells.size).toBe(0);
  });

  it("returns accurate top, left, right and bottom indexs", () => {
    const cells = getBoundedCells({
      top: 1,
      right: 5,
      left: 1,
      bottom: 5,
    });
    expect(cells.has(cellIndentifier(1, 1))).toBeTruthy();
    expect(cells.has(cellIndentifier(5, 5))).toBeTruthy();
  });
});

describe("getEstimatedTotalWidth", () => {
  it("returns estimated width during initial load", () => {
    const columnCount = 200;
    const estimatedColumnWidth = 30;
    const instanceProps = {
      lastMeasuredColumnIndex: -1,
      columnMetadataMap: {},
    };

    expect(
      getEstimatedTotalWidth(columnCount, estimatedColumnWidth, instanceProps)
    ).toBe(6000);
  });

  it("returns correct width", () => {
    const columnCount = 200;
    const estimatedColumnWidth = 30;
    const instanceProps = {
      lastMeasuredColumnIndex: 1,
      columnMetadataMap: {
        0: {
          offset: 0,
          size: 20,
        },
        1: {
          offset: 20,
          size: 70,
        },
      },
    };

    expect(
      getEstimatedTotalWidth(columnCount, estimatedColumnWidth, instanceProps)
    ).toBe(6030);
  });
});

describe("getEstimatedTotalHeight", () => {
  it("returns estimated height during initial load", () => {
    const rowCount = 200;
    const estimatedRowHeight = 30;
    const instanceProps = {
      lastMeasuredRowIndex: -1,
      rowMetadataMap: {},
    };

    expect(
      getEstimatedTotalHeight(rowCount, estimatedRowHeight, instanceProps)
    ).toBe(6000);
  });

  it("returns correct height after load", () => {
    const rowCount = 200;
    const estimatedRowHeight = 30;
    const instanceProps = {
      lastMeasuredRowIndex: 0,
      rowMetadataMap: {
        0: {
          offset: 0,
          size: 20,
        },
        1: {
          offset: 20,
          size: 70,
        },
      },
    };

    expect(
      getEstimatedTotalHeight(rowCount, estimatedRowHeight, instanceProps)
    ).toBe(5990);
  });
});
