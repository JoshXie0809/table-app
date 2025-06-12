import { useEffect, RefObject } from 'react';
import { Sheet } from '../../../sheet/sheet';
import { CellPosition } from '../../SheetView'

export function useSheetInteraction(
    canvasRef: RefObject<HTMLCanvasElement>,
    tableRef: RefObject<HTMLDivElement>,
    sheet: Sheet,
    onCellClick: ((rc: CellPosition) => void) | undefined,
    debug: boolean = false,
) {

    useEffect(() => {
      if (!onCellClick) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const tableContainer = tableRef.current;
      
      if(!tableContainer) return;

      
      const handleCanvasClick = (event: MouseEvent) => {

        const containerRect = {
          h: tableContainer.clientHeight,
          w: tableContainer.clientWidth,
        }

        const scrollLeft = tableContainer!.scrollLeft;
        const scrollTop = tableContainer!.scrollTop;


        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const realCoord = {x: scrollLeft + x, y: scrollTop + y}

        const realRC = {
          row: Math.floor(realCoord.y/sheet.sheetCellHeight),
          col: Math.floor(realCoord.x/sheet.sheetCellWidth)
        }

        const sheetRC = {
          row: realRC.row - 1,
          col: realRC.col - 1,
        }

        const canvasCoord = {
          x: realRC.col * sheet.sheetCellWidth - scrollLeft,
          y: realRC.row * sheet.sheetCellHeight - scrollTop,
        }

        if(debug) {
          console.log("real coordinate", realCoord)
          console.log("sheet-RC", sheetRC)
          console.log("canvas coordinate", canvasCoord)
          console.log("container Rect", containerRect)
        }

        onCellClick({
          realCoord,
          sheetRC,
          canvasCoord,
          containerRect,
        })
      };

      canvas.addEventListener('mousedown', handleCanvasClick);

      return () => {
        canvas.removeEventListener('mousedown', handleCanvasClick);
      };

    }, [canvasRef, sheet, onCellClick])
}