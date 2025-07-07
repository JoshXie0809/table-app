import { RefObject, useEffect } from "react";
import { TransSystemName } from "./canvas-table-v1.1/RenderManager";


export interface TopLeftCellProps {
  containerRef: RefObject<HTMLDivElement>;
  tlcRef: RefObject<HTMLDivElement>;
}

export const TopLeftCell: React.FC<TopLeftCellProps> = ({
  containerRef,
  tlcRef,
}) => {

  useEffect(() => {
    if(!containerRef.current) return;
    const tlc = tlcRef.current;
    if(!tlc) return;

    tlc.style.transform = `translate3d(${0}px, ${0}px, 0px)`;
    const transSystemName: TransSystemName = `tlc`
    tlc.dataset.transSystem = transSystemName;
    tlc.dataset.transX = `${0}`;
    tlc.dataset.transY = `${0}`;

    const handleScroll = () => {
      const container = containerRef.current;
      if(!container) return;
      const tlc = tlcRef.current;
      if(!tlc) return;
      
      let ticking = false;
      if (!ticking) {
        ticking = true; // 立即設定為 true，表示已排程一個幀

        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
          tlc.style.transform = `translate3d(${scrollLeft}px, ${scrollTop}px, 0px)`;
          const transSystemName: TransSystemName = `tlc`
          tlc.dataset.transSystem = transSystemName;
          tlc.dataset.transX = `${scrollLeft}`;
          tlc.dataset.transY = `${scrollTop}`;

          ticking = false; // 所有更新完成後，將 ticking 設為 false
        });
      }

      
    };
    containerRef.current.addEventListener("scroll", handleScroll);

    // 清理函數：在組件卸載或依賴變化時移除事件監聽器
    return () => {
      if(containerRef.current)
        containerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []); // 空依賴陣列表示只在組件 mount 和 unmount 時執行


  return null;
}