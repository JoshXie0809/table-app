import { VirtualPool } from "./IVirtualPool";

export interface IVirtualRow {
  el: HTMLElement;
  id: number;
  transY: number;
  giveEl: () => HTMLElement;
}

class VirtualRow implements IVirtualRow {
  el: HTMLElement;
  id: number;
  transY: number;

  constructor (el: HTMLElement, id: number, transY: number ) {
    this.el = el;
    this.id = id;
    this.transY = transY;  
  }

  giveEl =  (): HTMLElement => { return this.el; };
}

export interface IVirtualRowPool {
  topId: number;
  bottomId: number;

  topTransY: number;
  bottomTransY: number;
  
  pool: VirtualPool<IVirtualRow>;
  poolSize: number;

  rowHeigth: number;
  overScan: number;
  
  topElToBottom: () => void;
  bottomElToTop: () => void;
  topTransYMove: () => void;
  bottomTransYMove: () => void;

  reSize: (n: number)  => void;
  clearAll: () => void;
  giveRowI: (i: number) => IVirtualRow | undefined;
}


class VirtualRowPool implements IVirtualRowPool {
  topId: number;
  bottomId: number;
  topTransY: number;
  bottomTransY: number;
  pool: VirtualPool<IVirtualRow>;
  poolSize: number;
  rowHeigth: number;
  

  constructor(
    container: HTMLElement, poolSize: number, rowHeigth: number, 
    totalWidth: number,
  ) {

    this.topId = 0;
    this.poolSize = poolSize;
    this.bottomId = poolSize - 1;
    this.rowHeigth = rowHeigth;

    this.topTransY = 0;
    this.bottomTransY = (poolSize - 1) * rowHeigth;

    this.pool = new VirtualPool<IVirtualRow>;

    for(let i = 0; i < this.poolSize; i++) {
      const id = i;
      const el = document.createElement("div");
      const transY = i * rowHeigth;
      
      this.pool.pushBottom(new VirtualRow(el, id, transY));
      el.style.position = "absolute";
      el.style.top = "0px";
      el.style.willChange = "transform";

    }

  }


}