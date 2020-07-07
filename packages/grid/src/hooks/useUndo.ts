import React, { useReducer, useRef, useCallback, useEffect } from "react";
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
  id?: number;
  onRedo?: (patches: Patches) => void;
  onUndo?: (patches: Patches) => void;
}

export interface UndoResults {
  undo: () => void;
  redo: () => void;
  add: (stack: Stack) => void;
  canUndo: boolean;
  canRedo: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export type Path = any[];

export interface Patches {
  path: Path;
  value: any;
  op: PatchOperator;
}

export interface Stack {
  patches: Patches;
  inversePatches: Patches;
}

export enum PatchOperator {
  ADD = "add",
  REMOVE = "remove",
  REPLACE = "replace",
  MOVE = "move",
}

/**
 * Create patches
 * @param path
 * @param value
 * @param previousValue
 * @param op
 */
export function createPatches(
  path: Path,
  value?: any,
  previousValue?: any,
  op: PatchOperator = PatchOperator.REPLACE,
  opInverse: PatchOperator = op
): Stack {
  const patches: Patches = { op, value, path };
  const inversePatches: Patches = { op: opInverse, value: previousValue, path };
  return { patches, inversePatches };
}

/**
 * Undo/Redo hook
 * @param
 */
const useUndo = (props: UndoProps = {}): UndoResults => {
  const { onRedo, onUndo } = props;
  const undoStack = useRef<Stack[]>([]);
  const undoStackPointer = useRef<number>(-1);
  const [_, forceRender] = useReducer((s) => s + 1, 0);

  // Enable global undo
  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown)
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [])

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
    forceRender();
  };

  const handleRedo = () => {
    if (undoStackPointer.current === undoStack.current.length - 1) return;
    undoStackPointer.current++;
    const patches = undoStack.current[undoStackPointer.current].patches;
    onRedo && onRedo(patches);
    forceRender();
  };

  const addUndoable = ({ patches, inversePatches }: Stack) => {
    const pointer = ++undoStackPointer.current;
    undoStack.current.length = pointer;
    undoStack.current[pointer] = { patches, inversePatches };
    forceRender();
  };

  return {
    undo: handleUndo,
    redo: handleRedo,
    add: addUndoable,
    onKeyDown: handleKeyDown,
    canUndo: !(undoStackPointer.current < 0),
    canRedo: !(undoStackPointer.current === undoStack.current.length - 1),
  };
};

export default useUndo;
