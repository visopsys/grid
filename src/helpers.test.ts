import { getBoundedCells, cellIndentifier } from "./helpers";

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
