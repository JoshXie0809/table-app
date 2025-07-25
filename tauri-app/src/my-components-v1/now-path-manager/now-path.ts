import { BehaviorSubject } from "rxjs";

export const currentPath$ = new BehaviorSubject<string | null>(null);

export function setCurrentPath(path: string) {
  currentPath$.next(path);
}

export function getCurrentPath() {  
  return currentPath$.getValue();
}