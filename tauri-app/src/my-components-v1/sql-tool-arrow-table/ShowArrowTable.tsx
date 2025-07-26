import React, { CSSProperties } from 'react'
import { Table as ATable} from "apache-arrow";
import { Header, Cell, ColumnDef, createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable, } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import { makeStyles, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens  } from "@fluentui/react-components";
import { ColumnResizeMode } from '@tanstack/react-table';
import { MdNumbers } from "react-icons/md";
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'


const useArrowTableStyles = makeStyles({
  container: {
    height: "100%",
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
    position: "sticky",
    top: "0px",
    left: "0px",
    willChange: "transform",
    zIndex: 1,
  },
  tableHeaderCell: {
    paddingLeft: "12px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    fontWeight: "bolder", // 圖片中的表頭文字沒有粗體
    fontSize: "15px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    position: "relative",
    "& > div > span": {
      overflow: "hidden",
      textOverflow: "ellipsis", // 超出範圍時顯示...
    },
    "&:first-of-type > div" : {
      justifyContent: "end",
    }
  },
  headerSizer: {
    position: "absolute",
    right: "-15px",
    height: "calc(100% + 12px)",
    cursor: "w-resize",
    userSelect: "none",
    zIndex: 1,
    "&:hover": {
      backgroundColor: "rgba(59, 182, 231, 0.24)",
    },
    "&:active": {
      backgroundColor: "rgba(4, 53, 214, 0.56)",
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
    borderBottom: "none",
    // 新增第一欄 (Row Number) 的特殊樣式
    "& > td:first-of-type": {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorBrandForeground1,
      justifyContent: "end",
      fontWeight: "bolder",
      paddingRight: "10px",
      borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: "16px",
    },
  },
  tableCell: {
    boxSizing: "border-box",
    paddingLeft: "12px",
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
    backgroundColor: tokens.colorNeutralStroke2,
    paddingRight: "4px",
    paddingLeft: "4px",
    borderRadius: "4px",
    fontStyle: "italic",
    fontWeight: "bold",
  },
  boolValue: {
    paddingRight: "4px",
    paddingLeft: "4px",
    borderRadius: "4px",
    backgroundColor: tokens.colorNeutralStroke2,
    fontWeight: "bold",
  }
});

// 傳入 arrow Table 然後呈現一個 tanstack 表格
export interface ArrowTableProps {
  table: ATable,
}

export const ShowArrowTable: React.FC<ArrowTableProps> = ({
  table,
}) => 
{
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const styles = useArrowTableStyles();
  const tableObj = useMemo(() => tableToObjects(table), [table]);
  const columns = useMemo(() => inferColumnsFromTable(table, styles), [table, styles]);
  // 製作排序表
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map(c => c.id!));
  // Initialize TanStack Table
  const tableInstance = useReactTable({
    data: tableObj,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
  });
  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const { rows } = useMemo(() => tableInstance.getRowModel(), [tableObj]);
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
    overscan: 8,
  })

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div id="arrow-table-container" className={styles.container} ref={tableContainerRef}>
        <Table className={styles.table}>
          <TableHeader className={styles.tableHeader}>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <SortableContext
                key={headerGroup.id}
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow className={styles.headerRow}>
                  {headerGroup.headers.map(header => (
                    <DraggableTableHeader key={header.id} header={header} styles={styles} />
                  ))}
                </TableRow>
              </SortableContext>
            ))}
          </TableHeader>
          <TableBody className={styles.tableBody} style={{ height: rowVirtualizer.getTotalSize() }}>
            {
              rowVirtualizer.getVirtualItems().map(item => {
                const row = rows[item.index] as Row<any>
                return (
                  <TableRow 
                    key={row.id} 
                    className={styles.virtualRow} 
                    style={{ 
                      transform: `translateY(${item.start}px)`, //this should always be a `style` as it changes on scroll
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell key={cell.id} cell={cell} styles={styles}/>
                      </SortableContext>
                    ))}
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}

const DraggableTableHeader = ({
  header, styles
}: {
  header: Header<any, unknown>
  styles: any
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableHeaderCell 
      key={header.id} 
      colSpan={header.colSpan} 
      ref={setNodeRef}
      className={styles.tableHeaderCell}
      style={{ ...style, width: header.getSize() }}
    >
      {
        header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
      } 
      <button {...attributes} {...listeners}>
        🟰
      </button>
      <div
        className={styles.headerSizer}
        style={{ minWidth: "12px"}}
        {...{
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
        }}
      />
    </TableHeaderCell>
  )
}

const DragAlongCell = ({ cell, styles }: { cell: Cell<any, unknown>, styles: any }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableCell key={cell.id} 
      className={styles.tableCell} 
      ref={setNodeRef}
      style={{ ...style, width: cell.column.getSize() }} 
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}                        
    </TableCell>
  )
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
        header: () => <span>{colName}</span>,
        size: 160,
        cell: info => {
          const value: any = info.getValue();
          if (value === null) return <span className={styles.nullValue}>{"null"}</span>;
          // boolean
          if (field.typeId === 6) return <span className={styles.boolValue}>{`${value}`}</span>;
          // Timestamp (typeId = 15)
          if (field.typeId === 8) {
            const unit = (field.type as any).unit; // e.g. "MILLISECOND" or "MICROSECOND"
            const ms = unit === "MICROSECOND" ? Number(value) / 1000 : Number(value);
            const date = new Date(ms);
            // 轉成 YYYY-MM-DD HH:mm:ss
            const formatted = date.toISOString().split("T")[0];
            return <span>{formatted}</span>;
          }
          return <span>{ String(value) }</span>;
        },
        footer: () => <span>{colName}</span>
      })
    }); 
  return [rowNumberCol, ...dataCols];
}