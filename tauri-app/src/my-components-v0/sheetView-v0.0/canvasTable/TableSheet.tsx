// import React, { useMemo, useRef } from "react";
// import { Sheet } from "../../sheet/sheet-old"
// import { Cell } from "../../cell/cellPluginSystem";
// import { type ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
// import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
// import { useVirtualizer } from "@tanstack/react-virtual";

// export interface SheetProps {
//   sheet: Sheet;
//   style?: React.CSSProperties;
// }


// // 1. 定義給 TanStack Table 使用的「一列資料」的型別
// type TableRowData = {
//   rowHeader: string;
//   cells: Cell[];
// };


// const TableSheet: React.FC<SheetProps> = ({
//   sheet,
//   style = {},
// }) => {

//   // 2. 使用 useMemo 進行資料重組，只有當 sheet 變化時才重新計算
//   const tableData = useMemo((): TableRowData[] => {
//     console.log("Memo: Re-calculating table data..."); // 用來觀察計算時機
//     return sheet.rowHeader.map((header, index) => ({
//       rowHeader: header,
//       cells: sheet.cellMatrix[index],
//     }));
//   }, [sheet]);

//   const parentRef = useRef<HTMLDivElement>(null);

//   const columns = useMemo((): ColumnDef<TableRowData>[] => {
//     console.log("Memo: Re-calculating columns...");

//     // 第一欄：固定用來顯示列標題
//     const rowHeaderColumn: ColumnDef<TableRowData> = {
//       id: 'rowHeader',
//       header: "",
//       accessorKey: 'rowHeader',
//       size: sheet.sheetCellWidth, // 固定寬度
//     };

//     // 其他資料欄：根據 columnHeader 動態生成
//     const cellColumns: ColumnDef<TableRowData>[] = sheet.columnHeader.map((header, colIndex) => ({
//       id: `col-${header}`,
//       header: header,
//       size: sheet.sheetCellWidth,
//       // 使用 accessorFn 從每列的 cells 陣列中取出對應的 Cell 物件
//       accessorFn: (row) => row.cells[colIndex],
//       // cell renderer 負責決定如何顯示 Cell 物件

//       cell: (info) => {
//         const cell = info.getValue() as Cell;
//         return `${cell.payload.value}`;
//       },
//     }));

//     return [rowHeaderColumn, ...cellColumns];
//   }, [sheet.columnHeader, sheet.sheetCellWidth]); // 依賴 columnHeader

//   // 步驟四：初始化 Table 實例
//   const table = useReactTable({
//     data: tableData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });
  
//   const headers = table.getHeaderGroups()[0].headers;

//   // step 4.5 virtualizer
//   const rows = useMemo(() => {
//     return table.getRowModel().rows;
//   }, [sheet, table])


//   const rowVirtualizer = useVirtualizer({
//     count: rows.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => sheet.sheetCellHeight,
//     overscan: 8,
//   });

//   const virtualRows = rowVirtualizer.getVirtualItems();
//   const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
//   const paddingBottom =
//     virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0) : 0;

//   // 步驟五：渲染 JSX
//   return (
//     <div ref={parentRef} style={{...style, overflow:"auto", height: style.height ?? "100%",}}>
//       <Table>
//         <TableHeader>
//           <TableRow style={{ height: sheet.sheetCellHeight }}>
//             {headers.map((header, _i) => (
//               <TableHeaderCell key={header.id} style={{ width: header.getSize()}}>
//                 {flexRender(header.column.columnDef.header, header.getContext())}
//               </TableHeaderCell>
//             ))}
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {paddingTop > 0 && (
//             <TableRow style={{ height: `${paddingTop}px` }}>
//               <TableCell colSpan={headers.length} style={{ padding: 0, border: "none", background: "transparent" }} />
//             </TableRow>
//           )}
//           {virtualRows.map((virtualRow) => {
            
//             const row = rows[virtualRow.index];
//             // const actualRowIndex = row.index;

//             return(
//               <TableRow key={row.id} style={{ height: sheet.sheetCellHeight }}>
//                 {row.getVisibleCells().map((cell, _i) => {
//                   return(
//                     <TableCell key={cell.id}>
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </TableCell>  
//                   )
//                 })}
//               </TableRow>
//             )
//           })}

//           {paddingBottom > 0 && (
//             <TableRow style={{ height: `${paddingBottom}px` }}>
//               <TableCell colSpan={headers.length} style={{ padding: 0, border: "none", background: "transparent" }} />
//             </TableRow>
//           )}
//         </TableBody>


//       </Table>
//     </div>
//   );
// }




// export default TableSheet;