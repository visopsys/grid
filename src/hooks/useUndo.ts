import React, { useReducer, useRef, useEffect, useCallback } from "react";
import { KeyCodes } from "../types";

/**
 * Spec: https://tools.ietf.org/html/rfc6902
 *
 * add, { "op": "add", "path": ["data", "1,2"], "value": "hello world" }
 * remove { "op": "remove", "path": ["data", "1,2"], "value": "hello world" }
 * replace { "op": "replace", "path": ["data", "1,2"], "value": "hello world" }
 * move { "op": "move", "from": "/a/b/c", "path": "/a/b/d" }
 * copy
 */

export interface UndoProps {
  onRedo: (patches: Patches) => void;
  onUndo: (patches: Patches) => void;
}

export interface UndoResults {
  undo: () => void;
  redo: () => void;
  addToUndoStack: (stack: Stack) => void;
  canUndo: boolean;
  canRedo: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface Patches {
  path: [string, any];
  value: any;
  operator: Operator;
}

export interface Stack {
  patches: Patches;
  inversePatches: Patches;
}

export type Operator = "add" | "remove" | "replace" | "move";

export function createPatches(path, value, previousValue, op = "replace") {
  const patches = { op, value, path };
  const inversePatches = { op, value: previousValue, path };
  return { patches, inversePatches };
}

const useUndo = ({ onRedo, onUndo }: UndoProps): UndoResults => {
  const undoStack = useRef<Stack[]>([]);
  const undoStackPointer = useRef<number>(-1);
  const [_, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    document.addEventListener("undo", () => {
      console.log("calld");
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const isUndo = isMeta && e.which === KeyCodes.Z;
      const isRedo = e.shiftKey && isUndo;
      if (!isRedo && !isUndo) return;

      if (isRedo) {
        handleRedo();
      } else {
        handleUndo();
      }
    },
    []
  );

  const handleUndo = () => {
    if (undoStackPointer.current < 0) return;
    const patches = undoStack.current[undoStackPointer.current].inversePatches;
    undoStackPointer.current--;
    onUndo && onUndo(patches);
  };

  const handleRedo = () => {
    if (undoStackPointer.current === undoStack.current.length - 1) return;
    undoStackPointer.current++;
    const patches = undoStack.current[undoStackPointer.current].patches;
    onRedo && onRedo(patches);
  };

  const addUndoable = ({ patches, inversePatches }) => {
    const pointer = ++undoStackPointer.current;
    undoStack.current.length = pointer;
    undoStack.current[pointer] = { patches, inversePatches };
  };

  return {
    undo: handleUndo,
    redo: handleRedo,
    addToUndoStack: addUndoable,
    canUndo: !(undoStackPointer.current < 0),
    canRedo: !(undoStackPointer.current === undoStack.current.length - 1),
    onKeyDown: handleKeyDown,
  };
};

export default useUndo;
