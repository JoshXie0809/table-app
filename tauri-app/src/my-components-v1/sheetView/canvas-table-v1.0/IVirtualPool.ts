// export interface IVirtualPool<T> {
//   items: T[];

//   // 兩者應該結合使用
//   popTop: () => T | undefined; // 排出最前方的 obj
//   pushBottom: (item: T) => void; // 從最後方推入 obj

//   // // 兩者應該結合使用
//   popBottom: () => T | undefined; // 排出最後方的 obj
//   pushTop: (item: T) => void; // 從最前方推入 obj

//   // 給予 index
//   getIndex: () => number[]
// }


// export class VirtualPool<T> implements IVirtualPool<T> {
//   items: T[] = [];

//   public popTop = (): T | undefined =>  {
//     // 取出第一個物件
//     const topEl: T | undefined = this.items.shift();
//     if(!topEl) return undefined;
//     return topEl;
//   };

//   public pushBottom = (item: T) : void => {
//     this.items.push(item);
//   };

//   public popBottom = () : T | undefined => {
//     // 取出最後一個物件
//     const bottomEl: T | undefined = this.items.pop();
//     if(!bottomEl) return undefined;
//     return bottomEl;
//   }

//   public pushTop = (item: T) : void => {
//     this.items.unshift(item);
//   };

// }