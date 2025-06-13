import { useRef } from "react";
import { Cell } from "../cell/cellPluginSystem";
import { Sheet, updateSheetCellMatrix } from "../sheet/sheet";

export function useDirtyBuffer() {
  const dirtyMapRef = useRef<Map<string, Cell>>(new Map());

  function toKey(r: number, c: number): string {
    return `r${r}c${c}`;
  }

  function parseKey(key: string): [number, number] {
    const match = key.match(/^r(\d+)c(\d+)$/);
    if (!match) throw new Error(`Invalid key: ${key}`);
    return [parseInt(match[1]), parseInt(match[2])];
  }

  function markDirty(r: number, c: number, cell: Cell) {
    dirtyMapRef.current.set(toKey(r, c), cell);
  }

  function flushDirtyToSheet(sheet: Sheet): Sheet {
    const updates: [number, number, Cell][] = [];
    for (const [key, cell] of dirtyMapRef.current.entries()) {
      const [r, c] = parseKey(key);
      updates.push([r, c, cell]);
    }
    
    dirtyMapRef.current.clear();

    return updates.length > 0 ? updateSheetCellMatrix(sheet, updates) : sheet;
  }

  function clearDirty() {
    dirtyMapRef.current.clear();
  }

  function get(r: number, c: number): Cell | undefined {
    return dirtyMapRef.current.get(toKey(r, c));
  }

  const deleteCell = (r: number, c: number) => dirtyMapRef.current.delete(toKey(r, c));

  function has(r: number, c: number): boolean {
    return dirtyMapRef.current.has(toKey(r, c));
  }

  return {
    toKey,
    get,
    has,
    deleteCell,
    markDirty,
    flushDirtyToSheet,
    clearDirty,
    dirtyMapRef,
  };
}