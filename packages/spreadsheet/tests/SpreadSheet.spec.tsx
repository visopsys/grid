import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import SpreadSheet from "./../src/Spreadsheet";

describe("SpreadSheet", () => {
  test("renders spreadsheet", () => {
    const renderGrid = () => render(<SpreadSheet />);
    expect(renderGrid).not.toThrow();
  });
});
