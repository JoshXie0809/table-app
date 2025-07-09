export function findTransSystemElement(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    if (el.dataset?.transSystem) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
