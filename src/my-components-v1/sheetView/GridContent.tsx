import React, { RefObject, useEffect, useRef } from "react"


import { VManager } from "./canvas-table-v1.1/VirtualizationMangaer";
import { RManager } from "./canvas-table-v1.1/RanderManager";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import { VirtualCells } from "../VirtualCells";


export interface GridContentProps {
  containerRef: RefObject<HTMLDivElement>;
  gridRef: RefObject<HTMLDivElement>;
  vcRef: RefObject<VirtualCells>;
}


export const GridContent : React.FC<GridContentProps> = ({
  containerRef,
  gridRef,
  vcRef,
}) => {

  const vmRef = useRef<null | VManager>(null);
  const rmRef = useRef<null | RManager>(null);
  const containerDim = useContainerDimensions(containerRef);
  
  const totalRow = 102400 ;
  const totalCol = 128;
  const rowHeight = 44;
  const cellWidth = 152;  

  useEffect(() => {
    if(!gridRef.current || !vcRef.current) return;
    const container = gridRef.current;
    const vc = vcRef.current;

    const vm = new VManager(
      containerDim,
      totalRow,
      totalCol,
      rowHeight, cellWidth, 
      2, 2);

    const rm = new RManager(rowHeight, cellWidth, container, vc);

    vmRef.current = vm ;
    rmRef.current = rm; 
    
    // mount init cell
    const cells = vm.nplctrler.pool.map((cell) => cell).flat();
    cells.forEach(cell => rm.mountCell(cell));
    rm.transformScheduler.setExternalFlushMode(true);
    rm.contentScheduler.setExternalFlushMode(true);

    rm.transformScheduler.flush();
    rm.contentScheduler.flush();

    return () => {
      queueMicrotask(() => {
        rm.transformScheduler.flush();
        rm.contentScheduler.flush();
        const cells = vm.nplctrler.pool.map((cell) => cell).flat();
        cells.forEach(cell => rm.unmountCell(cell));
      });
    };

  }, [])

  useEffect(() => {
    if(!containerRef.current) return;
    if(!vmRef.current || !rmRef.current) return;
    const vm = vmRef.current;
    const rm = rmRef.current;
    const diff = vm.setContainerDims(containerDim);
    diff.added.forEach(cell => rm.mountCell(cell));
    queueMicrotask(() => {
      diff.deleted.forEach(cell => rm.unmountCell(cell));
    });

    rm.transformScheduler.flush()
    rm.contentScheduler.flush();

  }, [containerDim])


  useEffect(() => {
    const container = containerRef.current;
    const vm = vmRef.current;
    const rm = rmRef.current;
    if (!container || !vm || !rm) return;

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {
        requestAnimationFrame(() => {
          const ScrollTop = container.scrollTop;
          const scrollLeft = container.scrollLeft;
          const updatedCells = vm.scrollBy(ScrollTop, scrollLeft);
          updatedCells.forEach(cell => rm.markDirty(cell));
          rm.transformScheduler.flush();
          rm.contentScheduler.flush();

          ticking = false;
        });

        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);


  return null;
}