import { Table as ATable} from "apache-arrow";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable, } from "@tanstack/react-table";
import { useMemo } from "react";
import { makeStyles, shorthands, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens  } from "@fluentui/react-components";
import { MdNumbers } from "react-icons/md";

const useArrowTableStyles = makeStyles({
  container: {
    minHeight: "200px",
    maxHeight: "600px",
    overflow: "auto",
    // 增加外框線以符合圖片的整體感
    border : `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "8px",
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace", // 使用等寬字體更像IDE
  },
  table: {
    borderCollapse: "collapse",
    tableLayout: "fixed",
    width: "fit-content",
    minWidth: "160px",
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tableHeaderCell: {
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    fontWeight: "bolder", // 圖片中的表頭文字沒有粗體
    fontSize: "13px",
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    "&:first-of-type > div" : {
      display: "flex",
      justifyContent: "end",
    }
  },
  tableRow: {
    // 新增第一欄 (Row Number) 的特殊樣式
    "& > td:first-of-type": {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorBrandForeground1,
      fontWeight: "bold",
      textAlign: "right",
      paddingRight: "10px",
      borderRight: `1px solid ${tokens.colorNeutralStroke1}`
    },
    "&:last-of-type": {
      borderBottom: "none"
    }
  },
  tableCell: {
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    textAlign: "left",
    fontSize: "13px",
    whiteSpace: "nowrap", // 避免內文換行
    overflow: "hidden",
    textOverflow: "ellipsis", // 超出範圍時顯示...
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
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
  const styles = useArrowTableStyles();
  const tableObj = useMemo(() => tableToObjects(table), [table]);
  const columns = useMemo(() => inferColumnsFromTable(table, styles), [table, styles]);
  // Initialize TanStack Table
  const tableInstance = useReactTable({
    data: tableObj,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div id="arrow-table-container" className={styles.container}>
      <Table className={styles.table}>
        <TableHeader className={styles.tableHeader}>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
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
        <TableBody>
          {tableInstance.getRowModel().rows.map(row => (
            <TableRow key={row.id} className={styles.tableRow}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} 
                  className={styles.tableCell} 
                  style={{ width: cell.column.getSize() }} >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function tableToObjects(table: ATable): Record<string, any>[] {
  const rows = [];
  let counter = 0;
  for(const row of table.toArray()) {
    if(++counter > 150) break;
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