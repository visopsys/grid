import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SelectionProps, CellInterface, GridRef, SelectionArea } from "../Grid";
import { selectionFromActiveCell, prepareClipboardData } from "./../helpers";
import { KeyCodes } from "../types";

interface CopyProps {
  selections: SelectionArea[];
  activeCell?: CellInterface | null;
  getValue: (cell: CellInterface) => any;
  gridRef: React.MutableRefObject<GridRef>;
  onPaste?: (
    rows: (string | null)[][],
    activeCell: CellInterface | null
  ) => void;
}

enum MimeType {
  html = "text/html",
  csv = "text/csv",
  plain = "text/plain",
  json = "application/json",
}

/**
 * Copy paste hook
 * Usage
 *
 * useCopyPaste ({
 *  onPaste: (text) => {
 *  }
 * })
 */
const useCopyPaste = ({
  selections = [],
  activeCell = null,
  getValue,
  gridRef,
  onPaste,
}: CopyProps) => {
  const selectionRef = useRef({ selections, activeCell, getValue });

  /* Keep selections and activeCell upto date */
  useEffect(() => {
    selectionRef.current = { selections, activeCell, getValue };
  });

  const currentSelections = () => {
    const sel = selectionRef.current.selections.length
      ? selectionRef.current.selections
      : selectionFromActiveCell(selectionRef.current.activeCell);
    return sel[sel.length - 1];
  };

  useEffect(() => {
    if (!gridRef.current) return;
    document.addEventListener("copy", (e) => {
      if (gridRef.current?.container !== document.activeElement) return;
      handleCopy(e);
    });

    document.addEventListener("paste", (e) => {
      if (gridRef.current?.container !== document.activeElement) return;
      handlePaste(e);
    });
  }, []);

  const handleCopy = useCallback(
    (e: ClipboardEvent) => {
      /* Only copy the last selection */
      const { bounds } = currentSelections();
      const { top, left, right, bottom } = bounds;
      const rows = [];
      for (let i = top; i <= bottom; i++) {
        const row = [];
        for (let j = left; j <= right; j++) {
          const value =
            selectionRef.current.getValue({ rowIndex: i, columnIndex: j }) ??
            "";
          row.push(value);
        }
        rows.push(row);
      }
      const [html, csv] = prepareClipboardData(rows);
      e.clipboardData?.setData(MimeType.html, html);
      e.clipboardData?.setData(MimeType.plain, csv);
      e.clipboardData?.setData(MimeType.csv, csv);
      e.clipboardData?.setData(MimeType.json, JSON.stringify(rows));
      e.preventDefault();
    },
    [currentSelections]
  );

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const mimeTypes = [MimeType.html, MimeType.csv, MimeType.plain];
    let type;
    let value;
    for (type of mimeTypes) {
      value = e.clipboardData?.getData(type);
      if (value) break;
    }
    if (!type || !value) {
      console.warn("No clipboard data to paste");
      return;
    }
    const rows = [];
    if (/^text\/html/.test(type)) {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(value, type as SupportedType);
      const supportedNodes = "table, p, h1, h2, h3, h4, h5, h6";
      const nodes = doc.querySelectorAll(supportedNodes);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeName === "TABLE") {
          const tableRows = doc.querySelectorAll("tr");
          for (const tableRow of tableRows) {
            const row = [];
            const cells = tableRow.querySelectorAll("td");
            for (const cell of cells) {
              row.push(cell.textContent);
            }
            rows.push(row);
          }
        } else {
          // Single nodes
          rows.push([node.textContent]);
        }
      }
    } else {
      const values = value.split("\n");
      for (const val of values) {
        const row = [];
        for (const cell of val.split(",")) {
          row.push(cell.replace(/^\"|\"$/gi, ""));
        }
        rows.push(row);
      }
    }
    onPaste && onPaste(rows, selectionRef.current.activeCell);
  };

  return {};
};

export default useCopyPaste;
