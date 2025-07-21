import { Table as ATable} from "apache-arrow";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable, } from "@tanstack/react-table";
import { useMemo, useRef } from "react";
import { makeStyles, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens  } from "@fluentui/react-components";
import { MdNumbers } from "react-icons/md";
import {
  useVirtualizer,
  VirtualItem,
  Virtualizer,
} from '@tanstack/react-virtual'

const useArrowTableStyles = makeStyles({
  container: {
    minHeight: "200px",
    maxHeight: "600px",
    overflow: "auto",
    // 增加外框線以符合圖片的整體感
    border : `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "8px",
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace", // 使用等寬字體更像IDE
    position: "relative",
  },
  table: {
    borderCollapse: "collapse",
    tableLayout: "fixed",
    width: "fit-content",
    minWidth: "160px",
  },
  tableHeader: {
    display: "grid",
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    position: "sticky",
    top: "0px",
    left: "0px",
    willChange: "transform",
    zIndex: 1,
  },
  tableHeaderCell: {
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    fontWeight: "bolder", // 圖片中的表頭文字沒有粗體
    fontSize: "14px",
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    "&:first-of-type > div" : {
      display: "flex",
      justifyContent: "end",
    }
  },
  tableBody: {
    display: "grid",
    position: "relative",
  },
  headerRow: {
    display: "flex",
    width: "100%",
    borderBottom: "none",
  },
  virtualRow: {
    display: "flex",
    position: "absolute",
    top: "0px",
    left: "0px",
    willChange: "transform",
    // 新增第一欄 (Row Number) 的特殊樣式
    "& > td:first-of-type": {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorBrandForeground1,
      justifyContent: "end",
      fontWeight: "bolder",
      paddingRight: "10px",
      borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: "12px",
    },
    "&:last-of-type": {
      borderBottom: "none"
    }
  },
  tableCell: {
    boxSizing: "border-box",
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    textAlign: "left",
    fontSize: "14px",
    whiteSpace: "nowrap", // 避免內文換行
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    "& > span": {
      overflow: "hidden",
      textOverflow: "ellipsis", // 超出範圍時顯示...
    }
  },
  nullValue: {
    color: tokens.colorPaletteRedForeground3,
    fontStyle: "italic",
    fontWeight: "bold",
  },
});

// 傳入 arrow Table 然後呈現一個 tanstack 表格
export interface ArrowTableProps {
  table: ATable,
}

export const ArrowTable: React.FC<ArrowTableProps> = ({
  table,
}) => 
{
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const styles = useArrowTableStyles();
  const tableObj = useMemo(() => tableToObjects(table), [table]);
  const columns = useMemo(() => inferColumnsFromTable(table, styles), [table, styles]);
  // Initialize TanStack Table
  const tableInstance = useReactTable({
    data: tableObj,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const { rows } = useMemo(() => tableInstance.getRowModel(), [tableInstance]);
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 44, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 16,
  })

  return (
    <div id="arrow-table-container" className={styles.container} ref={tableContainerRef}>
      <Table className={styles.table}>
        <TableHeader className={styles.tableHeader}>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className={styles.headerRow}>
                {headerGroup.headers.map(header => (
                  <TableHeaderCell 
                    key={header.id} colSpan={header.colSpan} className={styles.tableHeaderCell}
                    style={{ width: header.getSize() }}
                  >
                    {
                      header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                    }
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
        </TableHeader>
        <TableBody className={styles.tableBody} style={{ height: rowVirtualizer.getTotalSize() }}>
          {
            rowVirtualizer.getVirtualItems().map(item => {
              const row = rows[item.index] as Row<any>
              return (
                <TableRow key={row.id} className={styles.virtualRow} 
                  style={{ 
                    transform: `translateY(${item.start}px)`, //this should always be a `style` as it changes on scroll
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} 
                      className={styles.tableCell} 
                      style={{ width: cell.column.getSize() }} >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </div>
  );
}

function tableToObjects(table: ATable): Record<string, any>[] {
  const rows = [];
  let counter = 0;
  for(const row of table.toArray()) {
    if(++counter > 25000) break;
    rows.push(row.toJSON())
  }
  return rows;
}

function inferColumnsFromTable(table: ATable, styles: Record<any, string>): ColumnDef<any>[] {
  const columnHelper = createColumnHelper<any>();
  const rowNumberCol = columnHelper.display({
      id: 'auto-add-row-number',
      header: (_row) => <MdNumbers />,
      // cell 的 info 物件包含 row 屬性，其 index 是從 0 開始的行索引
      cell: info => info.row.index + 1,
      size: 64,
  });
  const dataCols = table.schema.fields.map((field) => {
    const colName = field.name;
    return columnHelper.accessor(  
      row => row[colName], 
      {
        id: colName,
        header: colName,
        size: 160,
        cell: info => {
          const value: any = info.getValue();
          if (value === null) return <span className={styles.nullValue}>{"<null>"}</span>;
          return <span>{ String(value) }</span>;
        },
        footer: () => <span>{colName}</span>
      })
    }); 
  return [rowNumberCol, ...dataCols];
}